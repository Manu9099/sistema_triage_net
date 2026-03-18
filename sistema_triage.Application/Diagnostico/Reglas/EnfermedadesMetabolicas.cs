using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesMetabolicas
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "META001",
            Nombre = "Crisis hipoglucémica (Diabetes)",
            Grupo = "Metabólica",
            Descripcion = "Descenso crítico de glucosa en sangre, frecuente en diabéticos.",
            SintomasRequeridos = new() { "mareo", "astenia" },
            SintomasOpcionales = new() { "palpitaciones", "cefalea", "glasgow", "sincope" },
            SintomasExcluyentes = new() { "fiebre" },
            PesoMinimo = 2,
            NivelUrgencia = "Urgente",
            Recomendacion = "Administrar glucosa oral si está consciente. Urgencias si pérdida de consciencia."
        },
        new()
        {
            Codigo = "META002",
            Nombre = "Cetoacidosis diabética",
            Grupo = "Metabólica",
            Descripcion = "Complicación grave de la diabetes con acidosis metabólica.",
            SintomasRequeridos = new() { "nausea", "vomito", "astenia" },
            SintomasOpcionales = new() { "dolor_abd", "mareo", "glasgow", "disnea" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Hospitalización urgente. Insulina IV y corrección hidroelectrolítica."
        },
        new()
        {
            Codigo = "META003",
            Nombre = "Hipotiroidismo",
            Grupo = "Metabólica",
            Descripcion = "Producción insuficiente de hormonas tiroideas.",
            SintomasRequeridos = new() { "astenia", "perdida_peso" },
            SintomasOpcionales = new() { "edema", "cefalea", "mareo" },
            SintomasExcluyentes = new() { "fiebre", "disnea_severa" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "TSH y T4 libre. Tratamiento hormonal sustitutivo. Consulta endocrinológica."
        },
        new()
        {
            Codigo = "META004",
            Nombre = "Hipertiroidismo / Crisis tirotóxica",
            Grupo = "Metabólica",
            Descripcion = "Exceso de hormonas tiroideas con hiperactividad sistémica.",
            SintomasRequeridos = new() { "palpitaciones", "astenia" },
            SintomasOpcionales = new() { "perdida_peso", "mareo", "fiebre", "disnea" },
            SintomasExcluyentes = new() { "edema" },
            PesoMinimo = 2,
            NivelUrgencia = "Semi-urgente",
            Recomendacion = "TSH y T4 libre. Betabloqueantes para control de síntomas. Consulta endocrina."
        },
        new()
        {
            Codigo = "META005",
            Nombre = "Insuficiencia suprarrenal aguda",
            Grupo = "Metabólica",
            Descripcion = "Déficit agudo de cortisol con colapso hemodinámico.",
            SintomasRequeridos = new() { "astenia", "pa_baja", "nausea" },
            SintomasOpcionales = new() { "vomito", "dolor_abd", "mareo", "glasgow" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Hidrocortisona IV urgente. Hospitalización inmediata."
        }
    };
}