using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;
using sistema_triage.Infrastructure.Repositories;
using sistema_triage.Infrastructure.Services;

namespace sistema_triage.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Base de datos
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Repositorios
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<ITriageRepository, TriageRepository>();
        services.AddScoped<ISlotRepository, SlotRepository>();
        services.AddScoped<ICitaRepository, CitaRepository>();

        // Azure Blob — mock en desarrollo, real cuando se configure Azure
        var blobConnectionString = configuration["Azure:BlobConnectionString"];
        if (!string.IsNullOrEmpty(blobConnectionString) && blobConnectionString.Contains("AccountName"))
        {
            services.AddSingleton(_ => new BlobServiceClient(blobConnectionString));
            services.AddScoped<IBlobStorageService, BlobStorageService>();
        }
        else
        {
            services.AddScoped<IBlobStorageService, BlobStorageServiceMock>();
        }

        return services;
    }
}