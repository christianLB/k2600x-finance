// FullStrapiTable.tsx
"use client";

import { useState } from "react";
import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";
import { toast } from "sonner";
import useStrapiDelete from "@/hooks/useStrapiDelete";
import { useConfirm } from "@/hooks/useConfirm";
import { PencilIcon, Trash2Icon } from "lucide-react";

interface FullStrapiTableProps<T> {
  collection: string;
  columns: ColumnDefinition<T>[];
  title?: string;
  filters?: object;
  selectable?: boolean;
  onBulkDelete?: (selected: T[]) => void;
  /**
   * Custom form element to render inside the create/edit modal.
   * Receives { row, onChange, onSubmit, onCancel } as props.
   */
  formElement?: React.ReactNode | ((props: { row: T | null, onChange: (row: T) => void, onSubmit: (row: T) => void, onCancel: () => void }) => React.ReactNode);
  onEdit?: (row: T) => void;
  onCreate?: () => void;
  createButtonText?: string;
  allowCreate?: boolean;
  onDelete?: (row: T) => void;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface FilterState {
  [field: string]: string;
}

/**
 * Experimental generic Strapi table for iterative testing.
 * Usage: <FullStrapiTable collection="operations" columns={columns} />
 */
export function FullStrapiTable<T>({
  collection,
  columns,
  title,
  filters,
  selectable = true,
  onBulkDelete,
  formElement,
  onEdit,
  onCreate,
  createButtonText,
  allowCreate = true,
  onDelete,
}: FullStrapiTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);
  const [filtersState, setFiltersState] = useState<FilterState>({});

  // Bulk delete integration
  const { mutate: deleteItem } = useStrapiDelete(collection, () => {
    toast.success("Eliminación masiva completada");
    setSelectedRows([]);
  });

  const confirm = useConfirm();

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    confirm({
      title: `¿Eliminar ${selectedRows.length} registros seleccionados?`,
      description: `Esta acción eliminará ${selectedRows.length} registros. ¿Deseas continuar?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        selectedRows.forEach((row: any) => {
          const id = row.documentId || row.id;
          if (id) deleteItem({ id });
        });
      },
    });
  };

  // Compose query options with sorting and filtering
  const queryOptions = {
    ...(filters ? { filters } : {}),
    sort: sort ? [`${sort.field}:${sort.direction}`] : undefined,
    filters: {
      ...(filters || {}),
      ...Object.fromEntries(
        Object.entries(filtersState).filter(([_, v]) => v !== "")
      ),
    },
  };

  // Per-row actions
  const handleEdit = (row: T) => {
    if (onEdit) return onEdit(row);
    setEditRow(row);
    setModalOpen(true);
  };
  const handleDelete = (row: any) => {
    if (onDelete) return onDelete(row);
    const id = row.documentId || row.id;
    if (!id) return;
    confirm({
      title: "¿Eliminar este registro?",
      description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        deleteItem({ id });
      },
    });
  };
  const renderActions = (row: T) => (
    <div className="flex gap-2 justify-center">
      <button
        className="text-gray-500 hover:text-blue-600"
        title="Editar"
        onClick={() => handleEdit(row)}
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        className="text-gray-500 hover:text-red-600"
        title="Eliminar"
        onClick={() => handleDelete(row)}
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </div>
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);

  // Modal form logic
  function handleModalSubmit(row: T) {
    // TODO: Wire up create/edit logic
    setModalOpen(false);
  }
  function handleModalChange(row: T) {
    setEditRow(row);
  }

  function renderModal() {
    if (!modalOpen) return null;
    if (typeof formElement === 'function') {
      return formElement({
        row: editRow,
        onChange: handleModalChange,
        onSubmit: handleModalSubmit,
        onCancel: () => setModalOpen(false),
      });
    }
    if (formElement) {
      return formElement;
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 min-w-[300px] max-w-[90vw]">
          <h2 className="font-bold mb-4">{editRow ? "Editar" : "Crear"} registro</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto mb-4">{JSON.stringify(editRow, null, 2)}</pre>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => setModalOpen(false)}>Guardar</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render filter inputs above table ---
  function renderFiltersRow() {
    return (
      <div className="flex gap-2 mb-2">
        {columns.map((col, idx) =>
          col.filterable ? (
            <input
              key={col.filterKey ?? col.header}
              type="text"
              value={filtersState[col.filterKey ?? col.header] ?? ""}
              placeholder={`Filtrar ${col.header}`}
              className="border rounded px-2 py-1 text-xs w-full"
              onChange={e => setFiltersState(f => ({ ...f, [col.filterKey ?? col.header]: e.target.value }))}
              style={{ minWidth: 100 }}
            />
          ) : (
            <div key={col.header} style={{ minWidth: 100 }} />
          )
        )}
      </div>
    );
  }

  // --- Render sortable column headers ---
  function renderSortableHeader(col: ColumnDefinition<T>, idx: number) {
    if (!col.sortable) return col.header;
    const key = col.sortKey ?? col.header;
    return (
      <button
        type="button"
        className="font-semibold flex items-center gap-1"
        onClick={() =>
          setSort(s =>
            s && s.field === key && s.direction === "asc"
              ? { field: key, direction: "desc" }
              : { field: key, direction: "asc" }
          )
        }
      >
        {col.header}
        {sort?.field === key ? (sort.direction === "asc" ? "▲" : "▼") : null}
      </button>
    );
  }

  // --- Enhanced columns for StrapiTable ---
  const enhancedColumns = columns.map((col, idx) => ({
    ...col,
    header: renderSortableHeader(col, idx),
  }));

  return (
    <div>
      {(allowCreate && onCreate) && (
        <div className="flex justify-end mb-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={onCreate}
          >
            {createButtonText || "Crear nuevo"}
          </button>
        </div>
      )}
      {selectable && (
        <div className="mb-2 flex gap-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={selectedRows.length === 0}
            onClick={handleBulkDelete}
          >
            Eliminar seleccionados
          </button>
          <span className="text-sm text-gray-500">
            {selectedRows.length} seleccionados
          </span>
        </div>
      )}
      {renderFiltersRow()}
      {renderModal()}
      <StrapiTable<T>
        collection={collection}
        title={title}
        columns={enhancedColumns}
        queryOptions={queryOptions}
        selectable={selectable}
        onSelectionChange={setSelectedRows}
        renderActions={renderActions}
      />
    </div>
  );
}
