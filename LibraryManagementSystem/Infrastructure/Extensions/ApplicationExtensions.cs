using LibraryManagementSystem.Infrastructure.Behaviors;

namespace LibraryManagementSystem.Extensions
{
    /// <summary>
    /// MediatR and its pipeline. This is where the validation
    /// behavior goes when it is added.
    /// </summary>
    public static class ApplicationExtensions
    {
        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);

                cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });

            return services;
        }
    }
}
