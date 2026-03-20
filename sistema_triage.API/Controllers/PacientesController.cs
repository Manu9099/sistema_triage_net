using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Paciente;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Interfaces;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class PacientesController : ControllerBase
{
    private readonly IPacienteService _pacienteService;
    private readonly IValidator<CrearPacienteDto> _crearValidator;
    private readonly IPacienteRepository _pacienteRepo;

    public PacientesController(IPacienteService pacienteService, IValidator<CrearPacienteDto> crearValidator, IPacienteRepository pacienteRepo)
    {
        _pacienteService = pacienteService;
        _crearValidator = crearValidator;
        _pacienteRepo = pacienteRepo;
    }



    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var paciente = await _pacienteService.ObtenerPorIdAsync(id);
        if (paciente == null) return NotFound();
        return Ok(new { exitoso = true, data = paciente });
    }

    [HttpGet("documento/{numero}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetByDocumento(string numero)
    {
        var paciente = await _pacienteService.ObtenerPorDocumentoAsync(numero);
        if (paciente == null) return NotFound();
        return Ok(new { exitoso = true, data = paciente });
    }

    [HttpGet("buscar")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Buscar([FromQuery] string termino) =>
        Ok(new { exitoso = true, data = await _pacienteService.BuscarAsync(termino) });

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Crear([FromBody] CrearPacienteDto dto)
    {
        var validacion = await _crearValidator.ValidateAsync(dto);
        if (!validacion.IsValid)
            return BadRequest(new { exitoso = false, errores = validacion.Errors.Select(e => e.ErrorMessage) });

        var resultado = await _pacienteService.CrearAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = resultado.Id },
            new { exitoso = true, data = resultado });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Actualizar(Guid id, [FromBody] ActualizarPacienteDto dto)
    {
        var resultado = await _pacienteService.ActualizarAsync(id, dto);
        return Ok(new { exitoso = true, data = resultado });
    }

    [HttpPost("{id:guid}/foto")]
    [Authorize]
    public async Task<IActionResult> SubirFoto(Guid id, IFormFile foto)
    {
        if (foto == null || foto.Length == 0)
            return BadRequest(new { exitoso = false, mensaje = "Archivo inválido" });

        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(foto.FileName).ToLower();
        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { exitoso = false, mensaje = "Solo se permiten imágenes jpg, png o webp" });

        if (foto.Length > 5 * 1024 * 1024)
            return BadRequest(new { exitoso = false, mensaje = "La imagen no puede superar 5MB" });

        using var stream = foto.OpenReadStream();
        var url = await _pacienteService.ActualizarFotoAsync(id, stream, foto.FileName, foto.ContentType);
        return Ok(new { exitoso = true, data = new { url } });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Desactivar(Guid id)
    {
        await _pacienteService.DesactivarAsync(id);
        return Ok(new { exitoso = true, mensaje = "Paciente desactivado correctamente" });
    }
    [HttpGet("mi-perfil")]
[Authorize(Roles = "Paciente")]
public async Task<IActionResult> GetMiPerfil()
{
    var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(email)) return Unauthorized();

    var paciente = await _pacienteService.ObtenerPorEmailAsync(email);
    if (paciente == null) return NotFound(new { exitoso = false, mensaje = "Perfil no encontrado" });

    return Ok(new { exitoso = true, data = paciente });
}

[HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] string? busqueda,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var result = await _pacienteService.ObtenerPaginadoAsync(busqueda, page, pageSize);
    return Ok(new { exitoso = true, data = result });
}

[HttpPut("mi-perfil")]
[Authorize(Roles = "Paciente")]
public async Task<IActionResult> ActualizarMiPerfil([FromBody] ActualizarPacienteDto dto)
{
    var email = User.FindFirst(ClaimTypes.Email)?.Value!;
    var pacientes = await _pacienteRepo.FindAsync(p => p.Email == email && p.Activo);
    var paciente = pacientes.FirstOrDefault()
        ?? throw new KeyNotFoundException("Perfil no encontrado");
    var actualizado = await _pacienteService.ActualizarAsync(paciente.Id, dto);
    return Ok(new { exitoso = true, data = actualizado });
}

}