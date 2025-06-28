// =============================================================
// File: src/app/(admin)/diagnostics/page.tsx  (CRUD Diagnostics v5 – TanStack + @strapi/client; sin StrapiSchemaProvider)
// =============================================================
"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ThemeProvider,
  AppLayout,
  Button,
  Textarea,
} from "@k2600x/design-system";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Removed direct import of strapiPublic as we're using API routes now
import SmartDataTable from "@/modules/finance-dashboard/components/SmartDataTable";

export default function DiagnosticsPage() {
  const queryClient = useQueryClient();

  /* --------------------------- cargar esquemas --------------------------- */
  const {
    data: schemas = [],
    isLoading: isLoadingSchemas,
    error: schemasError,
  } = useQuery<any[]>({
    queryKey: ["schemas"],
    queryFn: async () => {
      const response = await fetch("/api/strapi/schemas");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch schemas: ${errorData.error || response.statusText}`,
          { cause: errorData.details }
        );
      }
      // The API route already filters for collection types
      return response.json();
    },
  });

  /* ----------------------- modelo seleccionado ----------------------- */
  const [selectedModel, setSelectedModel] = useState<string>("");
  useEffect(() => {
    if (!selectedModel && schemas.length) {
      setSelectedModel(schemas[0].uid);
    }
  }, [schemas, selectedModel]);

  /* ----------------------------- payload ----------------------------- */
  const [payload, setPayload] = useState<string>("{}");
  const safeParse = () => {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  /* -------------------- query de la colección -------------------- */
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1); // Reset page to 1 when model changes
  }, [selectedModel]);

  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: loadError,
  } = useQuery({
    queryKey: ["collection", selectedModel, currentPage],
    queryFn: async () => {
      if (!selectedModel) return null;
      
      const response = await fetch(
        `/api/strapi/collections/${btoa(selectedModel)}?` +
        new URLSearchParams({
          page: currentPage.toString(),
          pageSize: "5",
          populate: ""
        })
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch collection: ${errorData.error || response.statusText}`,
          { cause: errorData.details }
        );
      }
      
      return response.json();
    },
    enabled: Boolean(selectedModel),
  });

  /* ------------------------- operaciones CRUD ------------------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedModel) throw new Error("No collection selected");
      
      const response = await fetch(
        `/api/strapi/collections/${btoa(selectedModel)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create record: ${errorData.error || response.statusText}`,
          { cause: errorData.details }
        );
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection", selectedModel],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      if (!selectedModel) throw new Error("No collection selected");
      
      const response = await fetch(
        `/api/strapi/collections/${btoa(selectedModel)}/${encodeURIComponent(String(id))}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update record: ${errorData.error || response.statusText}`,
          { cause: errorData.details }
        );
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection", selectedModel],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      if (!selectedModel) throw new Error("No collection selected");
      
      const response = await fetch(
        `/api/strapi/collections/${btoa(selectedModel)}/${encodeURIComponent(String(id))}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to delete record: ${errorData.error || response.statusText}`,
          { cause: errorData.details }
        );
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection", selectedModel],
      });
    },
  });

  /* ----------------------------- handlers ----------------------------- */
  const handleCreate = () => {
    const parsed = safeParse();
    if (!parsed) return alert("Invalid JSON");
    createMutation.mutate(parsed);
  };

  const handleUpdate = () => {
    const parsed = safeParse();
    if (!parsed) return alert("Invalid JSON");
    const id = parsed.id ?? parsed.documentId;
    if (!id) return alert("Missing 'id' or 'documentId' in payload");
    updateMutation.mutate({ id, data: parsed });
  };

  const handleDelete = () => {
    const parsed = safeParse();
    if (!parsed) return alert("Invalid JSON");
    const id = parsed.id ?? parsed.documentId;
    if (!id) return alert("Missing 'id' or 'documentId' in payload");
    deleteMutation.mutate(id);
  };

  /* ----------------------------- sidebar ----------------------------- */
  const sidebar = useMemo(() => {
    if (isLoadingSchemas) return <p className="p-4">Cargando modelos…</p>;
    if (schemasError)
      return <p className="p-4 text-red-600">Error cargando modelos</p>;

    return (
      <ul className="flex flex-col gap-2">
        {schemas.map((s: any) => (
          <li key={s.uid}>
            <Button
              size="sm"
              variant={s.uid === selectedModel ? "primary" : "secondary"}
              className="w-full justify-start"
              onClick={() => setSelectedModel(s.uid)}
            >
              {s.schema.displayName}
            </Button>
          </li>
        ))}
      </ul>
    );
  }, [schemas, selectedModel, isLoadingSchemas, schemasError]);

  /* ---------------------- schema para la tabla ---------------------- */
  const tableSchema = useMemo(() => {
    if (!selectedModel || !schemas.length) return null;
    const selectedSchemaData = schemas.find((s) => s.uid === selectedModel);
    if (!selectedSchemaData) return null;

    return {
      ...selectedSchemaData.schema,
      uid: selectedSchemaData.uid,
      primaryKey: "id",
      primaryField: "id", // Default, as it's not provided by the API but required by the component type
    };
  }, [selectedModel, schemas]);

  /* ----------------------------- render ----------------------------- */
  return (
    <ThemeProvider>
      <AppLayout title="Diagnostics – Admin v5" sidebar={sidebar}>
        <div className="p-4 space-y-6 max-w-xl">
          <h2 className="text-xl font-bold">CRUD Diagnostics (TanStack)</h2>

          {/* Editor JSON */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payload (JSON)</label>
            <Textarea
              rows={6}
              value={payload}
              onChange={(e: any) => setPayload(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              Update
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>

          {/* Indicadores de estado */}
          {createMutation.isPending && <div>Creating…</div>}
          {createMutation.isError && (
            <div className="text-red-600">
              Error: {(createMutation.error as Error).message} {((createMutation.error as Error).cause as any)?.message ? `(${((createMutation.error as Error).cause as any)?.message})` : ''}
            </div>
          )}
          {createMutation.isSuccess && (
            <div className="text-green-600">Created ✔</div>
          )}

          {updateMutation.isPending && <div>Updating…</div>}
          {updateMutation.isError && (
            <div className="text-red-600">
              Error: {(updateMutation.error as Error).message} {((updateMutation.error as Error).cause as any)?.message ? `(${((updateMutation.error as Error).cause as any)?.message})` : ''}
            </div>
          )}
          {updateMutation.isSuccess && (
            <div className="text-green-600">Updated ✔</div>
          )}

          {deleteMutation.isPending && <div>Deleting…</div>}
          {deleteMutation.isError && (
            <div className="text-red-600">
              Error: {(deleteMutation.error as Error).message} {((deleteMutation.error as Error).cause as any)?.message ? `(${((deleteMutation.error as Error).cause as any)?.message})` : ''}
            </div>
          )}
          {deleteMutation.isSuccess && (
            <div className="text-green-600">Deleted ✔</div>
          )}
        </div>

        {/* Tabla de registros */}
        {selectedModel && tableSchema && (
          <SmartDataTable
            schema={tableSchema}
            data={collection?.data ?? []}
            isLoading={isLoadingCollection}
            pagination={{
              pageCount: collection?.meta?.pagination?.pageCount ?? 1,
              currentPage: collection?.meta?.pagination?.page ?? 1,
              onPageChange: (page) => setCurrentPage(page),
            }}
            onCreate={(data) => createMutation.mutateAsync(data)}
            onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
            onDelete={(id) => deleteMutation.mutateAsync(id)}
          />
        )}
      </AppLayout>
    </ThemeProvider>
  );
}
