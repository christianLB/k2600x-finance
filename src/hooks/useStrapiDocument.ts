import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StrapiResponse<T> {
  data: T;
  error?: any;
}

export interface StrapiMutationResponse<T> {
  data?: T;
  error?: any;
}

interface UseStrapiDocumentOptions {
  populate?: string | string[];
  enabled?: boolean;
}

/**
 * Hook para obtener y manipular un único documento de Strapi mediante el endpoint /api/strapi.
 * Se asume que para obtener un documento se envía un body:
 * { method: "GET", collection, id: documentId, query: { populate } }
 */
export function useStrapiDocument<T>(
  collection: string,
  documentId?: string,
  options: UseStrapiDocumentOptions = {}
) {
  const queryClient = useQueryClient();
  const { populate = "*", enabled = true } = options;

  const { data, error, isLoading, refetch } = useQuery<T | null, Error>({
    queryKey: [collection, documentId, populate],
    queryFn: async () => {
      if (!documentId) return null;
      const res = await fetch("/api/strapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "GET",
          collection,
          id: documentId,
          query: { populate },
        }),
      });
      const json: StrapiResponse<T> = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || `Error fetching ${collection}/${documentId}`);
      }
      return json.data ?? null;
    },
    enabled: !!documentId && enabled,
  });

  const updateMutation = useMutation<StrapiMutationResponse<T>, Error, Partial<T>>({
    mutationFn: async (updatedData) => {
      if (!documentId) throw new Error("No documentId provided for update");
      const res = await fetch("/api/strapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "PUT",
          collection,
          id: documentId,
          data: updatedData,
        }),
      });
      const result: StrapiMutationResponse<T> = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || "Error updating document");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collection, documentId] });
    },
  });

  const deleteMutation = useMutation<StrapiMutationResponse<null>, Error, void>({
    mutationFn: async () => {
      if (!documentId) throw new Error("No documentId provided for delete");
      const res = await fetch("/api/strapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "DELETE",
          collection,
          id: documentId,
        }),
      });
      const result: StrapiMutationResponse<null> = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || "Error deleting document");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collection] });
    },
  });

  return {
    data,
    error,
    isLoading,
    refetch,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
}
