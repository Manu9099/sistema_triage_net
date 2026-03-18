using FluentValidation;
using sistema_triage.Application.DTOs.Paciente;

namespace sistema_triage.Application.Validators.Paciente;

public class CrearPacienteValidator : AbstractValidator<CrearPacienteDto>
{
    public CrearPacienteValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty().WithMessage("Los nombres son requeridos")
            .MaximumLength(100);

        RuleFor(x => x.Apellidos)
            .NotEmpty().WithMessage("Los apellidos son requeridos")
            .MaximumLength(100);

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty().WithMessage("El número de documento es requerido")
            .MaximumLength(20);

        RuleFor(x => x.FechaNacimiento)
            .NotEmpty().WithMessage("La fecha de nacimiento es requerida")
            .LessThan(DateTime.UtcNow.AddYears(-18))
            .WithMessage("El paciente debe ser mayor de 18 años")
            .GreaterThan(DateTime.UtcNow.AddYears(-120))
            .WithMessage("Fecha de nacimiento inválida");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email inválido")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Telefono)
            .MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.Telefono));
    }
}