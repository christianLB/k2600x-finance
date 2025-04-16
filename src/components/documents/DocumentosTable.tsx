"use client";

import { FullStrapiTable } from "@/components/tables/FullStrapiTable";
import DocumentoModal from "./DocumentoModal";
import { Button } from "@/components/ui/button";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { toast } from "sonner";
import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import useStrapiDelete from "@/hooks/useStrapiDelete";
import { useConfirm } from "@/hooks/useConfirm";

interface Documento {
  id: number;
  documentId: string;
  estado: "pendiente" | "procesado" | "error ";
  resumen?: string;
  archivo?: {
    url: string;
    name: string;
    id: number;
  };
  content?: string;
  operation_tag?: { id: number; name: string } | null;
}

export default function DocumentosTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);

  const update = useStrapiUpdateMutation<Documento>("documentos");

  const deleteDocumento = useStrapiDelete<Documento>("documentos", () => {
    toast.success("Documento eliminado");
  });

  const deleteArchivo = useStrapiDelete("upload/files", () => {
    toast.success("Archivo adjunto eliminado");
  });

  const confirm = useConfirm();

  const handleEdit = (doc: Documento) => {
    setEditingDoc({
      ...doc,
      documentId: String(doc.id), // Ensure documentId is a string for modal (fixes TS error)
    });
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingDoc(null);
    setModalOpen(true);
  };

  const handleTagChange = async (doc: Documento, tagId: number) => {
    try {
      await update.mutateAsync({
        id: doc.documentId,
        updatedData: { operation_tag: tagId },
      });
      toast.success("Tag actualizado");
    } catch {
      toast.error("Error al actualizar tag");
    }
  };

  const handleDelete = (doc: Documento) => {
    const hasArchivo = !!doc.archivo?.id;
    confirm({
      title: "Eliminar documento",
      description: `¿Seguro que quieres eliminar el documento '${doc.resumen || doc.archivo?.name || doc.id}'?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      extraContent: hasArchivo ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" />
          También eliminar archivo adjunto
        </label>
      ) : undefined,
      onConfirm: async ({ deleteFile }: { deleteFile?: boolean }) => {
        try {
          await deleteDocumento.mutateAsync({ id: doc.documentId });
          if (deleteFile && hasArchivo) {
            await deleteArchivo.mutateAsync({ id: doc.archivo!.id });
          }
        } catch {
          toast.error("Error al eliminar documento o archivo");
        }
      },
    });
  };

  const columns = [
    {
      header: "Archivo",
      cell: (row: Documento) =>
        row.archivo ? (
          <a
            href={row.archivo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.archivo.name}
          </a>
        ) : (
          "Sin archivo"
        ),
      sortable: true,
      sortKey: "archivo.name",
    },
    {
      header: "Estado",
      cell: (row: Documento) => row.estado,
      sortable: true,
      sortKey: "estado",
    },
    {
      header: "Resumen",
      cell: (row: Documento) => row.resumen?.substring(0, 100) || "",
      sortable: true,
      sortKey: "resumen",
    },
    {
      header: "Tag",
      cell: (row: Documento) => (
        <TagsSelector
          appliesTo="documento"
          currentTag={row.operation_tag?.id || null}
          onSelect={(tagId) => handleTagChange(row, tagId)}
        />
      ),
    },
  ];

  return (
    <div>
      <FullStrapiTable<Documento>
        collection="documentos"
        columns={columns}
        title="Listado de Documentos"
        pageSize={10}
        selectable={false}
        allowCreate={true}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        createButtonText="Crear Documento"
      />
      <DocumentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        documento={editingDoc}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
