using sistema_triage.Application.Diagnostico.Models;
using sistema_triage.Application.Diagnostico.Reglas;

namespace sistema_triage.Application.Diagnostico;

public static class MotorDiagnostico
{
    private static readonly List<Enfermedad> _todasEnfermedades = CargarEnfermedades();

    private static List<Enfermedad> CargarEnfermedades() =>
        new List<Enfermedad>()
            .Concat(EnfermedadesRespiratorias.Obtener())
            .Concat(EnfermedadesCardiovasculares.Obtener())
            .Concat(EnfermedadesDigestivas.Obtener())
            .Concat(EnfermedadesNeurologicas.Obtener())
            .Concat(EnfermedadesInfecciosas.Obtener())
            .Concat(EnfermedadesMetabolicas.Obtener())
            .ToList();



    public static List<ResultadoDiagnostico> Analizar(List<string> sintomas, int edad)
    {
        var sintomasNormalizados = sintomas
            .Select(s => s.ToLower().Trim())
            .ToHashSet();

        var resultados = new List<ResultadoDiagnostico>();

        foreach (var enfermedad in _todasEnfermedades)
        {
            // Si tiene síntomas excluyentes presentes, descartamos
            if (enfermedad.SintomasExcluyentes.Any(s => sintomasNormalizados.Contains(s)))
                continue;

            // Verificar síntomas requeridos
            var requeridosPresentes = enfermedad.SintomasRequeridos
                .Where(s => sintomasNormalizados.Contains(s))
                .ToList();

            if (requeridosPresentes.Count < enfermedad.SintomasRequeridos.Count)
                continue;

            // Calcular síntomas opcionales coincidentes
            var opcionalesPresentes = enfermedad.SintomasOpcionales
                .Where(s => sintomasNormalizados.Contains(s))
                .ToList();

            var totalCoincidentes = requeridosPresentes.Count + opcionalesPresentes.Count;

            if (totalCoincidentes < enfermedad.PesoMinimo)
                continue;

            // Calcular probabilidad
            var totalPosibles = enfermedad.SintomasRequeridos.Count + enfermedad.SintomasOpcionales.Count;
            var probabilidadBase = totalPosibles > 0
                ? (double)totalCoincidentes / totalPosibles
                : 0;

            // Ajuste por edad para ciertas enfermedades
            var ajusteEdad = ObtenerAjusteEdad(enfermedad.Codigo, edad);
            var probabilidadFinal = Math.Min(probabilidadBase + ajusteEdad, 0.97);

            resultados.Add(new ResultadoDiagnostico
            {
                Codigo = enfermedad.Codigo,
                Nombre = enfermedad.Nombre,
                Grupo = enfermedad.Grupo,
                Descripcion = enfermedad.Descripcion,
                Probabilidad = Math.Round(probabilidadFinal * 100, 1),
                SintomasCoincidentes = requeridosPresentes.Concat(opcionalesPresentes).ToList(),
                NivelUrgencia = enfermedad.NivelUrgencia,
                Recomendacion = enfermedad.Recomendacion
            });
        }

        return resultados
            .OrderByDescending(r => r.Probabilidad)
            .Take(5)
            .ToList();
    }

private static bool EsSignoAlarma(string s) =>
    new[] { "dificultad respiratoria", "dolor pecho", "pérdida conciencia", "convulsiones" }
    .Any(x => s.ToLower().Contains(x));

private static bool EsSintomaResp(string s) =>
    new[] { "tos", "disnea", "expectoración", "sibilancias", "hemoptisis" }
    .Any(x => s.ToLower().Contains(x));

private static bool EsSintomaCardio(string s) =>
    new[] { "palpitaciones", "dolor precordial", "edema", "síncope" }
    .Any(x => s.ToLower().Contains(x));

private static bool EsSintomaDigest(string s) =>
    new[] { "náuseas", "vómitos", "diarrea", "dolor abdominal", "ictericia" }
    .Any(x => s.ToLower().Contains(x));

private static bool EsSintomaGeneral(string s) =>
    new[] { "fiebre", "cefalea", "malestar", "fatiga", "pérdida peso" }
    .Any(x => s.ToLower().Contains(x));
    private static double ObtenerAjusteEdad(string codigo, int edad) => codigo switch
    {
        "CARD001" or "CARD003" or "CARD004" when edad >= 60 => 0.10,
        "RESP005" when edad >= 50 => 0.08,
        "META001" or "META002" when edad >= 40 => 0.05,
        "INFE001" when edad <= 40 => 0.05,
        "NEUR002" when edad >= 55 => 0.10,
        _ => 0
    };

public static List<ResultadoDiagnostico> CombinarConML(
    List<ResultadoDiagnostico> resultadosReglas,
    List<(string Diagnostico, float Probabilidad)> prediccionesML)
{
    if (!prediccionesML.Any())
        return resultadosReglas;

    var combinados = new Dictionary<string, float>();

    foreach (var r in resultadosReglas)
        combinados[r.Nombre] = (float)r.Probabilidad * 0.6f;

    foreach (var (diagnostico, prob) in prediccionesML)
    {
        if (combinados.ContainsKey(diagnostico))
            combinados[diagnostico] += prob * 100f * 0.4f;
        else
            combinados[diagnostico] = prob * 100f * 0.4f;
    }

    return combinados
        .OrderByDescending(x => x.Value)
        .Take(5)
        .Select(x => {
            var original = resultadosReglas.FirstOrDefault(r => r.Nombre == x.Key);
            return new ResultadoDiagnostico
            {
                Codigo = original?.Codigo ?? x.Key.ToLower().Replace(" ", "_"),
                Nombre = x.Key,
                Probabilidad = Math.Round(x.Value, 1),
                Grupo = original?.Grupo ?? "General",
                Recomendacion = original?.Recomendacion ?? "Evaluación médica recomendada"
            };
        })
        .ToList();
}

}




