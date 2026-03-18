using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesRespiratorias
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "RESP001",
            Nombre = "Gripe (Influenza)",
            Grupo = "Respiratoria",
            Descripcion = "Infección viral aguda del tracto respiratorio.",
            SintomasRequeridos = new() { "fiebre", "cefalea" },
            SintomasOpcionales = new() { "tos", "astenia", "rinorrea", "dolor_muscular" },
            SintomasExcluyentes = new() { "dolor_pecho", "cianosis" },
            PesoMinimo = 3,
            NivelUrgencia = "No urgente / Semi-urgente",
            Recomendacion = "Reposo, hidratación, antipiréticos. Consulta médica si persiste más de 5 días."
        },
        new()
        {
            Codigo = "RESP002",
            Nombre = "Neumonía",
            Grupo = "Respiratoria",
            Descripcion = "Infección pulmonar bacteriana o viral con consolidación.",
            SintomasRequeridos = new() { "fiebre", "tos", "disnea" },
            SintomasOpcionales = new() { "esputo", "dolor_pecho", "astenia", "cianosis" },
            SintomasExcluyentes = new(),
            PesoMinimo = 4,
            NivelUrgencia = "Urgente",
            Recomendacion = "Evaluación médica urgente. Posible necesidad de antibióticos y radiografía de tórax."
        },
        new()
        {
            Codigo = "RESP003",
            Nombre = "Asma bronquial",
            Grupo = "Respiratoria",
            Descripcion = "Enfermedad inflamatoria crónica de las vías aéreas con broncoespasmo.",
            SintomasRequeridos = new() { "sibilan", "disnea" },
            SintomasOpcionales = new() { "tos", "disnea_severa" },
            SintomasExcluyentes = new() { "fiebre" },
            PesoMinimo = 2,
            NivelUrgencia = "Semi-urgente / Urgente",
            Recomendacion = "Broncodilatador de rescate. Si no mejora en 20 minutos, acudir a urgencias."
        },
        new()
        {
            Codigo = "RESP004",
            Nombre = "Bronquitis aguda",
            Grupo = "Respiratoria",
            Descripcion = "Inflamación aguda del árbol bronquial, generalmente viral.",
            SintomasRequeridos = new() { "tos", "esputo" },
            SintomasOpcionales = new() { "fiebre", "sibilan", "astenia" },
            SintomasExcluyentes = new() { "disnea_severa", "cianosis" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "Reposo, hidratación. Antibióticos solo si se confirma origen bacteriano."
        },
        new()
        {
            Codigo = "RESP005",
            Nombre = "EPOC exacerbado",
            Grupo = "Respiratoria",
            Descripcion = "Empeoramiento agudo de la enfermedad pulmonar obstructiva crónica.",
            SintomasRequeridos = new() { "disnea", "esputo" },
            SintomasOpcionales = new() { "sibilan", "tos", "cianosis", "astenia" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Urgente",
            Recomendacion = "Evaluación médica urgente. Broncodilatadores, posible corticoterapia."
        }
    };
}