using sistema_triage.Domain.Enums;
using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.DTOs.Triage;

public class TriageResponseDto
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public int Edad { get; set; }
    public string InicioSintomas { get; set; } = string.Empty;
    public NivelTriage Nivel { get; set; }
    public string NivelDescripcion => Nivel.ToString();
    public string RecomendacionClinica { get; set; } = string.Empty;
    public string TiempoAtencion { get; set; } = string.Empty;
    public List<string> SignosAlarma { get; set; } = new();
    public List<string> TodosSintomas { get; set; } = new();
    public string? Observaciones { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string UsuarioRegistra { get; set; } = string.Empty;

    // Agregar esta propiedad al final de la clase TriageResponseDto
    public List<ResultadoDiagnostico> DiagnosticosDiferenciales { get; set; } = new();

    // Signos vitales
    public decimal? Temperatura { get; set; }
    public int? FrecuenciaCardiaca { get; set; }
    public int? FrecuenciaRespiratoria { get; set; }
    public int? SaturacionOxigeno { get; set; }
    public string? PresionArterial { get; set; }
    public decimal? Glucosa { get; set; }
    public List<string> AlertasVitales { get; set; } = new();
}