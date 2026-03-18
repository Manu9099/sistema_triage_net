using FluentValidation;
using sistema_triage.Application.DTOs.Auth;

namespace sistema_triage.Application.Validators.Auth;

public class RegisterValidator : AbstractValidator<RegisterDto>
{
    private static readonly string[] RolesValidos = ["Admin", "Staff", "Paciente"];

    public RegisterValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty().WithMessage("Los nombres son requeridos")
            .MaximumLength(100).WithMessage("Máximo 100 caracteres");

        RuleFor(x => x.Apellidos)
            .NotEmpty().WithMessage("Los apellidos son requeridos")
            .MaximumLength(100).WithMessage("Máximo 100 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido")
            .EmailAddress().WithMessage("El email no tiene formato válido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(8).WithMessage("Mínimo 8 caracteres")
            .Matches("[A-Z]").WithMessage("Debe tener al menos una mayúscula")
            .Matches("[0-9]").WithMessage("Debe tener al menos un número")
            .Matches("[^a-zA-Z0-9]").WithMessage("Debe tener al menos un carácter especial");

        RuleFor(x => x.ConfirmarPassword)
            .Equal(x => x.Password).WithMessage("Las contraseñas no coinciden");

        RuleFor(x => x.Rol)
            .Must(r => RolesValidos.Contains(r))
            .WithMessage("Rol inválido. Valores permitidos: Admin, Staff, Paciente");
    }
}