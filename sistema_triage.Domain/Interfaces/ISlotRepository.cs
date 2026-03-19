using sistema_triage.Domain.Entities;

namespace sistema_triage.Domain.Interfaces;

public interface ISlotRepository : IRepository<SlotDisponibilidad>
{
    Task<IEnumerable<SlotDisponibilidad>> GetDisponiblesAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<SlotDisponibilidad>> GetByStaffAsync(string staffId, DateTime desde, DateTime hasta);
}