using sistema_triage.Application.DTOs.Seguimiento;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;

namespace sistema_triage.Application.Services;

public class SeguimientoService : ISeguimientoService
{
    private readonly ISeguimientoRepository _repo;
    private readonly ITriageRepository _triageRepo;

    public SeguimientoService(ISeguimientoRepository repo, ITriageRepository triageRepo)
    {
        _repo = repo;
        _triageRepo = triageRepo;
    }

    public async Task<SeguimientoResponseDto> RegistrarAsync(RegistrarSeguimientoDto dto, string usuarioId)
    {
        var triage = await _triageRepo.GetWithPacienteAsync(dto.TriageId)
            ?? throw new KeyNotFoundException("Triage no encontrado");

        var existente = await _repo.GetByTriageAsync(dto.TriageId);
        if (existente != null)
            throw new InvalidOperationException("Este triage ya tiene seguimiento registrado");

        var seguimiento = new SeguimientoTriage
        {
            TriageId = dto.TriageId,
            FueAtendido = dto.FueAtendido,
            DiagnosticoConfirmado = dto.DiagnosticoConfirmado,
            NivelTriageCorrecto = dto.NivelTriageCorrecto,
            NivelTriageReal = dto.NivelTriageReal,
            Observaciones = dto.Observaciones,
            MedicamentosIndicados = dto.MedicamentosIndicados,
            RegistradoPor = usuarioId
        };

        await _repo.AddAsync(seguimiento);
        await _repo.SaveChangesAsync();

        return MapToDto(seguimiento, triage);
    }

    public async Task<SeguimientoResponseDto?> ObtenerPorTriageAsync(Guid triageId)
    {
        var s = await _repo.GetByTriageAsync(triageId);
        if (s == null) return null;
        return MapToDto(s, s.Triage);
    }

    public async Task<IEnumerable<SeguimientoResponseDto>> ObtenerPorPacienteAsync(Guid pacienteId)
    {
        var seguimientos = await _repo.GetByPacienteAsync(pacienteId);
        return seguimientos.Select(s => MapToDto(s, s.Triage));
    }

    private static SeguimientoResponseDto MapToDto(SeguimientoTriage s, TriageRegistro t) => new()
    {
        Id = s.Id,
        TriageId = s.TriageId,
        NombrePaciente = t.Paciente != null
            ? $"{t.Paciente.Nombres} {t.Paciente.Apellidos}" : "—",
        FueAtendido = s.FueAtendido,
        DiagnosticoConfirmado = s.DiagnosticoConfirmado,
        NivelTriageCorrecto = s.NivelTriageCorrecto,
        NivelTriageReal = s.NivelTriageReal,
        Observaciones = s.Observaciones,
        MedicamentosIndicados = s.MedicamentosIndicados,
        RegistradoPor = s.RegistradoPor,
        FechaRegistro = s.FechaRegistro,
        NivelTriageOriginal = (int)t.Nivel,
        FechaTriage = t.FechaRegistro
    };
}