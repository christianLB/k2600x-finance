"use client";

import { format } from "date-fns";
import { StrapiTable } from "@/components/tables/StrapiTable";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { toast } from "sonner";
import MultiSelect from "../ui/multi-select";
import OperationModal from "./OperationModal";
import { useState } from "react";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";

export interface Operacion {
  documentId: string;
  id: number;
  fechaMovimiento: string;
  fechaValor: string;
  monto: number;
  descripcion: string;
  operation_tag?: { id: number; name: string } | null;
  posibleDuplicado: boolean;
  estadoConciliacion: string;
}

export function OperationsTable() {
  const [selectedOperation, setSelectedOperation] = useState<Operacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: { data: tags } } = useStrapiCollection("operation-tags");
  const updateMutation = useStrapiUpdateMutation<Operacion>("operations");
  
  const handleOpenModal = (operation?: Operacion) => {
    setSelectedOperation(operation || null);
    setModalOpen(true);
  };

  // ✅ Handler separado y async para actualizar el tag
  const handleTagChange = async (operation: Operacion, selectedIds: string[]) => {
    const tagId = selectedIds[0] || null;
    console.log(tagId)
    try {
    await updateMutation.mutateAsync({
      documentId: operation.documentId,//@ts-ignore
      updatedData: { operation_tag: tagId },
    });
    toast.success("Tag actualizado");
  } catch {
    toast.error("Error al actualizar tag");
  }
  };

  const handleToggleDuplicado = async (operation: Operacion, value: boolean) => {
    try {
      await updateMutation.mutateAsync({
        documentId: operation.documentId,
        updatedData: { posibleDuplicado: value },
      });
      toast.success("Estado de duplicado actualizado");
    } catch {
      toast.error("Error al actualizar duplicado");
    }
  };

  const handleEstadoChange = async (operation: Operacion, estado: string) => {
    try {
      await updateMutation.mutateAsync({
        documentId: operation.documentId,
        updatedData: { estadoConciliacion: estado },
      });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };


  const columns = [
    {
      header: "Fecha Mov.",
      cell: (row: Operacion) => format(new Date(row.fechaMovimiento), "dd/MM/yyyy"),
    },
    {
      header: "Fecha Val.",
      cell: (row: Operacion) => format(new Date(row.fechaValor), "dd/MM/yyyy"),
    },
    {
      header: "Monto",
      cell: (row: Operacion) => `${row.monto.toFixed(2)} €`,
    },
    {
      header: "Descripción",
      cell: (row: Operacion) => row.descripcion?.substring(0, 100) || "Sin descripción",
    },
    {
      header: "Tag",
      cell: (row: Operacion) => (
        <MultiSelect
          options={tags.map((tag: any) => ({ id: tag.id, label: tag.name }))}
          defaultValue={row.operation_tag ? [row.operation_tag.id] : []}
          placeholder="Seleccionar tag"
          // singleSelect
          onChange={(selectedIds: string[]) => handleTagChange(row, selectedIds)}
        />
      ),
    },
    {
      header: "Duplicado",
      cell: (row: Operacion) => (
        <select
          value={row.posibleDuplicado ? "true" : "false"}
          onChange={(e) => handleToggleDuplicado(row, e.target.value === "true")}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      ),
    },
    {
      header: "Estado",
      cell: (row: Operacion) => (
        <select
          value={row.estadoConciliacion || "pendiente"}
          onChange={(e) => handleEstadoChange(row, e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="pendiente">Pendiente</option>
          <option value="procesado">Procesado</option>
          <option value="conciliado">Conciliado</option>
          <option value="revisar">Revisar</option>
        </select>
      ),
    }
  ];

  return (
    <div>
      <StrapiTable<Operacion>
        collection="operations"
        columns={columns}
        title="Listado de Operaciones"
        onEdit={() => handleOpenModal()}
        selectable={false}
        pageSize={10}
        queryOptions={{
          sort: ["fechaValor:desc"],
        }}
      />
      <OperationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={selectedOperation}
      />
    </div>
  );
}

export default OperationsTable;
