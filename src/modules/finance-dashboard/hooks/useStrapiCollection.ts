import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import strapi from '@/services/strapi';
import type { StrapiResponse, StrapiPaginationMeta } from '@/types/strapi';

export interface TableColumn {
  accessorKey: string;
  header: string;
  cell: (row: any) => any;
}

export function useStrapiCollection(modelName: string) {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [pagination, setPagination] = useState<StrapiPaginationMeta['pagination']>({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });

  const fetchSchema = useCallback(async () => {
    if (!modelName) return;
    try {
      const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
      const schema = Array.isArray(res.data) ? res.data[0] : res.data;
      const attributes = schema?.schema?.attributes || {};
      const cols: TableColumn[] = Object.keys(attributes).map((name) => ({
        accessorKey: name,
        header: name,
        cell: (row: any) => row[name],
      }));
      setColumns(cols);
    } catch {
      setColumns([]);
    }
  }, [modelName]);

  const fetchData = useCallback(
    async (page: number = pagination.page, pageSize: number = pagination.pageSize) => {
      if (!modelName) {
        setData([]);
        return;
      }
      try {
        const res: StrapiResponse<any> = await strapi.post({
          method: 'GET',
          collection: modelName,
          query: { populate: '*', pagination: { page, pageSize } },
        });
        const parsed = z.array(z.record(z.any())).parse(res.data);
        setData(parsed);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      } catch {
        setData([]);
      }
    },
    [modelName, pagination.page, pagination.pageSize],
  );

  const refetch = useCallback(() => {
    fetchData(pagination.page, pagination.pageSize);
  }, [fetchData, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  useEffect(() => {
    fetchData(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, modelName]);

  return { data, columns, pagination, refetch };
}
