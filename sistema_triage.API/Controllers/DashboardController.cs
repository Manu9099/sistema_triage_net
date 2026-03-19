using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.API.Services;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardService.ObtenerEstadisticasAsync();
        return Ok(new { exitoso = true, data = stats });
    }

    [HttpGet("sala-espera")]
    public async Task<IActionResult> GetSalaEspera()
    {
        var sala = await _dashboardService.ObtenerSalaEsperaAsync();
        return Ok(new { exitoso = true, data = sala });
    }
}