using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Crm_Gruppo_5.Migrations
{
    /// <inheritdoc />
    public partial class test : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "zip",
                table: "Addresses",
                newName: "Zip");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Zip",
                table: "Addresses",
                newName: "zip");
        }
    }
}
