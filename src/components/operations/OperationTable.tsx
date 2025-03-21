"use client";

import { format } from "date-fns";
import { StrapiTable } from "@/components/tables/StrapiTable";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiDocument } from "@/hooks/useStrapiDocument";
import { toast } from "sonner";
import MultiSelect from "../ui/multi-select";
import OperationModal from "./OperationModal";
import { useState } from "react";

export interface Operacion {
  documentId: string;
  id: number;
  fechaMovimiento: string;
  monto: number;
  descripcion: string;
  tag?: { id: number; name: string } | null;
  posibleDuplicado: boolean;
}

export function OperationsTable() {
  const [selectedOperation, setSelectedOperation] = useState<Operacion | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  
  const { data: tags = [] } = useStrapiCollection("operation-tags");

  const { update } = useStrapiDocument("operations");

  const handleOpenModal = (operation?: Operacion) => {
    setSelectedOperation(operation || null);
    setModalOpen(true);
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
      cell: (row: Operacion) => row.descripcion || "Sin descripción",
    },
    {
      header: "Tag",
      cell: (row: Operacion) => (
        <MultiSelect
          options={tags.map((tag: any) => ({ id: tag.id, label: tag.name }))}
          defaultValue={row.tag ? [row.tag.id] : []}
          placeholder="Seleccionar tag"
          //singleSelect
          onChange={(selectedIds:  any) => {
            const tagId = selectedIds[0] || null;
            update({ documentId: row.documentId, updatedData: { tag: tagId } })
              //@ts-ignore
              .then(() => toast.success("Tag actualizado"))
              .catch(() => toast.error("Error al actualizar tag"));
          }}
        />
      ),
    },
    {
      header: "Duplicado",
      cell: (row: Operacion) => row.posibleDuplicado ? 'Sí' : 'No'
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
