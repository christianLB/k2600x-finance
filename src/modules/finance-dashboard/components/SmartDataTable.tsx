'use client';
import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button, DataTable, Dialog, DialogHeader, DialogTitle, DialogFooter } from '@k2600x/design-system';
import { DynamicStrapiForm } from '@/components/dynamic-form/DynamicStrapiForm';

export interface PaginationState {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export interface SmartDataTableProps<T extends { id: React.Key }> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination: PaginationState;
  onEdit: (row: T) => void;
  onPageChange: (page: number) => void;
  collection: string;
}

export function SmartDataTable<T extends { id: React.Key }>({
  data,
  columns,
  pagination,
  onEdit,
  onPageChange,
  collection,
}: SmartDataTableProps<T>) {
  const [editRow, setEditRow] = useState<T | null>(null);

  const cols = useMemo<ColumnDef<T, any>[]>(
    () => [
      ...columns,
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" onClick={() => setEditRow(row.original)}>
            Edit
          </Button>
        ),
      },
    ],
    [columns],
  );

  // Map local pagination to design system pagination format
  const dataTablePagination = React.useMemo(() => {
    const { totalItems, itemsPerPage, currentPage } = pagination;
    return {
      pageCount: Math.max(1, Math.ceil(totalItems / itemsPerPage)),
      currentPage,
      itemsPerPage,
      onPageChange,
    };
  }, [pagination, onPageChange]);

  const handleClose = () => setEditRow(null);
  const handleSuccess = (values: any) => {
    onEdit(values);
    setEditRow(null);
  };

  return (
    <div>
      <DataTable
        data={data}
        columns={cols}
        pagination={dataTablePagination}
        rowActions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => setEditRow(row)}>
            Edit
          </Button>
        )}
      />
      <Dialog isOpen={!!editRow} onClose={handleClose}>
        {editRow && (
          <div className="p-6 min-w-[400px] w-[95vw] max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
            </DialogHeader>
            <DynamicStrapiForm collection={collection} document={editRow} onSuccess={handleSuccess} />
            <DialogFooter className="mt-4">
              <Button onClick={handleClose} variant="ghost">
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default SmartDataTable;
