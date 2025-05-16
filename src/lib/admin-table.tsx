import type { ColumnDef, CellContext, TableMeta } from "@tanstack/react-table";

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    onCellUpdate?: (row: TData, key: string, value: any) => void;
  }
}
import React from "react";
import { Button } from "@k2600x/design-system";
import { TagsCell } from "@/components/admin/TagsCell";
import { BooleanCell } from "@/components/admin/BooleanCell";
import type { Tag } from "@/components/operation-tags/TagsSelector";
import Image from "next/image";

export interface AdminTableMeta {
  onCellUpdate?: (row: any, key: string, value: any) => void;
  relatedPlural?: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

/**
 * Generates table columns for the admin table based on the schema and visible columns.
 *
 * @param schema - The Strapi schema object for the collection.
 * @param onEdit - Callback invoked when editing a row (receives the record object).
 * @param onDelete - Callback invoked when deleting a row (receives the record object).
 * @param visibleCols - Array of visible column keys (attributes).
 * @param onTagsUpdate - Optional callback invoked when a tags cell is edited (receives rowId, key, and new value).
 * @returns Array of column definitions for TanStack Table.
 */
export function getTableColumns(
  schema: any,
  onEdit: (row: any) => void,
  onDelete: (row: any) => void,
  visibleCols: string[] | null,
  onTagsUpdate?: (rowId: any, key: string, value: any) => void
): ColumnDef<any, any>[] {
  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info: CellContext<any, any>) => info.getValue(),
    },
  ];
  if (schema && schema.schema && schema.schema.attributes && visibleCols) {
    visibleCols.forEach((key) => {
      const attr = schema.schema.attributes[key];
      if (!attr) return;
      // Tag cell (assume type 'tags' or custom field name, e.g. 'tags', 'operationTags', etc.)
      if (key.toLowerCase().includes("tag") || attr.type === "tags") {
        // Use singularName for appliesTo (for filtering), always fetch from 'operation-tags' collection
        const appliesTo = schema.schema.singularName || schema.schema.collectionName;
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const row = info.row.original;
            return (
              <TagsCell
                value={row[key] as Tag | null}
                onChange={(tag) => onTagsUpdate?.(row.id, key, tag)}
                appliesTo={appliesTo}
                fetchCollection="operation-tags"
              />
            );
          },
        });
        return;
      }
      // Boolean cell (use BooleanCell)
      if (attr.type === "boolean") {
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const row = info.row.original;
            return (
              <BooleanCell
                value={!!row[key]}
                onChange={(newValue) => {
                  if (info.table.options.meta?.onCellUpdate) {
                    info.table.options.meta.onCellUpdate(row, key, newValue);
                  }
                }}
                row={row}
                name={key}
                table={info.table}
                disabled={false}
              />
            );
          },
        });
        return;
      }
      // Relation cell (view only)
      if (attr.type === "relation") {
        // Use pluralName for related collection
        const relatedCollection = attr.target?.split(".").pop();
        const relatedPlural = schema.schemas && relatedCollection && schema.schemas[relatedCollection]?.schema?.pluralName
          ? schema.schemas[relatedCollection].schema.pluralName
          : relatedCollection;
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const value = info.getValue();
            if (!value) return <span style={{ color: '#888' }}>-</span>;
            // If many, show comma separated
            if (Array.isArray(value)) {
              return value.map((v: any, idx: number) => (
                <span key={v.id || idx} style={{ marginRight: 4 }}>
                  {v.displayName || v.name || v.id}
                </span>
              ));
            }
            return <span>{value.displayName || value.name || value.id}</span>;
          },
          // Pass down relatedPlural for use in RelationCell (for fetches)
          meta: { relatedPlural },
        });
        return;
      }
      // Media cell (view only)
      if (attr.type === "media") {
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const value = info.getValue();
            if (!value) return <span style={{ color: '#888' }}>-</span>;
            // If many, show thumbnails
            if (Array.isArray(value)) {
              return (
                <div style={{ display: "flex", gap: 4 }}>
                  {value.map((media: any, idx: number) => (
                    <Image
                      key={media.id || idx}
                      src={media.url || media.formats?.thumbnail?.url || ""}
                      alt={media.name || "media"}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  ))}
                </div>
              );
            }
            // Single image
            return (
              <Image
                src={value.url || value.formats?.thumbnail?.url || ""}
                alt={value.name || "media"}
                width={40}
                height={40}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            );
          },
        });
        return;
      }
      // Enumeration cell
      if (attr.type === "enumeration") {
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const value = info.getValue();
            if (Array.isArray(value)) {
              return value.length;
            }
            return value;
          },
        });
        return;
      }
      // Default cell
      columns.push({
        header: key,
        accessorFn: (row: any) => row[key],
        cell: (info: CellContext<any, any>) => {
          const value = info.getValue();
          return value;
        },
      });
    });
  }
  columns.push({
    id: "actions",
    header: "Actions",
    cell: (info: CellContext<any, any>) => (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          // @ts-expect-error: meta type is not known to TS in this version
          onClick={() => info.table.options.meta?.onEdit?.(info.row.original)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          // @ts-expect-error: meta type is not known to TS in this version
          onClick={() => info.table.options.meta?.onDelete?.(info.row.original)}
        >
          Delete
        </Button>
      </div>
    ),
  });
  return columns;
}
