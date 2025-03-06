"use client";

import { useState } from "react";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiDocument } from "@/hooks/useStrapiDocument"; // <-- Importamos el hook para delete
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
import { useConfirm } from "@/hooks/useConfirm"; // <-- Hook para mostrar el dialog

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
  // Opcional para edición
  onEdit?: (item: T) => void;
  // Eliminamos onDelete para forzar la lógica interna
  // onDelete?: (item: T) => void; <-- Se deja de exponer
  // Render custom de acciones (opcional).
  renderActions?: (item: T) => React.ReactNode;
  // Texto para el botón de eliminar seleccionados (opcional).
  deleteButtonText?: string;
}

/**
 * NOTA:
 * - Se asume que cada `item` tiene un campo ID (por ejemplo item.id, item.documentId, etc.) que podamos usar
 *   en getId(item). Ajusta esa parte según tu estructura de datos.
 * - Se asume que `useStrapiCollection` obtiene los documentos. 
 * - Internamente usamos `useStrapiDocument` para hacer DELETE por ID.
 */
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
  deleteButtonText,
}: StrapiTableProps<T>) {
  const [page, setPage] = useState(1);
  // Estado para selección en masa, si fuera necesario.
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useStrapiCollection<T>(collection, {
    pagination: { page, pageSize },
  });

  // Hook para pedir confirmación
  const confirm = useConfirm();

  // Para poder llamar a `deleteMutation` sin necesidad de que busque el doc primero
  const [documentIdToDelete, setDocumentIdToDelete] = useState<string | null>(null);

  // Este hook apunta a un ID dinámico, pero lo usamos solo para `delete`, sin hacer GET.
  const { delete: deleteItemMutation } = useStrapiDocument<T>(
    collection,
    documentIdToDelete ?? undefined, // si es null, no hace nada
    { enabled: false } // deshabilitamos fetch GET; solo usaremos DELETE
  );

  // Asegurar un array de items
  const rows: T[] = Array.isArray(data)
    ? data
    : data && Array.isArray((data as { data: T[] }).data)
    ? (data as { data: T[] }).data
    : [];

  // Cálculo de columnas extra (checkbox + acciones)
  const extraColumnsCount =
    (selectable ? 1 : 0) + // Columna de checkboxes
    (renderActions ? 1 : onEdit ? 1 : 0); // Columna de acciones si se da renderActions o si onEdit existe

  // Renderizado por defecto de las acciones si NO tenemos un renderActions custom,
  // pero sí tenemos onEdit (y *ya no* onDelete expuesto).
  const defaultRenderActions = (item: T) => (
    <div className="flex items-center gap-2 justify-center">
      {onEdit && (
        <button onClick={() => onEdit(item)} className="text-gray-500 hover:text-blue-600">
          <PencilIcon className="w-4 h-4" />
        </button>
      )}
      {/* Botón de eliminar interno */}
      <button
        onClick={() => handleDelete(item)}
        className="text-gray-500 hover:text-red-600"
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </div>
  );

  // Elegir si usamos renderActions o default
  const actionsRenderer = renderActions || (onEdit ? defaultRenderActions : null);

  /**
   * Lógica interna para eliminar un ítem con confirmación.
   */
  function handleDelete(item: T) {
    const docId = getId(item);
    if (!docId) return; // Asegúrate de tener un ID
    confirm({
      title: "¿Eliminar ítem?",
      description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        setDocumentIdToDelete(docId);
        deleteItemMutation(); // llama a la mutación DELETE
      },
    });
  }

  /**
   * Helpers para manejar selección (si lo necesitas).
   */
  function isSelected(item: T) {
    return selected.has(getId(item));
  }
  function toggleSelect(item: T) {
    const id = getId(item);
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }
  function toggleSelectAll(allRows: T[]) {
    setSelected((prev) => {
      if (prev.size === allRows.length) {
        return new Set(); // deselecciona todo
      } else {
        return new Set(allRows.map(getId));
      }
    });
  }

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      {/* Encabezado */}
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
          {/* Ejemplo: eliminar seleccionados en masa, si fuera necesario */}
          {selectable && selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                confirm({
                  title: "¿Eliminar seleccionados?",
                  description: `Se eliminarán ${selected.size} registros. ¿Continuar?`,
                  onConfirm: () => {
                    // Aquí podrías iterar en selected y llamar la mutación
                    // para cada ID, o adaptar useStrapiDocument para eliminar en lote.
                  },
                });
              }}
            >
              {deleteButtonText || "Eliminar Seleccionados"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <Table className="w-full text-sm border-collapse border border-gray-200">
          <TableHeader className="bg-gray-100">
            <tr>
              {selectable && <TableHead className="p-2 border"></TableHead>}
              {columns.map((col, idx) => (
                <TableHead key={idx} className="p-2 border">
                  {col.header}
                </TableHead>
              ))}
              {actionsRenderer && (
                <TableHead className="p-2 border text-center">Acciones</TableHead>
              )}
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + extraColumnsCount} className="text-center py-4">
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
                <TableCell colSpan={columns.length + extraColumnsCount} className="text-center py-4">
                  Sin registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center space-x-2">
        <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Anterior
        </Button>
        <span className="self-center">Página {page}</span>
        <Button size="sm" onClick={() => setPage(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

// Ajusta esta función de acuerdo a cómo obtienes el ID en cada item
function getId(item: any): string {
  return item.id || item.documentId; // reemplaza según tu estructura real
}
