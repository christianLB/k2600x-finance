// =============================================================
// File: src/app/(admin)/diagnostics/page.tsx  (CRUD diagnostics v3 – fixed hook order)
// =============================================================
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useStrapiSchemaCtx } from "@/context/StrapiSchemaProvider";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiMutation } from "@/hooks/useStrapiMutation";
import { useDraftRecord } from "@/hooks/useDraftRecord";
import {
  ThemeProvider,
  AppLayout,
  Button,
  Textarea,
} from "@k2600x/design-system";

export default function DiagnosticsPage() {
  const { list: schemas } = useStrapiSchemaCtx();
  const [selectedModel, setSelectedModel] = useState<string>(
    schemas[0]?.uid ?? ""
  );
  const [createdId, setCreatedId] = useState<string | number | null>(null);

  // draft based on schema
  const { draft, reset } = useDraftRecord(selectedModel);
  const [payload, setPayload] = useState<string>(
    JSON.stringify(draft, null, 2)
  );
  useEffect(() => {
    setPayload(JSON.stringify(draft, null, 2));
    setCreatedId(null);
  }, [draft]);

  // collection data (for quick feedback)
  const { data, meta, isLoading, error, refetch } = useStrapiCollection(
    selectedModel,
    { pageSize: 5 }
  );

  // mutations — HOOKS MUST BE CALLED UNCONDITIONALLY
  const { create, update, remove } = useStrapiMutation();
  const schemaCtx = useStrapiSchemaCtx();
  const pk = schemaCtx.get(selectedModel)?.primaryKey ?? "id";

  const createMut = create(selectedModel, {
    invalidate: [selectedModel],
    onSuccess: (res: any) => {
      const record = (res as any).data ?? res;
      const newId = (record as any).documentId ?? record.id ?? record[pk];
      setCreatedId(newId);
      refetch();
    },
  });
  // always initialise, id may be 0 placeholder if none
  const updateMut = update(selectedModel, createdId ?? "", {
    invalidate: [selectedModel],
    onSuccess: () => refetch(),
  });
  const deleteMut = remove(selectedModel, createdId ?? "", {
    invalidate: [selectedModel],
    onSuccess: () => {
      setCreatedId(null);
      refetch();
    },
  });

  // sidebar buttons
  const sidebar = useMemo(
    () => (
      <ul className="flex flex-col gap-2">
        {schemas.map((s) => (
          <li key={s.uid}>
            <Button
              size="sm"
              variant={s.uid === selectedModel ? "primary" : "secondary"}
              className="w-full justify-start"
              onClick={() => {
                setSelectedModel(s.uid);
                setCreatedId(null);
              }}
            >
              {s.displayName}
            </Button>
          </li>
        ))}
      </ul>
    ),
    [schemas, selectedModel]
  );

  const Indicator = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-32">{label}</span>
      <span
        className="px-2 py-1 rounded-full text-xs font-semibold"
        style={{
          background: ok ? "#4ade80" : "#ef4444",
          color: ok ? "#000" : "#fff",
        }}
      >
        {ok ? "OK" : "FAIL"}
      </span>
    </div>
  );

  const parsePayload = () => {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  return (
    <ThemeProvider>
      <AppLayout title="Diagnostics – Admin v2" sidebar={sidebar}>
        <div className="p-4 space-y-6 max-w-xl">
          {/* Schema preview */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm underline">
              Ver esquema para {selectedModel}
            </summary>
            <pre className="mt-2 p-2 bg-muted text-xs whitespace-pre-wrap rounded max-h-64 overflow-auto">
              {JSON.stringify(
                schemaCtx.get(selectedModel)?.attributes,
                null,
                2
              )}
            </pre>
          </details>
          <h2 className="text-xl font-bold">Estado de hooks</h2>
          <Indicator label="Schema" ok={schemas.length > 0} />
          <Indicator label="Collection" ok={!error} />
          <Indicator label="Mutation" ok={true} />

          {/* Payload editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payload (JSON)</label>
            <Textarea
              rows={6}
              value={payload}
              onChange={(e: any) => setPayload(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                const p = parsePayload();
                if (!p) return alert("JSON inválido");
                createMut.mutate(p);
              }}
            >
              Crear
            </Button>
            <Button
              variant="secondary"
              disabled={!createdId}
              onClick={() => {
                const p = parsePayload();
                if (!p) return alert("JSON inválido");
                if (!createdId) return;
                updateMut.mutate(p);
              }}
            >
              Update
            </Button>
            <Button
              variant="destructive"
              disabled={!createdId}
              onClick={() => {
                if (!createdId) return;
                deleteMut.mutate();
              }}
            >
              Borrar
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset Draft
            </Button>
          </div>

          {/* Messages */}
          {createMut.isSuccess && (
            <div className="text-xs">✔ Creado key {String(createdId)}</div>
          )}
          {updateMut.isSuccess && createdId && (
            <div className="text-xs">✔ Actualizado {String(createdId)}</div>
          )}
          {deleteMut.isSuccess && <div className="text-xs">✔ Borrado</div>}

          <div className="mt-4 text-sm text-muted-foreground">
            <strong>UID:</strong> {selectedModel}
          </div>
        </div>
      </AppLayout>
    </ThemeProvider>
  );
}
