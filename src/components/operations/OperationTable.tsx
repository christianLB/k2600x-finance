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
  monto: number;
  descripcion: string;
  operation_tag?: { id: number; name: string } | null;
  posibleDuplicado: boolean;
}

export function OperationsTable() {
  const [selectedOperation, setSelectedOperation] = useState<Operacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: tags = [] } = useStrapiCollection("operation-tags");

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
      cell: (row: Operacion) => (row.posibleDuplicado ? "Sí" : "No"),
    },
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
