import type { ColumnDef, CellContext } from "@tanstack/react-table";
import React from "react";
import { Button } from "@k2600x/design-system";
import { TagsCell } from "@/components/admin/TagsCell";
import type { Tag } from "@/components/operation-tags/TagsSelector";
import Image from "next/image";

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
): ColumnDef<any>[] {
  const columns: ColumnDef<any>[] = [
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
          // Render RelationCell for edit mode or advanced use
          // (Uncomment and adapt if you want editable relation cells)
          // cell: (info: CellContext<any, any>) => {
          //   const row = info.row.original;
          //   return (
          //     <RelationCell
          //       name={key}
          //       value={row[key]}
          //       onChange={...}
          //       target={attr.target}
          //       isMulti={attr.relationType && attr.relationType.includes("Many")}
          //       displayField={attr.displayField || "displayName"}
          //       relatedPlural={relatedPlural}
          //     />
          //   );
          // },
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
              return value.map((file: any, idx: number) => (
                <a key={file.id || idx} href={file.url} target="_blank" rel="noopener noreferrer">
                  <Image src={file.url} alt={file.name || ''} width={32} height={32} style={{ objectFit: 'cover', borderRadius: 4, marginRight: 4 }} />
                </a>
              ));
            }
            return (
              <a href={value.url} target="_blank" rel="noopener noreferrer">
                <Image src={value.url} alt={value.name || ''} width={32} height={32} style={{ objectFit: 'cover', borderRadius: 4 }} />
              </a>
            );
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
          if (Array.isArray(value)) {
            return value.length;
          }
          if (typeof value === "object" && value !== null) {
            return typeof (value as any).id !== "undefined" ? (value as any).id : JSON.stringify(value);
          }
          return value === undefined ? "" : String(value);
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
          onClick={() => onEdit(info.row.original)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(info.row.original)}
        >
          Delete
        </Button>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  });
  return columns;
}
