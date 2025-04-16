"use client";

import { useState, useEffect, useRef } from "react";
import {
  useStrapiCollection,
  UseStrapiCollectionOptions,
} from "@/hooks/useStrapiCollection";
import useStrapiDelete from "@/hooks/useStrapiDelete";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Checkbox } from "@/components/ui/checkbox";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

export interface ColumnDefinition<T> {
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
  filterable?: boolean;
  filterKey?: string;
  filterInput?: React.ReactNode | null;
}

export interface StrapiTableProps<T> {
  collection: string;
  columns: ColumnDefinition<T>[];
  title?: string;
  pageSize?: number;
  selectable?: boolean;
  onCreate?: () => void;
  createButtonText?: string;
  onEdit?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
  extraFilters?: Record<string, any>;
  queryOptions?: UseStrapiCollectionOptions;
  onSelectionChange?: (selected: T[]) => void;
}

export function StrapiTable<T>({
  collection,
  columns,
  title,
  pageSize = 10,
  selectable = false,
  onCreate,
  createButtonText,
  onEdit,
  renderActions,
  queryOptions,
  onSelectionChange,
}: StrapiTableProps<T>) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirm();

  const { mutate: deleteItem } = useStrapiDelete(collection, () => refetch());

  const { data, isLoading, refetch } = useStrapiCollection<T>(collection, { pagination: { page, pageSize: size }, ...queryOptions });

  useEffect(() => { refetch(); }, [page, size, queryOptions, refetch]);

  const rows: T[] = Array.isArray(data)
    ? data
    : data && Array.isArray((data as { data: T[] }).data)
    ? (data as { data: T[] }).data
    : [];

  const total =
    (data &&
      typeof data === "object" &&
      "meta" in data &&
      (data as any).meta?.pagination?.total) ||
    0;
  const totalPages = Math.ceil(total / size);

  const extraColumnsCount =
    (selectable ? 1 : 0) + (renderActions ? 1 : onEdit ? 1 : 0);

  const defaultRenderActions = (item: T) => (
    <div className="flex items-center gap-2 justify-center">
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className="text-gray-500 hover:text-blue-600"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => handleDelete(item)}
        className="text-gray-500 hover:text-red-600"
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </div>
  );

  const actionsRenderer =
    renderActions || (onEdit ? defaultRenderActions : defaultRenderActions);

  function handleDelete(item: T) {
    const docId = (item as any)?.documentId || (item as any)?.id;
    if (!docId) return;
    confirm({
      title: "¿Eliminar ítem?",
      description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        deleteItem({ id: docId });
      },
    });
  }

  function isSelected(item: T) {
    return selected.has(getId(item));
  }

  function toggleSelect(item: T) {
    const id = getId(item);
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  }

  function toggleSelectAll(allRows: T[]) {
    setSelected((prev) =>
      prev.size === allRows.length ? new Set() : new Set(allRows.map(getId))
    );
  }

  // Track previous selectedRows to avoid infinite loops
  const prevSelectedRowsRef = useRef<T[]>([]);

  // Effect: Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      // Only update if the selection actually changed
      const selectedRows = rows.filter((item) => selected.has(getId(item)));
      // Use JSON.stringify to compare arrays shallowly
      if (JSON.stringify(selectedRows.map(getId)) !== JSON.stringify((prevSelectedRowsRef.current ?? []).map(getId))) {
        onSelectionChange(selectedRows);
        prevSelectedRowsRef.current = selectedRows;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, rows]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className="min-w-full border-separate border-spacing-0">
          <TableHeader>
            <tr className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-muted">
              {selectable && (
                <TableHead className="p-2 border-b border-muted sticky left-0 bg-surface/95">
                  <Checkbox
                    checked={rows.length > 0 && rows.every(isSelected)}
                    indeterminate={selected.size > 0 && selected.size < rows.length}
                    onCheckedChange={() => toggleSelectAll(rows)}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
              )}
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="p-2 border-b border-muted text-left select-none group"
                  tabIndex={col.sortable ? 0 : -1}
                  aria-sort={col.sortable ? (queryOptions?.sort?.[0]?.endsWith(':desc') ? 'descending' : 'ascending') : undefined}
                  role="columnheader"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                        {/* TODO: Show actual sort direction if implemented */}
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M6 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 12l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </span>
                    )}
                  </span>
                </TableHead>
              ))}
              <TableHead className="p-2 border-b border-muted text-center">Acciones</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: size }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse even:bg-muted/40">
                  {Array(columns.length + extraColumnsCount).fill(0).map((_, cidx) => (
                    <TableCell key={cidx} className="p-2 border-b border-muted">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((item, idx) => (
                <TableRow
                  key={idx}
                  className="even:bg-muted/40 hover:bg-accent/10 transition-colors group"
                  tabIndex={0}
                  aria-rowindex={idx + 2}
                >
                  {selectable && (
                    <TableCell className="p-2 border-b border-muted sticky left-0 bg-surface/95">
                      <Checkbox
                        checked={isSelected(item)}
                        onCheckedChange={() => toggleSelect(item)}
                        aria-label="Seleccionar fila"
                      />
                    </TableCell>
                  )}
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="p-2 border-b border-muted">
                      {col.cell(item)}
                    </TableCell>
                  ))}
                  {actionsRenderer && (
                    <TableCell className="p-2 border-b border-muted text-center">
                      {actionsRenderer(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + extraColumnsCount}
                  className="text-center py-8 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="var(--color-muted)"/><path d="M7 17h10M7 13h10M7 9h10" stroke="var(--color-muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Sin registros</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center px-2 gap-2 mt-2">
        <span className="text-sm text-gray-500">
          Mostrando {(page - 1) * size + 1} - {Math.min(page * size, total)} de {total} registros
        </span>
        <select
          className="text-sm border rounded px-2 py-1"
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Filas por página"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="Primera página"
          >
            «
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            ‹
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (i) => i === 1 || i === totalPages || Math.abs(i - page) <= 1
            )
            .map((i) => (
              <Button
                key={i}
                size="icon"
                variant={i === page ? "default" : "ghost"}
                onClick={() => setPage(i)}
                aria-label={`Ir a página ${i}`}
              >
                {i}
              </Button>
            ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <span className="px-1 text-sm text-gray-400">...</span>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            ›
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            aria-label="Última página"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}

function getId(item: any): string {
  return item.id || item.documentId;
}