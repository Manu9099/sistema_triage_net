using Microsoft.AspNetCore.SignalR;

namespace sistema_triage.API.Hubs;

public class TriageHub : Hub
{
    public async Task UnirseGrupoAdmin()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
    }

    public async Task SalirGrupoAdmin()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
    }
}