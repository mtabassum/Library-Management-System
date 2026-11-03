namespace LibraryManagementSystem.Infrastructure.Middleware
{
    public class RequestTimingMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            var name = GetType().Name;
            Console.WriteLine($"→ Middleware: {name} ({context.Request.Path})");
            await next(context);
            Console.WriteLine($"← Middleware: {name} ({context.Response.StatusCode})");
        }
    }

    public static class RequestTimingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestTiming(this IApplicationBuilder app)
            => app.UseMiddleware<RequestTimingMiddleware>();
    }
}
