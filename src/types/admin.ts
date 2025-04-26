// Types for admin page, table, and schema utilities

import type { ColumnDef } from "@tanstack/react-table";

export interface ColumnPreference {
  id?: string;
  collection: string;
  columns: string[];
}

export interface StrapiSchema {
  schema: {
    attributes: Record<string, any>;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface RelationOption {
  label: string;
  value: any;
}
