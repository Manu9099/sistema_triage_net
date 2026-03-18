using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using sistema_triage.Domain.Interfaces;

namespace sistema_triage.Infrastructure.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(BlobServiceClient blobServiceClient, IConfiguration configuration)
    {
        _blobServiceClient = blobServiceClient;
        _containerName = configuration["Azure:BlobContainerName"] ?? "fotos";
    }

    public async Task<(string Url, string BlobNombre)> SubirFotoAsync(
        Stream stream, string nombreArchivo, string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

        var extension = Path.GetExtension(nombreArchivo);
        var blobNombre = $"{Guid.NewGuid()}{extension}";
        var blobClient = containerClient.GetBlobClient(blobNombre);

        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType });

        return (blobClient.Uri.ToString(), blobNombre);
    }

    public async Task EliminarFotoAsync(string blobNombre)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(blobNombre);
        await blobClient.DeleteIfExistsAsync();
    }

    public async Task<string> ObtenerUrlTempAsync(string blobNombre, int minutosExpiracion = 60)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(blobNombre);

        var sasUri = blobClient.GenerateSasUri(
            Azure.Storage.Sas.BlobSasPermissions.Read,
            DateTimeOffset.UtcNow.AddMinutes(minutosExpiracion));

        return await Task.FromResult(sasUri.ToString());
    }
}

public class BlobStorageServiceMock : IBlobStorageService
{
    public Task<(string Url, string BlobNombre)> SubirFotoAsync(
        Stream stream, string nombreArchivo, string contentType)
    {
        var blobNombre = $"{Guid.NewGuid()}{Path.GetExtension(nombreArchivo)}";
        var url = $"https://placeholder.blob.core.windows.net/fotos/{blobNombre}";
        return Task.FromResult((url, blobNombre));
    }

    public Task EliminarFotoAsync(string blobNombre) => Task.CompletedTask;

    public Task<string> ObtenerUrlTempAsync(string blobNombre, int minutosExpiracion = 60) =>
        Task.FromResult($"https://placeholder.blob.core.windows.net/fotos/{blobNombre}");
}