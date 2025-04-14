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
    { id: string; updatedData: Partial<T> }
  >({
    mutationFn: async ({ id, updatedData }) => {
      const res = await fetch("/api/strapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "PUT",
          collection,
          id,
          data: updatedData,
        }),
      });
      const result: StrapiMutationResponse<T> = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || "Error updating document");
      }
      return result;
    },
    onSuccess: (_, { id }) => {
      // invalidar tanto el listado como el detalle si existen
      queryClient.invalidateQueries({ queryKey: [collection] });
      queryClient.invalidateQueries({ queryKey: [collection, id] });
    },
  });
}
