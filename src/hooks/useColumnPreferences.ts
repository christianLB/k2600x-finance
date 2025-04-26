import { useState, useEffect, useCallback } from "react";
import strapi from "@/services/strapi";

/**
 * Hook to manage column preferences for a Strapi collection.
 * @param selectedCollection The collection key (string)
 * @param schema The schema object for the collection
 */
export function useColumnPreferences(selectedCollection: string | null, schema: any) {
  const [visibleColumns, setVisibleColumnsState] = useState<string[] | null>(null);
  const [columnPrefId, setColumnPrefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get short (plural) collection name
  const getShortCollection = useCallback(() => {
    return schema?.schema?.pluralName || selectedCollection;
  }, [schema, selectedCollection]);

  // Fetch preferences
  useEffect(() => {
    if (!selectedCollection || !schema) {
      setVisibleColumnsState(null);
      setColumnPrefId(null);
      return;
    }
    const shortCollection = getShortCollection();
    async function fetchPref() {
      setLoading(true);
      setError(null);
      try {
        const res = await strapi.post({
          method: "GET",
          collection: "column-preferences",
          query: { filters: { collection: { $eq: shortCollection } } },
        });
        const pref = Array.isArray(res?.data) ? res.data[0] : null;
        const schemaAttrs = Object.keys(schema?.schema?.attributes || {});
        if (pref && typeof pref.columns === 'string' && pref.columns.trim()) {
          // Filter out columns not in schema
          const filteredCols = pref.columns.split(',').map((col: string) => col.trim()).filter((col: string) => schemaAttrs.includes(col));
          setVisibleColumnsState(filteredCols);
          setColumnPrefId(pref.documentId ?? pref.id?.toString() ?? null);
        } else {
          // No preference found, fallback to all columns
          setVisibleColumnsState(schemaAttrs);
          setColumnPrefId(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load column preferences');
        // Fallback to all columns
        const schemaAttrs = Object.keys(schema?.schema?.attributes || {});
        setVisibleColumnsState(schemaAttrs);
        setColumnPrefId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPref();
  }, [selectedCollection, schema, getShortCollection]);

  // Persist preferences
  const setVisibleColumns = useCallback(async (newColumns: string[]) => {
    if (!selectedCollection || !schema) return;
    setLoading(true);
    setError(null);
    const shortCollection = getShortCollection();
    const schemaAttrs = Object.keys(schema?.schema?.attributes || {});
    const filteredColumns = newColumns.filter((col: string) => schemaAttrs.includes(col));
    try {
      const prefId = columnPrefId;
      let res;
      if (prefId) {
        res = await strapi.post({
          method: "PUT",
          collection: "column-preferences",
          id: prefId,
          data: { collection: shortCollection, columns: filteredColumns.join(",") },
        });
      } else {
        res = await strapi.post({
          method: "POST",
          collection: "column-preferences",
          data: { collection: shortCollection, columns: filteredColumns.join(",") },
        });
      }
      setColumnPrefId(res?.data?.documentId ?? res?.data?.id?.toString() ?? null);
      setVisibleColumnsState(filteredColumns);
    } catch (err: any) {
      setError(err?.message || 'Failed to save column preferences');
    } finally {
      setLoading(false);
    }
  }, [selectedCollection, schema, columnPrefId, getShortCollection]);

  return { visibleColumns, setVisibleColumns, loading, error, columnPrefId };
}
