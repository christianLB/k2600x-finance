/**
 * Get the attribute keys from a Strapi schema object.
 */
export function getSchemaAttributeKeys(schema: any): string[] {
  return Object.keys(schema?.schema?.attributes || {});
}

/**
 * Get the display name for a collection from a Strapi schema object.
 */
export function getSchemaDisplayName(schema: any, fallback: string): string {
  return schema?.schema?.displayName || fallback;
}

/**
 * Get the short (plural) collection name from a Strapi schema object.
 */
export function getShortCollectionName(schema: any, fallback: string): string {
  return schema?.schema?.pluralName || fallback;
}
