namespace sistema_triage.Domain.Entities;

public class SeguimientoTriage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TriageId { get; set; }
    public bool FueAtendido { get; set; }
    public string? DiagnosticoConfirmado { get; set; }
    public bool NivelTriageCorrecto { get; set; }
    public int? NivelTriageReal { get; set; }
    public string? Observaciones { get; set; }
    public string? MedicamentosIndicados { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Navegación
    public TriageRegistro Triage { get; set; } = null!;
}