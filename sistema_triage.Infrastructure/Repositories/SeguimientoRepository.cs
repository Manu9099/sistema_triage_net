using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;

namespace sistema_triage.Infrastructure.Repositories;

public class SeguimientoRepository : Repository<SeguimientoTriage>, ISeguimientoRepository
{
    public SeguimientoRepository(AppDbContext context) : base(context) { }

    public async Task<SeguimientoTriage?> GetByTriageAsync(Guid triageId) =>
        await _dbSet
            .Include(s => s.Triage).ThenInclude(t => t.Paciente)
            .FirstOrDefaultAsync(s => s.TriageId == triageId);

    public async Task<IEnumerable<SeguimientoTriage>> GetByPacienteAsync(Guid pacienteId) =>
        await _dbSet
            .Include(s => s.Triage)
            .Where(s => s.Triage.PacienteId == pacienteId)
            .OrderByDescending(s => s.FechaRegistro)
            .ToListAsync();
}