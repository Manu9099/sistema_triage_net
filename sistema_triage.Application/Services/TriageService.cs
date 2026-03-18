using System.Text.Json;
using sistema_triage.Application.DTOs.Triage;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Enums;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Application.Diagnostico;

namespace sistema_triage.Application.Services;

public class TriageService : ITriageService
{
    private readonly ITriageRepository _repo;
    private readonly IPacienteRepository _pacienteRepo;

    public TriageService(ITriageRepository repo, IPacienteRepository pacienteRepo)
    {
        _repo = repo;
        _pacienteRepo = pacienteRepo;
    }

public async Task<TriageResponseDto> RegistrarAsync(CrearTriageDto dto, string usuarioId)
{
    var paciente = await _pacienteRepo.GetByIdAsync(dto.PacienteId)
        ?? throw new KeyNotFoundException("Paciente no encontrado");

    var nivel = CalcularNivel(dto, paciente.Edad);
    var (recomendacion, tiempo) = ObtenerRecomendacion(nivel);

    // Motor de diagnóstico diferencial
    var todosSintomas = dto.SignosAlarma
        .Concat(dto.SintomasResp)
        .Concat(dto.SintomasCardio)
        .Concat(dto.SintomasDigest)
        .Concat(dto.SintomasGeneral)
        .ToList();

    var diagnosticos = MotorDiagnostico.Analizar(todosSintomas, paciente.Edad);

    var triage = new TriageRegistro
    {
        PacienteId = dto.PacienteId,
        UsuarioRegistraId = usuarioId,
        Edad = paciente.Edad,
        InicioSintomas = dto.InicioSintomas,
        SignosAlarmaJson = JsonSerializer.Serialize(dto.SignosAlarma),
        SintomasRespJson = JsonSerializer.Serialize(dto.SintomasResp),
        SintomasCardioJson = JsonSerializer.Serialize(dto.SintomasCardio),
        SintomasDigestJson = JsonSerializer.Serialize(dto.SintomasDigest),
        SintomasGeneralJson = JsonSerializer.Serialize(dto.SintomasGeneral),
        Nivel = nivel,
        RecomendacionClinica = recomendacion,
        TiempoAtencion = tiempo,
        Observaciones = dto.Observaciones,
        Temperatura = dto.Temperatura,
        FrecuenciaCardiaca = dto.FrecuenciaCardiaca,
        FrecuenciaRespiratoria = dto.FrecuenciaRespiratoria,
        SaturacionOxigeno = dto.SaturacionOxigeno,
        PresionArterial = dto.PresionArterial,
        Glucosa = dto.Glucosa
    };

    await _repo.AddAsync(triage);
    await _repo.SaveChangesAsync();

    var response = MapToDto(triage, paciente);
    response.DiagnosticosDiferenciales = diagnosticos;
    return response;
}

public async Task<TriageResponseDto?> ObtenerPorIdAsync(Guid id)
{
    var t = await _repo.GetWithPacienteAsync(id);
    if (t == null) return null;
    var dto = MapToDto(t, t.Paciente);
    var sintomas = new List<string>();
    if (!string.IsNullOrEmpty(t.SignosAlarmaJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SignosAlarmaJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasRespJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasRespJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasCardioJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasCardioJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasDigestJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasDigestJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasGeneralJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasGeneralJson) ?? new());
    dto.DiagnosticosDiferenciales = MotorDiagnostico.Analizar(sintomas, t.Edad);
    return dto;
}

public async Task<IEnumerable<TriageResponseDto>> ObtenerPorPacienteAsync(Guid pacienteId)
{
    var paciente = await _pacienteRepo.GetByIdAsync(pacienteId);
    if (paciente == null) return new List<TriageResponseDto>();

    var triages = await _repo.GetByPacienteAsync(pacienteId);
    return triages.Select(t => {
        var dto = MapToDto(t, paciente);
        var sintomas = new List<string>();
        if (!string.IsNullOrEmpty(t.SignosAlarmaJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SignosAlarmaJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasRespJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasRespJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasCardioJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasCardioJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasDigestJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasDigestJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasGeneralJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasGeneralJson) ?? new());
        dto.DiagnosticosDiferenciales = MotorDiagnostico.Analizar(sintomas, t.Edad);
        return dto;
    });
}

public async Task<IEnumerable<TriageResponseDto>> ObtenerPorFechaAsync(DateTime desde, DateTime hasta)
{
    var triages = await _repo.GetByFechaAsync(desde, hasta);
    return triages.Select(t => {
        var dto = MapToDto(t, t.Paciente);
        // Recalcular diagnósticos desde síntomas guardados
        var sintomas = new List<string>();
        if (!string.IsNullOrEmpty(t.SignosAlarmaJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SignosAlarmaJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasRespJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasRespJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasCardioJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasCardioJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasDigestJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasDigestJson) ?? new());
        if (!string.IsNullOrEmpty(t.SintomasGeneralJson))
            sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasGeneralJson) ?? new());
        dto.DiagnosticosDiferenciales = MotorDiagnostico.Analizar(sintomas, t.Edad);
        return dto;
    });
}

    private static NivelTriage CalcularNivel(CrearTriageDto dto, int edad)
    {
        if (dto.SignosAlarma.Count > 0) return NivelTriage.Emergencia;

        var pesos = new Dictionary<string, int>
        {
            {"disnea",2},{"sibilan",2},{"palpitaciones",2},{"edema",2},
            {"mareo",2},{"sincope",3},{"vomito",2},{"dolor_abd",2},
            {"ictericia",3},{"astenia",2},{"perdida_peso",2},{"adenopatias",2}
        };

        var todosSintomas = dto.SintomasResp
            .Concat(dto.SintomasCardio)
            .Concat(dto.SintomasDigest)
            .Concat(dto.SintomasGeneral);

        var puntos = todosSintomas.Sum(s => pesos.GetValueOrDefault(s, 1));

        var nivel = puntos >= 7 || dto.InicioSintomas == "agudo"
            ? NivelTriage.Urgente
            : puntos >= 4 || dto.InicioSintomas == "subagudo"
                ? NivelTriage.SemiUrgente
                : NivelTriage.NoUrgente;

        if (edad >= 65 && nivel > NivelTriage.Urgente)
            nivel--;

        return nivel;
    }

    private static (string recomendacion, string tiempo) ObtenerRecomendacion(NivelTriage nivel) => nivel switch
    {
        NivelTriage.Emergencia => ("Trasladar a urgencias / activar código de emergencia.", "Inmediato"),
        NivelTriage.Urgente => ("Evaluación médica prioritaria. No debe esperar en sala general.", "≤ 15 minutos"),
        NivelTriage.SemiUrgente => ("Atención médica estándar. Monitorear mientras espera.", "≤ 30–60 minutos"),
        NivelTriage.NoUrgente => ("Consulta general o programada. Educar al paciente.", "Puede esperar"),
        _ => ("Sin clasificación", "Indefinido")
    };

    private static TriageResponseDto MapToDto(TriageRegistro t, Domain.Entities.Paciente p) => new()
    {
        Id = t.Id,
        PacienteId = t.PacienteId,
        NombrePaciente = $"{p.Nombres} {p.Apellidos}",
        NumeroDocumento = p.NumeroDocumento,
        Edad = t.Edad,
        InicioSintomas = t.InicioSintomas,
        Nivel = t.Nivel,
        RecomendacionClinica = t.RecomendacionClinica,
        TiempoAtencion = t.TiempoAtencion,
        SignosAlarma = JsonSerializer.Deserialize<List<string>>(t.SignosAlarmaJson) ?? new(),
        TodosSintomas = new List<string>()
            .Concat(JsonSerializer.Deserialize<List<string>>(t.SintomasRespJson) ?? new())
            .Concat(JsonSerializer.Deserialize<List<string>>(t.SintomasCardioJson) ?? new())
            .Concat(JsonSerializer.Deserialize<List<string>>(t.SintomasDigestJson) ?? new())
            .Concat(JsonSerializer.Deserialize<List<string>>(t.SintomasGeneralJson) ?? new())
            .ToList(),
        Observaciones = t.Observaciones,
        FechaRegistro = t.FechaRegistro,
        Temperatura = t.Temperatura,
        FrecuenciaCardiaca = t.FrecuenciaCardiaca,
        FrecuenciaRespiratoria = t.FrecuenciaRespiratoria,
        SaturacionOxigeno = t.SaturacionOxigeno,
        PresionArterial = t.PresionArterial,
        Glucosa = t.Glucosa,
        AlertasVitales = AnalizarSignosVitales(t),
        UsuarioRegistra = t.UsuarioRegistra?.UserName ?? string.Empty
    };
private static List<string> AnalizarSignosVitales(TriageRegistro t)
{
    var alertas = new List<string>();

    if (t.Temperatura.HasValue)
    {
        if (t.Temperatura >= 39.5m) alertas.Add("Fiebre alta (≥39.5°C)");
        else if (t.Temperatura >= 38m) alertas.Add("Fiebre moderada (≥38°C)");
        else if (t.Temperatura < 36m) alertas.Add("Hipotermia (<36°C)");
    }
    if (t.FrecuenciaCardiaca.HasValue)
    {
        if (t.FrecuenciaCardiaca > 100) alertas.Add("Taquicardia (>100 lpm)");
        else if (t.FrecuenciaCardiaca < 60) alertas.Add("Bradicardia (<60 lpm)");
    }
    if (t.SaturacionOxigeno.HasValue)
    {
        if (t.SaturacionOxigeno < 90) alertas.Add("Saturación crítica (<90%)");
        else if (t.SaturacionOxigeno < 94) alertas.Add("Saturación baja (<94%)");
    }
    if (t.FrecuenciaRespiratoria.HasValue)
    {
        if (t.FrecuenciaRespiratoria > 20) alertas.Add("Taquipnea (>20 rpm)");
        else if (t.FrecuenciaRespiratoria < 12) alertas.Add("Bradipnea (<12 rpm)");
    }
    if (t.Glucosa.HasValue)
    {
        if (t.Glucosa > 200) alertas.Add("Hiperglucemia (>200 mg/dL)");
        else if (t.Glucosa < 70) alertas.Add("Hipoglucemia (<70 mg/dL)");
    }

    return alertas;
}
private static List<Application.Diagnostico.Models.ResultadoDiagnostico> RecalcularDiagnosticos(TriageRegistro t)
{
    var sintomas = new List<string>();
    if (!string.IsNullOrEmpty(t.SignosAlarmaJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SignosAlarmaJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasRespJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasRespJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasCardioJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasCardioJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasDigestJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasDigestJson) ?? new());
    if (!string.IsNullOrEmpty(t.SintomasGeneralJson))
        sintomas.AddRange(JsonSerializer.Deserialize<List<string>>(t.SintomasGeneralJson) ?? new());
    return MotorDiagnostico.Analizar(sintomas, t.Edad);
}
}