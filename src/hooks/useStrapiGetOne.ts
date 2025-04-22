// src/hooks/useStrapiGetOne.ts
import { useQuery } from "@tanstack/react-query";
import strapi from "@/services/strapi";

interface StrapiGetOneResponse<T> {
  data: { id: string; attributes: T };
}

export function useStrapiGetOne<T>(
  collection: string,
  id: string,
  options: { enabled?: boolean, documentId?: string, populate?: string | string[] } = {}
) {
  // Use documentId if provided, otherwise fall back to id
  const strapiId = options.documentId || id;
  const populate = options.populate ?? '*';
  const query = useQuery<StrapiGetOneResponse<T>, Error>({
    queryKey: [collection, strapiId, populate],
    queryFn: () => strapi.post({ method: "GET", collection, id: strapiId, query: { populate } }),
    enabled: options.enabled ?? !!strapiId,
  });

  // Normalize relations: convert { id, ... } to id, [ {id, ...} ] to [id, ...]
  function normalizeRelations(data: any, schema: any) {
    if (!data || !schema) return data;
    const normalized = { ...data };
    for (const [key, field] of Object.entries(schema.attributes ?? {})) {
      if (typeof field === 'object' && field && (field as any).type === 'relation') {
        if (Array.isArray(normalized[key])) {
          normalized[key] = normalized[key].map((item: any) => item?.id ?? item);
        } else if (normalized[key] && typeof normalized[key] === 'object') {
          normalized[key] = normalized[key].id ?? normalized[key];
        }
      }
    }
    return normalized;
  }

  return {
    data: query.data?.data.attributes as T | undefined,
    normalized: (schema?: any) =>
      schema ? normalizeRelations(query.data?.data.attributes, schema) : query.data?.data.attributes,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
