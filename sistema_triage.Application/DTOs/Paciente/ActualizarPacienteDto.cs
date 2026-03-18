using sistema_triage.Domain.Enums;

namespace sistema_triage.Application.DTOs.Paciente;

public class ActualizarPacienteDto
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public Genero Genero { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? Alergias { get; set; }
    public string? Comorbilidades { get; set; }
}