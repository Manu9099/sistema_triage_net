using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using sistema_triage.API.Middleware;
using sistema_triage.API.Services;
using sistema_triage.Application;
using sistema_triage.Domain.Entities;
using sistema_triage.Infrastructure;
using sistema_triage.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Registrando servicios...");

    builder.Services.AddApplication();
    Log.Information("Application OK");

    builder.Services.AddInfrastructure(builder.Configuration);
    Log.Information("Infrastructure OK");

    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
    Log.Information("Identity OK");

    var jwtKey = builder.Configuration["Jwt:Key"]!;
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
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
    Log.Information("JWT OK");

    builder.Services.AddAuthorization();
    builder.Services.AddSignalR();
    builder.Services.AddSingleton<sistema_triage.API.Services.NotificacionService>();
    builder.Services.AddControllers();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
            policy.WithOrigins(
                    builder.Configuration["Cors:Origins"]?.Split(',') ??
                     ["http://localhost:5173"  ,
                    "https://sistema-triage-api.onrender.com",
                    "https://sistema-triage-client.onrender.com"]
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());
    });

    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, ct) =>
        {
            document.Info.Title = "Sistema Triage API";
            document.Info.Version = "v1";
            document.Info.Description = "API para sistema de triage clínico";
            return Task.CompletedTask;
        });
    });
  
    builder.Services.AddScoped<DashboardService>(); 
    Log.Information("Construyendo app...");
    var app = builder.Build();
    Log.Information("App construida OK");

    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Sistema Triage API";
        options.Theme = ScalarTheme.Purple;
        options.AddHttpAuthentication("Bearer", auth =>
        {
            auth.Token = "";
        });
    });

    app.UseHttpsRedirection();

    app.UseDefaultFiles();
    app.UseStaticFiles();

    app.UseCors("Frontend");
    app.UseAuthentication();
    app.UseAuthorization();

    app.UseWhen(
        context => context.Request.Path.StartsWithSegments("/api"),
        branch => branch.UseMiddleware<GlobalExceptionMiddleware>()
    );

    app.MapControllers();
    app.MapHub<sistema_triage.API.Hubs.TriageHub>("/hubs/triage");
    app.MapGet("/health", () => Results.Ok(new { ok = true, servicio = "api" }));

    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            foreach (var rol in new[] { "Admin", "Staff", "Paciente" })
            {
                if (!await roleManager.RoleExistsAsync(rol))
                    await roleManager.CreateAsync(new IdentityRole(rol));
            }

            Log.Information("Roles creados OK");

            var adminEmail = builder.Configuration["AdminDefault:Email"] ?? "admin@triage.com";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    Nombres = "Administrador",
                    Apellidos = "Sistema",
                    EmailConfirmed = true
                };

                var pwd = builder.Configuration["AdminDefault:Password"] ?? "Admin@12345";
                var resultado = await userManager.CreateAsync(admin, pwd);

                if (resultado.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                    Log.Information("Admin creado OK: {Email}", adminEmail);
                }
                else
                {
                    Log.Warning("No se pudo crear admin: {Errores}",
                        string.Join(", ", resultado.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                Log.Information("Admin ya existe, saltando seed");
            }
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Error en seed, continuando de todas formas");
        }
    }

    app.MapFallbackToFile("index.html");

    Log.Information("Iniciando servidor...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Error fatal al iniciar: {Message}", ex.Message);
    Console.WriteLine($"ERROR: {ex}");
}
finally
{
    Log.CloseAndFlush();
}