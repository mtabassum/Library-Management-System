using LibraryManagementSystem.Infrastructure.ErrorHandling;
using LibraryManagementSystem.Infrastructure.Middleware;
using Serilog;

namespace LibraryManagementSystem.Extensions
{
    /// <summary>
    /// Global exception handling and the correlation id.
    /// </summary>
    public static class ErrorHandlingExtensions
    {
        public static IServiceCollection AddErrorHandling(
            this IServiceCollection services)
        {
            services.AddExceptionHandler<GlobalExceptionHandler>();

            // Also makes the framework's own errors (404s, malformed query
            // strings) use the ProblemDetails shape, so the API is consistent
            // with itself.
            services.AddProblemDetails();

            return services;
        }

        /// <summary>
        /// Order matters, and keeping these lines in one method is the reason
        /// this exists:
        ///
        ///   1. CorrelationIdMiddleware is outermost, so every log line and
        ///      every response carries the correlation id, including errors.
        ///
        ///   2. Request logging comes next. It sits outside the exception
        ///      handler, so it only sees the finished response (for example
        ///      a 500) and writes one short line, without the stack trace.
        ///
        ///   3. UseExceptionHandler is innermost. It catches anything a
        ///      controller or handler throws, and GlobalExceptionHandler
        ///      logs the stack trace once.
        ///
        /// Call this FIRST, immediately after builder.Build(). Middleware
        /// registered above it is not covered.
        /// </summary>
        public static WebApplication UseErrorHandling(this WebApplication app)
        {
            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseSerilogRequestLogging();
            app.UseExceptionHandler();

            return app;
        }
    }
}
