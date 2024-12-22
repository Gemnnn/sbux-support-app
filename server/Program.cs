using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Repositories;
using server.Services;
using Serilog;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Caching.Memory;


var builder = WebApplication.CreateBuilder(args);

// Add MemoryCache service
builder.Services.AddMemoryCache();

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
    options.EnableHeartbeat = false; // Disable Heart Beat
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
    dbConnectionString = builder.Configuration.GetConnectionString("AzureConnection");
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

// Swagger on Debug Mode
if (app.Environment.IsDevelopment())
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


app.MapGet("/", () => "Service is running.");

// Test code for connecting with DB
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

    try
    {
        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("Database connection successful.");

            // Preload data
            var allProducts = dbContext.Products.ToList();
            cache.Set("AllProducts", allProducts, TimeSpan.FromHours(1)); // Cache for 1 hour
            //Console.WriteLine($"Preloaded {allProducts.Count} products into memory cache.");

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
