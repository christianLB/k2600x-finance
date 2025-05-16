import React, { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@k2600x/design-system";
import { useStrapiUpload, StrapiMedia } from "@/hooks/useStrapiUpload";
import { File as FileIcon, FileImage, FileText } from "lucide-react";
import { FileArchive } from "lucide-react";

export type StrapiMediaUploadProps = {
  value: StrapiMedia[];
  onChange: (media: StrapiMedia[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  label?: string;
};

// Helper to get absolute Strapi media URL
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
  const { upload, uploading, error, deleteMedia } = useStrapiUpload({
    onUpload: (media) => onChange([...value, ...media]),
    onError: () => {},
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (maxSize && Array.from(e.target.files).some(f => f.size > maxSize)) {
      alert("Archivo demasiado grande");
      return;
    }
    await upload(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploading) return;
    const files = e.dataTransfer.files;
    if (maxSize && Array.from(files).some(f => f.size > maxSize)) {
      alert("Archivo demasiado grande");
      return;
    }
    await upload(files);
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

  const handleRemove = async (media: StrapiMedia) => {
    await deleteMedia(media.id);
    onChange(value.filter(v => v.id !== media.id));
  };

  return (
    <div className="space-y-2">
      {label && <label className="block font-medium">{label}</label>}
      <div
        className={`relative border-2 rounded-md px-4 py-6 flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer ${dragActive ? "border-blue-500 bg-blue-50" : "border-dashed border-muted bg-muted/10"} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-blue-400"}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        tabIndex={0}
        role="button"
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled || uploading}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <span className="text-sm text-muted-foreground mb-2 select-none">
          {uploading ? "Subiendo..." : dragActive ? "Suelta el archivo aquí" : `Haz click o arrastra archivo${multiple ? 's' : ''} aquí para subir`}
        </span>
        <Button type="button" size="sm" variant="secondary" disabled={disabled || uploading} className="pointer-events-none opacity-60">
          Seleccionar archivo
        </Button>
      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error.message}</div>}
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
              <Button type="button" size="sm" variant="ghost" onClick={() => handleRemove(media)} disabled={uploading}>
                Quitar
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
