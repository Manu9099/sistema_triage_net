// RegistrarSeguimientoDto.cs
namespace sistema_triage.Application.DTOs.Seguimiento;

public class RegistrarSeguimientoDto
{
    public Guid TriageId { get; set; }
    public bool FueAtendido { get; set; }
    public string? DiagnosticoConfirmado { get; set; }
    public bool NivelTriageCorrecto { get; set; }
    public int? NivelTriageReal { get; set; }
    public string? Observaciones { get; set; }
    public string? MedicamentosIndicados { get; set; }
}