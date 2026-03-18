using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;

namespace sistema_triage.Infrastructure.Repositories;

public class PacienteRepository : Repository<Paciente>, IPacienteRepository
{
    public PacienteRepository(AppDbContext context) : base(context) { }

    public async Task<Paciente?> GetByDocumentoAsync(string numeroDocumento) =>
        await _dbSet.FirstOrDefaultAsync(p => p.NumeroDocumento == numeroDocumento);

    public async Task<Paciente?> GetWithTriagesAsync(Guid id) =>
        await _dbSet
            .Include(p => p.Triages)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Paciente>> SearchAsync(string termino) =>
        await _dbSet
            .Where(p => p.Activo && (
                p.Nombres.Contains(termino) ||
                p.Apellidos.Contains(termino) ||
                p.NumeroDocumento.Contains(termino) ||
                (p.Email != null && p.Email.Contains(termino))
            ))
            .OrderBy(p => p.Apellidos)
            .Take(50)
            .ToListAsync();
}