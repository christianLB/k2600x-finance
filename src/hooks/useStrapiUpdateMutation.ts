import { useMutation, useQueryClient } from "@tanstack/react-query";

interface StrapiMutationResponse<T> {
  data?: T;
  error?: any;
}

export function useStrapiUpdateMutation<T>(collection: string) {
  const queryClient = useQueryClient();

  return useMutation<
    StrapiMutationResponse<T>,
    Error,
    { documentId: string; updatedData: Partial<T> }
  >({
    mutationFn: async ({ documentId, updatedData }) => {
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
    onSuccess: (_, { documentId }) => {
      // invalidar tanto el listado como el detalle si existen
      queryClient.invalidateQueries({ queryKey: [collection] });
      queryClient.invalidateQueries({ queryKey: [collection, documentId] });
    },
  });
}
