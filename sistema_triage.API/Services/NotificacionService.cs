using Microsoft.AspNetCore.SignalR;
using sistema_triage.API.Hubs;

namespace sistema_triage.API.Services;

public class NotificacionService
{
    private readonly IHubContext<TriageHub> _hub;

    public NotificacionService(IHubContext<TriageHub> hub)
    {
        _hub = hub;
    }

    public async Task NotificarNuevoTriage(object datos)
    {
        await _hub.Clients.Group("admins").SendAsync("NuevoTriage", datos);
    }

    public async Task NotificarEmergencia(object datos)
    {
        await _hub.Clients.Group("admins").SendAsync("NuevaEmergencia", datos);
    }

    public async Task ActualizarEstadisticasDashboard(DashboardStatsDto stats)
    {
        await _hub.Clients.Group("admins").SendAsync("ActualizarDashboard", stats);
    }

    public async Task NotificarSalaEspera(List<PacienteEsperaDto> sala)
    {
        await _hub.Clients.Group("admins").SendAsync("ActualizarSalaEspera", sala);
    }
}

public class DashboardStatsDto
{
    public int TotalPacientesHoy { get; set; }
    public int TotalTriagesHoy { get; set; }
    public int Emergencias { get; set; }
    public int Urgentes { get; set; }
    public int SemiUrgentes { get; set; }
    public int NoUrgentes { get; set; }
    public double TiempoPromedioEsperaMinutos { get; set; }
    public DateTime UltimaActualizacion { get; set; } = DateTime.UtcNow;
}

public class PacienteEsperaDto
{
    public Guid TriageId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public int Nivel { get; set; }
    public string NivelDescripcion { get; set; } = string.Empty;
    public DateTime HoraRegistro { get; set; }
    public int MinutosEspera { get; set; }
    public string Sintomas { get; set; } = string.Empty;
}