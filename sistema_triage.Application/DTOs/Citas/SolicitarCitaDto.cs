namespace sistema_triage.Application.DTOs.Citas;

public class SolicitarCitaDto
{
    public Guid SlotId { get; set; }
    public string? MotivoConsulta { get; set; }
}