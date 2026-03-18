using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Entities;

namespace sistema_triage.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<TriageRegistro> TriageRegistros => Set<TriageRegistro>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Paciente>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Nombres).IsRequired().HasMaxLength(100);
            e.Property(p => p.Apellidos).IsRequired().HasMaxLength(100);
            e.Property(p => p.NumeroDocumento).IsRequired().HasMaxLength(20);
            e.HasIndex(p => p.NumeroDocumento).IsUnique();
            e.Property(p => p.Email).HasMaxLength(200);
            e.Property(p => p.Telefono).HasMaxLength(20);
            e.Ignore(p => p.Edad); // propiedad calculada
        });

        builder.Entity<TriageRegistro>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.InicioSintomas).IsRequired().HasMaxLength(20);
            e.Property(t => t.RecomendacionClinica).HasMaxLength(500);
            e.Property(t => t.TiempoAtencion).HasMaxLength(50);
            e.HasOne(t => t.Paciente)
             .WithMany(p => p.Triages)
             .HasForeignKey(t => t.PacienteId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.UsuarioRegistra)
             .WithMany()
             .HasForeignKey(t => t.UsuarioRegistraId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Renombrar tablas de Identity para que queden más limpias
        builder.Entity<ApplicationUser>().ToTable("Usuarios");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("Roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UsuariosRoles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UsuariosClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UsuariosLogins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RolesClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UsuariosTokens");
    }
}