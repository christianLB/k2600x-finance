import React, { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { strapiService } from "@/services/strapiService";
import { Button } from "@k2600x/design-system";
import { File as FileIcon, FileImage, FileText, FileArchive } from "lucide-react";

// Assuming StrapiMedia type is defined elsewhere, or we define it here.
export interface StrapiMedia {
  id: number;
  name: string;
  url: string;
  mime: string;
  // Add other relevant fields from your Strapi media type
}

export type StrapiMediaUploadProps = {
  value: StrapiMedia[];
  onChange: (media: StrapiMedia[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  label?: string;
};

function getStrapiMediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return base.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
}

export function StrapiMediaUpload({
  value,
  onChange,
  multiple = false,
  accept = "*/*",
  maxSize,
  disabled,
  label = "",
}: StrapiMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation<StrapiMedia[], Error, FileList>({
    mutationFn: async (files: FileList) => {
      const results: StrapiMedia[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await strapiService.uploadFile<StrapiMedia>(files[i]);
        results.push(result);
      }
      return results;
    },
    onSuccess: (newMedia: StrapiMedia[]) => {
      onChange([...value, ...newMedia]);
      queryClient.invalidateQueries({ queryKey: ['strapi', 'media'] });
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => strapiService.deleteFile(id),
    onSuccess: (_: void, id: number) => {
      onChange(value.filter((v) => v.id !== id));
      queryClient.invalidateQueries({ queryKey: ['strapi', 'media'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = e.target.files;
    if (maxSize) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > maxSize) {
          alert("Archivo demasiado grande");
          return;
        }
      }
    }
    uploadMutation.mutate(fileList);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploadMutation.isPending) return;
    const fileList = e.dataTransfer.files;
    if (maxSize) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > maxSize) {
          alert("Archivo demasiado grande");
          return;
        }
      }
    }
    uploadMutation.mutate(fileList);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragActive) setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = (media: StrapiMedia) => {
    deleteMutation.mutate(media.id);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block font-medium">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-primary/80 bg-background text-foreground/60"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled || uploadMutation.isPending}
          style={{ display: "none" }}
        />
        <span className="text-sm text-muted-foreground mb-2 select-none">
          {uploadMutation.isPending ? "Subiendo..." : dragActive ? "Suelta el archivo aquí" : `Haz click o arrastra archivo${multiple ? 's' : ''} aquí para subir`}
        </span>
        <Button type="button" size="sm" variant="secondary" disabled={disabled || uploadMutation.isPending} className="pointer-events-none opacity-60">
          Seleccionar archivo
        </Button>
      </div>
      {uploadMutation.error && <div className="text-xs text-red-500 mt-1">{uploadMutation.error.message}</div>}
      <ul className="flex flex-wrap gap-2 mt-2">
        {value.map((media) => {
          let icon = <FileIcon className="w-8 h-8 text-gray-400" />;
          if (media.mime?.startsWith("image/")) icon = <FileImage className="w-8 h-8 text-blue-400" />;
          else if (media.mime === "application/pdf") icon = <FileArchive className="w-8 h-8 text-red-500" />;
          else if (media.mime?.startsWith("text/")) icon = <FileText className="w-8 h-8 text-green-500" />;
          const fileUrl = getStrapiMediaUrl(media.url);
          return (
            <li key={media.id} className="relative border rounded p-2 flex items-center gap-2 min-w-[180px]">
              {media.mime?.startsWith("image/") ? (
                <Image src={fileUrl} alt={media.name} width={64} height={64} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                  {icon}
                </div>
              )}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs truncate max-w-[120px] hover:underline"
                title={media.name}
              >
                {media.name}
              </a>
              <Button type="button" size="sm" variant="ghost" onClick={() => handleRemove(media)} disabled={deleteMutation.isPending}>
                Quitar
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
