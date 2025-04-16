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
  formElement,
  onEdit,
  onCreate,
  createButtonText,
  allowCreate = true,
  onDelete,
}: FullStrapiTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [sort] = useState<SortState | null>(null);
  const [filtersState, setFiltersState] = useState<FilterState>({});

  const { mutate: deleteItem } = useStrapiDelete(collection, () => {
    toast.success("Eliminación masiva completada");
    setSelectedRows([]);
  });

  const confirm = useConfirm();

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

  const handleEdit = (row: T) => {
    if (onEdit) return onEdit(row);
    setEditRow(row);
    setModalOpen(true);
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);

  function handleModalSubmit(/*row: T*/) {
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-card rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] transition-colors">
          <h2 className="font-bold mb-4">{editRow ? "Editar" : "Crear"} registro</h2>
          <pre className="text-xs bg-muted p-2 rounded max-h-64 overflow-auto mb-4">{JSON.stringify(editRow, null, 2)}</pre>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-1 rounded bg-muted text-foreground" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={() => setModalOpen(false)}>Guardar</button>
          </div>
        </div>
      </div>
    );
  }

  const queryOptions = {
    ...(filters ? { filters } : {}),
    sort: sort ? [`${sort.field}:${sort.direction}`] : undefined,
    filters: {
      ...(filters || {}),
      ...Object.fromEntries(
        Object.entries(filtersState).filter(([, v]) => v !== "")
      ),
    },
  };

  function renderFiltersRow() {
    return (
      <div className="flex gap-2 mb-2">
        {columns.map((col) =>
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

  const enhancedColumns = columns;

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-muted scrollbar-track-card">
      {/* Only render title if provided, and let the page own the main heading */}
      {title && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-1">
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="var(--color-primary)" fillOpacity="0.08"/><path d="M7 17h10M7 13h10M7 9h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {title}
          </h2>
          {(allowCreate && onCreate) && (
            <button
              className="bg-primary text-primary-foreground font-semibold rounded-md px-4 py-2 shadow-sm hover:bg-primary/80 transition-colors"
              onClick={onCreate}
            >
              {createButtonText || "Crear"}
            </button>
          )}
        </div>
      )}
      {/* Filters and selectable info in a single flex row for better space usage */}
      {(selectable || columns.some(col => col.filterable)) && (
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 px-1">
          {selectable && (
            <span className="text-sm text-gray-500">
              {selectedRows.length} seleccionados
            </span>
          )}
          <div className="flex-1">{renderFiltersRow()}</div>
        </div>
      )}
      {/* Table card: single border/shadow, no redundant wrappers */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-muted bg-surface">
        <StrapiTable<T>
          collection={collection}
          columns={enhancedColumns}
          queryOptions={queryOptions}
          selectable={selectable}
          onSelectionChange={setSelectedRows}
          renderActions={renderActions}
        />
      </div>
      {renderModal()}
    </div>
  );
}

export default FullStrapiTable;
export type { ColumnDefinition } from "@/components/tables/StrapiTable";
