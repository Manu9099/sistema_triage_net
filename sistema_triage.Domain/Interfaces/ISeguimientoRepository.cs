using sistema_triage.Domain.Entities;

namespace sistema_triage.Domain.Interfaces;

public interface ISeguimientoRepository : IRepository<SeguimientoTriage>
{
    Task<SeguimientoTriage?> GetByTriageAsync(Guid triageId);
    Task<IEnumerable<SeguimientoTriage>> GetByPacienteAsync(Guid pacienteId);
}