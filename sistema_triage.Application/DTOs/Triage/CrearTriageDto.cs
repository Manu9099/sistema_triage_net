namespace sistema_triage.Application.DTOs.Triage;

public class CrearTriageDto
{
    public Guid PacienteId { get; set; }
    public string InicioSintomas { get; set; } = string.Empty;
    public List<string> SignosAlarma { get; set; } = new();
    public List<string> SintomasResp { get; set; } = new();
    public List<string> SintomasCardio { get; set; } = new();
    public List<string> SintomasDigest { get; set; } = new();
    public List<string> SintomasGeneral { get; set; } = new();
    public string? Observaciones { get; set; }

    // Signos vitales
    public decimal? Temperatura { get; set; }
    public int? FrecuenciaCardiaca { get; set; }
    public int? FrecuenciaRespiratoria { get; set; }
    public int? SaturacionOxigeno { get; set; }
    public string? PresionArterial { get; set; }
    public decimal? Glucosa { get; set; }
}