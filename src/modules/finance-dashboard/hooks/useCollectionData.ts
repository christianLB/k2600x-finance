import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StrapiPaginationMeta } from '@/types/strapi';

export interface TableColumn {
  accessorKey: string;
  header: string;
  cell: (row: any) => any;
}

export interface UseCollectionDataOptions {
  initialPageSize?: number;
  initialPage?: number;
  initialSort?: string;
  filters?: Record<string, any>;
  populate?: string | string[] | Record<string, any>;
  enabled?: boolean;
}

export interface UseCollectionDataReturn<T = any> {
  data: T[];
  columns: TableColumn[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  // Mutation methods
  create: (data: Omit<T, 'id'>) => Promise<any>;
  update: (data: T) => Promise<any>;
  remove: (id: string | number) => Promise<any>;
  // Raw mutation objects
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
}

/**
 * Hook to fetch collection data from server-side API endpoints
 * 
 * @param collectionUid - The Strapi model UID (e.g., 'api::category.category')
 * @param options - Options for pagination, sorting, filtering
 * @returns Collection data, columns, pagination controls and loading state
 */
export function useCollectionData<T extends Record<string, any> = any>(
  collectionUid: string,
  options: UseCollectionDataOptions = {}
): UseCollectionDataReturn<T> {
  const queryClient = useQueryClient();
  
  // Extract collection name from UID (e.g., 'api::category.category' -> 'category')
  const collectionName = collectionUid?.split('::')[1]?.split('.')[1] || '';
  
  // State for pagination and filtering
  const [pagination, setPaginationState] = useState({
    page: options.initialPage || 1,
    pageSize: options.initialPageSize || 10,
    pageCount: 0,
    total: 0,
  });
  const [filters, setFiltersState] = useState<Record<string, any>>(options.filters || {});
  const [sort, setSort] = useState<string | undefined>(options.initialSort);
  const [columns, setColumns] = useState<TableColumn[]>([]);

  // Helper function to build URL with query parameters
  const buildUrl = useCallback((page: number, pageSize: number) => {
    if (!collectionName) return null;
    
    const url = new URL(`/api/strapi/collections/${collectionName}`, window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    
    if (sort) {
      url.searchParams.append('sort', sort);
    }
    
    if (options.populate) {
      const populateParam = typeof options.populate === 'string' 
        ? options.populate 
        : JSON.stringify(options.populate);
      url.searchParams.append('populate', populateParam);
    }
    
    if (Object.keys(filters).length > 0) {
      url.searchParams.append('filters', JSON.stringify(filters));
    }
    
    return url.toString();
  }, [collectionName, sort, filters, options.populate]);

  // Fetch schema to generate columns
  useQuery({
    queryKey: ['schema', collectionUid],
    queryFn: async () => {
      if (!collectionUid) return null;
      
      const res = await fetch('/api/strapi/schemas');
      if (!res.ok) throw new Error('Failed to fetch schema');
      
      const schemas = await res.json();
      const schema = schemas.find((s: any) => s.uid === collectionUid);
      
      if (schema?.schema?.attributes) {
        const cols: TableColumn[] = Object.keys(schema.schema.attributes).map(name => ({
          accessorKey: name,
          header: name,
          cell: (row: any) => row[name],
        }));
        
        setColumns(cols);
      }
      
      return schema;
    },
    enabled: !!collectionUid,
  });

  // Main query to fetch collection data
  const {
    data: responseData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['collection', collectionUid, pagination.page, pagination.pageSize, sort, JSON.stringify(filters)],
    queryFn: async () => {
      const url = buildUrl(pagination.page, pagination.pageSize);
      if (!url) return { data: [], meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } } };
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to fetch data');
      }
      
      return res.json();
    },
    enabled: !!collectionUid && !!collectionName && options.enabled !== false,
  });

  // Update pagination state when response data changes
  if (responseData?.meta?.pagination && !isLoading) {
    const newPagination = responseData.meta.pagination;
    if (
      newPagination.page !== pagination.page ||
      newPagination.pageSize !== pagination.pageSize ||
      newPagination.pageCount !== pagination.pageCount ||
      newPagination.total !== pagination.total
    ) {
      setPaginationState(newPagination);
    }
  }

  // Extract data from response
  const items: T[] = responseData?.data?.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  })) || [];

  // Helper functions for pagination and filtering
  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPaginationState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  // Create mutation for record creation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<T, 'id'>) => {
      const res = await fetch(`/api/strapi/collections/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to create record');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionUid] });
    },
  });

  // Create mutation for record update
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: T) => {
      const res = await fetch(`/api/strapi/collections/${collectionName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to update record');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionUid] });
    },
  });

  // Create mutation for record deletion
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await fetch(`/api/strapi/collections/${collectionName}/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to delete record');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionUid] });
    },
  });

  const refetchData = async () => {
    await refetch();
  };

  return {
    data: items,
    columns,
    pagination,
    loading: isLoading,
    error: error as Error | null,
    refetch: refetchData,
    setPage,
    setPageSize,
    setFilters,
    // Also expose mutations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
