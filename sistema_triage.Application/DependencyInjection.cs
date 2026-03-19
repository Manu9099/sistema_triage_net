using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using sistema_triage.Application.Services;
using sistema_triage.Application.Services.Interfaces;

namespace sistema_triage.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPacienteService, PacienteService>();
        services.AddScoped<ITriageService, TriageService>();
        services.AddScoped<ICitaService, CitaService>();
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<ISeguimientoService, SeguimientoService>();
        return services;
    }
}