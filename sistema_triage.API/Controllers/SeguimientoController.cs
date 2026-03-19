using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Seguimiento;
using sistema_triage.Application.Services.Interfaces;
using System.Security.Claims;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class SeguimientoController : ControllerBase
{
    private readonly ISeguimientoService _service;

    public SeguimientoController(ISeguimientoService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarSeguimientoDto dto)
    {
        var usuarioId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var result = await _service.RegistrarAsync(dto, usuarioId);
        return Ok(new { exitoso = true, data = result });
    }

    [HttpGet("triage/{triageId:guid}")]
    public async Task<IActionResult> GetByTriage(Guid triageId)
    {
        var result = await _service.ObtenerPorTriageAsync(triageId);
        return Ok(new { exitoso = true, data = result });
    }

    [HttpGet("paciente/{pacienteId:guid}")]
    public async Task<IActionResult> GetByPaciente(Guid pacienteId)
    {
        var result = await _service.ObtenerPorPacienteAsync(pacienteId);
        return Ok(new { exitoso = true, data = result });
    }
}