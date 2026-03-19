using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Models;

namespace sistema_triage.Domain.Interfaces;

public interface ITriageRepository : IRepository<TriageRegistro>
{
    Task<IEnumerable<TriageRegistro>> GetByPacienteAsync(Guid pacienteId);
    Task<IEnumerable<TriageRegistro>> GetByFechaAsync(DateTime desde, DateTime hasta);
    Task<TriageRegistro?> GetWithPacienteAsync(Guid id);
   
    Task<PaginatedResult<TriageRegistro>> GetByPacientePaginadoAsync(Guid pacienteId, int page, int pageSize);
    Task<PaginatedResult<TriageRegistro>> GetByFechaPaginadoAsync(DateTime desde, DateTime hasta, int page, int pageSize);

}