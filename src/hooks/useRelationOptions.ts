// src/hooks/useRelationOptions.ts
import { useState, useEffect } from "react";
import strapi from "@/services/strapi";
import type { FieldConfig } from "@/hooks/useFormFactory";

// Helper to choose a display label from entity attributes
function getDisplayLabel(attrs: any, displayField?: string): string {
  if (displayField && attrs[displayField]) return String(attrs[displayField]);
  return (
    attrs.displayName || attrs.name || attrs.title || attrs.email || attrs.id || "(no label)"
  );
}

/**
 * Fetches and caches options for all relation fields in a form.
 * Returns a map: fieldName -> options[]
 */
export function useRelationOptions(
  fieldsConfig: FieldConfig<any>[],
  schemas: any // Add schemas as a parameter
): Record<string, { label: string; value: any }[]> {
  const [optionsMap, setOptionsMap] = useState<
    Record<string, { label: string; value: any }[]>
  >({});

  useEffect(() => {
    let cancelled = false;
    const fetchOptions = async () => {
      const relFields = fieldsConfig.filter(
        (f) => f.type === "relation" && f.props?.target && !!f.props.target && typeof f.props.target === 'string'
      );
      if (relFields.length === 0) {
        console.log("useRelationOptions: No valid relation fields found in fieldsConfig:", fieldsConfig);
        return;
      }
      const map: Record<string, { label: string; value: any }[]> = {};

      await Promise.all(
        relFields.map(async (f) => {
          const uid: string = f.props.target;
          // ENHANCEMENT: Defensive - skip if target is missing or not a string
          if (!uid || typeof uid !== 'string') {
            console.warn(`useRelationOptions: Skipping field '${f.name}' due to invalid target`, f);
            map[f.name] = [];
            return;
          }
          // Use pluralName from schema context if available
          let collection = uid.split('.').pop() as string;
          // Try to get the correct pluralName from schema context
          if (schemas && schemas[uid]?.schema?.pluralName) {
            collection = schemas[uid].schema.pluralName;
          }
          if (!collection) {
            console.warn(`useRelationOptions: Could not resolve collection for uid '${uid}' in field '${f.name}'`, f);
            map[f.name] = [];
            return;
          }
          try {
            const res = await strapi.post({ method: "GET", collection, query: { populate: "*" } });
            const items = Array.isArray(res.data) ? res.data : [];
            map[f.name] = items.map((item: any) => ({
              label: item.attributes?.displayName || item.attributes?.name || item.id,
              value: item.id,
            }));
          } catch (err) {
            map[f.name] = [];
          }
        })
      );

      if (!cancelled) {
        setOptionsMap(map);
      }
    };

    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, [fieldsConfig, schemas]); // Add schemas to the dependency array

  return optionsMap;
}
