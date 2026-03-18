using sistema_triage.Domain.Entities;

namespace sistema_triage.Domain.Interfaces;

public interface IPacienteRepository : IRepository<Paciente>
{
    Task<Paciente?> GetByDocumentoAsync(string numeroDocumento);
    Task<Paciente?> GetWithTriagesAsync(Guid id);
    Task<IEnumerable<Paciente>> SearchAsync(string termino);
}