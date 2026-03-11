using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Crm_Gruppo_5.Migrations
{
    /// <inheritdoc />
    public partial class RimossoVincoloRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Companies_AddressId",
                table: "Companies");

            migrationBuilder.AlterColumn<int>(
                name: "AddressId",
                table: "Companies",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

           /* migrationBuilder.AddColumn<string>(
                name: "zip",
                table: "Addresses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");*/

            migrationBuilder.CreateIndex(
                name: "IX_Companies_AddressId",
                table: "Companies",
                column: "AddressId",
                unique: true,
                filter: "[AddressId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Companies_AddressId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "zip",
                table: "Addresses");

            migrationBuilder.AlterColumn<int>(
                name: "AddressId",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_AddressId",
                table: "Companies",
                column: "AddressId",
                unique: true);
        }
    }
}
