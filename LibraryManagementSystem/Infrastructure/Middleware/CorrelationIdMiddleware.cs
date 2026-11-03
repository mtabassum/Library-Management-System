using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LibraryManagementSystem.Infrastructure.Middleware
{
    /// <summary>
    /// Gives every request a correlation id.
    ///
    /// The id is reused from the inbound "X-Correlation-Id" header when the
    /// caller supplies a safe one, otherwise a new GUID is generated. It is:
    ///
    ///  1) stored on HttpContext.Items so GlobalExceptionHandler can include it
    ///     in the error response,
    ///  2) echoed back on the response header so the client can read it on
    ///     successful responses too,
    ///  3) attached as a logging scope so every log line written during the
    ///     request carries it -- including EF Core's SQL lines.
    ///
    /// </summary>
    public sealed class CorrelationIdMiddleware
    {
        public const string HeaderName = "X-Correlation-Id";
        public const string ItemKey = "CorrelationId";

        private const int MaxLength = 64;

        private readonly RequestDelegate _next;
        private readonly ILogger<CorrelationIdMiddleware> _logger;

        public CorrelationIdMiddleware(
            RequestDelegate next,
            ILogger<CorrelationIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = ReadInboundId(context) ?? Guid.NewGuid().ToString();

            context.Items[ItemKey] = correlationId;

            context.Response.OnStarting(() =>
            {
                context.Response.Headers[HeaderName] = correlationId;
                return Task.CompletedTask;
            });

            using (_logger.BeginScope(
                new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
            {
                await _next(context);
            }
        }

        /// <summary>
        /// Accepts a caller-supplied id only if it is short and made of safe
        /// characters. The value goes straight into log files, so a header
        /// containing newlines could be used to forge log entries (log
        /// injection) and an over-long one would bloat every entry. Anything
        /// that fails the check is discarded and replaced with a fresh id.
        /// </summary>
        private static string? ReadInboundId(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue(HeaderName, out var values))
                return null;

            var value = values.ToString();

            if (string.IsNullOrWhiteSpace(value) || value.Length > MaxLength)
                return null;

            foreach (var character in value)
            {
                if (!char.IsLetterOrDigit(character) && character != '-' && character != '_')
                    return null;
            }

            return value;
        }
    }
}
