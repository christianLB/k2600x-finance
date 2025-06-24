import { useEffect, useState } from 'react';
import strapi from '@/services/strapi';
import { z } from 'zod';

// This schema represents the structure returned by the Strapi API
const StrapiApiSchema = z.object({
  uid: z.string(),
  schema: z.object({
    kind: z.enum(['collectionType', 'singleType']),
    displayName: z.string(),
    attributes: z.record(z.any()),
  }),
});

// This schema represents the desired, flattened structure for use in the app
export const StrapiSchemaItemSchema = z.object({
  uid: z.string(),
  kind: z.enum(['collectionType', 'singleType']),
  info: z.object({ displayName: z.string() }),
  attributes: z.record(z.any()),
});

export type StrapiSchema = z.infer<typeof StrapiSchemaItemSchema>;

export function useStrapiSchema() {
  const [schemas, setSchemas] = useState<StrapiSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await strapi.post({ method: 'SCHEMA' });
        const items = (res as any).data?.data ?? (res as any).data ?? res;
        
        // 1. Parse the raw API response
        const parsedFromApi = z.array(StrapiApiSchema).parse(items);

        // 2. Transform into the desired flattened structure
        const transformedSchemas = parsedFromApi.map(item => ({
          uid: item.uid,
          kind: item.schema.kind,
          info: {
            displayName: item.schema.displayName,
          },
          attributes: item.schema.attributes,
        }));
        
        // 3. (Optional but good practice) Validate the transformed structure
        const finalSchemas = z.array(StrapiSchemaItemSchema).parse(transformedSchemas);

        setSchemas(finalSchemas);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { schemas, loading, error };
}
