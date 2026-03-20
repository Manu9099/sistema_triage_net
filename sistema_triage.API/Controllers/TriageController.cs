using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Triage;
using sistema_triage.Application.Services.Interfaces;
using System.Security.Claims;
using sistema_triage.API.Services;
using sistema_triage.Infrastructure.ML;
using sistema_triage.Application.Diagnostico;
using sistema_triage.Application.DTOs.Paciente;
using sistema_triage.Domain.Interfaces;

namespace sistema_triage.API.Controllers;




[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TriageController : ControllerBase
{
private readonly ITriageService _triageService;
private readonly NotificacionService _notificaciones;
private readonly DashboardService _dashboardService;
private readonly DiagnosticoMLService _mlService;
private readonly IPacienteRepository _pacienteRepo;

public TriageController(
    ITriageService triageService,
    NotificacionService notificaciones,
    DashboardService dashboardService,
    DiagnosticoMLService mlService,
    IPacienteRepository pacienteRepo)
{
    _triageService = triageService;
    _notificaciones = notificaciones;
    _dashboardService = dashboardService;
    _mlService = mlService;
    _pacienteRepo = pacienteRepo;
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
// Enriquecer diagnósticos con ML si está disponible
if (_mlService.ModeloDisponible && resultado.DiagnosticosDiferenciales?.Any() == true)
{
    var input = new TriageDiagnosticoInput
    {
        Edad = resultado.Edad,
        TieneSignosAlarma = dto.SignosAlarma.Any() ? 1f : 0f,
        TieneSintomasResp = dto.SintomasResp.Any() ? 1f : 0f,
        TieneSintomasCardio = dto.SintomasCardio.Any() ? 1f : 0f,
        TieneSintomasDigest = dto.SintomasDigest.Any() ? 1f : 0f,
        TieneSintomasGeneral = dto.SintomasGeneral.Any() ? 1f : 0f,
        Temperatura = (float)(dto.Temperatura ?? 37m),
        FrecuenciaCardiaca = dto.FrecuenciaCardiaca ?? 80,
        SaturacionOxigeno = dto.SaturacionOxigeno ?? 98,
        NivelTriage = (float)resultado.Nivel,
        CantidadSintomas = dto.SignosAlarma.Count + dto.SintomasResp.Count +
                           dto.SintomasCardio.Count + dto.SintomasDigest.Count +
                           dto.SintomasGeneral.Count
    };

    var prediccionesML = _mlService.Predecir(input);
    resultado.DiagnosticosDiferenciales = MotorDiagnostico.CombinarConML(
        resultado.DiagnosticosDiferenciales, prediccionesML);
}
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
    [Authorize]
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
[Authorize]
public async Task<IActionResult> GetByPaciente(
    Guid pacienteId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var result = await _triageService.ObtenerPorPacientePaginadoAsync(pacienteId, page, pageSize);
    return Ok(new { exitoso = true, data = result });
}

[HttpGet("stats-rango")]
[Authorize(Roles = "Admin,Staff")]
public async Task<IActionResult> GetStatsRango(
    [FromQuery] DateTime desde,
    [FromQuery] DateTime hasta)
{
    var stats = await _triageService.ObtenerStatsRangoAsync(desde, hasta);
    return Ok(new { exitoso = true, data = stats });
}

}
