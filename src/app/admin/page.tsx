"use client";

import React, { useState, useEffect } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import strapi from "@/services/strapi";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";
import { Button } from "@k2600x/design-system";
import { AdminTable } from "@/components/admin/AdminTable";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ColumnSelectorDialog } from "@/components/admin/ColumnSelectorDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RecordFormDialog } from "@/components/admin/RecordFormDialog";

export default function AdminPage() {
  const { schemas } = useStrapiSchemas();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[] | null>(null);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const [columnPrefId, setColumnPrefId] = useState<string | null>(null);

  // Compute correct collection name for API calls from schema
  const apiCollection = selectedCollection && schemas[selectedCollection]?.schema?.pluralName;

  // Fetch records when collection changes
  useEffect(() => {
    if (!apiCollection) return;
    setLoading(true);
    setTableError(null);
    strapi
      .post({ method: "GET", collection: apiCollection })
      .then((res) => {
        setRecords(res.data)
      })
      .catch((err) => setTableError(err.message || "Failed to fetch records"))
      .finally(() => setLoading(false));
  }, [apiCollection]);

  // Normalize relations for update: convert relation objects to their DB id or null
  function normalizeRelationsForUpdate(data: any, schema: any) {
    if (!data || !schema) return data;
    const normalized = { ...data };
    for (const [key, field] of Object.entries(schema.schema?.attributes ?? {})) {
      const typedField = field as { type?: string; [key: string]: any };
      if (typedField.type === 'relation' || typedField.type === 'media') {
        if (Array.isArray(normalized[key])) {
          // For many relations and media: map to array of ids, keep [] if empty
          normalized[key] = normalized[key]
            .map((item: any) => {
              if (!item) return null;
              if (typeof item === 'object' && typeof item.id !== 'undefined') return item.id;
              return item;
            })
            .filter((v: any) => v !== null && v !== undefined); // Remove nulls
          // If still empty, keep as []
        } else if (normalized[key] && typeof normalized[key] === 'object') {
          normalized[key] = typeof normalized[key].id !== 'undefined' ? normalized[key].id : null;
        } else if (normalized[key] === undefined || normalized[key] === "") {
          // For single relation/media, set to null if empty string or undefined
          normalized[key] = null;
        }
      }
    }
    return normalized;
  }

  // Handle create/update
  async function handleFormSubmit(values: any) {
    setLoading(true);
    try {
      let payload = values;
      if (selectedRecord) {
        if (!selectedCollection) throw new Error("No collection selected");
        // Update: use documentId for PUT, normalize relations
        payload = normalizeRelationsForUpdate(values, schemas[selectedCollection]);
        await strapi.post({
          method: "PUT",
          collection: apiCollection!,
          id: selectedRecord.documentId,
          data: payload,
        });
      } else {
        if (!selectedCollection) throw new Error("No collection selected");
        // Create: normalize relations
        payload = normalizeRelationsForUpdate(values, schemas[selectedCollection]);
        await strapi.post({
          method: "POST",
          collection: apiCollection!,
          data: payload,
        });
      }
      // Refresh list
      const res = await strapi.post({ method: "GET", collection: apiCollection! });
      setRecords(res.data);
      setShowForm(false);
      setSelectedRecord(null);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete
  async function handleDelete(record: any) {
    setLoading(true);
    await strapi.post({
      method: "DELETE",
      collection: apiCollection!,
      id: record.documentId,
    });
    // Refresh list
    const res = await strapi.post({ method: "GET", collection: apiCollection! });
    setRecords(res.data);
    setSelectedRecord(null);
    setShowForm(false);
    setLoading(false);
  }

  // Fetch column preferences for the selected collection
  useEffect(() => {
    if (!selectedCollection || !schemas[selectedCollection]) {
      setVisibleColumns(null);
      setColumnPrefId(null);
      return;
    }
    const shortCollection = schemas[selectedCollection]?.schema?.pluralName || selectedCollection;
    async function fetchColumnPref() {
      setLoading(true);
      try {
        const res = await strapi.post({
          method: "GET",
          collection: "column-preferences",
          query: { filters: { collection: { $eq: shortCollection } } },
        });
        const pref = Array.isArray(res?.data) ? res.data[0] : null;
        let schemaAttrs: string[] = [];
        if (selectedCollection && schemas[selectedCollection]) {
          schemaAttrs = Object.keys(schemas[selectedCollection]?.schema?.attributes || {});
        }
        if (pref && typeof pref.columns === 'string' && pref.columns.trim()) {
          // Filter out columns not in schema
          const filteredCols = pref.columns.split(',').map((col: string) => col.trim()).filter((col: string) => schemaAttrs.includes(col));
          setVisibleColumns(filteredCols);
          setColumnPrefId(pref.documentId ?? pref.id?.toString() ?? null);
        } else {
          // No preference found, fallback to all columns
          setVisibleColumns(schemaAttrs);
          setColumnPrefId(null);
        }
      } catch (err: unknown) {
        console.log(err);
        // On error, fallback to all columns
        let schemaAttrs: string[] = [];
        if (selectedCollection && schemas[selectedCollection]) {
          schemaAttrs = Object.keys(schemas[selectedCollection]?.schema?.attributes || {});
        }
        setVisibleColumns(schemaAttrs);
        setColumnPrefId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchColumnPref();
  }, [selectedCollection, schemas]);

  // Persist visibleColumns to column-preferences collection
  async function persistDisplayColumns(newColumns: string[]) {
    if (!selectedCollection || !schemas[selectedCollection]) return;
    setLoading(true);
    const shortCollection = schemas[selectedCollection]?.schema?.pluralName || selectedCollection;
    // Only persist columns that exist in the schema
    const schemaAttrs = Object.keys(schemas[selectedCollection]?.schema?.attributes || {});
    const filteredColumns = newColumns.filter((col: string) => schemaAttrs.includes(col));
    try {
      if (columnPrefId) {
        await strapi.post({
          method: "PUT",
          collection: "column-preferences",
          id: columnPrefId,
          data: { columns: filteredColumns.join(","), collection: shortCollection },
        });
      } else {
        const res = await strapi.post({
          method: "POST",
          collection: "column-preferences",
          data: { collection: shortCollection, columns: filteredColumns.join(",") },
        });
        setColumnPrefId(res?.data?.documentId ?? res?.data?.id?.toString() ?? null);
      }
      setVisibleColumns(filteredColumns);
      if (typeof window !== 'undefined' && window.location) {
        //window.location.reload();
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        alert("Failed to save column preference: " + (err as any).message);
      } else {
        alert("Failed to save column preference: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  // Helper to generate columns for Table
  function getTableColumns(schema: any, onEdit: (row: any) => void, onDelete: (row: any) => void, visibleCols: string[] | null): ColumnDef<any>[] {
    const columns: ColumnDef<any>[] = [
      {
        accessorKey: "id",
        header: "ID",
        cell: info => info.getValue(),
      },
    ];
    if (schema && schema.schema && schema.schema.attributes && visibleCols) {
      visibleCols.forEach((key) => {
        if (!schema.schema.attributes[key]) return;
        columns.push({
          header: key,
          accessorFn: row => row[key],
          cell: info => {
            const value = info.getValue();
            return typeof value === "object" ? JSON.stringify(value) : String(value ?? "-");
          },
        });
      });
    }
    columns.push({
      id: "actions",
      header: "Actions",
      cell: info => (
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

  // Helper to filter out internal/system collections
  const collectionOptions = Object.keys(schemas || {})
    .filter(
      (col: string) => !col.startsWith("strapi::") && !col.startsWith("admin::") && !col.startsWith("plugin::")
    );
  const sidebarCollections = collectionOptions.map((col: string) => ({
    key: col,
    label: schemas[col]?.schema?.displayName || col,
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        collections={sidebarCollections}
        selectedCollection={selectedCollection}
        onSelect={setSelectedCollection}
      />
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginRight: 16 }}>
            {selectedCollection ? schemas[selectedCollection]?.schema?.displayName || selectedCollection : "Select a Collection"}
          </h2>
          {selectedCollection && (
            <Button style={{ marginLeft: 16 }} onClick={() => { setSelectedRecord(null); setShowForm(true); }}>
              New
            </Button>
          )}
        </div>
        {tableError && <div style={{ color: "red" }}>{tableError}</div>}
        {selectedCollection && !showForm && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button variant="outline" size="sm" onClick={() => setColumnSelectorOpen(true)}>
                Select Columns
              </Button>
              {visibleColumns && (
                <span style={{ marginLeft: 12, fontSize: 12, color: '#888' }}>
                  Visible: {visibleColumns.join(", ")}
                </span>
              )}
            </div>
            <AdminTable
              data={records}
              columns={getTableColumns(schemas[selectedCollection], async (rec) => {
                const documentId = rec.documentId;
                if (!documentId) {
                  alert("This record is missing a documentId and cannot be edited.");
                  return;
                }
                setLoading(true);
                setSelectedRecord(null);
                try {
                  const res = await strapi.post({
                    method: "GET",
                    collection: apiCollection!,
                    id: documentId,
                    query: { populate: "*" },
                  });
                  setSelectedRecord({ ...res.data });
                  setShowForm(true);
                } catch (err: unknown) {
                  alert("Failed to fetch record for editing: " + (err && typeof err === "object" && "message" in err ? (err as any).message : String(err)));
                } finally {
                  setLoading(false);
                }
              }, handleDelete, visibleColumns)}
              loading={loading}
              error={tableError || undefined}
              emptyMessage="No data found."
            />
            {/* Column Selector Dialog */}
            <ColumnSelectorDialog
              open={columnSelectorOpen}
              columns={Object.keys(selectedCollection && schemas[selectedCollection]?.schema?.attributes || {})}
              selected={visibleColumns || []}
              onChange={persistDisplayColumns}
              onClose={() => setColumnSelectorOpen(false)}
              loading={loading}
            />
          </>
        )}
        {/* Modal for Create/Edit Form */}
        <RecordFormDialog
          open={showForm}
          collection={selectedCollection!}
          record={selectedRecord}
          onSave={handleFormSubmit}
          onClose={() => setShowForm(false)}
          loading={loading}
          title={selectedRecord ? "Edit Record" : "Create Record"}
        />
      </div>
    </div>
  );
}
