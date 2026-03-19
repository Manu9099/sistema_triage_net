using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Domain.Models;
using sistema_triage.Infrastructure.Data;
using sistema_triage.Infrastructure.Extensions;

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

            public async Task<PaginatedResult<TriageRegistro>> GetByFechaPaginadoAsync(
    DateTime desde, DateTime hasta, int page, int pageSize)
{
    return await _dbSet
        .Include(t => t.Paciente)
        .Where(t => t.FechaRegistro >= desde && t.FechaRegistro <= hasta)
        .OrderByDescending(t => t.FechaRegistro)
        .ToPaginatedAsync(page, pageSize);
}

public async Task<PaginatedResult<TriageRegistro>> GetByPacientePaginadoAsync(
    Guid pacienteId, int page, int pageSize)
{
    return await _dbSet
        .Include(t => t.Paciente)
        .Where(t => t.PacienteId == pacienteId)
        .OrderByDescending(t => t.FechaRegistro)
        .ToPaginatedAsync(page, pageSize);
}

 
}