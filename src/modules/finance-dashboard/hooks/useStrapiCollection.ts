import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import strapi from '@/services/strapi';
import type { StrapiResponse, StrapiPaginationMeta, StrapiGetOneResponse } from '@/types/strapi';

export interface TableColumn {
  accessorKey: string;
  header: string;
  cell: (row: any) => any;
}

const strapiItemSchema = z.object({
  id: z.number(),
  attributes: z.record(z.any()),
});

type StrapiItem = z.infer<typeof strapiItemSchema>;

export interface UseStrapiCollectionOptions {
  initialPageSize?: number;
  initialPage?: number;
  initialSort?: string;
  filters?: Record<string, any>;
  populate?: string | string[] | Record<string, any>;
}

export interface UseStrapiCollectionReturn<T = any> {
  data: T[];
  columns: TableColumn[];
  pagination: StrapiPaginationMeta['pagination'];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;
  setFilters: (filters: Record<string, any>) => void;
}

/**
 * Hook to fetch and manage Strapi collection data with pagination, filtering and error handling
 * @param modelName The Strapi model UID (e.g., 'api::category.category')
 * @param options Options for pagination, sorting, filtering
 * @returns Collection data, columns, pagination controls and loading state
 */
export function useStrapiCollection<T extends Record<string, any> = any>(
  modelName: string,
  options: UseStrapiCollectionOptions = {}
): UseStrapiCollectionReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [collectionName, setCollectionName] = useState<string>('');
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<Record<string, any>>(options.filters || {});
  const [pagination, setPagination] = useState<StrapiPaginationMeta['pagination']>({
    page: options.initialPage || 1,
    pageSize: options.initialPageSize || 10,
    pageCount: 0,
    total: 0,
  });

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    // Reset to page 1 when filters change
    setPagination((prev: StrapiPaginationMeta['pagination']) => ({ ...prev, page: 1 }));
  }, []);

  const fetchSchema = useCallback(async () => {
    if (!modelName) return;
    setError(null);
    try {
      const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
      const schema = Array.isArray(res.data) ? res.data[0] : res.data;
      if (schema?.schema?.collectionName) {
        setCollectionName(schema.schema.collectionName);
      }
      const attributes = schema?.schema?.attributes || {};
      const cols: TableColumn[] = Object.keys(attributes).map((name) => ({
        accessorKey: name,
        header: name,
        cell: (row: any) => row[name],
      }));
      setColumns(cols);
    } catch {
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, [modelName]);

  const fetchData = useCallback(
    async (page: number = pagination.page, pageSize: number = pagination.pageSize) => {
      setError(null);
      if (!modelName || !collectionName) {
        setLoading(false);
        setData([]);
        return;
      }
      setLoading(true);
      try {
        const query: Record<string, any> = { 
          pagination: { page, pageSize },
          populate: options.populate || '*'
        };
        
        // Add filters if any are set
        if (Object.keys(filters).length > 0) {
          query.filters = filters;
        }
        
        // Add sort if specified
        if (options.initialSort) {
          query.sort = options.initialSort;
        }
        
        // Make the API call
        const res = await strapi.post<StrapiResponse<T>>({
          method: 'GET',
          collection: collectionName,
          query,
        });
        
        // Parse and transform the data
        const parsed = z.array(strapiItemSchema).parse(res.data);
        const flattenedData = parsed.map((item: StrapiItem) => ({
          id: item.id,
          ...item.attributes,
        }));
        
        // Update state with the fetched data
        setData(flattenedData as unknown as T[]);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError(err as Error);
        setData([]);
      } finally {
        setLoading(false);
      }
  }, [modelName, collectionName, pagination.page, pagination.pageSize, filters]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setLoading(false);
    }
  }, [fetchData, pagination.page, pagination.pageSize]);

  // Set page helper function
  const setPage = useCallback(async (page: number) => {
    setPagination((prev: StrapiPaginationMeta['pagination']) => ({ ...prev, page }));
    try {
      await fetchData(page, pagination.pageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to change page'));
    }
  }, [fetchData, pagination.pageSize]);
  
  // Set page size helper function
  const setPageSize = useCallback(async (pageSize: number) => {
    setPagination((prev: StrapiPaginationMeta['pagination']) => ({ ...prev, pageSize, page: 1 })); // Reset to page 1 when changing page size
    try {
      await fetchData(1, pageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to change page size'));
    }
  }, [fetchData]);

  useEffect(() => {
    // When modelName changes, reset state and fetch the schema.
    setData([]);
    setColumns([]);
    setCollectionName(''); // Important: reset to trigger the next effect.
    if (modelName) {
      // IMPROVEMENT: This fetch could be avoided by using a shared schema context
      // if the schemas are already loaded globally by another component.
      fetchSchema();
    }
  }, [modelName, fetchSchema]);

  useEffect(() => {
    // This effect runs only when collectionName is successfully set,
    // preventing a race condition where data is fetched with the wrong identifier.
    if (collectionName) {
      fetchData(1, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { 
    data, 
    columns, 
    pagination, 
    loading, 
    error, 
    refetch, 
    setPage,
    setPageSize,
    setFilters
  };
}
