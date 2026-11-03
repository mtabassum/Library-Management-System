// NOTE: written without sight of the current Program.cs. The DbContext and
// migration/seed calls match what the project is known to do; the repository
// registrations are PLACEHOLDERS -- replace them with the exact lines from
// Program.cs.

using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Extensions
{
    /// <summary>
    /// Everything to do with the database: the DbContext, the repositories,
    /// and the startup migration + seed.
    /// </summary>
    public static class PersistenceExtensions
    {
        public static IServiceCollection AddPersistence(
            this IServiceCollection services,
            IConfiguration configuration,
            IHostEnvironment environment)
        {
            services.AddDbContext<LibraryDbContext>(options =>
            {
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"));

                if (environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                }
            });

            services.AddScoped<IBookRepository, BookRepository>();
            services.AddScoped<IBookCopyRepository, BookCopyRepository>();
            services.AddScoped<IMemberRepository, MemberRepository>();
            services.AddScoped<IBorrowRecordRepository, BorrowRecordRepository>();
            services.AddScoped<IMemberCodeGenerator, SequenceMemberCodeGenerator>();

            // The unit of work IS the DbContext -- LibraryDbContext implements
            // IUnitOfWork. Resolve the same scoped instance the repositories
            // use, so every change commits in one transaction. 
            services.AddScoped<IUnitOfWork>(sp =>
                sp.GetRequiredService<LibraryDbContext>());

            return services;
        }

        public static async Task MigrateAndSeedAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();

            var logger = scope.ServiceProvider
                .GetRequiredService<ILogger<Program>>();
            var db = scope.ServiceProvider
                .GetRequiredService<LibraryDbContext>();

            try
            {
                await db.Database.MigrateAsync();
                await DbSeeder.SeedAsync(db);
            }
            catch (Exception ex)
            {
                logger.LogCritical(ex,
                    "Database migration or seeding failed on startup.");

                throw;
            }
        }
    }
}
