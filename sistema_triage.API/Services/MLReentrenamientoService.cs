using sistema_triage.Infrastructure.ML;
using Microsoft.EntityFrameworkCore;

namespace sistema_triage.API.Services;

public class MLReentrenamientoService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MLReentrenamientoService> _logger;
    private readonly TimeSpan _intervalo = TimeSpan.FromDays(7);

    public MLReentrenamientoService(
        IServiceProvider serviceProvider,
        ILogger<MLReentrenamientoService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ML Reentrenamiento Service iniciado");

        // Entrenamiento inicial al arrancar
        await ReentrenarAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_intervalo, stoppingToken);

            if (!stoppingToken.IsCancellationRequested)
                await ReentrenarAsync();
        }
    }

    private async Task ReentrenarAsync()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var mlService = scope.ServiceProvider.GetRequiredService<DiagnosticoMLService>();
            var context = scope.ServiceProvider.GetRequiredService<sistema_triage.Infrastructure.Data.AppDbContext>();

            // Verificar si hay nuevos datos desde el último entrenamiento
            var totalSeguimientos = await context.Seguimientos
                .CountAsync(s => s.DiagnosticoConfirmado != null);

            _logger.LogInformation(
                "ML Reentrenamiento: {Total} seguimientos con diagnóstico confirmado",
                totalSeguimientos);

            await mlService.EntrenarAsync();

            _logger.LogInformation("ML Reentrenamiento completado exitosamente");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ML Reentrenamiento automático");
        }
    }
}