using sistema_triage.Application.DTOs.Auth;

namespace sistema_triage.Application.Services.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
    Task<TokenResponseDto> RegisterAsync(RegisterDto dto);
    Task<TokenResponseDto> RefreshTokenAsync(string refreshToken);
    Task RevocarTokenAsync(string userId);
}