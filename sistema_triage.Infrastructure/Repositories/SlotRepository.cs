using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;

namespace sistema_triage.Infrastructure.Repositories;

public class SlotRepository : Repository<SlotDisponibilidad>, ISlotRepository
{
    public SlotRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<SlotDisponibilidad>> GetDisponiblesAsync(DateTime desde, DateTime hasta) =>
        await _dbSet
            .Include(s => s.Staff)
            .Where(s => s.Disponible && s.FechaHoraInicio >= desde && s.FechaHoraInicio <= hasta)
            .OrderBy(s => s.FechaHoraInicio)
            .ToListAsync();

    public async Task<IEnumerable<SlotDisponibilidad>> GetByStaffAsync(string staffId, DateTime desde, DateTime hasta) =>
        await _dbSet
            .Include(s => s.Cita)
            .Where(s => s.StaffId == staffId && s.FechaHoraInicio >= desde && s.FechaHoraInicio <= hasta)
            .OrderBy(s => s.FechaHoraInicio)
            .ToListAsync();
}