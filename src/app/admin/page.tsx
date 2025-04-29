"use client";

import React, { useState } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import strapi from "@/lib/strapi";
import { Button } from "@k2600x/design-system";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ColumnSelectorDialog } from "@/components/admin/ColumnSelectorDialog";
import { RecordFormDialog } from "@/components/admin/RecordFormDialog";
import { useColumnPreferences } from "@/hooks/useColumnPreferences";
import { useAdminRecords } from "@/hooks/useAdminRecords";
import { getTableColumns } from "@/lib/admin-table";
import { getSchemaAttributeKeys, getSchemaDisplayName } from "@/lib/schema-utils";

export default function AdminPage() {
  const { schemas } = useStrapiSchemas();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tableError] = useState<string | null>(null);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);

  // Compute correct collection name for API calls from schema
  const apiCollection = selectedCollection && schemas[selectedCollection]?.schema?.pluralName;

  // Use custom hook for records CRUD
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useAdminRecords(
    selectedCollection,
    selectedCollection ? schemas[selectedCollection] : null
  );

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
    if (!selectedCollection) return;
    setLoading(true);
    try {
      let payload = values;
      if (selectedRecord) {
        // Update: use documentId for PUT, normalize relations
        payload = normalizeRelationsForUpdate(values, schemas[selectedCollection]);
        await updateRecord(selectedRecord.documentId, payload);
      } else {
        // Create: normalize relations
        payload = normalizeRelationsForUpdate(values, schemas[selectedCollection]);
        await createRecord(payload);
      }
      setShowForm(false);
      setSelectedRecord(null);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete
  async function handleDelete(record: any) {
    if (!selectedCollection) return;
    setLoading(true);
    await deleteRecord(record.documentId);
    setSelectedRecord(null);
    setShowForm(false);
    setLoading(false);
  }

  // Inline tags update handler
  async function handleTagsUpdate(rowId: any, key: string, value: any) {
    if (!selectedCollection) return;
    // Only send the tag id for the tag field, not the full object
    const tagId = value && typeof value === 'object' && 'id' in value ? value.id : value;
    // Only send the tag field in the payload
    const payload = normalizeRelationsForUpdate({ [key]: tagId }, schemas[selectedCollection]);
    const record = records.find((r: any) => r.id === rowId);
    if (!record) return;
    await updateRecord(record.documentId, payload);
  }

  // Use custom hook for column preferences
  const { visibleColumns, setVisibleColumns, loading: columnsLoading } = useColumnPreferences(
    selectedCollection,
    selectedCollection ? schemas[selectedCollection] : null
  );

  const collectionOptions = Object.keys(schemas || {})
    .filter(
      (col: string) => !col.startsWith("strapi::") && !col.startsWith("admin::") && !col.startsWith("plugin::")
    );
  const sidebarCollections = collectionOptions.map((col: string) => ({
    key: col,
    label: getSchemaDisplayName(schemas[col], col),
  }));

  const [loading, setLoading] = useState(false);

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
            {selectedCollection ? getSchemaDisplayName(schemas[selectedCollection], selectedCollection) : "Select a Collection"}
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
              columns={getTableColumns(
                schemas[selectedCollection],
                async (rec: any) => {
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
                },
                (rec: any) => handleDelete(rec),
                visibleColumns,
                handleTagsUpdate
              )}
              loading={recordsLoading}
              error={recordsError || undefined}
              emptyMessage="No data found."
              meta={{
                onCellUpdate: async (row: any, key: string, value: any) => {
                  if (!selectedCollection) return;
                  // Only send the changed field
                  const payload = { [key]: value };
                  await updateRecord(row.documentId, payload);
                },
              }}
            />
            {/* Column Selector Dialog */}
            <ColumnSelectorDialog
              open={columnSelectorOpen}
              columns={getSchemaAttributeKeys(schemas[selectedCollection])}
              selected={visibleColumns || []}
              onChange={setVisibleColumns}
              onClose={() => setColumnSelectorOpen(false)}
              loading={columnsLoading}
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
