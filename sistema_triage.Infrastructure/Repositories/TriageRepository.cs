using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;

namespace sistema_triage.Infrastructure.Repositories;

public class TriageRepository : Repository<TriageRegistro>, ITriageRepository
{
    public TriageRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<TriageRegistro>> GetByPacienteAsync(Guid pacienteId) =>
        await _dbSet
            .Where(t => t.PacienteId == pacienteId)
            .OrderByDescending(t => t.FechaRegistro)
            .ToListAsync();

    public async Task<IEnumerable<TriageRegistro>> GetByFechaAsync(DateTime desde, DateTime hasta) =>
        await _dbSet
            .Include(t => t.Paciente)
            .Where(t => t.FechaRegistro >= desde && t.FechaRegistro <= hasta)
            .OrderByDescending(t => t.FechaRegistro)
            .ToListAsync();

    public async Task<TriageRegistro?> GetWithPacienteAsync(Guid id) =>
        await _dbSet
            .Include(t => t.Paciente)
            .Include(t => t.UsuarioRegistra)
            .FirstOrDefaultAsync(t => t.Id == id);
}