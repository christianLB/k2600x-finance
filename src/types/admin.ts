// Types for admin page, table, and schema utilities

/**
 * Represents a user's saved column preferences for a collection.
 */
export interface ColumnPreference {
  id?: string;
  collection: string;
  columns: string[];
}

/**
 * Represents the Strapi schema for a collection, including its attributes.
 */
export interface StrapiSchema {
  schema: {
    attributes: Record<string, any>;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Option for relation fields in admin forms (label/value pairs).
 */
export interface RelationOption {
  label: string;
  value: any;
}
