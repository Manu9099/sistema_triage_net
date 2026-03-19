namespace sistema_triage.Application.DTOs.Citas;

public class CrearSlotDto
{
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionMinutos { get; set; } = 30;
    public int CantidadSlots { get; set; } = 1;
}