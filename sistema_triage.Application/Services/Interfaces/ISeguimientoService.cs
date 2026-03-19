using sistema_triage.Application.DTOs.Seguimiento;

namespace sistema_triage.Application.Services.Interfaces;

public interface ISeguimientoService
{
    Task<SeguimientoResponseDto> RegistrarAsync(RegistrarSeguimientoDto dto, string usuarioId);
    Task<SeguimientoResponseDto?> ObtenerPorTriageAsync(Guid triageId);
    Task<IEnumerable<SeguimientoResponseDto>> ObtenerPorPacienteAsync(Guid pacienteId);
}