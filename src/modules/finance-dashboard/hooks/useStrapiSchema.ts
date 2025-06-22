import { useEffect, useState } from 'react';
import { strapiService } from '@/services/strapiService';
import { z } from 'zod';

export const StrapiSchemaItemSchema = z.object({
  uid: z.string(),
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
        const res = await strapiService.getCollection('content-type-builder/content-types');
        const items = (res as any).data?.data ?? (res as any).data ?? res;
        const parsed = z.array(StrapiSchemaItemSchema).parse(items);
        setSchemas(parsed);
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
