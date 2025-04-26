import type { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Button } from "@k2600x/design-system";

/**
 * Generate columns for the admin table based on schema and visible columns.
 * @param schema The Strapi schema object
 * @param onEdit Edit handler
 * @param onDelete Delete handler
 * @param visibleCols Array of visible column keys
 */
export function getTableColumns(
  schema: any,
  onEdit: (row: any) => void,
  onDelete: (row: any) => void,
  visibleCols: string[] | null
): ColumnDef<any>[] {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: info => info.getValue(),
    },
  ];
  if (schema && schema.schema && schema.schema.attributes && visibleCols) {
    visibleCols.forEach((key) => {
      if (!schema.schema.attributes[key]) return;
      columns.push({
        header: key,
        accessorFn: row => row[key],
        cell: info => {
          const value = info.getValue();
          if (Array.isArray(value)) {
            return value.length;
          }
          if (typeof value === "object" && value !== null) {
            return typeof (value as any).id !== "undefined" ? (value as any).id : JSON.stringify(value);
          }
          return value === undefined ? "" : String(value);
        },
      });
    });
  }
  columns.push({
    id: "actions",
    header: "Actions",
    cell: info => (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(info.row.original)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(info.row.original)}
        >
          Delete
        </Button>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  });
  return columns;
}
