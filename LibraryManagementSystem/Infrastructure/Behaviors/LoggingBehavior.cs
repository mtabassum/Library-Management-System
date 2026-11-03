using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace LibraryManagementSystem.Infrastructure.Behaviors
{
    /// <summary>
    /// Wraps every MediatR request: logs one line on the way in and one on the
    /// way out, with the elapsed time.
    ///
    /// The logging scope tags every log line written during the request with
    /// RequestName -- including EF Core's SQL lines, which know nothing about
    /// MediatR. That is what lets you see which queries belonged to which
    /// request.
    ///
    /// Registered once as an open generic:
    ///     cfg.AddOpenBehavior(typeof(LoggingBehavior&lt;,&gt;));
    /// </summary>
    public sealed class LoggingBehavior<TRequest, TResponse>
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
            => _logger = logger;

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Only the type name is logged. The request object itself may carry
            // a phone number or address, which does not belong in a log file.
            var requestName = typeof(TRequest).Name;

            using (_logger.BeginScope(
                new Dictionary<string, object> { ["RequestName"] = requestName }))
            {
                _logger.LogInformation("Starting {RequestName}", requestName);

                var stopwatch = Stopwatch.StartNew();

                // next() runs the rest of the chain -- ultimately the handler.
                // If it throws, we exit without logging "Finished" and the
                // exception travels on to GlobalExceptionHandler.
                //
                // RequestHandlerDelegate<TResponse> takes an optional
                // CancellationToken (MediatR 12.4+, including 14.x), so the
                // token is forwarded here. On MediatR 12.0-12.3 the delegate
                // takes no parameters -- use next() instead.
                var response = await next(cancellationToken);

                stopwatch.Stop();

                _logger.LogInformation(
                    "Finished {RequestName} in {ElapsedMs} ms",
                    requestName,
                    stopwatch.ElapsedMilliseconds);

                return response;
            }
        }
    }
}
