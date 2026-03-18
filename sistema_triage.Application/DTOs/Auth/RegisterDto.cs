namespace sistema_triage.Application.DTOs.Auth;

public class RegisterDto
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmarPassword { get; set; } = string.Empty;
    public string Rol { get; set; } = "Paciente"; // Admin, Staff, Paciente
}