using sistema_triage.Application.DTOs.Citas;

namespace sistema_triage.Application.Services.Interfaces;

public interface ICitaService
{
    Task<IEnumerable<SlotResponseDto>> ObtenerSlotsDisponiblesAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<SlotResponseDto>> CrearSlotsAsync(CrearSlotDto dto, string staffId);
    Task<CitaResponseDto> SolicitarCitaAsync(SolicitarCitaDto dto, Guid pacienteId);
    Task<CitaResponseDto> GestionarCitaAsync(Guid citaId, GestionarCitaDto dto);
    Task<IEnumerable<CitaResponseDto>> ObtenerCitasPorPacienteAsync(Guid pacienteId);
    Task<IEnumerable<CitaResponseDto>> ObtenerCitasPorFechaAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<CitaResponseDto>> ObtenerCitasPendientesAsync();
    Task EliminarSlotAsync(Guid slotId);
}