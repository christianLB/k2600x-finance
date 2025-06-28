"use client";
// ==========================================================================
// SmartDataTable v4 — Presentational Component
// ==========================================================================
//
// @description
// This component is a "presentational" or "dumb" component. It is
// responsible for rendering the UI for a Strapi collection, but it does
// not fetch any data itself. Instead, it receives all data, schema,
// and mutation handlers as props from a parent component.
//
// @features
// - Renders a DataTable for any Strapi collection.
// - Dynamically generates columns based on the provided Strapi schema.
// - Includes dialogs for Create, Update, and Delete operations.
// - Uses a DynamicStrapiForm for editing and creating records.
// - Delegates all state management and API calls to its parent.
//
// ==========================================================================

import React, { useMemo, useState, useRef, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Button,
  DataTable,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Switch,
} from "@k2600x/design-system";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";

// ==========================================================================
// Type Definitions
// ==========================================================================

// Cast Design System components to `any` to bypass strict type checks
// that may conflict with the dynamic nature of this component.
const Btn = Button as any;
const DT = DataTable as any;
const Dlg = Dialog as any;
const DlgHeader = DialogHeader as any;
const DlgTitle = DialogTitle as any;
const DlgFooter = DialogFooter as any;

// Defines the shape of the Strapi schema object required by this component.
interface StrapiSchema {
  uid: string;
  primaryKey: string;
  primaryField: string;
  attributes: {
    [key: string]: {
      type: string;
      relation?: {
        targetUID: string;
      };
    };
  };
}

// Defines the props for the SmartDataTable component.
interface Props {
  schema: StrapiSchema;
  data: any[];
  isLoading: boolean;
  // CRUD operations are handled by the parent component.
  onCreate: (values: any) => Promise<any>;
  onUpdate: (id: any, values: any) => Promise<any>;
  onDelete: (id: any) => Promise<any>;
  // Pagination state is also controlled by the parent.
  pagination: {
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
}

// ==========================================================================
// Component
// ==========================================================================

export default function SmartDataTable({ schema, data, isLoading, onCreate, onUpdate, onDelete, pagination }: Props) {
  // State for managing the Create, Update, and Delete dialogs.
  const [isNewDialogOpen, setNewDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deletingRow, setDeletingRow] = useState<any | null>(null);
  const [isDirty, setDirty] = useState(false);

  // Ref to access the DynamicStrapiForm's imperative methods (e.g., submitForm).
  const formRef = useRef<{ submitForm: () => void; isDirty: () => boolean }>(null);

  // State for tracking the status of mutations.
  const [mutationState, setMutationState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  /**
   * Dynamically generates table columns from the Strapi schema.
   * This memoized function avoids re-computation on every render.
   */
  const columns: ColumnDef<any, any>[] = useMemo(() => {
    if (!schema) return [];

    const generatedColumns: ColumnDef<any, any>[] = Object.entries(schema.attributes)
      .map(([fieldName, attr]) => {
        // Handle different attribute types to render them appropriately.
        switch (attr.type) {
          case "boolean":
            return {
              accessorKey: fieldName,
              header: fieldName,
              cell: ({ row }) => <Switch checked={row.original[fieldName]} disabled />,
            };
          case "media":
            return {
              accessorKey: fieldName,
              header: fieldName,
              cell: ({ row }) =>
                row.original[fieldName]?.url ? (
                  <a href={row.original[fieldName].url} target="_blank" rel="noreferrer" className="underline text-xs">file</a>
                ) : '—',
            };
          // Add more type handlers as needed (e.g., relations, dates).
          default:
            // For simple types, just display the value.
            return { accessorKey: fieldName, header: fieldName };
        }
      });

    // Add a final column for action buttons (Edit, Delete).
    generatedColumns.push({
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Btn size="sm" variant="ghost" onClick={() => setEditingRow(row.original)}>
            Edit
          </Btn>
          <Btn size="sm" variant="destructive" onClick={() => setDeletingRow(row.original)}>
            Delete
          </Btn>
        </div>
      ),
    });

    return generatedColumns;
  }, [schema]);

  // ==========================================================================
  // CRUD Handlers
  // ==========================================================================

  const executeMutation = async (mutationFn: () => Promise<any>, onSuccess: () => void) => {
    setMutationState('pending');
    try {
      await mutationFn();
      setMutationState('success');
      onSuccess();
      // Briefly show success, then reset.
      setTimeout(() => setMutationState('idle'), 2000);
    } catch (error) {
      console.error("Mutation failed:", error);
      setMutationState('error');
    }
  };

  const handleCreate = (values: any) => {
    executeMutation(() => onCreate(values), () => setNewDialogOpen(false));
  };

  const handleUpdate = (values: any) => {
    if (!editingRow) return;
    const id = editingRow[schema.primaryKey];
    executeMutation(() => onUpdate(id, values), () => setEditingRow(null));
  };

  const handleDelete = () => {
    if (!deletingRow) return;
    const id = deletingRow[schema.primaryKey];
    executeMutation(() => onDelete(id), () => setDeletingRow(null));
  };

  // ==========================================================================
  // Render Logic
  // ==========================================================================

  if (!schema) {
    return <p className="text-zinc-500">Select a model to begin.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn size="sm" onClick={() => setNewDialogOpen(true)}>
          Add New Record
        </Btn>
      </div>

      <DT
        data={data}
        columns={columns}
        pagination={{
          pageCount: pagination.pageCount,
          currentPage: pagination.currentPage,
          itemsPerPage: 10, // This could be a prop if needed
          onPageChange: pagination.onPageChange,
        }}
        loading={isLoading}
      />

      {/* Create Record Dialog */}
      <Dlg isOpen={isNewDialogOpen} onClose={() => setNewDialogOpen(false)}>
        <div className="p-6 w-[95vw] max-w-xl">
          <DlgHeader><DlgTitle>New Record</DlgTitle></DlgHeader>
          <DynamicStrapiForm
            ref={formRef}
            collection={schema.uid}
            onSuccess={handleCreate}
            hideSubmitButton
            onDirtyChange={setDirty}
          />
          <DlgFooter className="mt-4 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setNewDialogOpen(false)}>Cancel</Btn>
            <Btn onClick={() => formRef.current?.submitForm()} disabled={!isDirty || mutationState === 'pending'}>
              {mutationState === 'pending' ? 'Creating...' : 'Create'}
            </Btn>
          </DlgFooter>
        </div>
      </Dlg>

      {/* Edit Record Dialog */}
      <Dlg isOpen={!!editingRow} onClose={() => setEditingRow(null)}>
        <div className="p-6 w-[95vw] max-w-xl">
          {editingRow && (
            <>
              <DlgHeader><DlgTitle>Edit Record</DlgTitle></DlgHeader>
              <DynamicStrapiForm
                ref={formRef}
                collection={schema.uid}
                document={editingRow}
                onSuccess={handleUpdate}
                hideSubmitButton
                onDirtyChange={setDirty}
              />
              <DlgFooter className="mt-4 flex justify-end gap-2">
                <Btn variant="ghost" onClick={() => setEditingRow(null)}>Cancel</Btn>
                <Btn onClick={() => formRef.current?.submitForm()} disabled={!isDirty || mutationState === 'pending'}>
                  {mutationState === 'pending' ? 'Saving...' : 'Save Changes'}
                </Btn>
              </DlgFooter>
            </>
          )}
        </div>
      </Dlg>

      {/* Delete Confirmation Dialog */}
      <Dlg isOpen={!!deletingRow} onClose={() => setDeletingRow(null)}>
        <div className="p-6 w-[95vw] max-w-sm">
          <DlgHeader><DlgTitle>Confirm Deletion</DlgTitle></DlgHeader>
          <p className="my-4 text-sm">This action is permanent and cannot be undone.</p>
          <DlgFooter className="mt-2 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setDeletingRow(null)}>Cancel</Btn>
            <Btn variant="destructive" onClick={handleDelete} disabled={mutationState === 'pending'}>
              {mutationState === 'pending' ? 'Deleting...' : 'Delete'}
            </Btn>
          </DlgFooter>
        </div>
      </Dlg>
    </div>
  );
}
