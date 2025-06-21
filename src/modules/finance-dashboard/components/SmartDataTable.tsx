'use client';
import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Button, Pagination, Dialog, DialogHeader, DialogTitle, DialogFooter } from '@k2600x/design-system';
import { DynamicStrapiForm } from '@/components/dynamic-form/DynamicStrapiForm';

export interface PaginationState {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export interface SmartDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination: PaginationState;
  onEdit: (row: T) => void;
  onPageChange: (page: number) => void;
  collection: string;
}

export function SmartDataTable<T>({
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

  const table = useReactTable({ data, columns: cols, getCoreRowModel: getCoreRowModel() });

  const handleClose = () => setEditRow(null);
  const handleSuccess = (values: any) => {
    onEdit(values);
    setEditRow(null);
  };

  return (
    <div>
      <table className="table-auto w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left px-3 py-2 border-b">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <Pagination
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          onPageChange={onPageChange}
        />
      </div>
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
