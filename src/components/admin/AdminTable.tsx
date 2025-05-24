import React from "react";
import { Table } from "@k2600x/design-system";
import type { ColumnDef } from "@tanstack/react-table";

/**
 * AdminTable displays data with actions and handles loading/error/empty states.
 * @param data Table data
 * @param columns Column definitions
 * @param loading Loading state
 * @param error Optional error message
 * @param onEdit Optional edit handler
 * @param onDelete Optional delete handler
 * @param emptyMessage Optional message when no data
 */
export interface AdminTableProps {
  data: any[];
  columns: ColumnDef<any>[];
  loading: boolean;
  error?: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  emptyMessage?: string;
  // Add meta for custom table features (e.g. onCellUpdate)
  meta?: Record<string, any>;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  data,
  columns,
  loading,
  error,
  emptyMessage = "No data found.",
  meta,
}) => {
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }
  if (!data || data.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <Table
      data={data}
      columns={columns}
      className="mt-2"
      meta={meta}
    />
  );
};
