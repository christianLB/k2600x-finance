import type { StrapiSchema } from "@/types/admin";

/**
 * Get the attribute keys from a Strapi schema object.
 */
export function getSchemaAttributeKeys(schema: StrapiSchema): string[] {
  return Object.keys(schema?.schema?.attributes || {});
}

/**
 * Get the display name for a collection from a Strapi schema object.
 */
export function getSchemaDisplayName(schema: StrapiSchema, fallback: string): string {
  return schema?.schema?.displayName || fallback;
}

/**
 * Get the short (plural) collection name from a Strapi schema object.
 */
export function getShortCollectionName(schema: StrapiSchema, fallback: string): string {
  return schema?.schema?.pluralName || fallback;
}
