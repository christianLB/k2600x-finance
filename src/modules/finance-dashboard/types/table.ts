import type { ColumnDef } from '@tanstack/react-table';

export interface PaginationState {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination: PaginationState;
}
