using sistema_triage.Domain.Enums;

namespace sistema_triage.Domain.Entities;

public class TriageRegistro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PacienteId { get; set; }
    public string UsuarioRegistraId { get; set; } = string.Empty;

    // Datos vitales
    public int Edad { get; set; }
    public string InicioSintomas { get; set; } = string.Empty; // agudo, subagudo, cronico

    // Síntomas seleccionados (guardados como JSON)
    public string SignosAlarmaJson { get; set; } = "[]";
    public string SintomasRespJson { get; set; } = "[]";
    public string SintomasCardioJson { get; set; } = "[]";
    public string SintomasDigestJson { get; set; } = "[]";
    public string SintomasGeneralJson { get; set; } = "[]";

    // Resultado
    public NivelTriage Nivel { get; set; }
    public string RecomendacionClinica { get; set; } = string.Empty;
    public string TiempoAtencion { get; set; } = string.Empty;

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public string? Observaciones { get; set; }

    // Navegación
    public Paciente Paciente { get; set; } = null!;
    public ApplicationUser UsuarioRegistra { get; set; } = null!;


    // Signos vitales
    public decimal? Temperatura { get; set; }        // °C
    public int? FrecuenciaCardiaca { get; set; }     // lpm
    public int? FrecuenciaRespiratoria { get; set; } // rpm
    public int? SaturacionOxigeno { get; set; }      // %
    public string? PresionArterial { get; set; }     // ej: "120/80"
    public decimal? Glucosa { get; set; }            // mg/dL
}