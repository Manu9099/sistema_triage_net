using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sistema_triage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSignosVitales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FrecuenciaCardiaca",
                table: "TriageRegistros",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FrecuenciaRespiratoria",
                table: "TriageRegistros",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Glucosa",
                table: "TriageRegistros",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PresionArterial",
                table: "TriageRegistros",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SaturacionOxigeno",
                table: "TriageRegistros",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Temperatura",
                table: "TriageRegistros",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FrecuenciaCardiaca",
                table: "TriageRegistros");

            migrationBuilder.DropColumn(
                name: "FrecuenciaRespiratoria",
                table: "TriageRegistros");

            migrationBuilder.DropColumn(
                name: "Glucosa",
                table: "TriageRegistros");

            migrationBuilder.DropColumn(
                name: "PresionArterial",
                table: "TriageRegistros");

            migrationBuilder.DropColumn(
                name: "SaturacionOxigeno",
                table: "TriageRegistros");

            migrationBuilder.DropColumn(
                name: "Temperatura",
                table: "TriageRegistros");
        }
    }
}
