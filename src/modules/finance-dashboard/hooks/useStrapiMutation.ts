import { useState, useCallback } from 'react';
import strapi from '../../../services/strapi';

// A simple in-memory cache to store modelName -> collectionName mappings
const schemaCache = new Map<string, string>();

/**
 * Fetches the collectionName from the Strapi schema API for a given model UID.
 * Uses an in-memory cache to avoid redundant API calls.
 *
 * @param modelName - The UID of the Strapi content type (e.g., 'api::category.category').
 * @returns The collectionName (e.g., 'categories').
 */
async function getCollectionName(modelName: string): Promise<string> {
  if (schemaCache.has(modelName)) {
    return schemaCache.get(modelName)!;
  }
  const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
  const schema = Array.isArray(res.data) ? res.data[0] : res.data;
  const collectionName = schema?.schema?.collectionName;

  if (collectionName) {
    schemaCache.set(modelName, collectionName);
    return collectionName;
  }
  throw new Error(`Could not determine collectionName for model: ${modelName}`);
}

interface StrapiMutationHandles {
  create: (modelName: string, data: any) => Promise<any>;
  update: (modelName: string, id: string | number, data: any) => Promise<any>;
  remove: (modelName: string, id: string | number) => Promise<any>;
}

interface StrapiMutationResult extends StrapiMutationHandles {
  loading: boolean;
  error: any;
}

/**
 * A React hook to perform create, update, and delete operations on Strapi collections.
 * It is not tied to a specific collection and can be used for multiple content types.
 *
 * @returns An object containing `create`, `update`, `remove` functions, and `loading`/`error` states.
 */
export function useStrapiMutation(): StrapiMutationResult {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const performMutation = useCallback(async (mutationLogic: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationLogic();
      return result;
    } catch (err) {
      setError(err);
      console.error('Strapi mutation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    (modelName: string, data: any) =>
      performMutation(async () => {
        const collectionName = await getCollectionName(modelName);
        const res = await strapi.post({
          method: 'POST',
          collection: collectionName,
          data,
        });
        return res.data;
      }),
    [performMutation]
  );

  const update = useCallback(
    (modelName: string, id: string | number, data: any) =>
      performMutation(async () => {
        const collectionName = await getCollectionName(modelName);
        const res = await strapi.post({
          method: 'PUT',
          collection: collectionName,
          id: String(id),
          data,
        });
        return res.data;
      }),
    [performMutation]
  );

  const remove = useCallback(
    (modelName: string, id: string | number) =>
      performMutation(async () => {
        const collectionName = await getCollectionName(modelName);
        const res = await strapi.post({
          method: 'DELETE',
          collection: collectionName,
          id: String(id),
        });
        return res.data;
      }),
    [performMutation]
  );

  return { create, update, remove, loading, error };
}
