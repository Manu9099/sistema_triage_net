using sistema_triage.Domain.Enums;

namespace sistema_triage.Application.DTOs.Citas;

public class CitaResponseDto
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public string NumeroDocumento { get; set; } = string.Empty;
    public string? EmailPaciente { get; set; }
    public string? TelefonoPaciente { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public string Fecha => FechaHoraInicio.ToString("dd/MM/yyyy");
    public string Hora => FechaHoraInicio.ToString("HH:mm");
    public string? MotivoConsulta { get; set; }
    public EstadoCita Estado { get; set; }
    public string EstadoDescripcion => Estado.ToString();
    public string? NotasStaff { get; set; }
    public string? MotivoRechazo { get; set; }
    public string NombreStaff { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaConfirmacion { get; set; }
}