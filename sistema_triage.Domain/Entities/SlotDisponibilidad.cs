namespace sistema_triage.Domain.Entities;

public class SlotDisponibilidad
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public string StaffId { get; set; } = string.Empty;
    public bool Disponible { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public ApplicationUser Staff { get; set; } = null!;
    public Cita? Cita { get; set; }
}