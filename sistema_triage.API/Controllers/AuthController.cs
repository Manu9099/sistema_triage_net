using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sistema_triage.Application.DTOs.Auth;
using sistema_triage.Application.Services.Interfaces;

namespace sistema_triage.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<LoginDto> _loginValidator;
    private readonly IValidator<RegisterDto> _registerValidator;

    public AuthController(
        IAuthService authService,
        IValidator<LoginDto> loginValidator,
        IValidator<RegisterDto> registerValidator)
    {
        _authService = authService;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var validacion = await _loginValidator.ValidateAsync(dto);
        if (!validacion.IsValid)
            return BadRequest(new { exitoso = false, errores = validacion.Errors.Select(e => e.ErrorMessage) });

        var resultado = await _authService.LoginAsync(dto);
        return Ok(new { exitoso = true, data = resultado });
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var validacion = await _registerValidator.ValidateAsync(dto);
        if (!validacion.IsValid)
            return BadRequest(new { exitoso = false, errores = validacion.Errors.Select(e => e.ErrorMessage) });

        var resultado = await _authService.RegisterAsync(dto);
        return Ok(new { exitoso = true, data = resultado });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] string refreshToken)
    {
        var resultado = await _authService.RefreshTokenAsync(refreshToken);
        return Ok(new { exitoso = true, data = resultado });
    }

    [HttpPost("revocar")]
    [Authorize]
    public async Task<IActionResult> Revocar()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;
        await _authService.RevocarTokenAsync(userId);
        return Ok(new { exitoso = true, mensaje = "Sesión cerrada correctamente" });
    }

    [HttpPost("crear-cuenta-paciente")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> CrearCuentaPaciente([FromBody] RegisterDto dto)
    {
    var validacion = await _registerValidator.ValidateAsync(dto);
    if (!validacion.IsValid)
        return BadRequest(new { exitoso = false, errores = validacion.Errors.Select(e => e.ErrorMessage) });

    dto.Rol = "Paciente";
    var resultado = await _authService.RegisterAsync(dto);
    return Ok(new { exitoso = true, data = resultado });
    }

}