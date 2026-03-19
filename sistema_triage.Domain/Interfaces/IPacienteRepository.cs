using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Models;

namespace sistema_triage.Domain.Interfaces;

public interface IPacienteRepository : IRepository<Paciente>
{
    Task<Paciente?> GetByDocumentoAsync(string numeroDocumento);
    Task<Paciente?> GetWithTriagesAsync(Guid id);
    Task<IEnumerable<Paciente>> SearchAsync(string termino);
    Task<PaginatedResult<Paciente>> GetPaginadoAsync(string? busqueda, int page, int pageSize);
}