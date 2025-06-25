// =============================================================
// File: src/context/StrapiSchemaProvider.tsx  (agregado primaryKey)
// =============================================================
import React, { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import { strapiService } from "@/services/strapiService";

// Zod schema for raw content-type builder response
const StrapiApiItemSchema = z.object({
  uid: z.string(),
  schema: z.object({
    kind: z.enum(["collectionType", "singleType"]),
    displayName: z.string(),
    singularName: z.string(),
    pluralName: z.string(),
    primaryField: z.string().optional(),
    attributes: z.record(z.any()),
  }),
});

export type AttributeMeta = {
  type: string;
  required?: boolean;
  enumValues?: string[];
  relation?: {
    targetUID: string;
    kind: string;
  };
};

export interface CollectionMeta {
  uid: string;
  apiID: string;
  displayName: string;
  singularName: string;
  pluralName: string;
  kind: "collectionType" | "singleType";
  primaryField: string; // campo legible (title)
  primaryKey: string;
  attributes: Record<string, AttributeMeta>;
  defaultPopulate: string[];
  defaultSelect: string[];
}

interface StrapiSchemaContextShape {
  collections: Record<string, CollectionMeta>;
  list: CollectionMeta[];
  get: (uid: string) => CollectionMeta | undefined;
  attribute: (uid: string, field: string) => AttributeMeta | undefined;
}

const StrapiSchemaCtx = createContext<StrapiSchemaContextShape | null>(null);
export const useStrapiSchemaCtx = () => {
  const ctx = useContext(StrapiSchemaCtx);
  if (!ctx) throw new Error("StrapiSchemaProvider missing");
  return ctx;
};

export const StrapiSchemaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState<StrapiSchemaContextShape | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const res = await strapiService.schema<{ data: unknown[] }>(undefined);
        const items = (res as any).data ?? res;
        const parsed = z.array(StrapiApiItemSchema).parse(items);

        const entries = parsed.map(({ uid, schema }) => {
          const attrs = schema.attributes as Record<string, any>;
          const attributes: Record<string, AttributeMeta> = {};
          Object.entries(attrs).forEach(([k, v]: any) => {
            attributes[k] = {
              type: v.type,
              required: !!v.required,
              enumValues: v.enum,
              relation:
                v.type === "relation"
                  ? { targetUID: v.target, kind: v.relationType }
                  : undefined,
            };
          });

          // Detecta primaryKey: si existe 'documentId' en atributos, úsalo; sino 'id'
          const primaryKeyField = attrs.documentId ? "documentId" : "id";

          const meta: CollectionMeta = {
            uid,
            apiID:
              schema.kind === "collectionType"
                ? schema.pluralName
                : schema.singularName,
            displayName: schema.displayName,
            singularName: schema.singularName,
            pluralName: schema.pluralName,
            kind: schema.kind,
            primaryField: schema.primaryField || "id",
            primaryKey: primaryKeyField,
            attributes,
            defaultPopulate: Object.keys(attrs).filter(
              (k) => attrs[k].type === "relation"
            ),
            defaultSelect: [
              primaryKeyField,
              schema.primaryField || primaryKeyField,
            ],
          };
          return [uid, meta] as const;
        });

        const collections = Object.fromEntries(entries);
        setValue({
          collections,
          list: Object.values(collections),
          get: (uid) => collections[uid],
          attribute: (uid, f) => collections[uid]?.attributes[f],
        });
      } catch (err) {
        console.error("Schema load failed", err);
      }
    })();
    return () => abort.abort();
  }, []);

  if (!value) return null; // Could return spinner
  return (
    <StrapiSchemaCtx.Provider value={value}>
      {children}
    </StrapiSchemaCtx.Provider>
  );
};

// =============================================================
