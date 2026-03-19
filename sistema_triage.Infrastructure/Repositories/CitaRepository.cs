using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;

namespace sistema_triage.Infrastructure.Repositories;

public class CitaRepository : Repository<Cita>, ICitaRepository
{
    public CitaRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Cita>> GetByPacienteAsync(Guid pacienteId) =>
        await _dbSet
            .Include(c => c.Slot).ThenInclude(s => s.Staff)
            .Where(c => c.PacienteId == pacienteId)
            .OrderByDescending(c => c.Slot.FechaHoraInicio)
            .ToListAsync();

    public async Task<IEnumerable<Cita>> GetByFechaAsync(DateTime desde, DateTime hasta) =>
        await _dbSet
            .Include(c => c.Paciente)
            .Include(c => c.Slot).ThenInclude(s => s.Staff)
            .Where(c => c.Slot.FechaHoraInicio >= desde && c.Slot.FechaHoraInicio <= hasta)
            .OrderBy(c => c.Slot.FechaHoraInicio)
            .ToListAsync();

    public async Task<Cita?> GetWithDetallesAsync(Guid id) =>
        await _dbSet
            .Include(c => c.Paciente)
            .Include(c => c.Slot).ThenInclude(s => s.Staff)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Cita>> GetPendientesAsync() =>
        await _dbSet
            .Include(c => c.Paciente)
            .Include(c => c.Slot).ThenInclude(s => s.Staff)
            .Where(c => c.Estado == Domain.Enums.EstadoCita.Pendiente)
            .OrderBy(c => c.Slot.FechaHoraInicio)
            .ToListAsync();
}