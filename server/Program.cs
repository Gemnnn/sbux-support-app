using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext with SQL Server
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repository and service classes
builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<ProductService>();

// Configure Kestrel dynamically based on the environment
builder.WebHost.ConfigureKestrel(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        // In development, bind to all network interfaces for easier testing
        options.ListenAnyIP(5223);
    }
    else
    {
        // In production, bind only to localhost for security
        options.ListenLocalhost(5223);
    }
});

// Allows only specific type of requests in production for security
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAll", builder =>
        {
            builder.AllowAnyOrigin()  // Allow Expo Web on localhost
                   .AllowAnyMethod()  // Allow any headers
                   .AllowAnyHeader(); // Allow any HTTP methods (GET, POST, etc.)
        });
    }
    else
    {
        // Apply more restrictive CORS policy for production
        options.AddPolicy("AllowSpecific", builder =>
        {
            // Set up your specific CORS policy here
        });
    }
});



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(builder.Environment.IsDevelopment() ? "AllowAll" : "AllowSpecific");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
