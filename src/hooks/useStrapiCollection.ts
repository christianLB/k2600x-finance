import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface StrapiResponse<T> {
  data: T;
}

interface StrapiMutationResponse<T> {
  data?: T;
  error?: string;
}

interface UseStrapiCollectionOptions {
  filters?: Record<string, unknown>;
  populate?: string[];
  sort?: string[];
  pagination?: { page: number; pageSize: number };
  enabled?: boolean; // <--- ADICIÓN
}

const fetchCollection = async <T>(
  collection: string,
  params: UseStrapiCollectionOptions = {}
): Promise<T[]> => {
  const response = await fetch(`/api/strapi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "GET",
      collection,
      query: {
        ...params.filters,
        populate: params.populate || "*",
      },
    }),
  });

  const data: StrapiResponse<T[]> = await response.json();

  if (!response.ok) throw new Error("Error fetching collection");

  // Manejo de StrapiResponse<T[]> vs array directo:
  if (Array.isArray(data)) return data;
  return Array.isArray(data.data) ? data.data : [];
};

export const useStrapiCollection = <T>(
  collection: string,
  params: UseStrapiCollectionOptions = {}
) => {
  const queryClient = useQueryClient();

  // Extraemos "enabled" y lo pasamos al useQuery
  const { enabled = true, ...restParams } = params;

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useQuery<T[], Error>({
    queryKey: [collection, restParams] as const,
    queryFn: () => fetchCollection<T>(collection, restParams),
    enabled, // <--- Aquí usamos la flag
  });

  const createMutation = useMutation<StrapiMutationResponse<T>, Error, T>({
    mutationFn: async (newData) => {
      const response = await fetch(`/api/strapi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "POST", collection, data: newData }),
      });
      const result: StrapiMutationResponse<T> = await response.json();
      if (!response.ok) throw new Error(result.error || "Error creating document");
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [collection] }),
  });

  const updateMutation = useMutation<
    StrapiMutationResponse<T>,
    Error,
    { documentId: string; updatedData: Partial<T> }
  >({
    mutationFn: async ({ documentId, updatedData }) => {
      if (!documentId) throw new Error("documentId is required for update");

      const response = await fetch(`/api/strapi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "PUT",
          collection,
          id: documentId,
          data: updatedData,
        }),
      });

      const result: StrapiMutationResponse<T> = await response.json();
      if (!response.ok) throw new Error(result.error || "Error updating document");
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [collection] }),
  });

  const deleteMutation = useMutation<StrapiMutationResponse<null>, Error, string>({
    mutationFn: async (documentId) => {
      if (!documentId) throw new Error("documentId is required for delete");

      const response = await fetch(`/api/strapi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "DELETE",
          collection,
          id: documentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete document");
      return { data: null };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [collection] }),
  });

  return {
    data,
    error,
    isLoading,
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
};
