using sistema_triage.Domain.Interfaces;

namespace sistema_triage.API.Services;

public class DashboardService
{
    private readonly ITriageRepository _triageRepo;
    private readonly IPacienteRepository _pacienteRepo;
    private readonly NotificacionService _notificacion;

    public DashboardService(
        ITriageRepository triageRepo,
        IPacienteRepository pacienteRepo,
        NotificacionService notificacion)
    {
        _triageRepo = triageRepo;
        _pacienteRepo = pacienteRepo;
        _notificacion = notificacion;
    }

    public async Task<DashboardStatsDto> ObtenerEstadisticasAsync()
    {
        var hoy = DateTime.UtcNow.Date;
        var manana = hoy.AddDays(1);
        var triagesHoy = await _triageRepo.GetByFechaAsync(hoy, manana);
        var lista = triagesHoy.ToList();

        return new DashboardStatsDto
        {
            TotalTriagesHoy = lista.Count,
            Emergencias = lista.Count(t => (int)t.Nivel == 1),
            Urgentes = lista.Count(t => (int)t.Nivel == 2),
            SemiUrgentes = lista.Count(t => (int)t.Nivel == 3),
            NoUrgentes = lista.Count(t => (int)t.Nivel == 4),
            TiempoPromedioEsperaMinutos = lista.Count > 0
                ? lista.Average(t => (DateTime.UtcNow - t.FechaRegistro).TotalMinutes)
                : 0,
            UltimaActualizacion = DateTime.UtcNow
        };
    }

    public async Task<List<PacienteEsperaDto>> ObtenerSalaEsperaAsync()
    {
        var desde = DateTime.UtcNow.AddHours(-4);
        var triages = await _triageRepo.GetByFechaAsync(desde, DateTime.UtcNow);

        return triages
            .OrderBy(t => t.Nivel)
            .ThenBy(t => t.FechaRegistro)
            .Select(t => new PacienteEsperaDto
            {
                TriageId = t.Id,
                NombrePaciente = t.Paciente != null
                    ? $"{t.Paciente.Nombres} {t.Paciente.Apellidos}" : "—",
                Nivel = (int)t.Nivel,
                NivelDescripcion = t.Nivel switch
                {
                    Domain.Enums.NivelTriage.Emergencia => "Emergencia",
                    Domain.Enums.NivelTriage.Urgente => "Urgente",
                    Domain.Enums.NivelTriage.SemiUrgente => "Semi-urgente",
                    _ => "No urgente"
                },
                HoraRegistro = t.FechaRegistro,
                MinutosEspera = (int)(DateTime.UtcNow - t.FechaRegistro).TotalMinutes,
                Sintomas = t.SignosAlarmaJson ?? ""
            })
            .ToList();
    }

    public async Task EmitirActualizacionAsync()
    {
        var stats = await ObtenerEstadisticasAsync();
        var sala = await ObtenerSalaEsperaAsync();
        await _notificacion.ActualizarEstadisticasDashboard(stats);
        await _notificacion.NotificarSalaEspera(sala);
    }
}
