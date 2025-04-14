"use client";

import { StrapiTable } from "@/components/tables/StrapiTable";
import DocumentoModal from "./DocumentoModal";
import { Button } from "@/components/ui/button";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { toast } from "sonner";
import { useState } from "react";

interface Documento {
  id: number;
  documentId: string;
  estado: "pendiente" | "procesado" | "error ";
  resumen?: string;
  archivo?: {
    url: string;
    name: string;
  };
  content?: string;
  operation_tag?: { id: number; name: string } | null;
}

export default function DocumentosTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);

  const update = useStrapiUpdateMutation<Documento>("documentos");

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
    },
    {
      header: "Estado",
      cell: (row: Documento) => row.estado,
    },
    {
      header: "Resumen",
      cell: (row: Documento) => row.resumen?.substring(0, 100) || "",
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
    {
      header: "Acciones",
      cell: (row: Documento) => (
        <Button size="sm" onClick={() => handleEdit(row)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button onClick={handleCreate}>Crear Documento</Button>
      </div>
      <StrapiTable<Documento>
        collection="documentos"
        columns={columns}
        title="Listado de Documentos"
        pageSize={10}
        selectable={false}
        //queryOptions={{ populate: ["*"] }}
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
