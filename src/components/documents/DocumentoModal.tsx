"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import { toast } from "sonner";
import { uploadPdfToStrapi } from "@/lib/uploadPdfToStrapi";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import useStrapiCreate from "@/hooks/useStrapiCreate";

export interface DocumentoModalProps {
  open: boolean;
  onClose: () => void;
  documento?: any; // If editing, provide existing document
  onSuccess?: () => void;
}

export default function DocumentoModal({ open, onClose, documento, onSuccess }: DocumentoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resumen, setResumen] = useState(documento?.resumen || "");
  const [content, setContent] = useState(documento?.content || "");
  const [estado, setEstado] = useState(documento?.estado || "pendiente");
  const [tag, setTag] = useState(documento?.operation_tag?.id || null);
  const [loading, setLoading] = useState(false);

  const createDocumento = useStrapiCreate("documentos");
  const updateDocumento = useStrapiUpdateMutation("documentos");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let archivoId = documento?.archivo?.id || null;
      // If a new file is selected, upload it
      if (file) {
        // Use File directly (browser FormData)
        const uploaded = await uploadPdfToStrapi(file, file.name);
        archivoId = uploaded.id;
      }
      const data: any = {
        resumen,
        content,
        estado,
        operation_tag: tag,
        ...(archivoId && { archivo: archivoId }),
      };
      if (documento?.documentId) {
        await updateDocumento.mutateAsync({ id: documento.documentId, updatedData: data });
        toast.success("Documento actualizado");
      } else {
        await createDocumento.mutateAsync(data);
        toast.success("Documento creado");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error("Error al guardar documento: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>{documento ? "Editar Documento" : "Crear Documento"}</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>
            Archivo:
            <Input
              type="file"
              accept="*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && <span className="text-xs">{file.name}</span>}
            {!file && documento?.archivo?.name && (
              <span className="text-xs">Actual: {documento.archivo.name}</span>
            )}
          </label>
          <label>
            Resumen:
            <Input value={resumen} onChange={e => setResumen(e.target.value)} disabled={loading} />
          </label>
          <label>
            Contenido (Markdown):
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} disabled={loading} />
          </label>
          <label>
            Estado:
            <Select value={estado} onValueChange={setEstado} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="procesado">Procesado</SelectItem>
                <SelectItem value="error ">Error</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label>
            Tag:
            <TagsSelector
              appliesTo="documento"
              currentTag={tag}
              onSelect={setTag}
              //disabled={loading}
            />
          </label>
          <Button type="submit" disabled={loading}>
            {documento ? "Actualizar" : "Crear"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
