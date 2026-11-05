using LibraryManagementSystem.Abstractions;
using LibraryManagementSystem.Extensions;
using LibraryManagementSystem.Infrastructure.Behaviors;
using LibraryManagementSystem.Infrastructure.ErrorHandling;
using LibraryManagementSystem.Infrastructure.Middleware;
using LibraryManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;


try { 
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, configuration) => configuration
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services));

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders(CorrelationIdMiddleware.HeaderName)); 
});

builder.Services.AddPersistence(builder.Configuration, builder.Environment);

builder.Services.AddApplication();

builder.Services.AddErrorHandling();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseRequestTiming();    
}


app.UseErrorHandling();

app.UseSerilogRequestLogging();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.UseHttpsRedirection();

app.MapControllers();

await app.MigrateAndSeedAsync();

app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
    throw;
}
finally
{
    Log.CloseAndFlush();
}