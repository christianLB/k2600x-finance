import type { ColumnDef, CellContext } from "@tanstack/react-table";
import React from "react";
import { Button } from "@k2600x/design-system";

/**
 * Generates table columns for the admin table based on the schema and visible columns.
 *
 * @param schema - The Strapi schema object for the collection.
 * @param onEdit - Callback invoked when editing a row (receives the record object).
 * @param onDelete - Callback invoked when deleting a row (receives the record object).
 * @param visibleCols - Array of visible column keys (attributes).
 * @returns Array of column definitions for TanStack Table.
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
      cell: (info: CellContext<any, any>) => info.getValue(),
    },
  ];
  if (schema && schema.schema && schema.schema.attributes && visibleCols) {
    visibleCols.forEach((key) => {
      if (!schema.schema.attributes[key]) return;
      columns.push({
        header: key,
        accessorFn: (row: any) => row[key],
        cell: (info: CellContext<any, any>) => {
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
    cell: (info: CellContext<any, any>) => (
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
