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
}