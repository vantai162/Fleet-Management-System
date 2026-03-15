using Microsoft.EntityFrameworkCore;
using FMS.Models;
using System.Text;
using System.Reflection;
using System.IO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using FMS.DAL.Interfaces;
using FMS.DAL.Implementation;
using FMS.ServiceLayer.Interface;
using FMS.ServiceLayer.Implementation;
using Microsoft.AspNetCore.RateLimiting;
using FMS.Middleware;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("MyDB");
builder.Services.AddDbContext<FMSDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddMemoryCache();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var key = Encoding.UTF8.GetBytes(secretKey);


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});



builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("fixed", limiterOptions => {
    limiterOptions.PermitLimit = 400; // số request cho phép
    limiterOptions.Window = TimeSpan.FromSeconds(60); // trong 10 giây
    limiterOptions.QueueLimit = 0; 
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// DAL registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDriverRepository, DriverRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<ITripRepository, TripRepository>();
builder.Services.AddScoped<IDriverLicenseRepository, DriverLicenseRepository>();
builder.Services.AddScoped<IExtraExpenseRepository, ExtraExpenseRepository>();
builder.Services.AddScoped<IFuelRecordRepository, FuelRecordRepository>();
builder.Services.AddScoped<ILicenseClassRepository, LicenseClassRepository>();
builder.Services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
builder.Services.AddScoped<ITripDriverRepository, TripDriverRepository>();
builder.Services.AddScoped<ITripLogRepository, TripLogRepository>();
//builder.Services.AddScoped<IVehicleDriverAssignmentRepository, VehicleDriverAssignmentRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IMaintenanceServiceRepository, MaintenanceServiceRepository>();
builder.Services.AddScoped<ITripStepRepository, TripStepRepository>();
builder.Services.AddScoped<IEmergencyReportRepository, EmergencyReportRepository>();

// Service registrations
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IDriverService, DriverService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IEmergencyReportService, EmergencyReportService>();
builder.Services.AddScoped<IMaintenanceService, FMS.ServiceLayer.Implementation.MaintenanceService>();
builder.Services.AddScoped<IFuelRecordService, FMS.ServiceLayer.Implementation.FuelRecordService>();
builder.Services.AddScoped<ITripAssignmentService, TripAssignmentService>();
builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddScoped<IExtraExpenseService, FMS.ServiceLayer.Implementation.ExtraExpenseService>();
builder.Services.AddScoped<IStatService, StatService>();


builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer {token}'"
    });

    // Include XML comments (requires GenerateDocumentationFile in project)
    try
    {
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
        }
    }
    catch
    {
        // ignore if xml comments aren't available
    }

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS for React dev servers
const string CorsPolicy = "CorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://localhost:5173",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

app.Run();
