using sistema_triage.Domain.Enums;

namespace sistema_triage.Domain.Entities;

public class Cita
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PacienteId { get; set; }
    public Guid SlotId { get; set; }
    public string? MotivoConsulta { get; set; }
    public EstadoCita Estado { get; set; } = EstadoCita.Pendiente;
    public string? NotasStaff { get; set; }
    public string? MotivoRechazo { get; set; }
    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;
    public DateTime? FechaConfirmacion { get; set; }

    // Navegación
    public Paciente Paciente { get; set; } = null!;
    public SlotDisponibilidad Slot { get; set; } = null!;
}