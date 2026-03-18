namespace sistema_triage.Application.Diagnostico.Models;

public class Enfermedad
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public List<string> SintomasRequeridos { get; set; } = new();
    public List<string> SintomasOpcionales { get; set; } = new();
    public List<string> SintomasExcluyentes { get; set; } = new();
    public int PesoMinimo { get; set; } = 1;
    public string NivelUrgencia { get; set; } = string.Empty;
    public string Recomendacion { get; set; } = string.Empty;
}