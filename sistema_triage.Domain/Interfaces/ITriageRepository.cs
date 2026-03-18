using sistema_triage.Domain.Entities;

namespace sistema_triage.Domain.Interfaces;

public interface ITriageRepository : IRepository<TriageRegistro>
{
    Task<IEnumerable<TriageRegistro>> GetByPacienteAsync(Guid pacienteId);
    Task<IEnumerable<TriageRegistro>> GetByFechaAsync(DateTime desde, DateTime hasta);
    Task<TriageRegistro?> GetWithPacienteAsync(Guid id);
}