using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesInfecciosas
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "INFE001",
            Nombre = "Dengue",
            Grupo = "Infecciosa",
            Descripcion = "Enfermedad viral transmitida por mosquito Aedes aegypti.",
            SintomasRequeridos = new() { "fiebre", "cefalea", "astenia" },
            SintomasOpcionales = new() { "dolor_muscular", "nausea", "vomito", "adenopatias" },
            SintomasExcluyentes = new() { "rinorrea", "tos" },
            PesoMinimo = 3,
            NivelUrgencia = "Semi-urgente / Urgente",
            Recomendacion = "Hidratación abundante. Evitar AAS e ibuprofeno. Control de plaquetas."
        },
        new()
        {
            Codigo = "INFE002",
            Nombre = "COVID-19",
            Grupo = "Infecciosa",
            Descripcion = "Infección por SARS-CoV-2 con afectación respiratoria variable.",
            SintomasRequeridos = new() { "fiebre", "tos" },
            SintomasOpcionales = new() { "disnea", "astenia", "cefalea", "rinorrea", "diarrea" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "No urgente / Urgente según gravedad",
            Recomendacion = "Aislamiento. Test diagnóstico. Urgente si saturación O2 menor a 94%."
        },
        new()
        {
            Codigo = "INFE003",
            Nombre = "Infección urinaria",
            Grupo = "Infecciosa",
            Descripcion = "Infección bacteriana del tracto urinario.",
            SintomasRequeridos = new() { "fiebre", "dolor_abd" },
            SintomasOpcionales = new() { "astenia", "nausea" },
            SintomasExcluyentes = new() { "tos", "disnea" },
            PesoMinimo = 2,
            NivelUrgencia = "Semi-urgente",
            Recomendacion = "Urocultivo. Antibióticos según antibiograma. Hidratación abundante."
        },
        new()
        {
            Codigo = "INFE004",
            Nombre = "Sepsis",
            Grupo = "Infecciosa",
            Descripcion = "Respuesta sistémica grave a una infección con disfunción orgánica.",
            SintomasRequeridos = new() { "fiebre", "pa_baja", "glasgow" },
            SintomasOpcionales = new() { "astenia", "disnea_severa", "cianosis" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Hospitalización urgente. Antibióticos IV y soporte hemodinámico."
        },
        new()
        {
            Codigo = "INFE005",
            Nombre = "Tuberculosis pulmonar",
            Grupo = "Infecciosa",
            Descripcion = "Infección crónica por Mycobacterium tuberculosis.",
            SintomasRequeridos = new() { "tos", "perdida_peso", "astenia" },
            SintomasOpcionales = new() { "fiebre", "hemoptisis", "esputo", "adenopatias" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Semi-urgente",
            Recomendacion = "Baciloscopia y cultivo de esputo. Aislamiento respiratorio. Tratamiento DOTS."
        }
    };
}