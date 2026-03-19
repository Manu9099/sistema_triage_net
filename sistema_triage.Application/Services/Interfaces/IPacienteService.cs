using sistema_triage.Application.DTOs.Paciente;
using sistema_triage.Domain.Models;

namespace sistema_triage.Application.Services.Interfaces;

public interface IPacienteService
{
    Task<PacienteResponseDto> CrearAsync(CrearPacienteDto dto);
    Task<PacienteResponseDto> ActualizarAsync(Guid id, ActualizarPacienteDto dto);
    Task<PacienteResponseDto?> ObtenerPorIdAsync(Guid id);
    Task<PacienteResponseDto?> ObtenerPorDocumentoAsync(string documento);
    Task<IEnumerable<PacienteResponseDto>> BuscarAsync(string termino);
    Task<IEnumerable<PacienteResponseDto>> ObtenerTodosAsync();
    Task<string> ActualizarFotoAsync(Guid id, Stream stream, string nombreArchivo, string contentType);
    Task DesactivarAsync(Guid id);
    Task<PacienteResponseDto?> ObtenerPorEmailAsync(string email);

    Task<PaginatedResult<PacienteResponseDto>> ObtenerPaginadoAsync(string? busqueda, int page, int pageSize);
}