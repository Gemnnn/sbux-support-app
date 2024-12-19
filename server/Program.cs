using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Repositories;
using server.Services;
using Serilog;
using Microsoft.ApplicationInsights.Extensibility;

var builder = WebApplication.CreateBuilder(args);

// === Application Insights Connection String ===
// Retrieve the Application Insights connection string from appsettings.json
var appInsightsConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"];
if (string.IsNullOrEmpty(appInsightsConnectionString))
{
    appInsightsConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
}

// === Serilog Configuration ===
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console() // Log output to console
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day) // Log output to daily rolling files
    .WriteTo.ApplicationInsights(
        new TelemetryConfiguration { ConnectionString = appInsightsConnectionString },
        TelemetryConverter.Traces // Send logs to Application Insights as traces
    )
    .MinimumLevel.Information() // Set the minimum log level to Information
    .CreateLogger();

// Integrate Serilog into ASP.NET Core
builder.Host.UseSerilog();

// === Application Insights Configuration ===
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = appInsightsConnectionString; // Set Application Insights connection string
    options.EnableAdaptiveSampling = true; // Enable adaptive sampling (recommended for production)
    options.EnableDebugLogger = builder.Environment.IsDevelopment(); // Enable debug logger in development
});

// === Add services to the container ===
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// === Configure DbContext with SQL Server ===
string dbConnectionString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING");
if (string.IsNullOrEmpty(dbConnectionString))
{
    dbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(dbConnectionString));

// Register repositories and services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// === Configure Kestrel dynamically based on the environment ===
builder.WebHost.ConfigureKestrel(options =>
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
    options.ListenAnyIP(int.Parse(port));
});

// === Configure CORS policies ===
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAll", builder =>
        {
            builder.AllowAnyOrigin() // Allow requests from any origin
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    }
    else
    {
        options.AddPolicy("AllowSpecific", builder =>
        {
            builder.WithOrigins("https://your-production-domain.com") // Replace with production frontend URL later
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    }
});

var app = builder.Build();

// === Configure HTTP request pipeline ===
if (app.Environment.IsDevelopment() || app.Environment.IsProduction()) 
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseStaticFiles();

app.UseCors(app.Environment.IsDevelopment() ? "AllowAll" : "AllowSpecific");
// Force HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();

// Test code for connecting with DB
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    try
    {
        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("Database connection successful.");
        }
        else
        {
            Console.WriteLine("Database connection failed!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed: {ex.Message}");
    }
}

// Log application startup message
Log.Information("Application Starting Up");

app.Run();

// Log when application exits
Log.CloseAndFlush();
