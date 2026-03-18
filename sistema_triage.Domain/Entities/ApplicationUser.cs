using Microsoft.AspNetCore.Identity;

namespace sistema_triage.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public string? FotoBlobNombre { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public bool Activo { get; set; } = true;
}