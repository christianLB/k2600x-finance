'use client';
import React, { useMemo, useState, useRef } from 'react';
import { useStrapiMutation } from '../hooks';
import type { ColumnDef } from '@tanstack/react-table';

// Import with type assertions to bypass JSX type errors
import {
  Button,
  DataTable,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@k2600x/design-system';

// Cast as any to bypass type errors from design-system JSX elements
const ButtonComponent = Button as any;
const DataTableComponent = DataTable as any;
const DialogComponent = Dialog as any;
const DialogHeaderComponent = DialogHeader as any;
const DialogTitleComponent = DialogTitle as any;
const DialogFooterComponent = DialogFooter as any;
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
  onPageChange: (page: number) => void;
  onMutationSuccess?: () => void;
  collection: string; // This should be the Strapi model UID, e.g., 'api::category.category'
}

export const SmartDataTable = <T extends { id: React.Key }>(props: SmartDataTableProps<T>) => {
  const {
    data,
    columns,
    pagination,
    onPageChange,
    onMutationSuccess,
    collection,
  } = props;
  const [editRow, setEditRow] = useState<T | null>(null);
  const [deleteRow, setDeleteRow] = useState<T | null>(null);
  const { update, remove, loading: isMutating } = useStrapiMutation();
  const formRef = useRef<{ submitForm: () => void; isDirty: () => boolean; }>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleUpdate = async (values: any) => {
    if (!editRow) return;
    try {
      await update(collection, String(editRow.id), values);
      setEditRow(null);
      onMutationSuccess?.();
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    try {
      await remove(collection, String(deleteRow.id));
      setDeleteRow(null);
      onMutationSuccess?.();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleFooterSubmit = () => {
    formRef.current?.submitForm();
  };

  const tableColumns = useMemo<ColumnDef<T, any>[]>(
    () => [
      ...columns,
      {
        id: 'actions',
        header: () => <span className="text-right w-full block">Actions</span>,
        cell: ({ row }) => {
          const original = row.original;
          return (
            <div className="flex space-x-2 justify-end">
              <ButtonComponent variant="ghost" size="sm" onClick={() => setEditRow(original)}>
                Edit
              </ButtonComponent>
              <ButtonComponent variant="destructive" size="sm" onClick={() => setDeleteRow(original)}>
                Delete
              </ButtonComponent>
            </div>
          );
        },
      },
    ],
    [columns]
  );
  
  const dataTablePagination = useMemo(() => ({
    pageCount: Math.ceil(pagination.totalItems / pagination.itemsPerPage),
    currentPage: pagination.currentPage,
    itemsPerPage: pagination.itemsPerPage,
    onPageChange: onPageChange,
  }), [pagination, onPageChange]);

  return (
    <div>
      <DataTableComponent
        data={data}
        columns={tableColumns}
        pagination={dataTablePagination}
      />

      {/* Edit Dialog */}
      <DialogComponent isOpen={!!editRow} onClose={() => {
        if (formRef.current?.isDirty()) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            setEditRow(null);
          }
        } else {
          setEditRow(null);
        }
      }}>
        <div className="dialog-content p-6 min-w-[400px] w-[95vw] max-w-xl">
          {editRow && (
            <>
              <DialogHeaderComponent>
                <DialogTitleComponent>Edit Record</DialogTitleComponent>
              </DialogHeaderComponent>
              <DynamicStrapiForm
                ref={formRef}
                collection={collection}
                document={editRow}
                onSuccess={handleUpdate}
                hideSubmitButton
                onDirtyChange={(isDirty) => setIsFormDirty(isDirty)}
              />
              <DialogFooterComponent className="mt-4">
                <ButtonComponent onClick={() => setEditRow(null)} variant="ghost">
                  Cancel
                </ButtonComponent>
                <ButtonComponent onClick={handleFooterSubmit} disabled={isMutating || !isFormDirty}>
                  {isMutating ? 'Saving...' : 'Save Changes'}
                </ButtonComponent>
              </DialogFooterComponent>
            </>
          )}
        </div>
      </DialogComponent>

      {/* Delete Confirmation Dialog */}
      <DialogComponent isOpen={!!deleteRow} onClose={() => setDeleteRow(null)}>
        <div className="dialog-content p-6 min-w-[400px] w-[95vw] max-w-xl">
          <DialogHeaderComponent>
            <DialogTitleComponent>Confirm Deletion</DialogTitleComponent>
          </DialogHeaderComponent>
          <p>Are you sure you want to delete this record? This action cannot be undone.</p>
          <DialogFooterComponent className="mt-6 flex justify-end space-x-2">
            <ButtonComponent onClick={() => setDeleteRow(null)} variant="ghost" disabled={isMutating}>
              Cancel
            </ButtonComponent>
            <ButtonComponent onClick={handleDelete} variant="destructive" disabled={isMutating}>
              {isMutating ? 'Deleting...' : 'Delete'}
            </ButtonComponent>
          </DialogFooterComponent>
        </div>
      </DialogComponent>
    </div>
  );
}

export default SmartDataTable;
