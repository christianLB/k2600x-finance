"use client"
import React from "react";
import useStrapiSchema from "@/hooks/useStrapiSchema";
import { strapiToFormConfig } from "@/utils/strapiToFormConfig";
import { useFormFactory } from "@/hooks/useFormFactory";
import { FormProvider } from "react-hook-form";
import { Button } from "@k2600x/design-system";
import { z } from "zod";

export default function TestStrapiSchemaPage() {
  const [uid, setUid] = React.useState("");
  const [showForm, setShowForm] = React.useState(true);
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useStrapiSchema(uid || undefined);

  const availableUids = React.useMemo(() => {
    if (data && Array.isArray(data.data)) {
      return data.data.map((item: any) => item.uid);
    }
    return [];
  }, [data]);

  const selectedSchema = React.useMemo(() => {
    if (uid && data && Array.isArray(data.data)) {
      return data.data.find((item: any) => item.uid === uid);
    }
    return null;
  }, [uid, data]);

  const { schema, defaultValues, fieldsConfig } = React.useMemo(() => {
    if (selectedSchema) {
      return strapiToFormConfig(selectedSchema);
    }
    return {
      schema: z.object({}),
      defaultValues: {},
      fieldsConfig: [],
    };
  }, [selectedSchema]);

  // --- Fetch all relation options in a single effect, robust for all schema changes ---
  //const [relationOptionsMap, setRelationOptionsMap] = React.useState<Record<string, { label: string; value: any }[]>>({});
  const [relationsLoading, setRelationsLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setRelationsLoading(true);
      const relFields = fieldsConfig.filter(f => f.type === 'relation' && f.props?.target);
      // Use pluralName from schema for correct collection name
      const pluralNameMap: Record<string, string> = {};
      // --- Patch: Use the schema object for pluralName ---
      if (selectedSchema && selectedSchema.schema && selectedSchema.schema.attributes) {
        Object.entries(selectedSchema.schema.attributes).forEach(([attrName, attr]: any) => {
          if (attr.type === 'relation' && attr.target) {
            // Find the target schema object from the global data
            let targetPluralName = undefined;
            if (attr.target) {
              // Try to find the schema object for this target in the global data array
              const allSchemas = Array.isArray(data?.data) ? data.data : [];
              const targetSchema = allSchemas.find((s: any) => s.uid === attr.target);
              if (targetSchema && targetSchema.schema && targetSchema.schema.pluralName) {
                targetPluralName = targetSchema.schema.pluralName;
              }
            }
            pluralNameMap[attrName] = targetPluralName || attr.target.split('.').pop();
          }
        });
      }
      const uniqueCollections = Array.from(new Set(relFields.map(f => pluralNameMap[f.name] || f.props?.target.match(/([^.]+)$/)?.[1] || f.props?.target)));
      const map: Record<string, { label: string; value: any }[]> = {};
      await Promise.all(uniqueCollections.map(async (collection) => {
        try {
          // Use the proxy route for Strapi collection data, with POST body
          const res = await fetch("/api/strapi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "GET", collection }),
          });
          const data = await res.json();
          map[collection] = Array.isArray(data.data)
            ? data.data.map((item: any) => ({
                label: item.attributes?.displayName || item.attributes?.name || item.id,
                value: item.id,
              }))
            : [];
        } catch {
          map[collection] = [];
        }
      }));
      // Map fieldName -> options[]
      const fieldMap: Record<string, { label: string; value: any }[]> = {};
      relFields.forEach(f => {
        const collection = pluralNameMap[f.name] || f.props?.target.match(/([^.]+)$/)?.[1] || f.props?.target;
        fieldMap[f.name] = map[collection] || [];
      });
      if (!cancelled) {
        //setRelationOptionsMap(fieldMap);
        setRelationsLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [fieldsConfig, selectedSchema, data, data.data]);

  const formFactory = useFormFactory(schema, defaultValues, fieldsConfig);

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .strapi-playground-container {
            background: #181c20 !important;
            color: #f6f6f6 !important;
          }
          .strapi-playground-pre {
            background: #23272e !important;
            color: #f6f6f6 !important;
          }
        }
      `}</style>
      <div className="strapi-playground-container" style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #0001", padding: 32 }}>
        <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 4 }}>Strapi Schema Playground</h1>
        <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
          Dynamically test and preview forms generated from your Strapi content-type schemas.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500 }}>
            schemaUid (optional):
            <input
              type="text"
              value={uid}
              onChange={e => setUid(e.target.value)}
              placeholder="e.g. api::article.article"
              style={{ marginLeft: 8, width: 300, border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 15 }}
              list="schema-uid-list"
            />
          </label>
          <button onClick={() => refetch()} disabled={isFetching} style={{ marginLeft: 12, padding: "6px 16px", borderRadius: 6, border: 0, background: "#e7e7e7", fontWeight: 500 }}>
            Refetch
          </button>
        </div>
        {availableUids.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 500 }}>
              Or pick a schema:
              <select
                value={uid}
                onChange={e => setUid(e.target.value)}
                style={{ marginLeft: 8, minWidth: 320, border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 15 }}
              >
                <option value="">-- Show all --</option>
                {availableUids.map((schemaUid: string) => (
                  <option key={schemaUid} value={schemaUid}>
                    {schemaUid}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <datalist id="schema-uid-list">
          {availableUids.map((schemaUid: string) => (
            <option key={schemaUid} value={schemaUid} />
          ))}
        </datalist>
        <div style={{ marginTop: 20 }}>
          <Button variant="secondary" style={{ marginBottom: 12 }} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Show Raw Schema" : "Show Form"}
          </Button>
          {isLoading || isFetching || relationsLoading ? (
            <div>Loading schema...</div>
          ) : error ? (
            <div style={{ color: "red" }}>Error: {error.message}</div>
          ) : (
            showForm && fieldsConfig.length > 0 ? (
              <FormProvider {...formFactory.form}>
                <form
                  onSubmit={formFactory.form.handleSubmit((values) => alert(JSON.stringify(values, null, 2)))}
                  style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}
                >
                  {formFactory.renderFields()}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <Button type="submit" variant="primary" style={{ minWidth: 120, fontWeight: 600, fontSize: 16 }}>Submit</Button>
                  </div>
                </form>
              </FormProvider>
            ) : (
              <pre className="strapi-playground-pre" style={{ background: "#f4f4f4", padding: 16, borderRadius: 4, overflowX: "auto" }}>
                {uid && selectedSchema
                  ? JSON.stringify(selectedSchema, null, 2)
                  : JSON.stringify(data, null, 2)}
              </pre>
            )
          )}
        </div>
      </div>
    </div>
  );
}
