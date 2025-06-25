// =============================================================
// File: src/hooks/useDraftRecord.ts
// =============================================================
import { useState, useEffect } from "react";
import { useStrapiSchemaCtx } from "@/context/StrapiSchemaProvider";
import { buildSamplePayload } from "@/lib/schema-utils";

export function useDraftRecord(uid: string) {
  const { get } = useStrapiSchemaCtx();
  const col = get(uid)!;
  const [draft, setDraft] = useState<Record<string, any>>(() =>
    buildSamplePayload(col)
  );

  useEffect(() => {
    setDraft(buildSamplePayload(col));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const setField = (k: string, v: any) => setDraft((d) => ({ ...d, [k]: v }));
  const reset = () => setDraft(buildSamplePayload(col));

  return { draft, setField, reset };
}
