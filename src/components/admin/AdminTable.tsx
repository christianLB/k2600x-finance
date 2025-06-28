import React from "react";
import SmartDataTable from "@/modules/finance-dashboard/components/SmartDataTable";
import type { ColumnDef } from "@tanstack/react-table";

// Define PaginationState interface to match SmartDataTable
interface PaginationState {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

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

  // AdminTable is deprecated and SmartDataTable has different props
  // This is a temporary compatibility wrapper
  return (
    <div>
      <p className="text-orange-600 mb-4">
        AdminTable is deprecated. Use SmartDataTable directly with proper schema props.
      </p>
      <div className="border rounded p-4">
        {data?.map((item, index) => (
          <div key={index} className="border-b py-2 last:border-b-0">
            <pre className="text-xs">{JSON.stringify(item, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};
