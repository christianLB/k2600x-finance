import React, { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@k2600x/design-system";
import { File as FileIcon, FileImage, FileText, FileArchive } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

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
  // Props for auto-updating Strapi record when files are removed
  autoUpdate?: {
    collection: string;
    documentId: string;
    fieldName: string;
  };
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
  autoUpdate,
}: StrapiMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();
  const showConfirm = useConfirm();

  const uploadMutation = useMutation<StrapiMedia[], Error, File[]>({
    mutationFn: async (files: File[]) => {
      console.log('📁 Starting file upload:', { fileCount: files.length });
      const results: StrapiMedia[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading file ${i + 1}/${files.length}:`, { 
          name: file.name, 
          size: file.size, 
          type: file.type 
        });
        try {
          // Use our API proxy instead of direct strapiService call
          const formData = new FormData();
          formData.append('files', file);
          
          const response = await fetch('/api/strapi/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
          }
          
          const result = await response.json();
          console.log('✅ Upload successful:', result);
          
          // Strapi upload returns an array, get the first item
          const uploadedFile = Array.isArray(result) ? result[0] : result;
          results.push(uploadedFile);
        } catch (error) {
          console.error('❌ Upload failed:', error);
          throw error;
        }
      }
      return results;
    },
    onSuccess: (newMedia: StrapiMedia[]) => {
      console.log('🎉 All uploads successful:', newMedia);
      onChange([...value, ...newMedia]);
      queryClient.invalidateQueries({ queryKey: ['strapi', 'media'] });
    },
    onError: (error) => {
      console.error('💥 Upload mutation failed:', error);
    }
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      console.log('🗑️ Deleting file:', id);
      const response = await fetch(`/api/strapi/media/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} ${errorText}`);
      }
      
      console.log('✅ File deleted successfully');
    },
    onSuccess: (_: void, id: number) => {
      console.log('📝 Updating form state after file deletion');
      const newValue = value.filter((v) => v.id !== id);
      onChange(newValue);
      
      // Immediately invalidate media queries
      queryClient.invalidateQueries({ queryKey: ['strapi', 'media'] });
      
      // Also immediately invalidate collection queries for instant UI update
      if (autoUpdate) {
        queryClient.invalidateQueries({ 
          queryKey: ['collection', autoUpdate.collection] 
        });
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && 
              (queryKey[0] === 'collection' && queryKey[1] === autoUpdate.collection) ||
              (queryKey.includes(autoUpdate.collection) || 
               queryKey.includes(autoUpdate.documentId));
          }
        });
      }
    },
    onError: (error) => {
      console.error('❌ Delete mutation failed:', error);
    }
  });

  // Mutation to update the Strapi record with new file list
  const updateRecordMutation = useMutation<void, Error, { newFileList: StrapiMedia[] }>({
    mutationFn: async ({ newFileList }) => {
      if (!autoUpdate) return;
      
      console.log('📄 Updating Strapi record:', {
        collection: autoUpdate.collection,
        documentId: autoUpdate.documentId,
        fieldName: autoUpdate.fieldName,
        newFileList: newFileList.map(f => f.id)
      });
      
      const encodedCollection = btoa(autoUpdate.collection);
      const updateData = {
        [autoUpdate.fieldName]: newFileList.map(file => file.id)
      };
      
      const response = await fetch(`/api/strapi/collections/${encodedCollection}/${autoUpdate.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Record update failed: ${response.status} ${errorText}`);
      }
      
      console.log('✅ Strapi record updated successfully');
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh everything
      if (autoUpdate) {
        console.log('🔄 Invalidating all related queries for complete refresh');
        
        // Invalidate collection queries (using the actual query key from diagnostics page)
        queryClient.invalidateQueries({ 
          queryKey: ['collection', autoUpdate.collection] 
        });
        
        // Invalidate all collection queries regardless of page
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && 
              queryKey[0] === 'collection' &&
              queryKey[1] === autoUpdate.collection;
          }
        });
        
        // Invalidate Strapi-specific queries
        queryClient.invalidateQueries({ 
          queryKey: ['strapi', 'collections', btoa(autoUpdate.collection)] 
        });
        
        // Invalidate specific document queries
        queryClient.invalidateQueries({ 
          queryKey: ['strapi', 'document', autoUpdate.collection, autoUpdate.documentId] 
        });
        
        // Invalidate media queries
        queryClient.invalidateQueries({ queryKey: ['strapi', 'media'] });
        
        // Force refetch of all queries containing this collection or document
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && 
              (queryKey.includes(autoUpdate.collection) || 
               queryKey.includes(autoUpdate.documentId) ||
               queryKey.includes(btoa(autoUpdate.collection)));
          }
        });
      }
    },
    onError: (error) => {
      console.error('❌ Record update failed:', error);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📎 File input changed');
    if (!e.target.files) {
      console.log('❌ No files selected');
      return;
    }
    const fileList = e.target.files;
    console.log('📁 Files selected:', Array.from(fileList).map(f => ({ name: f.name, size: f.size })));
    
    if (maxSize) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > maxSize) {
          console.log('❌ File too large:', { name: file.name, size: file.size, maxSize });
          alert("Archivo demasiado grande");
          return;
        }
      }
    }
    uploadMutation.mutate(Array.from(fileList));
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
    uploadMutation.mutate(Array.from(fileList));
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
    showConfirm({
      title: "Eliminar archivo",
      description: `¿Estás seguro de que deseas eliminar "${media.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        console.log('✅ User confirmed file deletion:', media.name);
        
        try {
          // First, delete the file from Strapi media library
          await deleteMutation.mutateAsync(media.id);
          
          // Then, if autoUpdate is enabled, update the record to remove file reference
          if (autoUpdate) {
            const newFileList = value.filter((v) => v.id !== media.id);
            await updateRecordMutation.mutateAsync({ newFileList });
            console.log('🔄 Record updated successfully after file deletion');
          }
        } catch (error) {
          console.error('❌ Failed to delete file or update record:', error);
        }
      },
      onCancel: () => {
        console.log('❌ User cancelled file deletion');
      }
    });
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
