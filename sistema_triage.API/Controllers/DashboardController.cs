using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.API.Services;
using sistema_triage.Infrastructure.ML;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly DiagnosticoMLService _mlService;

    public DashboardController(DashboardService dashboardService,DiagnosticoMLService mlService)
    {
        _dashboardService = dashboardService;
          _mlService = mlService;
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
    [HttpPost("reentrenar-ml")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ReentrenarML()
{
    await _mlService.EntrenarAsync();
    return Ok(new { exitoso = true, mensaje = "Modelo reentrenado correctamente" });
}

[HttpGet("ml-status")]
public IActionResult GetMLStatus() =>
    Ok(new { exitoso = true, data = new { disponible = _mlService.ModeloDisponible } });
}