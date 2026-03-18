using sistema_triage.Domain.Enums;

namespace sistema_triage.Application.DTOs.Paciente;

public class PacienteResponseDto
{
    public Guid Id { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string NombreCompleto => $"{Nombres} {Apellidos}";
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public int Edad { get; set; }
    public Genero Genero { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? FotoUrl { get; set; }
    public string? Alergias { get; set; }
    public string? Comorbilidades { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool TieneCuenta { get; set; }
}