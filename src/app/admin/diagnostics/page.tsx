"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ThemeProvider,
  AppLayout,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
} from "@k2600x/design-system";
import SmartDataTable from "@/modules/finance-dashboard/components/SmartDataTable";

export default function DiagnosticsPage() {
  const queryClient = useQueryClient();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [testPayload, setTestPayload] = useState<string>('');

  // Load available schemas
  const {
    data: schemas = [],
    isLoading: isLoadingSchemas,
    error: schemasError,
  } = useQuery<any[]>({
    queryKey: ["schemas"],
    queryFn: async () => {
      const response = await fetch("/api/strapi/schemas");
      if (!response.ok) {
        throw new Error(`Failed to fetch schemas: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Filter to only show API collections (not plugins)
  const apiCollections = useMemo(() => {
    return schemas.filter(schema => 
      schema.uid.startsWith('api::') && 
      schema.schema.kind === 'collectionType'
    );
  }, [schemas]);

  // Load collection data
  const {
    data: collectionData,
    isLoading: isLoadingData,
    error: dataError,
  } = useQuery({
    queryKey: ["collection", selectedCollection, 1], // page 1
    queryFn: async () => {
      if (!selectedCollection) return null;
      
      const response = await fetch(
        `/api/strapi/collections/${btoa(selectedCollection)}?page=1&pageSize=10`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!selectedCollection,
  });

  // Get sample documentId from existing data for examples
  const sampleDocumentId = useMemo(() => {
    if (collectionData?.data?.length > 0) {
      return collectionData.data[0].documentId;
    }
    return "abc123"; // fallback
  }, [collectionData]);

  // Auto-select first collection
  React.useEffect(() => {
    if (!selectedCollection && apiCollections.length > 0) {
      setSelectedCollection(apiCollections[0].uid);
    }
  }, [apiCollections, selectedCollection]);

  // Auto-update payload when collection or data changes
  React.useEffect(() => {
    if (!selectedCollection) return;

    console.log("🔄 Payload Effect:", {
      selectedCollection,
      hasCollectionData: !!collectionData?.data?.length,
      dataLength: collectionData?.data?.length,
      firstRecord: collectionData?.data?.[0]
    });

    if (collectionData?.data?.length > 0) {
      const firstRecord = collectionData.data[0];
      const samplePayload = {
        documentId: firstRecord.documentId,
        ...Object.keys(firstRecord)
          .filter(key => !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'content'].includes(key))
          .filter(key => firstRecord[key] !== null && firstRecord[key] !== undefined)
          .slice(0, 2) // Only first 2 non-null fields
          .reduce((obj, key) => {
            obj[key] = firstRecord[key];
            return obj;
          }, {} as any)
      };
      
      console.log("✅ Auto-generated payload:", samplePayload);
      setTestPayload(JSON.stringify(samplePayload, null, 2));
    } else if (collectionData && collectionData.data?.length === 0) {
      // Empty collection - provide create example
      console.log("⚠️ Empty collection, providing create example");
      setTestPayload(JSON.stringify({
        estado: "pendiente",
        resumen: "Test entry"
      }, null, 2));
    }
  }, [selectedCollection, collectionData]);

  // Get schema for selected collection
  const selectedSchema = useMemo(() => {
    if (!selectedCollection) return null;
    const schema = apiCollections.find(s => s.uid === selectedCollection);
    if (!schema) return null;
    
    return {
      ...schema.schema,
      uid: selectedCollection,
      primaryKey: "documentId",
      primaryField: "documentId",
    };
  }, [selectedCollection, apiCollections]);

  // CRUD Mutations for standalone testing
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", selectedCollection] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", selectedCollection] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", selectedCollection] });
    },
  });

  // Parse test payload
  const parsePayload = () => {
    try {
      return JSON.parse(testPayload);
    } catch {
      return null;
    }
  };

  // Test handlers
  const handleTestCreate = () => {
    const data = parsePayload();
    if (!data) {
      alert("Invalid JSON payload");
      return;
    }
    
    // Remove any IDs for create
    const { id, documentId, ...cleanData } = data;
    createMutation.mutate(cleanData);
  };

  const handleTestUpdate = () => {
    const data = parsePayload();
    if (!data) {
      alert("Invalid JSON payload");
      return;
    }
    
    console.log("🔍 Update Debug:", {
      originalData: data,
      sampleDocumentId,
      collectionData: collectionData?.data?.slice(0, 1) // First record only
    });
    
    const { id, documentId, ...updateData } = data;
    const recordId = documentId || id;
    
    if (!recordId) {
      const examplePayload = JSON.stringify({
        documentId: sampleDocumentId,
        estado: "procesado",
        resumen: "Updated test entry"
      }, null, 2);
      
      alert(`Update requires 'documentId' in payload.\n\nExample:\n${examplePayload}`);
      return;
    }
    
    console.log("📤 Sending UPDATE request:", {
      selectedCollection,
      recordId,
      updateData,
      url: `/api/strapi/collections/${btoa(selectedCollection)}/${recordId}`
    });
    
    updateMutation.mutate({ id: recordId, data: updateData });
  };

  const handleTestDelete = () => {
    const data = parsePayload();
    if (!data) {
      alert("Invalid JSON payload");
      return;
    }
    
    const recordId = data.documentId || data.id;
    if (!recordId) {
      const examplePayload = JSON.stringify({
        documentId: sampleDocumentId
      }, null, 2);
      
      alert(`Delete requires 'documentId' in payload.\n\nExample:\n${examplePayload}`);
      return;
    }
    
    deleteMutation.mutate(recordId);
  };

  // Sidebar with collection selector
  const sidebar = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Select Collection</h3>
        {isLoadingSchemas ? (
          <p className="text-sm text-gray-500">Loading collections...</p>
        ) : schemasError ? (
          <p className="text-sm text-red-600">Error loading collections</p>
        ) : (
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="Choose collection..." />
            </SelectTrigger>
            <SelectContent>
              {apiCollections.map((collection) => (
                <SelectItem key={collection.uid} value={collection.uid}>
                  {collection.schema.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {selectedCollection && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Collection Info</p>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">UID:</span> {selectedCollection}</p>
            <p><span className="font-medium">Records:</span> {collectionData?.meta?.pagination?.total || 0}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ThemeProvider>
      <AppLayout title="Strapi Diagnostics" sidebar={sidebar}>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Strapi API Diagnostics</h1>
            <p className="text-gray-600">Test CRUD operations on your Strapi collections</p>
          </div>

          {!selectedCollection ? (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">Select a collection from the sidebar to begin testing</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* API Testing Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">API Testing</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Test Payload (JSON)</label>
                      <Textarea
                        value={testPayload}
                        onChange={(e: any) => setTestPayload(e.target.value)}
                        rows={8}
                        className="font-mono text-xs"
                        placeholder='{"field": "value"}'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Create: data only | Update/Delete: include documentId
                      </p>
                    </div>

                    <div className="border-t my-4"></div>

                    <div className="space-y-2">
                      <Button 
                        onClick={handleTestCreate}
                        disabled={createMutation.isPending}
                        className="w-full"
                        size="sm"
                      >
                        {createMutation.isPending ? "Creating..." : "Test CREATE"}
                      </Button>
                      
                      <Button 
                        onClick={handleTestUpdate}
                        disabled={updateMutation.isPending}
                        variant="secondary"
                        className="w-full"
                        size="sm"
                      >
                        {updateMutation.isPending ? "Updating..." : "Test UPDATE"}
                      </Button>
                      
                      <Button 
                        onClick={handleTestDelete}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                        className="w-full"
                        size="sm"
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Test DELETE"}
                      </Button>
                    </div>

                    <div className="border-t my-4"></div>

                    {/* Status indicators */}
                    <div className="space-y-2 text-sm">
                      {createMutation.isSuccess && (
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">CREATE ✓</span>
                          <span className="text-green-600">Success</span>
                        </div>
                      )}
                      {createMutation.isError && (
                        <div className="flex items-center gap-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">CREATE ✗</span>
                          <span className="text-red-600 text-xs">
                            {(createMutation.error as Error)?.message}
                          </span>
                        </div>
                      )}
                      
                      {updateMutation.isSuccess && (
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">UPDATE ✓</span>
                          <span className="text-green-600">Success</span>
                        </div>
                      )}
                      {updateMutation.isError && (
                        <div className="flex items-center gap-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">UPDATE ✗</span>
                          <span className="text-red-600 text-xs">
                            {(updateMutation.error as Error)?.message}
                          </span>
                        </div>
                      )}
                      
                      {deleteMutation.isSuccess && (
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">DELETE ✓</span>
                          <span className="text-green-600">Success</span>
                        </div>
                      )}
                      {deleteMutation.isError && (
                        <div className="flex items-center gap-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">DELETE ✗</span>
                          <span className="text-red-600 text-xs">
                            {(deleteMutation.error as Error)?.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Collection Data & Table Operations</h3>
                  </div>
                  <div className="p-4">
                    {selectedSchema && (
                      <SmartDataTable
                        schema={selectedSchema}
                        data={collectionData?.data || []}
                        isLoading={isLoadingData}
                        pagination={{
                          pageCount: collectionData?.meta?.pagination?.pageCount || 1,
                          currentPage: collectionData?.meta?.pagination?.page || 1,
                          onPageChange: (page) => {
                            // Could implement page change here
                            console.log("Page change:", page);
                          },
                        }}
                        onCreate={(data) => {
                          console.log('🆕 CREATE raw data:', data);
                          
                          // Clean top-level auto-generated fields
                          const { id, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                          
                          // Clean media fields - remove documentId from uploaded files
                          const processedData = { ...cleanData };
                          
                          // Process each field to clean media objects
                          Object.keys(processedData).forEach(key => {
                            const value = processedData[key];
                            
                            if (Array.isArray(value)) {
                              // Handle media arrays - remove documentId from each media object
                              processedData[key] = value.map(item => {
                                if (item && typeof item === 'object' && item.documentId) {
                                  const { documentId: mediaDocId, ...cleanMedia } = item;
                                  return cleanMedia;
                                }
                                return item;
                              });
                            } else if (value && typeof value === 'object' && value.documentId) {
                              // Handle single media object - remove documentId
                              const { documentId: mediaDocId, ...cleanMedia } = value;
                              processedData[key] = cleanMedia;
                            }
                          });
                          
                          console.log('🆕 CREATE data cleaned:', { original: data, cleaned: processedData });
                          return createMutation.mutateAsync(processedData);
                        }}
                        onUpdate={(id, data) => {
                          console.log('✏️ UPDATE raw data:', { id, data });
                          
                          // Clean all auto-generated fields from UPDATE data
                          const { id: dataId, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                          
                          // Clean media fields - remove documentId from uploaded files
                          const processedData = { ...cleanData };
                          
                          // Process each field to clean media objects
                          Object.keys(processedData).forEach(key => {
                            const value = processedData[key];
                            
                            if (Array.isArray(value)) {
                              // Handle media arrays - remove documentId from each media object
                              processedData[key] = value.map(item => {
                                if (item && typeof item === 'object' && item.documentId) {
                                  const { documentId: mediaDocId, ...cleanMedia } = item;
                                  return cleanMedia;
                                }
                                return item;
                              });
                            } else if (value && typeof value === 'object' && value.documentId) {
                              // Handle single media object - remove documentId
                              const { documentId: mediaDocId, ...cleanMedia } = value;
                              processedData[key] = cleanMedia;
                            }
                          });
                          
                          console.log('✏️ UPDATE data cleaned:', { id, original: data, cleaned: processedData });
                          return updateMutation.mutateAsync({ id, data: processedData });
                        }}
                        onDelete={(id) => deleteMutation.mutateAsync(id)}
                      />
                    )}
                    
                    {dataError && (
                      <div className="text-center py-8">
                        <p className="text-red-600">Error loading collection data</p>
                        <p className="text-sm text-gray-500">{(dataError as Error).message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </ThemeProvider>
  );
}