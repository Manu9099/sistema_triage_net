using Microsoft.ML;
using Microsoft.ML.Data;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace sistema_triage.Infrastructure.ML;

public class DiagnosticoMLService
{
   private readonly MLContext _mlContext;
    private readonly IServiceProvider _serviceProvider;
    private ITransformer? _modelo;
    private PredictionEngine<TriageDiagnosticoInput, TriageDiagnosticoPrediction>? _engine;
    private readonly string _modelPath;
    private bool _modeloEntrenado = false;
    private static readonly object _lock = new();

    public DiagnosticoMLService(IServiceProvider serviceProvider)
    {
        _mlContext = new MLContext(seed: 42);
        _serviceProvider = serviceProvider;
        _modelPath = Path.Combine(AppContext.BaseDirectory, "diagnostico_model.zip");
    }

    public bool ModeloDisponible => _modeloEntrenado;

    private async Task InicializarAsync()
    {
        try
        {
            if (File.Exists(_modelPath))
            {
                CargarModelo();
                return;
            }
            await EntrenarAsync();
        }
        catch { }
    }

    public async Task EntrenarAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider
            .GetRequiredService<sistema_triage.Infrastructure.Data.AppDbContext>();

        var datos = await ObtenerDatosEntrenamientoAsync(context);
        if (datos.Count < 10)
            datos.AddRange(GenerarDatosSinteticos());

        var dataView = _mlContext.Data.LoadFromEnumerable(datos);

        var pipeline = _mlContext.Transforms.Conversion
            .MapValueToKey("Label")
            .Append(_mlContext.Transforms.Concatenate("Features",
                nameof(TriageDiagnosticoInput.Edad),
                nameof(TriageDiagnosticoInput.TieneSignosAlarma),
                nameof(TriageDiagnosticoInput.TieneSintomasResp),
                nameof(TriageDiagnosticoInput.TieneSintomasCardio),
                nameof(TriageDiagnosticoInput.TieneSintomasDigest),
                nameof(TriageDiagnosticoInput.TieneSintomasGeneral),
                nameof(TriageDiagnosticoInput.Temperatura),
                nameof(TriageDiagnosticoInput.FrecuenciaCardiaca),
                nameof(TriageDiagnosticoInput.SaturacionOxigeno),
                nameof(TriageDiagnosticoInput.NivelTriage),
                nameof(TriageDiagnosticoInput.CantidadSintomas)))
            .Append(_mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy(
                labelColumnName: "Label",
                featureColumnName: "Features"))
            .Append(_mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));

        lock (_lock)
        {
            _modelo = pipeline.Fit(dataView);
            _mlContext.Model.Save(_modelo, dataView.Schema, _modelPath);
            _engine = _mlContext.Model
                .CreatePredictionEngine<TriageDiagnosticoInput, TriageDiagnosticoPrediction>(_modelo);
            _modeloEntrenado = true;
        }
    }


  public List<(string Diagnostico, float Probabilidad)> Predecir(TriageDiagnosticoInput input)
    {
        if (!_modeloEntrenado || _engine == null)
            return new List<(string, float)>();

        lock (_lock)
        {
            var prediccion = _engine.Predict(input);
            if (prediccion.Score == null || prediccion.Score.Length == 0)
                return new List<(string, float)>();

            var diagnosticos = ObtenerEtiquetas();
            return diagnosticos
                .Zip(prediccion.Score, (d, s) => (d, s))
                .OrderByDescending(x => x.s)
                .Take(3)
                .Where(x => x.s > 0.05f)
                .Select(x => (x.d, x.s))
                .ToList();
        }
    }


    private void CargarModelo()
    {
        lock (_lock)
        {
            _modelo = _mlContext.Model.Load(_modelPath, out _);
            _engine = _mlContext.Model.CreatePredictionEngine<TriageDiagnosticoInput, TriageDiagnosticoPrediction>(_modelo);
            _modeloEntrenado = true;
        }
    }

    private static async Task<List<TriageDiagnosticoInput>> ObtenerDatosEntrenamientoAsync(
        sistema_triage.Infrastructure.Data.AppDbContext context)
    {
        return await context.Seguimientos
            .Include(s => s.Triage)
            .Where(s => !string.IsNullOrEmpty(s.DiagnosticoConfirmado))
            .Select(s => new TriageDiagnosticoInput
            {
                Edad = s.Triage.Edad,
                TieneSignosAlarma = string.IsNullOrEmpty(s.Triage.SignosAlarmaJson) ? 0f : 1f,
                TieneSintomasResp = string.IsNullOrEmpty(s.Triage.SintomasRespJson) ? 0f : 1f,
                TieneSintomasCardio = string.IsNullOrEmpty(s.Triage.SintomasCardioJson) ? 0f : 1f,
                TieneSintomasDigest = string.IsNullOrEmpty(s.Triage.SintomasDigestJson) ? 0f : 1f,
                TieneSintomasGeneral = string.IsNullOrEmpty(s.Triage.SintomasGeneralJson) ? 0f : 1f,
                Temperatura = (float)(s.Triage.Temperatura ?? 37.0m),
                FrecuenciaCardiaca = s.Triage.FrecuenciaCardiaca ?? 80,
                SaturacionOxigeno = s.Triage.SaturacionOxigeno ?? 98,
                NivelTriage = (float)s.Triage.Nivel,
                CantidadSintomas = 3f,
                Diagnostico = s.DiagnosticoConfirmado!
            })
            .ToListAsync();
    }

   private static List<string> ObtenerEtiquetas() =>
    [
        "Gripe", "Neumonía", "Asma", "Bronquitis", "EPOC",
        "Hipertensión", "Arritmia", "SCA", "Insuficiencia Cardíaca", "TEP",
        "Gastritis", "Apendicitis", "Colecistitis", "SII", "Hepatitis",
        "Migraña", "ACV", "Epilepsia", "Vértigo", "Meningitis",
        "Dengue", "COVID-19", "ITU", "Sepsis", "Tuberculosis",
        "Hipoglucemia", "Cetoacidosis", "Hipotiroidismo", "Hipertiroidismo", "ISR"
    ];

  private static List<TriageDiagnosticoInput> GenerarDatosSinteticos()
    {
        var random = new Random(42);
        var datos = new List<TriageDiagnosticoInput>();
        var diagnosticos = ObtenerEtiquetas();

        foreach (var diagnostico in diagnosticos)
        {
            for (int i = 0; i < 20; i++)
            {
                datos.Add(new TriageDiagnosticoInput
                {
                    Edad = random.Next(5, 90),
                    TieneSignosAlarma = diagnostico is "SCA" or "ACV" or "Sepsis" or "TEP" ? 1f : random.Next(0, 2),
                    TieneSintomasResp = diagnostico is "Gripe" or "Neumonía" or "Asma" or "Bronquitis" or "EPOC" or "COVID-19" or "Tuberculosis" ? 1f : random.Next(0, 2),
                    TieneSintomasCardio = diagnostico is "Hipertensión" or "Arritmia" or "SCA" or "Insuficiencia Cardíaca" or "TEP" ? 1f : random.Next(0, 2),
                    TieneSintomasDigest = diagnostico is "Gastritis" or "Apendicitis" or "Colecistitis" or "SII" or "Hepatitis" ? 1f : random.Next(0, 2),
                    TieneSintomasGeneral = random.Next(0, 2),
                    Temperatura = diagnostico is "Gripe" or "Neumonía" or "Dengue" or "COVID-19" or "Sepsis" ? random.Next(38, 41) : random.Next(36, 38),
                    FrecuenciaCardiaca = diagnostico is "Arritmia" or "SCA" or "TEP" ? random.Next(100, 150) : random.Next(60, 100),
                    SaturacionOxigeno = diagnostico is "Neumonía" or "EPOC" or "Asma" ? random.Next(85, 94) : random.Next(95, 100),
                    NivelTriage = diagnostico is "SCA" or "ACV" or "Sepsis" or "Meningitis" ? 1f :
                                  diagnostico is "Neumonía" or "Apendicitis" or "TEP" or "Cetoacidosis" ? 2f :
                                  diagnostico is "Gripe" or "Gastritis" or "Migraña" ? 3f : 4f,
                    CantidadSintomas = random.Next(2, 8),
                    Diagnostico = diagnostico
                });
            }
        }
        return datos;
    }
}