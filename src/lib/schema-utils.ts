import type { StrapiSchema } from "@/types/admin";
// import { CollectionMeta } from "@/context/StrapiSchemaProvider"; // DEPRECATED
interface CollectionMeta { 
  apiID: string; 
  displayName: string; 
  attributes: Record<string, any>;
} // Stub for build compatibility

/**
 * Returns the attribute keys from a Strapi schema object.
 * @param schema - The Strapi schema object.
 * @returns Array of attribute keys for the collection.
 */
export function getSchemaAttributeKeys(schema: StrapiSchema): string[] {
  return Object.keys(schema?.schema?.attributes || {});
}

/**
 * Returns the display name for a collection from a Strapi schema object.
 * @param schema - The Strapi schema object.
 * @param fallback - The fallback display name to return if the schema does not have a display name.
 * @returns Display name string.
 */
export function getSchemaDisplayName(
  schema: StrapiSchema,
  fallback: string
): string {
  return schema?.schema?.displayName || fallback;
}

/**
 * Get the short (plural) collection name from a Strapi schema object.
 */
export function getShortCollectionName(
  schema: StrapiSchema,
  fallback: string
): string {
  return schema?.schema?.pluralName || fallback;
}

// =============================================================
// File: src/lib/schema-utils.ts
// =============================================================

export function buildSamplePayload(col: CollectionMeta) {
  const obj: Record<string, any> = {};
  Object.entries(col.attributes).forEach(([name, meta]) => {
    if (meta.relation) return; // omit relations for dummy payload
    switch (meta.type) {
      case "string":
      case "text":
        obj[name] = "lorem ipsum";
        break;
      case "integer":
      case "biginteger":
      case "decimal":
        obj[name] = 0;
        break;
      case "boolean":
        obj[name] = false;
        break;
      case "date":
        obj[name] = new Date().toISOString().slice(0, 10);
        break;
      default:
        obj[name] = null;
    }
  });
  return obj;
}
