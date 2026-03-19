using Microsoft.ML.Data;

namespace sistema_triage.Infrastructure.ML;

public class TriageDiagnosticoInput
{
    [LoadColumn(0)] public float Edad { get; set; }
    [LoadColumn(1)] public float TieneSignosAlarma { get; set; }
    [LoadColumn(2)] public float TieneSintomasResp { get; set; }
    [LoadColumn(3)] public float TieneSintomasCardio { get; set; }
    [LoadColumn(4)] public float TieneSintomasDigest { get; set; }
    [LoadColumn(5)] public float TieneSintomasGeneral { get; set; }
    [LoadColumn(6)] public float Temperatura { get; set; }
    [LoadColumn(7)] public float FrecuenciaCardiaca { get; set; }
    [LoadColumn(8)] public float SaturacionOxigeno { get; set; }
    [LoadColumn(9)] public float NivelTriage { get; set; }
    [LoadColumn(10)] public float CantidadSintomas { get; set; }
    [LoadColumn(11)] [ColumnName("Label")] public string Diagnostico { get; set; } = string.Empty;
}

public class TriageDiagnosticoPrediction
{
    [ColumnName("PredictedLabel")] public string Diagnostico { get; set; } = string.Empty;
    public float[] Score { get; set; } = Array.Empty<float>();
}