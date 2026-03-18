using sistema_triage.Domain.Enums;

namespace sistema_triage.Domain.Entities;

public class Paciente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public int Edad => DateTime.UtcNow.Year - FechaNacimiento.Year;
    public Genero Genero { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? FotoUrl { get; set; }
    public string? FotoBlobNombre { get; set; }
    public string? Alergias { get; set; }
    public string? Comorbilidades { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public bool Activo { get; set; } = true;

    // Navegación
    public ICollection<TriageRegistro> Triages { get; set; } = new List<TriageRegistro>();

    
}