// =============================================================
// File: src/hooks/useStrapiMutation.ts
// =============================================================
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { strapiService } from "@/services/strapiService";
import { useStrapiSchemaCtx } from "@/context/StrapiSchemaProvider";

export interface MutationOptions<T> {
  invalidate?: string[];
  onSuccess?: (data: T) => void;
}

export function useStrapiMutation() {
  const qc = useQueryClient();
  const schemaCtx = useStrapiSchemaCtx();

  const pathOf = (uid: string, id?: string | number | Record<string, any>) => {
    const col = schemaCtx.get(uid);
    if (!col) throw new Error(`Schema not found for uid: ${uid}`);
    const base = `/api/${col.apiID}`;

    // allow passing a full record; extract primaryKey
    let identifier: string | number | undefined;
    if (typeof id === "object" && id !== null) {
      identifier = id[col.primaryKey];
    } else {
      identifier = id;
    }
    return identifier !== undefined && identifier !== ""
      ? `${base}/${identifier}`
      : base;
  };

  const create = <T = any>(uid: string, opts: MutationOptions<T> = {}) =>
    useMutation({
      mutationFn: (payload: unknown) =>
        strapiService.post(pathOf(uid), payload),
      onSuccess: (data) => {
        opts.onSuccess?.(data as T);
        opts.invalidate?.forEach((u) =>
          qc.invalidateQueries({ queryKey: [u] })
        );
      },
    });

  const update = <T = any>(
    uid: string,
    id: string | number,
    opts: MutationOptions<T> = {}
  ) =>
    useMutation({
      mutationFn: (payload: unknown) =>
        strapiService.put(pathOf(uid, id), payload),
      onSuccess: (data) => {
        opts.onSuccess?.(data as T);
        opts.invalidate?.forEach((u) =>
          qc.invalidateQueries({ queryKey: [u] })
        );
      },
    });

  const remove = <T = any>(
    uid: string,
    id: string | number,
    opts: MutationOptions<T> = {}
  ) =>
    useMutation({
      mutationFn: () => strapiService.del(pathOf(uid, id)),
      onSuccess: (data) => {
        opts.onSuccess?.(data as T);
        opts.invalidate?.forEach((u) =>
          qc.invalidateQueries({ queryKey: [u] })
        );
      },
    });

  return { create, update, remove };
}
