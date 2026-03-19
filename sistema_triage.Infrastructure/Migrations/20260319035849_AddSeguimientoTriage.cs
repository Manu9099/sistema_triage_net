using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sistema_triage.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeguimientoTriage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Seguimientos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TriageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FueAtendido = table.Column<bool>(type: "bit", nullable: false),
                    DiagnosticoConfirmado = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NivelTriageCorrecto = table.Column<bool>(type: "bit", nullable: false),
                    NivelTriageReal = table.Column<int>(type: "int", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MedicamentosIndicados = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RegistradoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seguimientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Seguimientos_TriageRegistros_TriageId",
                        column: x => x.TriageId,
                        principalTable: "TriageRegistros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Seguimientos_TriageId",
                table: "Seguimientos",
                column: "TriageId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Seguimientos");
        }
    }
}
