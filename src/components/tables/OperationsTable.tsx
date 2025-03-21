"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
//import { Checkbox } from "@/components/ui/checkbox";
//import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import MultiSelect from "../ui/multi-select";

export interface Operacion {
  documentId: string;
  id: number;
  fechaMovimiento: string;
  monto: number;
  descripcion: string;
  tags: Array<{ id: number; name: string }>;
}

export function OperationsTable() {
  const [page, setPage] = useState(1);
  //const [selected, setSelected] = useState<Set<string>>(new Set());

  // Hooks de Strapi
  const { data: operaciones = [], update, refetch } = useStrapiCollection<Operacion>("operations", {
    pagination: { page, pageSize: 10 },
  });
  const { data: tags = [] } = useStrapiCollection("operation-tags");
  const confirm = useConfirm();

  // Actualizar tags de una operación
  const updateTags = async (documentId: string, selectedTagIds: number[]) => {
    try {//@ts-ignore
      await update({ documentId, updatedData: { tags: selectedTagIds } });
      toast.success("Tags actualizados");
      refetch();
    } catch {
      toast.error("Error al actualizar los tags");
    }
  };

  // Eliminar una operación
  const handleDelete = (documentId: string) => {
    confirm({
      title: "¿Eliminar operación?",
      description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await fetch(`/api/operations/${documentId}`, { method: "DELETE" });
          toast.success("Operación eliminada");
          refetch();
        } catch {
          toast.error("Error al eliminar la operación");
        }
      },
    });
  };

  // Definir columnas de la tabla
  const columns = [
    {
      header: "Fecha",
      cell: (row: Operacion) => format(new Date(row.fechaMovimiento), "dd/MM/yyyy"),
    },
    {
      header: "Monto",
      cell: (row: Operacion) => `${row.monto.toFixed(2)} €`,
    },
    {
      header: "Descripción",
      cell: (row: Operacion) => row.descripcion || "Sin descripción",
    },
    {
      header: "Tags",
      cell: (row: Operacion) => (
        <MultiSelect
          //@ts-ignore
          options={tags.map(tag => ({ id: tag.id, label: tag.name }))}
          defaultValue={row.tags?.map(tag => tag.id) || []}
          placeholder="Seleccionar tags"
          onChange={(selectedIds) => updateTags(row.documentId, selectedIds)}
        />
      ),
    },
    {
      header: "Acciones",
      cell: (row: Operacion) => (
        <div className="flex items-center gap-2 justify-center">
          <button onClick={() => handleDelete(row.documentId)} className="text-gray-500 hover:text-red-600">
            {/* <Trash2Icon className="w-4 h-4" /> */}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Listado de Operaciones</span>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-sm border-collapse border border-gray-200">
          <TableHeader className="bg-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <TableHead key={idx} className="p-2 border">
                  {col.header}
                </TableHead>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {operaciones.length ? (
              operaciones.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="p-2 border">
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
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

export default OperationsTable;
