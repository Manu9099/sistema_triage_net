using sistema_triage.Application.Diagnostico.Models;

namespace sistema_triage.Application.Diagnostico.Reglas;

public static class EnfermedadesNeurologicas
{
    public static List<Enfermedad> Obtener() => new()
    {
        new()
        {
            Codigo = "NEUR001",
            Nombre = "Migraña",
            Grupo = "Neurológica",
            Descripcion = "Cefalea primaria recurrente de carácter pulsátil.",
            SintomasRequeridos = new() { "cefalea" },
            SintomasOpcionales = new() { "nausea", "vomito", "mareo", "astenia" },
            SintomasExcluyentes = new() { "fiebre", "glasgow", "paralisis" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "Reposo en ambiente oscuro y silencioso. Analgésicos específicos para migraña."
        },
        new()
        {
            Codigo = "NEUR002",
            Nombre = "Accidente cerebrovascular (ACV)",
            Grupo = "Neurológica",
            Descripcion = "Interrupción del flujo sanguíneo cerebral. Emergencia neurológica.",
            SintomasRequeridos = new() { "paralisis" },
            SintomasOpcionales = new() { "glasgow", "cefalea", "mareo", "sincope" },
            SintomasExcluyentes = new(),
            PesoMinimo = 2,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Llamar al 112 inmediatamente. Ventana terapéutica de 4.5 horas."
        },
        new()
        {
            Codigo = "NEUR003",
            Nombre = "Crisis epiléptica",
            Grupo = "Neurológica",
            Descripcion = "Actividad eléctrica cerebral anormal con manifestaciones motoras o sensitivas.",
            SintomasRequeridos = new() { "convulsion" },
            SintomasOpcionales = new() { "glasgow", "paralisis", "mareo" },
            SintomasExcluyentes = new(),
            PesoMinimo = 1,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Proteger al paciente de lesiones. No introducir objetos en la boca."
        },
        new()
        {
            Codigo = "NEUR004",
            Nombre = "Vértigo periférico",
            Grupo = "Neurológica",
            Descripcion = "Sensación de movimiento rotatorio por disfunción del oído interno.",
            SintomasRequeridos = new() { "mareo" },
            SintomasOpcionales = new() { "nausea", "vomito", "palpitaciones" },
            SintomasExcluyentes = new() { "paralisis", "cefalea", "glasgow" },
            PesoMinimo = 2,
            NivelUrgencia = "No urgente",
            Recomendacion = "Reposo. Maniobras de reposicionamiento. Consulta otorrinolaringológica."
        },
        new()
        {
            Codigo = "NEUR005",
            Nombre = "Meningitis",
            Grupo = "Neurológica",
            Descripcion = "Inflamación de las meninges, generalmente de origen infeccioso.",
            SintomasRequeridos = new() { "cefalea", "fiebre" },
            SintomasOpcionales = new() { "glasgow", "convulsion", "vomito" },
            SintomasExcluyentes = new(),
            PesoMinimo = 3,
            NivelUrgencia = "Emergencia",
            Recomendacion = "EMERGENCIA. Hospitalización urgente. Antibióticos intravenosos inmediatos."
        }
    };
}