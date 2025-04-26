import { useCallback, useState } from "react";

export type StrapiMedia = {
  id: number;
  url: string;
  mime: string;
  name: string;
  size: number;
  [key: string]: any;
};

export type UseStrapiUploadOptions = {
  multiple?: boolean;
  onUpload?: (media: StrapiMedia[]) => void;
  onError?: (error: Error) => void;
};

export function useStrapiUpload({ onUpload, onError }: Omit<UseStrapiUploadOptions, 'multiple'> = {}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    setError(null);
    try {
      const fileArr = Array.from(files);
      const uploaded: StrapiMedia[] = [];
      for (const file of fileArr) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        const res = await fetch("/api/strapi-upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Error uploading file");
        const data = await res.json();
        uploaded.push(data[0] || data);
      }
      onUpload?.(uploaded);
      return uploaded;
    } catch (err: any) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [onUpload, onError]);

  const deleteMedia = useCallback(async (mediaId: number) => {
    try {
      const res = await fetch(`/api/strapi-upload?id=${mediaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting file");
      return true;
    } catch (err: any) {
      setError(err);
      onError?.(err);
      throw err;
    }
  }, [onError]);

  return { upload, uploading, error, deleteMedia };
}
