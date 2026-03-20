using sistema_triage.Application.DTOs.Citas;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Enums;
using sistema_triage.Domain.Interfaces;

namespace sistema_triage.Application.Services;

public class CitaService : ICitaService
{
    private readonly ISlotRepository _slotRepo;
    private readonly ICitaRepository _citaRepo;
    private readonly IPacienteRepository _pacienteRepo;

    public CitaService(ISlotRepository slotRepo, ICitaRepository citaRepo, IPacienteRepository pacienteRepo)
    {
        _slotRepo = slotRepo;
        _citaRepo = citaRepo;
        _pacienteRepo = pacienteRepo;
    }

    public async Task<IEnumerable<SlotResponseDto>> ObtenerSlotsDisponiblesAsync(DateTime desde, DateTime hasta)
    {
        var slots = await _slotRepo.GetDisponiblesAsync(desde, hasta);
        return slots.Select(MapSlotToDto);
    }

    public async Task<IEnumerable<SlotResponseDto>> CrearSlotsAsync(CrearSlotDto dto, string staffId)
    {
        var slots = new List<SlotDisponibilidad>();
        var inicio = dto.FechaHoraInicio;

        for (int i = 0; i < dto.CantidadSlots; i++)
        {
            var slot = new SlotDisponibilidad
            {
                FechaHoraInicio = inicio,
                FechaHoraFin = inicio.AddMinutes(dto.DuracionMinutos),
                StaffId = staffId
            };
            await _slotRepo.AddAsync(slot);
            slots.Add(slot);
            inicio = inicio.AddMinutes(dto.DuracionMinutos);
        }

        await _slotRepo.SaveChangesAsync();
        return slots.Select(MapSlotToDto);
    }

    public async Task<CitaResponseDto> SolicitarCitaAsync(SolicitarCitaDto dto, Guid pacienteId)
    {
        var slot = await _slotRepo.GetByIdAsync(dto.SlotId)
            ?? throw new KeyNotFoundException("Slot no encontrado");

        if (!slot.Disponible)
            throw new InvalidOperationException("Este horario ya no está disponible");

        var paciente = await _pacienteRepo.GetByIdAsync(pacienteId)
            ?? throw new KeyNotFoundException("Paciente no encontrado");

        var cita = new Cita
        {
            PacienteId = pacienteId,
            SlotId = dto.SlotId,
            MotivoConsulta = dto.MotivoConsulta,
            Estado = EstadoCita.Pendiente
        };

        slot.Disponible = false;
        _slotRepo.Update(slot);
        await _citaRepo.AddAsync(cita);
        await _citaRepo.SaveChangesAsync();

        var citaCompleta = await _citaRepo.GetWithDetallesAsync(cita.Id);
        return MapCitaToDto(citaCompleta!);
    }

    public async Task<CitaResponseDto> GestionarCitaAsync(Guid citaId, GestionarCitaDto dto)
    {
        var cita = await _citaRepo.GetWithDetallesAsync(citaId)
            ?? throw new KeyNotFoundException("Cita no encontrada");

        switch (dto.Accion.ToLower())
        {
            case "confirmar":
                cita.Estado = EstadoCita.Confirmada;
                cita.FechaConfirmacion = DateTime.UtcNow;
                cita.NotasStaff = dto.NotasStaff;
                break;
            case "cancelar":
                cita.Estado = EstadoCita.Cancelada;
                cita.MotivoRechazo = dto.MotivoRechazo;
                cita.Slot.Disponible = true;
                break;
            case "completar":
                cita.Estado = EstadoCita.Completada;
                cita.NotasStaff = dto.NotasStaff;
                break;
            case "reprogramar":
                if (!dto.NuevoSlotId.HasValue)
                    throw new ArgumentException("Debe indicar el nuevo slot");
                var nuevoSlot = await _slotRepo.GetByIdAsync(dto.NuevoSlotId.Value)
                    ?? throw new KeyNotFoundException("Nuevo slot no encontrado");
                if (!nuevoSlot.Disponible)
                    throw new InvalidOperationException("El nuevo slot no está disponible");
                cita.Slot.Disponible = true;
                nuevoSlot.Disponible = false;
                cita.SlotId = dto.NuevoSlotId.Value;
                cita.Estado = EstadoCita.Reprogramada;
                cita.NotasStaff = dto.NotasStaff;
                _slotRepo.Update(nuevoSlot);
                break;
            default:
                throw new ArgumentException("Acción no válida");
        }

        _citaRepo.Update(cita);
        await _citaRepo.SaveChangesAsync();
        return MapCitaToDto(cita);
    }

    public async Task<IEnumerable<CitaResponseDto>> ObtenerCitasPorPacienteAsync(Guid pacienteId) =>
        (await _citaRepo.GetByPacienteAsync(pacienteId)).Select(MapCitaToDto);

    public async Task<IEnumerable<CitaResponseDto>> ObtenerCitasPorFechaAsync(DateTime desde, DateTime hasta) =>
        (await _citaRepo.GetByFechaAsync(desde, hasta)).Select(MapCitaToDto);

    public async Task<IEnumerable<CitaResponseDto>> ObtenerCitasPendientesAsync() =>
        (await _citaRepo.GetPendientesAsync()).Select(MapCitaToDto);

    public async Task EliminarSlotAsync(Guid slotId)
    {
        var slot = await _slotRepo.GetByIdAsync(slotId)
            ?? throw new KeyNotFoundException("Slot no encontrado");
        if (!slot.Disponible)
            throw new InvalidOperationException("No se puede eliminar un slot con cita asignada");
        _slotRepo.Delete(slot);
        await _slotRepo.SaveChangesAsync();
    }

    private static SlotResponseDto MapSlotToDto(SlotDisponibilidad s) => new()
    {
        Id = s.Id,
        FechaHoraInicio = s.FechaHoraInicio,
        FechaHoraFin = s.FechaHoraFin,
        Disponible = s.Disponible,
        NombreStaff = s.Staff != null ? $"{s.Staff.Nombres} {s.Staff.Apellidos}" : "—"
    };

    private static CitaResponseDto MapCitaToDto(Cita c) => new()
    {
        Id = c.Id,
        PacienteId = c.PacienteId,
        NombrePaciente = c.Paciente != null ? $"{c.Paciente.Nombres} {c.Paciente.Apellidos}" : "—",
        NumeroDocumento = c.Paciente?.NumeroDocumento ?? "—",
        EmailPaciente = c.Paciente?.Email,
        TelefonoPaciente = c.Paciente?.Telefono,
        FechaHoraInicio = c.Slot.FechaHoraInicio,
        FechaHoraFin = c.Slot.FechaHoraFin,
        MotivoConsulta = c.MotivoConsulta,
        Estado = c.Estado,
        NotasStaff = c.NotasStaff,
        MotivoRechazo = c.MotivoRechazo,
        NombreStaff = c.Slot.Staff != null ? $"{c.Slot.Staff.Nombres} {c.Slot.Staff.Apellidos}" : "—",
        FechaSolicitud = c.FechaSolicitud,
        FechaConfirmacion = c.FechaConfirmacion
    };

public async Task<CitaResponseDto> CancelarPorPacienteAsync(Guid citaId, Guid pacienteId, string? motivo)
{
    var cita = await _citaRepo.GetWithDetallesAsync(citaId)
        ?? throw new KeyNotFoundException("Cita no encontrada");

    if (cita.PacienteId != pacienteId)
        throw new UnauthorizedAccessException("No puedes cancelar una cita que no es tuya");

    if (cita.Estado == EstadoCita.Cancelada)
        throw new InvalidOperationException("La cita ya está cancelada");

    if (cita.Estado == EstadoCita.Completada)
        throw new InvalidOperationException("No puedes cancelar una cita completada");

    // Validar 24h de anticipación
    var horasRestantes = (cita.Slot.FechaHoraInicio - DateTime.UtcNow).TotalHours;
    if (horasRestantes < 24)
        throw new InvalidOperationException("Solo puedes cancelar con al menos 24 horas de anticipación");

    cita.Estado = EstadoCita.Cancelada;
    cita.MotivoRechazo = motivo ?? "Cancelado por el paciente";
    cita.Slot.Disponible = true;

    _citaRepo.Update(cita);
    await _citaRepo.SaveChangesAsync();

    return MapCitaToDto(cita);
}

}