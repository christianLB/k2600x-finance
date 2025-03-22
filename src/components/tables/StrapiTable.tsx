"use client";

import { useState, useEffect } from "react";
import {
  useStrapiCollection,
  UseStrapiCollectionOptions,
} from "@/hooks/useStrapiCollection";
import { useStrapiDocument } from "@/hooks/useStrapiDocument";
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
  deleteButtonText?: string;
  extraFilters?: Record<string, any>;
  queryOptions?: UseStrapiCollectionOptions;
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
}: StrapiTableProps<T>) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirm();
  const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(
    null
  );

  const { delete: deleteItemMutation } = useStrapiDocument<T>(
    collection,
    documentIdToDelete ?? undefined,
    { enabled: false }
  );

  const { data, isLoading, refetch } = useStrapiCollection<T>(collection, {
    pagination: { page, pageSize },
    ...queryOptions,
  });

  useEffect(() => {
    refetch();
  }, [page, pageSize, queryOptions, refetch]);

  const rows: T[] = Array.isArray(data)
    ? data
    : data && Array.isArray((data as { data: T[] }).data)
    ? (data as { data: T[] }).data
    : [];

  const total =
    (data &&
      typeof data === "object" &&
      "meta" in data && //@ts-ignore (pagination)
      data.meta?.pagination?.total) ||
    0;
  const totalPages = Math.ceil(total / pageSize);

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
    renderActions || (onEdit ? defaultRenderActions : null);

  function handleDelete(item: T) {
    //@ts-ignore
    const docId = item?.documentId;
    if (!docId) return;
    confirm({
      title: "¿Eliminar ítem?",
      description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        setDocumentIdToDelete(docId);
        deleteItemMutation();
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

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        {selectable && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={rows.length > 0 && selected.size === rows.length}
              onCheckedChange={() => toggleSelectAll(rows)}
            />
            <span>Seleccionar Todos</span>
          </div>
        )}
        <span className="font-semibold">{title || "Listado"}</span>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button size="sm" onClick={onCreate}>
              {createButtonText || "Crear"}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-sm border-collapse border border-gray-200">
          <TableHeader className="bg-gray-100">
            <tr>
              {selectable && <TableHead className="p-2 border" />}
              {columns.map((col, idx) => (
                <TableHead key={idx} className="p-2 border">
                  {col.header}
                </TableHead>
              ))}
              {actionsRenderer && (
                <TableHead className="p-2 border text-center">
                  Acciones
                </TableHead>
              )}
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + extraColumnsCount}
                  className="text-center py-4"
                >
                  <Loader />
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((item, idx) => (
                <TableRow key={idx}>
                  {selectable && (
                    <TableCell className="p-2 border">
                      <Checkbox
                        checked={isSelected(item)}
                        onCheckedChange={() => toggleSelect(item)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="p-2 border">
                      {col.cell(item)}
                    </TableCell>
                  ))}
                  {actionsRenderer && (
                    <TableCell className="p-2 border text-center">
                      {actionsRenderer(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + extraColumnsCount}
                  className="text-center py-4"
                >
                  Sin registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center px-2 gap-2">
        <span className="text-sm text-gray-500">
          Mostrando {(page - 1) * pageSize + 1} -{" "}
          {Math.min(page * pageSize, total)} de {total} registros
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            «
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
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
          >
            ›
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
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
