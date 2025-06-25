import React from "react";
import { SmartDataTable, PaginationState } from "@/modules/finance-dashboard/components/SmartDataTable";
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
  columns: ColumnDef<any, any>[];
  loading: boolean;
  error?: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  emptyMessage?: string;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  collection?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  data,
  columns,
  loading,
  error,
  emptyMessage = "No data found.",
  pagination,
  onEdit = () => {},
  onPageChange,
  collection,
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
    <SmartDataTable
      data={data || []}
      columns={columns}
      pagination={pagination ?? { currentPage: 1, itemsPerPage: 0, totalItems: 0 }}
      onPageChange={onPageChange ?? (() => {})}
      collection={collection ?? ''}
    />
  );
};
