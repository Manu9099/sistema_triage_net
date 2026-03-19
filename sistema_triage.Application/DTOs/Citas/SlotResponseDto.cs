namespace sistema_triage.Application.DTOs.Citas;

public class SlotResponseDto
{
    public Guid Id { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public bool Disponible { get; set; }
    public string NombreStaff { get; set; } = string.Empty;
    public string Fecha => FechaHoraInicio.ToString("dd/MM/yyyy");
    public string Hora => FechaHoraInicio.ToString("HH:mm");
}