using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SearchLogs",
                columns: table => new
                {
                    SearchLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NormalizedProductName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    SearchedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SearchLogs", x => x.SearchLogId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SearchLogs_NormalizedProductName",
                table: "SearchLogs",
                column: "NormalizedProductName");

            migrationBuilder.CreateIndex(
                name: "IX_SearchLogs_SearchedAtUtc",
                table: "SearchLogs",
                column: "SearchedAtUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SearchLogs");
        }
    }
}
