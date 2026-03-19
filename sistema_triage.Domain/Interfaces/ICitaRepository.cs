using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Models;

namespace sistema_triage.Domain.Interfaces;

public interface ICitaRepository : IRepository<Cita>
{
    Task<IEnumerable<Cita>> GetByPacienteAsync(Guid pacienteId);
    Task<IEnumerable<Cita>> GetByFechaAsync(DateTime desde, DateTime hasta);
    Task<Cita?> GetWithDetallesAsync(Guid id);
    Task<IEnumerable<Cita>> GetPendientesAsync();
    Task<PaginatedResult<Cita>> GetByFechaPaginadoAsync(DateTime desde, DateTime hasta, int page, int pageSize);
}