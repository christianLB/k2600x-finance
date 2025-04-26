import type { StrapiSchema } from "@/types/admin";

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
export function getSchemaDisplayName(schema: StrapiSchema, fallback: string): string {
  return schema?.schema?.displayName || fallback;
}

/**
 * Get the short (plural) collection name from a Strapi schema object.
 */
export function getShortCollectionName(schema: StrapiSchema, fallback: string): string {
  return schema?.schema?.pluralName || fallback;
}
