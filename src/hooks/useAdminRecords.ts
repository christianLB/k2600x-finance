import { useState, useCallback, useEffect } from "react";
import strapi from "@/services/strapi";

/**
 * Hook to manage CRUD operations for a Strapi collection.
 * @param selectedCollection The collection key (string)
 * @param schema The schema object for the collection (optional, for pluralName)
 */
export function useAdminRecords(selectedCollection: string | null, schema?: any) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute correct collection name for API calls (use pluralName if available)
  const apiCollection = schema?.schema?.pluralName || selectedCollection;

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!apiCollection) return;
    setLoading(true);
    setError(null);
    try {
      const res = await strapi.post({ method: "GET", collection: apiCollection });
      setRecords(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [apiCollection]);

  // Fetch records when collection or schema changes
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, schema]);

  // Create record
  const createRecord = useCallback(async (data: any) => {
    if (!apiCollection) return;
    setLoading(true);
    setError(null);
    try {
      await strapi.post({ method: "POST", collection: apiCollection, data });
      await fetchRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to create record");
    } finally {
      setLoading(false);
    }
  }, [apiCollection, fetchRecords]);

  // Update record
  const updateRecord = useCallback(async (id: string, data: any) => {
    if (!apiCollection) return;
    setLoading(true);
    setError(null);
    try {
      await strapi.post({ method: "PUT", collection: apiCollection, id, data });
      await fetchRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to update record");
    } finally {
      setLoading(false);
    }
  }, [apiCollection, fetchRecords]);

  // Delete record
  const deleteRecord = useCallback(async (id: string) => {
    if (!apiCollection) return;
    setLoading(true);
    setError(null);
    try {
      await strapi.post({ method: "DELETE", collection: apiCollection, id });
      await fetchRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to delete record");
    } finally {
      setLoading(false);
    }
  }, [apiCollection, fetchRecords]);

  return { records, loading, error, fetchRecords, createRecord, updateRecord, deleteRecord };
}
