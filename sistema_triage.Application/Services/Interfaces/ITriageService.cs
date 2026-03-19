using sistema_triage.Application.DTOs.Triage;
using sistema_triage.Domain.Models;

namespace sistema_triage.Application.Services.Interfaces;

public interface ITriageService
{
    Task<TriageResponseDto> RegistrarAsync(CrearTriageDto dto, string usuarioId);
    Task<TriageResponseDto?> ObtenerPorIdAsync(Guid id);
    Task<IEnumerable<TriageResponseDto>> ObtenerPorPacienteAsync(Guid pacienteId);
Task<PaginatedResult<TriageResponseDto>> ObtenerPorFechaPaginadoAsync(DateTime desde, DateTime hasta, int page, int pageSize);
Task<PaginatedResult<TriageResponseDto>> ObtenerPorPacientePaginadoAsync(Guid pacienteId, int page, int pageSize);
}