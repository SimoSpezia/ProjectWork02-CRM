using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Crm_Gruppo_5.Migrations
{
    /// <inheritdoc />
    public partial class Contact : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Group_Categories_CategoriesCategoryId",
                table: "Group");

            migrationBuilder.DropForeignKey(
                name: "FK_Group_Contacts_ContactsContactId",
                table: "Group");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Group",
                table: "Group");

            migrationBuilder.RenameTable(
                name: "Group",
                newName: "Groups");

            migrationBuilder.RenameIndex(
                name: "IX_Group_ContactsContactId",
                table: "Groups",
                newName: "IX_Groups_ContactsContactId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Groups",
                table: "Groups",
                columns: new[] { "CategoriesCategoryId", "ContactsContactId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Categories_CategoriesCategoryId",
                table: "Groups",
                column: "CategoriesCategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Contacts_ContactsContactId",
                table: "Groups",
                column: "ContactsContactId",
                principalTable: "Contacts",
                principalColumn: "ContactId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Categories_CategoriesCategoryId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Contacts_ContactsContactId",
                table: "Groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Groups",
                table: "Groups");

            migrationBuilder.RenameTable(
                name: "Groups",
                newName: "Group");

            migrationBuilder.RenameIndex(
                name: "IX_Groups_ContactsContactId",
                table: "Group",
                newName: "IX_Group_ContactsContactId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Group",
                table: "Group",
                columns: new[] { "CategoriesCategoryId", "ContactsContactId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Group_Categories_CategoriesCategoryId",
                table: "Group",
                column: "CategoriesCategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Group_Contacts_ContactsContactId",
                table: "Group",
                column: "ContactsContactId",
                principalTable: "Contacts",
                principalColumn: "ContactId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
