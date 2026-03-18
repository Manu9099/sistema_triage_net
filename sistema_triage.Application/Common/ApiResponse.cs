namespace sistema_triage.Application.Common;

public class ApiResponse<T>
{
    public bool Exitoso { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string> Errores { get; set; } = new();

    public static ApiResponse<T> Success(T data, string mensaje = "OK") =>
        new() { Exitoso = true, Mensaje = mensaje, Data = data };

    public static ApiResponse<T> Failure(string mensaje, List<string>? errores = null) =>
        new() { Exitoso = false, Mensaje = mensaje, Errores = errores ?? new() };
}