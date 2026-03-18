using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesCardiovasculares
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "CARD001",
            Nombre = "Hipertensión arterial (crisis)",
            Grupo = "Cardiovascular",
            Descripcion = "Elevación aguda de la presión arterial con riesgo de daño orgánico.",
            SintomasRequeridos = new() { "cefalea", "mareo" },
            SintomasOpcionales = new() { "palpitaciones", "dolor_pecho", "glasgow" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "Urgente",
            Recomendacion = "Medición de presión arterial inmediata. Control médico urgente."
        },
        new()
        {
            Codigo = "CARD002",
            Nombre = "Arritmia cardíaca",
            Grupo = "Cardiovascular",
            Descripcion = "Alteración del ritmo cardíaco normal.",
            SintomasRequeridos = new() { "palpitaciones" },
            SintomasOpcionales = new() { "mareo", "sincope", "disnea", "dolor_pecho", "astenia" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "Semi-urgente / Urgente",
            Recomendacion = "Electrocardiograma urgente. Evitar esfuerzo físico."
        },
        new()
        {
            Codigo = "CARD003",
            Nombre = "Síndrome coronario agudo",
            Grupo = "Cardiovascular",
            Descripcion = "Espectro clínico que incluye angina inestable e infarto de miocardio.",
            SintomasRequeridos = new() { "dolor_pecho" },
            SintomasOpcionales = new() { "disnea", "palpitaciones", "mareo", "sincope", "cianosis" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "Emergencia",
            Recomendacion = "Emergencia médica. Llamar al servicio de emergencias inmediatamente."
        },
        new()
        {
            Codigo = "CARD004",
            Nombre = "Insuficiencia cardíaca",
            Grupo = "Cardiovascular",
            Descripcion = "Incapacidad del corazón para bombear sangre suficiente.",
            SintomasRequeridos = new() { "disnea", "edema" },
            SintomasOpcionales = new() { "astenia", "palpitaciones", "cianosis", "perdida_peso" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Urgente",
            Recomendacion = "Evaluación cardiológica urgente. Posible hospitalización."
        },
        new()
        {
            Codigo = "CARD005",
            Nombre = "Tromboembolismo pulmonar",
            Grupo = "Cardiovascular",
            Descripcion = "Obstrucción de la arteria pulmonar por un coágulo.",
            SintomasRequeridos = new() { "disnea_severa", "dolor_pecho" },
            SintomasOpcionales = new() { "hemoptisis", "sincope", "cianosis", "palpitaciones" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Emergencia",
            Recomendacion = "Emergencia médica. Requiere atención hospitalaria inmediata."
        }
    };
}