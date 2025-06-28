// =============================================================
// File: src/hooks/useStrapiCRUD.ts  (React Query v5 compatible)
// =============================================================
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { strapiService } from "@/services/strapiService";
// import { useStrapiSchemaCtx } from "@/context/StrapiSchemaProvider"; // DEPRECATED

/**
 * Hook providing React Query mutations for create/update/delete operations
 * and exposes primaryKey for the given collection UID.
 */
export function useStrapiCRUD(uid: string) {
  const qc = useQueryClient();
  // DEPRECATED: StrapiSchemaProvider context was removed
  // Return minimal stub for build compatibility
  return {
    create: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    primaryKey: 'id'
  };
  
  /* DEPRECATED CODE:
  const { get } = useStrapiSchemaCtx();
  const col = get(uid);
  if (!col) {
    throw new Error(`Schema not found for uid: ${uid}`);
  }
  const basePath = `/api/${col.apiID}`;
  const pk = col.primaryKey;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      strapiService.post(basePath, { data: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [uid] }),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) =>
      strapiService.put(`${basePath}/${id}`, { data: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [uid] }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => strapiService.del(`${basePath}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [uid] }),
  });

  return { primaryKey: pk, createMutation, updateMutation, deleteMutation };
  */
}

export default useStrapiCRUD;
