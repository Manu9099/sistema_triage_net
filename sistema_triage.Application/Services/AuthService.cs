using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using sistema_triage.Application.DTOs.Auth;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Entities;

namespace sistema_triage.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas");

        if (!user.Activo)
            throw new UnauthorizedAccessException("Usuario desactivado");

        var valido = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!valido)
            throw new UnauthorizedAccessException("Credenciales inválidas");

        return await GenerarTokenAsync(user);
    }

    public async Task<TokenResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existe = await _userManager.FindByEmailAsync(dto.Email);
        if (existe != null)
            throw new InvalidOperationException("El email ya está registrado");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            Nombres = dto.Nombres,
            Apellidos = dto.Apellidos,
            EmailConfirmed = true
        };

        var resultado = await _userManager.CreateAsync(user, dto.Password);
        if (!resultado.Succeeded)
        {
            var errores = resultado.Errors.Select(e => e.Description).ToList();
            throw new InvalidOperationException(string.Join(", ", errores));
        }

        await _userManager.AddToRoleAsync(user, dto.Rol);
        return await GenerarTokenAsync(user);
    }

    public async Task<TokenResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = _userManager.Users
            .FirstOrDefault(u => u.SecurityStamp == refreshToken)
            ?? throw new UnauthorizedAccessException("Refresh token inválido");

        return await GenerarTokenAsync(user);
    }

    public async Task RevocarTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("Usuario no encontrado");
        await _userManager.UpdateSecurityStampAsync(user);
    }

    private async Task<TokenResponseDto> GenerarTokenAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, $"{user.Nombres} {user.Apellidos}"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracion = DateTime.UtcNow.AddMinutes(
            int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60"));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiracion,
            signingCredentials: creds);

        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        user.SecurityStamp = refreshToken;
        await _userManager.UpdateAsync(user);

        return new TokenResponseDto
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            RefreshToken = refreshToken,
            Expiracion = expiracion,
            UserId = user.Id,
            Email = user.Email!,
            NombreCompleto = $"{user.Nombres} {user.Apellidos}",
            Roles = roles
        };
    }
}