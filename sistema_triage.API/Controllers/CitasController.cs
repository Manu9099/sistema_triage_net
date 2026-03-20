using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Citas;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Interfaces;
using System.Security.Claims;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CitasController : ControllerBase
{
    private readonly ICitaService _citaService;
    private readonly IPacienteRepository _pacienteRepo;

    public CitasController(ICitaService citaService, IPacienteRepository pacienteRepo)
    {
        _citaService = citaService;
        _pacienteRepo = pacienteRepo;
    }

    // ── SLOTS ──────────────────────────────────────────────

    [HttpGet("slots")]
    public async Task<IActionResult> GetSlotsDisponibles(
        [FromQuery] DateTime desde,
        [FromQuery] DateTime hasta) =>
        Ok(new { exitoso = true, data = await _citaService.ObtenerSlotsDisponiblesAsync(desde, hasta) });

    [HttpPost("slots")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> CrearSlots([FromBody] CrearSlotDto dto)
    {
        var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var slots = await _citaService.CrearSlotsAsync(dto, staffId);
        return Ok(new { exitoso = true, data = slots });
    }

    [HttpDelete("slots/{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> EliminarSlot(Guid id)
    {
        await _citaService.EliminarSlotAsync(id);
        return Ok(new { exitoso = true, mensaje = "Slot eliminado" });
    }

    // ── CITAS ──────────────────────────────────────────────

    [HttpPost("solicitar")]
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> SolicitarCita([FromBody] SolicitarCitaDto dto)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value!;
        var pacientes = await _pacienteRepo.FindAsync(p => p.Email == email && p.Activo);
        var paciente = pacientes.FirstOrDefault()
            ?? throw new KeyNotFoundException("Paciente no encontrado");
        var cita = await _citaService.SolicitarCitaAsync(dto, paciente.Id);
        return Ok(new { exitoso = true, data = cita });
    }

    [HttpPut("{id:guid}/gestionar")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GestionarCita(Guid id, [FromBody] GestionarCitaDto dto)
    {
        var cita = await _citaService.GestionarCitaAsync(id, dto);
        return Ok(new { exitoso = true, data = cita });
    }

    [HttpGet("pendientes")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetPendientes() =>
        Ok(new { exitoso = true, data = await _citaService.ObtenerCitasPendientesAsync() });

    [HttpGet("reporte")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetReporte(
        [FromQuery] DateTime desde,
        [FromQuery] DateTime hasta) =>
        Ok(new { exitoso = true, data = await _citaService.ObtenerCitasPorFechaAsync(desde, hasta) });

    [HttpGet("mis-citas")]
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> GetMisCitas()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value!;
        var pacientes = await _pacienteRepo.FindAsync(p => p.Email == email && p.Activo);
        var paciente = pacientes.FirstOrDefault()
            ?? throw new KeyNotFoundException("Paciente no encontrado");
        var citas = await _citaService.ObtenerCitasPorPacienteAsync(paciente.Id);
        return Ok(new { exitoso = true, data = citas });
    }
    [HttpDelete("{id:guid}/cancelar")]
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> CancelarPorPaciente(Guid id, [FromBody] string? motivo)
    {
    var email = User.FindFirst(ClaimTypes.Email)?.Value!;
    var pacientes = await _pacienteRepo.FindAsync(p => p.Email == email && p.Activo);
    var paciente = pacientes.FirstOrDefault()
        ?? throw new KeyNotFoundException("Paciente no encontrado");

    var cita = await _citaService.CancelarPorPacienteAsync(id, paciente.Id, motivo);
    return Ok(new { exitoso = true, data = cita });
    }

}