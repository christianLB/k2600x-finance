import { useState, useEffect, useCallback } from 'react';
import strapi from '../../../services/strapi';

/**
 * Represents a flattened Strapi document, where attributes are top-level properties.
 */
interface StrapiDocument {
  id: number;
  [key: string]: any;
}

/**
 * A React hook to fetch a single document from a Strapi collection.
 *
 * @param modelName - The UID of the Strapi content type (e.g., 'api::category.category').
 * @param documentId - The ID of the document to fetch. If null, the hook will not fetch data.
 * @returns An object containing the fetched document, loading state, error state, and a refetch function.
 */
export function useStrapiDocument(modelName: string, documentId: number | string | null) {
  const [document, setDocument] = useState<StrapiDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [collectionName, setCollectionName] = useState<string>('');

  // Step 1: Fetch the schema to determine the correct collection name from the model UID.
  const fetchSchema = useCallback(async () => {
    if (!modelName) return;
    try {
      const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
      const schema = Array.isArray(res.data) ? res.data[0] : res.data;
      if (schema?.schema?.collectionName) {
        setCollectionName(schema.schema.collectionName);
      } else {
        throw new Error(`Could not determine collectionName for model: ${modelName}`);
      }
    } catch (err) {
      setError(err);
      console.error('Failed to fetch Strapi schema:', err);
    }
  }, [modelName]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  // Step 2: Fetch the specific document once the collection name and a valid ID are available.
  const fetchDocument = useCallback(async () => {
    // If no documentId is provided, we are likely in a 'create new' form.
    // In this case, there is no document to load.
    if (!documentId) {
      setLoading(false);
      setDocument(null);
      return;
    }

    if (!collectionName) {
      return; // Wait for the schema to be fetched first.
    }

    setLoading(true);
    setError(null);
    try {
      const res = await strapi.post({
        method: 'GET',
        collection: collectionName,
        id: String(documentId), // The API proxy expects the ID to be a string.
      });

      // Flatten the data structure from { id, attributes: { ... } } to { id, ... }
      const flattenedData = {
        id: res.data.id,
        ...res.data.attributes,
      };
      setDocument(flattenedData);
    } catch (err) {
      setError(err);
      console.error(`Failed to fetch document with id ${documentId} from ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /**
   * A function to manually trigger a refetch of the document.
   */
  const refetch = () => {
    fetchDocument();
  };

  return { document, loading, error, refetch };
}
