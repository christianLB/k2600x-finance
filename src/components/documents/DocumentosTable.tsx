"use client";

import { StrapiTable } from "@/components/tables/StrapiTable";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
// import { useState } from "react";
import { toast } from "sonner";
// import MultiSelect from "../ui/multi-select";

interface Documento {
  id: number;
  documentId: string;
  estado: "pendiente" | "procesado" | "error ";
  resumen?: string;
  archivo?: {
    url: string;
    name: string;
  };
  tags?: { id: number; name: string }[];
}

export default function DocumentosTable() {
  const { data: tags = [] } = useStrapiCollection("tags");
  const update = useStrapiUpdateMutation<Documento>("documentos");

  // const handleTagChange = async (doc: Documento, selected: number[]) => {
  //   try {
  //     await update.mutateAsync({
  //       documentId: doc.documentId,
  //       updatedData: { tags: selected },
  //     });
  //     toast.success("Tags actualizados");
  //   } catch {
  //     toast.error("Error al actualizar tags");
  //   }
  // };

  const handleEstadoChange = async (
    doc: Documento,
    estado: Documento["estado"]
  ) => {
    try {
      await update.mutateAsync({
        documentId: doc.documentId,
        updatedData: { estado },
      });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
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
      cell: (row: Documento) => (
        <select
          className="text-sm border rounded px-2 py-1"
          value={row.estado}
          onChange={(e) =>
            handleEstadoChange(row, e.target.value as Documento["estado"])
          }
        >
          <option value="pendiente">Pendiente</option>
          <option value="procesado">Procesado</option>
          <option value="error ">Error</option>
        </select>
      ),
    },
    {
      header: "Resumen",
      cell: (row: Documento) => row.resumen?.substring(0, 100) || "",
    },
    {
      header: "Tags",
      cell: (row: Documento) => (
        <>sarsa</>
        // <MultiSelect
        //   options={tags.map((tag) => ({ id: tag.id, label: tag.name }))}
        //   defaultValue={row.tags?.map((t) => t.id) || []}
        //   onChange={(ids) => handleTagChange(row, ids)}
        // />
      ),
    },
  ];

  return (
    <StrapiTable<Documento>
      collection="documentos"
      columns={columns}
      title="Listado de Documentos"
      pageSize={10}
      selectable={false}
      queryOptions={{ populate: ["tags", "archivo"] }}
    />
  );
}
