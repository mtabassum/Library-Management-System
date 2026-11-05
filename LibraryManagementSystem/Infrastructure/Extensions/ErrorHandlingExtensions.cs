using LibraryManagementSystem.Infrastructure.ErrorHandling;
using LibraryManagementSystem.Infrastructure.Middleware;

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
        /// Order matters, and keeping both lines in one method is the reason
        /// this exists:
        ///
        ///   UseExceptionHandler is outermost so it also catches failures
        ///   inside the correlation middleware. The correlation id is still
        ///   available when a controller throws, because HttpContext.Items was
        ///   populated on the way in.
        ///
        /// Call this FIRST, immediately after builder.Build(). Middleware
        /// registered above it is not covered.
        /// </summary>
        public static WebApplication UseErrorHandling(this WebApplication app)
        {
            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseExceptionHandler();

            return app;
        }
    }
}
