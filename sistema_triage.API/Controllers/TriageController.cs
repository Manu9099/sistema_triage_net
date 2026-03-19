using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Triage;
using sistema_triage.Application.Services.Interfaces;
using System.Security.Claims;
using sistema_triage.API.Services;

namespace sistema_triage.API.Controllers;




[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TriageController : ControllerBase
{
    private readonly ITriageService _triageService;
   private readonly NotificacionService _notificaciones;

    private readonly DashboardService _dashboardService;
    public TriageController(ITriageService triageService ,NotificacionService notificaciones, DashboardService dashboardService)
    {
        _triageService = triageService;
         _notificaciones = notificaciones;
         _dashboardService = dashboardService;
    }

    

[HttpPost]
[Authorize(Roles = "Admin,Staff,Paciente")]
public async Task<IActionResult> Registrar([FromBody] CrearTriageDto dto)
{
    var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
    var resultado = await _triageService.RegistrarAsync(dto, usuarioId);

    var notif = new
    {
        id = resultado.Id,
        nombrePaciente = resultado.NombrePaciente,
        nivel = resultado.Nivel,
        nivelDescripcion = resultado.NivelDescripcion,
        tiempoAtencion = resultado.TiempoAtencion,
        diagnosticoPrincipal = resultado.DiagnosticosDiferenciales?.FirstOrDefault()?.Nombre ?? "—",
        fechaRegistro = resultado.FechaRegistro
    };

    await _notificaciones.NotificarNuevoTriage(notif);

    if (resultado.Nivel == Domain.Enums.NivelTriage.Emergencia ||
        resultado.Nivel == Domain.Enums.NivelTriage.Urgente)
        await _notificaciones.NotificarEmergencia(notif);

    // Emitir actualización del dashboard en background
    _ = Task.Run(async () =>
    {
        try { await _dashboardService.EmitirActualizacionAsync(); }
        catch { }
    });

    return CreatedAtAction(nameof(GetById), new { id = resultado.Id },
        new { exitoso = true, data = resultado });
}

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var triage = await _triageService.ObtenerPorIdAsync(id);
        if (triage == null) return NotFound();
        return Ok(new { exitoso = true, data = triage });
    }

 [HttpGet("reporte")]
[Authorize(Roles = "Admin,Staff")]
public async Task<IActionResult> GetReporte(
    [FromQuery] DateTime desde,
    [FromQuery] DateTime hasta,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var result = await _triageService.ObtenerPorFechaPaginadoAsync(desde, hasta, page, pageSize);
    return Ok(new { exitoso = true, data = result });
}

[HttpGet("paciente/{pacienteId:guid}")]
public async Task<IActionResult> GetByPaciente(
    Guid pacienteId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var result = await _triageService.ObtenerPorPacientePaginadoAsync(pacienteId, page, pageSize);
    return Ok(new { exitoso = true, data = result });
}
}