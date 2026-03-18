using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesDigestivas
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "DIGS001",
            Nombre = "Gastritis aguda",
            Grupo = "Digestiva",
            Descripcion = "Inflamación aguda de la mucosa gástrica.",
            SintomasRequeridos = new() { "dolor_abd", "nausea" },
            SintomasOpcionales = new() { "vomito", "astenia" },
            SintomasExcluyentes = new() { "ictericia", "fiebre" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "Dieta blanda, antiácidos. Evitar AINEs y alcohol."
        },
        new()
        {
            Codigo = "DIGS002",
            Nombre = "Apendicitis aguda",
            Grupo = "Digestiva",
            Descripcion = "Inflamación del apéndice vermiforme, requiere cirugía urgente.",
            SintomasRequeridos = new() { "dolor_abd", "fiebre" },
            SintomasOpcionales = new() { "nausea", "vomito", "astenia" },
            SintomasExcluyentes = new() { "diarrea" },
            PesoMinimo = 3,
            NivelUrgencia = "Urgente / Emergencia",
            Recomendacion = "Evaluación quirúrgica urgente. No administrar analgésicos antes de la evaluación."
        },
        new()
        {
            Codigo = "DIGS003",
            Nombre = "Cólico biliar / Colecistitis",
            Grupo = "Digestiva",
            Descripcion = "Obstrucción o inflamación de la vesícula biliar.",
            SintomasRequeridos = new() { "dolor_abd", "nausea" },
            SintomasOpcionales = new() { "vomito", "ictericia", "fiebre" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "Semi-urgente",
            Recomendacion = "Ecografía abdominal. Dieta sin grasas. Evaluación médica."
        },
        new()
        {
            Codigo = "DIGS004",
            Nombre = "Síndrome de intestino irritable",
            Grupo = "Digestiva",
            Descripcion = "Trastorno funcional del intestino con dolor y cambio del hábito intestinal.",
            SintomasRequeridos = new() { "dolor_abd", "diarrea" },
            SintomasOpcionales = new() { "nausea", "astenia" },
            SintomasExcluyentes = new() { "fiebre", "ictericia", "hemoptisis" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "Manejo del estrés, dieta rica en fibra. Consulta gastroenterológica."
        },
        new()
        {
            Codigo = "DIGS005",
            Nombre = "Hepatitis aguda",
            Grupo = "Digestiva",
            Descripcion = "Inflamación hepática aguda de origen viral o tóxico.",
            SintomasRequeridos = new() { "ictericia", "astenia" },
            SintomasOpcionales = new() { "nausea", "vomito", "dolor_abd", "fiebre" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Urgente",
            Recomendacion = "Análisis hepáticos urgentes. Evitar alcohol y hepatotóxicos."
        }
    };
}