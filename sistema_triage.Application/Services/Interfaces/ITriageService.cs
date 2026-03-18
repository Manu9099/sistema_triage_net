using sistema_triage.Application.DTOs.Triage;

namespace sistema_triage.Application.Services.Interfaces;

public interface ITriageService
{
    Task<TriageResponseDto> RegistrarAsync(CrearTriageDto dto, string usuarioId);
    Task<TriageResponseDto?> ObtenerPorIdAsync(Guid id);
    Task<IEnumerable<TriageResponseDto>> ObtenerPorPacienteAsync(Guid pacienteId);
    Task<IEnumerable<TriageResponseDto>> ObtenerPorFechaAsync(DateTime desde, DateTime hasta);
}