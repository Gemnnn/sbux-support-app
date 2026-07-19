using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddProductShelfLifeOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductShelfLifeOptions",
                columns: table => new
                {
                    ProductShelfLifeOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    PreparationType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ShelfLifeDays = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductShelfLifeOptions", x => x.ProductShelfLifeOptionId);
                    table.ForeignKey(
                        name: "FK_ProductShelfLifeOptions_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductShelfLifeOptions_ProductId",
                table: "ProductShelfLifeOptions",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductShelfLifeOptions_ProductId_PreparationType",
                table: "ProductShelfLifeOptions",
                columns: new[] { "ProductId", "PreparationType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductShelfLifeOptions");
        }
    }
}
