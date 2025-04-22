"use client";

import React, { useState, useEffect } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import strapi from "@/services/strapi";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { schemas, loading: schemasLoading, error: schemasError } = useStrapiSchemas();
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

  // Handle create/update
  async function handleFormSubmit(values: any) {
    setLoading(true);
    try {
      if (selectedRecord) {
        // Update: use documentId for PUT
        await strapi.post({
          method: "PUT",
          collection: apiCollection!,
          id: selectedRecord.documentId,
          data: values,
        });
      } else {
        // Create
        await strapi.post({
          method: "POST",
          collection: apiCollection!,
          data: values,
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

  // Render collection selector
  const collectionOptions = Object.keys(schemas).sort();

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Strapi Admin</h1>
      {schemasLoading && <div className="text-gray-500 mb-4">Loading schemas...</div>}
      {schemasError && <div className="text-red-500">Error loading schemas: {schemasError}</div>}
      <div className="flex items-center">
        <label className="flex items-center gap-2">
          Select collection:          
          <select className="border rounded px-2 py-1"
            value={selectedCollection || ""}
            onChange={(e) => {
              setSelectedCollection(e.target.value);
              setSelectedRecord(null);
              setShowForm(false);
            }}
          >
            <option value="" disabled>
              -- Choose --
            </option>
            {collectionOptions.map((col) => (
              <option key={col} value={col}>
                {schemas[col]?.schema?.displayName || col}
              </option>
            ))}
          </select>
        </label>
        {selectedCollection && (
          <Button onClick={() => { setSelectedRecord(null); setShowForm(true); }}>
            New
          </Button>
        )}
      </div>      {tableError && <div className="text-red-500">{tableError}</div>}
      {selectedCollection && !showForm && (<div className="w-full">      
        <table className="w-full border border-gray-300 rounded-md">        
          <thead>
            <tr>
              <th className="p-4 font-semibold text-sm">ID</th>
              {/* Render dynamic headers */}
              {records[0] && typeof records[0].attributes === 'object' && records[0].attributes !== null &&
                Object.keys(records[0].attributes).map((key) => (
                  <th className="p-4 font-semibold text-sm" key={key}>{key}</th>
                ))}
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec: any) => (
              <tr key={rec.id}>
                <td className="p-4">{rec.id}</td>
                {typeof rec.attributes === 'object' && rec.attributes !== null
                  ? Object.keys(rec.attributes).map((key) => (
                      <td className="p-4" key={key} >{JSON.stringify(rec.attributes[key])}</td>
                    ))
                  : <td className="p-4" colSpan={1}>-</td>
                }
                <td className="p-4">
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
                      } catch (err) {
                        alert("Failed to fetch record for editing");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Edit                    
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(rec)}>
                      Delete
                    </Button>
                  </div>                
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {selectedCollection && showForm && (
        <div className="mt-6">
          {loading && <div>Loading record for editing...</div>}
              {!loading && selectedRecord && (
                <DynamicStrapiForm
                  collection={selectedCollection}                  
                  document={selectedRecord}
                  onSuccess={handleFormSubmit}
                  onError={(err) => alert(err?.message || String(err))}
                />
              )}
              <Button className="ml-4 mt-4" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>        
        </div>
      )}        
    </div>    
  );
}
