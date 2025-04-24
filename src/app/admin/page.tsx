"use client";

import React, { useState, useEffect } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import strapi from "@/services/strapi";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";
import { Button } from "@k2600x/design-system";
import { Sidebar } from "@/components/admin/Sidebar";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AdminPage() {
  const { schemas } = useStrapiSchemas();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Compute correct collection name for API calls from schema
  const apiCollection = selectedCollection && schemas[selectedCollection]?.schema?.pluralName;

  // Fetch records when collection changes
  useEffect(() => {
    if (!apiCollection) return;
    setLoading(true);
    setTableError(null);
    strapi
      .post({ method: "GET", collection: apiCollection })
      .then((res) => setRecords(res.data))
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

  // Helper to filter out internal/system collections
  const collectionOptions = Object.keys(schemas || {})
    .filter(
      (col) => !col.startsWith("strapi::") && !col.startsWith("admin::") && !col.startsWith("plugin::")
    );
  const sidebarCollections = collectionOptions.map((col) => ({
    key: col,
    label: schemas[col]?.schema?.displayName || col,
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        collections={sidebarCollections}
        selectedCollection={selectedCollection}
        onSelectCollection={(col) => {
          setSelectedCollection(col);
          setSelectedRecord(null);
          setShowForm(false);
        }}
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
                {/* Render dynamic headers */}
                {records[0] && typeof records[0].attributes === 'object' && records[0].attributes !== null &&
                  Object.keys(records[0].attributes).map((key) => (
                    <th key={key} style={{ borderBottom: "1px solid #ddd", padding: 8 }}>{key}</th>
                  ))}
                <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec: any) => (
                <tr key={rec.id}>
                  <td style={{ padding: 8 }}>{rec.id}</td>
                  {typeof rec.attributes === 'object' && rec.attributes !== null
                    ? Object.keys(rec.attributes).map((key) => (
                        <td key={key} style={{ padding: 8 }}>{JSON.stringify(rec.attributes[key])}</td>
                      ))
                    : <td style={{ padding: 8 }} colSpan={1}>-</td>
                  }
                  <td style={{ padding: 8 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const documentId = rec.documentId;
                        if (!documentId) {
                          alert("This record is missing a documentId and cannot be edited.");
                          return;
                        }
                        setLoading(true);
                        setSelectedRecord(null);
                        try {
                          // Always fetch the latest entity by documentId with populate: '*'
                          const res = await strapi.post({
                            method: "GET",
                            collection: apiCollection!,
                            id: documentId,
                            query: { populate: "*" },
                          });
                          setSelectedRecord({ ...res.data });
                          setShowForm(true);
                        } catch (err: any) {
                          alert("Failed to fetch record for editing: " + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" style={{ marginLeft: 8 }} onClick={() => handleDelete(rec)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal for Create/Edit Form */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <div style={{ minWidth: 320, maxWidth: 500 }}>
              {loading && <div>Loading record for editing...</div>}
              {!loading && selectedCollection && (
                <DynamicStrapiForm
                  collection={selectedCollection}
                  document={selectedRecord}
                  onSuccess={handleFormSubmit}
                  onError={() => alert("An error occurred")}
                />
              )}
              <Button style={{ marginTop: 16 }} variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
