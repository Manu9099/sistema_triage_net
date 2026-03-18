namespace sistema_triage.Domain.Interfaces;

public interface IBlobStorageService
{
    Task<(string Url, string BlobNombre)> SubirFotoAsync(Stream stream, string nombreArchivo, string contentType);
    Task EliminarFotoAsync(string blobNombre);
    Task<string> ObtenerUrlTempAsync(string blobNombre, int minutosExpiracion = 60);
}