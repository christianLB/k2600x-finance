import type { ColumnDef, CellContext } from "@tanstack/react-table";

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    onCellUpdate?: (row: TData, key: string, value: any) => void;
  }
}
import React from "react";
import { Button, Tooltip } from "@k2600x/design-system";
import { TagsCell } from "@/components/admin/TagsCell";
import { BooleanCell } from "@/components/admin/BooleanCell";
import type { Tag } from "@/components/operation-tags/TagsSelector";
import {
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FileType,
  Presentation,
  File as FileDefault,
  Pencil,
  Trash2
} from "lucide-react";

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
  onTagsUpdate?: (rowId: any, key: string, value: any) => void,
  showIdColumn: boolean = false // Default to hiding the ID column
): ColumnDef<any, any>[] {
  // Initialize empty columns array
  const columns: ColumnDef<any, any>[] = [];
  
  // No unused variables
  
  // Only add ID column if showIdColumn is true
  if (showIdColumn) {
    columns.push({
      accessorKey: "id",
      header: () => <div className="text-left font-medium">ID</div>,
      cell: (info: CellContext<any, any>) => info.getValue(),
    });
  }
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
      // Helper function to get the appropriate file icon based on extension
      const getFileIcon = (fileName: string, size = 24) => {
        // Extract file extension
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        
        // Document files
        if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
          return <FileText size={size} />;
        }
        
        // PDF files
        if (extension === 'pdf') {
          return <FileText size={size} />;
        }
        
        // Spreadsheet files
        if (['xls', 'xlsx', 'csv'].includes(extension)) {
          return <FileSpreadsheet size={size} />;
        }
        
        // Presentation files
        if (['ppt', 'pptx'].includes(extension)) {
          return <Presentation size={size} />;
        }
        
        // Image files
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
          return <FileImage size={size} />;
        }
        
        // Video files
        if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
          return <FileVideo size={size} />;
        }
        
        // Archive files
        if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
          return <FileArchive size={size} />;
        }
        
        // Code files
        if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'].includes(extension)) {
          return <FileType size={size} />;
        }
        
        // Default file icon for any other file type
        return <FileDefault size={size} />;
      };
      
      // Media cell (view only)
      if (attr.type === "media") {
        columns.push({
          header: key,
          accessorFn: (row: any) => row[key],
          cell: (info: CellContext<any, any>) => {
            const value = info.getValue();
            if (!value) return <span style={{ color: '#888' }}>-</span>;
            // If many, show file icons with tooltips
            if (Array.isArray(value)) {
              return (
                <div style={{ display: "flex", gap: 4 }}>
                  {value.map((media: any, idx: number) => {
                    const fileName = media.name || "Unknown file";
                    return (
                      <Tooltip key={media.id || idx} content={fileName}>
                        <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {getFileIcon(fileName, 24)}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            }
            // Single file
            const fileName = value.name || "Unknown file";
            return (
              <Tooltip content={fileName}>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getFileIcon(fileName, 24)}
                </div>
              </Tooltip>
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
        id: key, // Add id to fix TypeScript error
        header: () => <div className="text-left font-medium">{key}</div>,
        accessorFn: (row: any) => row[key],
        cell: (info: CellContext<any, any>) => {
          const value = info.getValue();
          return value;
        },
      });
    });
  }
  // Add actions column at the end (always visible)
  columns.push({
    id: "actions",
    header: () => <div className="text-left font-medium">Actions</div>,
    cell: (info: CellContext<any, any>) => (
      <div className="flex gap-2">
        <Tooltip content="Edit">
          <Button
            variant="ghost"
            size="icon"
            // Direct call to the onEdit function passed as argument
            onClick={() => onEdit(info.row.original)}
            className="h-9 w-9 p-0"
          >
            <Pencil size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="Delete">
          <Button
            variant="ghost"
            size="icon"
            // Direct call to the onDelete function passed as argument
            onClick={() => onDelete(info.row.original)}
            className="h-9 w-9 p-0 text-destructive hover:text-destructive/80"
          >
            <Trash2 size={18} />
          </Button>
        </Tooltip>
      </div>
    ),
  });
  return columns;
}
