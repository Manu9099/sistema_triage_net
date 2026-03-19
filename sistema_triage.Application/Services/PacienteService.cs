using sistema_triage.Application.DTOs.Paciente;
using sistema_triage.Application.Services.Interfaces;
using sistema_triage.Domain.Entities;
using sistema_triage.Domain.Interfaces;
using sistema_triage.Domain.Models;

namespace sistema_triage.Application.Services;

public class PacienteService : IPacienteService
{
    private readonly IPacienteRepository _repo;
    private readonly IBlobStorageService _blob;
    private readonly Microsoft.AspNetCore.Identity.UserManager<Domain.Entities.ApplicationUser> _userManager;

    public PacienteService(IPacienteRepository repo, IBlobStorageService blob,Microsoft.AspNetCore.Identity.UserManager<Domain.Entities.ApplicationUser> userManager)
    {
        _repo = repo;
        _blob = blob;
        _userManager = userManager;
    }

    public async Task<PacienteResponseDto> CrearAsync(CrearPacienteDto dto)
    {
        var existe = await _repo.GetByDocumentoAsync(dto.NumeroDocumento);
        if (existe != null)
            throw new InvalidOperationException($"Ya existe un paciente con documento {dto.NumeroDocumento}");

        var paciente = new Paciente
        {
            Nombres = dto.Nombres,
            Apellidos = dto.Apellidos,
            NumeroDocumento = dto.NumeroDocumento,
            FechaNacimiento = dto.FechaNacimiento,
            Genero = dto.Genero,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Direccion = dto.Direccion,
            Alergias = dto.Alergias,
            Comorbilidades = dto.Comorbilidades
        };

        await _repo.AddAsync(paciente);
        await _repo.SaveChangesAsync();
        return MapToDto(paciente);
    }

    public async Task<PacienteResponseDto> ActualizarAsync(Guid id, ActualizarPacienteDto dto)
    {
        var paciente = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Paciente no encontrado");

        paciente.Nombres = dto.Nombres;
        paciente.Apellidos = dto.Apellidos;
        paciente.FechaNacimiento = dto.FechaNacimiento;
        paciente.Genero = dto.Genero;
        paciente.Telefono = dto.Telefono;
        paciente.Email = dto.Email;
        paciente.Direccion = dto.Direccion;
        paciente.Alergias = dto.Alergias;
        paciente.Comorbilidades = dto.Comorbilidades;

        _repo.Update(paciente);
        await _repo.SaveChangesAsync();
        return MapToDto(paciente);
    }

    public async Task<PacienteResponseDto?> ObtenerPorIdAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p == null ? null : MapToDto(p);
    }

    public async Task<PacienteResponseDto?> ObtenerPorDocumentoAsync(string documento)
    {
        var p = await _repo.GetByDocumentoAsync(documento);
        return p == null ? null : MapToDto(p);
    }

    public async Task<IEnumerable<PacienteResponseDto>> BuscarAsync(string termino) =>
        (await _repo.SearchAsync(termino)).Select(MapToDto);

  public async Task<IEnumerable<PacienteResponseDto>> ObtenerTodosAsync()
{
    var pacientes = (await _repo.GetAllAsync()).Where(p => p.Activo).ToList();
    var result = new List<PacienteResponseDto>();
    foreach (var p in pacientes)
    {
        var dto = MapToDto(p);
        if (!string.IsNullOrEmpty(p.Email))
        {
            var user = await _userManager.FindByEmailAsync(p.Email);
            dto.TieneCuenta = user != null;
        }
        result.Add(dto);
    }
    return result;
}

    public async Task<string> ActualizarFotoAsync(Guid id, Stream stream, string nombreArchivo, string contentType)
    {
        var paciente = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Paciente no encontrado");

        if (!string.IsNullOrEmpty(paciente.FotoBlobNombre))
            await _blob.EliminarFotoAsync(paciente.FotoBlobNombre);

        var (url, blobNombre) = await _blob.SubirFotoAsync(stream, nombreArchivo, contentType);
        paciente.FotoUrl = url;
        paciente.FotoBlobNombre = blobNombre;

        _repo.Update(paciente);
        await _repo.SaveChangesAsync();
        return url;
    }

    public async Task DesactivarAsync(Guid id)
    {
        var paciente = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Paciente no encontrado");
        paciente.Activo = false;
        _repo.Update(paciente);
        await _repo.SaveChangesAsync();
    }

    private static PacienteResponseDto MapToDto(Paciente p) => new()
    {
        Id = p.Id,
        Nombres = p.Nombres,
        Apellidos = p.Apellidos,
        NumeroDocumento = p.NumeroDocumento,
        FechaNacimiento = p.FechaNacimiento,
        Edad = p.Edad,
        Genero = p.Genero,
        Telefono = p.Telefono,
        Email = p.Email,
        Direccion = p.Direccion,
        FotoUrl = p.FotoUrl,
        Alergias = p.Alergias,
        Comorbilidades = p.Comorbilidades,
        FechaRegistro = p.FechaRegistro
       
    };
  public async Task<PacienteResponseDto?> ObtenerPorEmailAsync(string email)
{
    var pacientes = await _repo.FindAsync(p => p.Email == email && p.Activo);
    var paciente = pacientes.FirstOrDefault();
    return paciente == null ? null : MapToDto(paciente);
}

public async Task<PaginatedResult<PacienteResponseDto>> ObtenerPaginadoAsync(
    string? busqueda, int page, int pageSize)
{
    var result = await _repo.GetPaginadoAsync(busqueda, page, pageSize);
    return new PaginatedResult<PacienteResponseDto>
    {
        Data = result.Data.Select(MapToDto),
        TotalItems = result.TotalItems,
        Page = result.Page,
        PageSize = result.PageSize
    };
}
}

