// SeguimientoResponseDto.cs
namespace sistema_triage.Application.DTOs.Seguimiento;

public class SeguimientoResponseDto
{
    public Guid Id { get; set; }
    public Guid TriageId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public bool FueAtendido { get; set; }
    public string? DiagnosticoConfirmado { get; set; }
    public bool NivelTriageCorrecto { get; set; }
    public int? NivelTriageReal { get; set; }
    public string? Observaciones { get; set; }
    public string? MedicamentosIndicados { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public int NivelTriageOriginal { get; set; }
    public string DiagnosticoPrincipal { get; set; } = string.Empty;
    public DateTime FechaTriage { get; set; }
}