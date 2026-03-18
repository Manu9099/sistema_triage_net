using System.Net;
using System.Text.Json;

namespace sistema_triage.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);

            // Manejo de 404 sin excepción (ruta no encontrada)
            if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
                await EscribirErrorAsync(context, 404, "El recurso solicitado no existe.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción no controlada: {Message}", ex.Message);
            await ManejarExcepcionAsync(context, ex);
        }
    }

    private static Task ManejarExcepcionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, mensaje) = ex switch
        {
            KeyNotFoundException      => (404, ex.Message),
            UnauthorizedAccessException => (401, ex.Message),
            InvalidOperationException => (400, ex.Message),
            ArgumentException         => (400, ex.Message),
            _                         => (500, "Error interno del servidor. Intente más tarde.")
        };

        return EscribirErrorAsync(context, statusCode, mensaje);
    }

    private static async Task EscribirErrorAsync(HttpContext context, int statusCode, string mensaje)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var respuesta = JsonSerializer.Serialize(new
        {
            exitoso = false,
            statusCode,
            mensaje,
            timestamp = DateTime.UtcNow
        }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await context.Response.WriteAsync(respuesta);
    }
}