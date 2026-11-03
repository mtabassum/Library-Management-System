
using LibraryManagementSystem.Abstractions.Validation;
using LibraryManagementSystem.Infrastructure.Middleware;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LibraryManagementSystem.Infrastructure.ErrorHandling;
    /// <summary>
    /// Catches anything that escapes a controller action, logs it once with the
    /// full stack trace, and returns a consistent ProblemDetails body carrying
    /// the request's correlation id.
    ///
    /// This handles UNEXPECTED failures only (bugs, database outages). Expected
    /// business failures are reported with Result&lt;T&gt; inside the handlers and
    /// never reach this class.
    ///
    /// </summary>
    public sealed class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionHandler(
            ILogger<GlobalExceptionHandler> logger,
            IHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var correlationId = ReadCorrelationId(httpContext);

            if (exception is ValidationException validationException)
            {
                return await HandleValidationAsync(
                    httpContext, validationException, correlationId, cancellationToken);
            }

            _logger.LogError(exception,
                "Unhandled exception on {Method} {Path}. CorrelationId: {CorrelationId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                correlationId);

            if (httpContext.Response.HasStarted)
                return true;

            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Something went wrong. Please try again.",
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            };

            problem.Extensions["correlationId"] = correlationId;

            if (_environment.IsDevelopment())
            {
                problem.Detail = exception.Message;
                problem.Extensions["exceptionType"] = exception.GetType().Name;
            }

            httpContext.Response.StatusCode = problem.Status.Value;
            await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

            return true;
        }

        private async ValueTask<bool> HandleValidationAsync(
            HttpContext httpContext,
            ValidationException exception,
            string correlationId,
            CancellationToken cancellationToken)
        {
            _logger.LogWarning(
                "Validation failed on {Method} {Path}. CorrelationId: {CorrelationId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                correlationId);

            if (httpContext.Response.HasStarted)
                return true;

            // ValidationProblemDetails fills in its own Title and puts the
            // failures under "errors", keyed by property name, so the client can
            // show each message beside its own input.
            var problem = new ValidationProblemDetails(exception.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            };

            problem.Extensions["correlationId"] = correlationId;

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

            return true;
        }

        /// <summary>
        /// Falls back to TraceIdentifier so the handler still works if
        /// CorrelationIdMiddleware is not registered or failed early.
        /// </summary>
        private static string ReadCorrelationId(HttpContext context) =>
            context.Items.TryGetValue(CorrelationIdMiddleware.ItemKey, out var value)
            && value is string id
                ? id
                : context.TraceIdentifier;
    }


