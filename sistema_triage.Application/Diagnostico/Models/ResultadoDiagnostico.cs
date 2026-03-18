namespace sistema_triage.Application.Diagnostico.Models;

public class ResultadoDiagnostico
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Grupo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public double Probabilidad { get; set; }
    public List<string> SintomasCoincidentes { get; set; } = new();
    public string NivelUrgencia { get; set; } = string.Empty;
    public string Recomendacion { get; set; } = string.Empty;
}