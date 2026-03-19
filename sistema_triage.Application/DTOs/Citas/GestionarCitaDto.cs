namespace sistema_triage.Application.DTOs.Citas;

public class GestionarCitaDto
{
    public string Accion { get; set; } = string.Empty; // confirmar, cancelar, completar
    public string? NotasStaff { get; set; }
    public string? MotivoRechazo { get; set; }
    public Guid? NuevoSlotId { get; set; } // para reprogramar
}