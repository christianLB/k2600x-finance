// =============================================================
// File: src/hooks/useStrapiCollection.ts  (nuevo)
// =============================================================
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { strapiService } from "@/services/strapiService";
import { useStrapiSchemaCtx } from "@/context/StrapiSchemaProvider";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CollectionResponse<T> {
  data: T[];
  meta: { pagination: PaginationMeta };
}

export interface UseCollectionOptions {
  page?: number;
  pageSize?: number;
  populate?: string[];
  filters?: Record<string, unknown>;
  sort?: string;
}

export function useStrapiCollection<T = any>(
  uid: string,
  opts: UseCollectionOptions = {}
) {
  const schemaCtx = useStrapiSchemaCtx();
  const qc = useQueryClient();

  const col = schemaCtx.get(uid);
  if (!col) throw new Error(`Schema not found for uid ${uid}`);

  const {
    page = 1,
    pageSize = 25,
    populate = col.defaultPopulate,
    filters,
    sort,
  } = opts;

  const queryKey = [uid, { page, pageSize, populate, filters, sort }];

  const query = useQuery<CollectionResponse<T>>({
    queryKey,
    queryFn: () => {
      const qs: Record<string, unknown> = {
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
      };
      if (sort) qs["sort"] = sort;
      if (filters) Object.assign(qs, filters);

      // populate: sólo primer nivel; si no hay relaciones usar '*'
      const firstLevelRels = populate.filter((rel) => !rel.includes("."));

      qs.populate = "*";
      return strapiService.get<CollectionResponse<T>>(`/api/${col.apiID}`, qs);
    },
    //keepPreviousData: true,
  });

  const onPageChange = (nextPage: number) => {
    qc.setQueryData(queryKey, (old: any) => old); // placeholder, react-query will refetch automatically because key changes
  };

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    onPageChange,
  };
}
