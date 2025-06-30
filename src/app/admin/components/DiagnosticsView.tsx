"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Alert,
} from "@k2600x/design-system";
import SmartDataTable from "@/modules/finance-dashboard/components/SmartDataTable";

interface DiagnosticsViewProps {
  schemas: any[];
  isLoadingSchemas: boolean;
  schemasError: any;
}

export function DiagnosticsView({ schemas, isLoadingSchemas, schemasError }: DiagnosticsViewProps) {
  const queryClient = useQueryClient();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [testPayload, setTestPayload] = useState<string>('');

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
    queryKey: ["diagnostics-collection", selectedCollection, 1],
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

  // Auto-select first collection
  React.useEffect(() => {
    if (!selectedCollection && apiCollections.length > 0) {
      setSelectedCollection(apiCollections[0].uid);
    }
  }, [apiCollections, selectedCollection]);

  // Auto-update payload when collection or data changes
  React.useEffect(() => {
    if (!selectedCollection) return;

    if (collectionData?.data?.length > 0) {
      const firstRecord = collectionData.data[0];
      const samplePayload = {
        documentId: firstRecord.documentId,
        ...Object.keys(firstRecord)
          .filter(key => !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'content'].includes(key))
          .filter(key => firstRecord[key] !== null && firstRecord[key] !== undefined)
          .slice(0, 2)
          .reduce((obj, key) => {
            obj[key] = firstRecord[key];
            return obj;
          }, {} as any)
      };
      
      setTestPayload(JSON.stringify(samplePayload, null, 2));
    } else if (collectionData && collectionData.data?.length === 0) {
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

  // CRUD Mutations
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
      queryClient.invalidateQueries({ queryKey: ["diagnostics-collection", selectedCollection] });
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
      queryClient.invalidateQueries({ queryKey: ["diagnostics-collection", selectedCollection] });
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
      queryClient.invalidateQueries({ queryKey: ["diagnostics-collection", selectedCollection] });
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
    
    const { id, documentId, ...cleanData } = data;
    createMutation.mutate(cleanData);
  };

  const handleTestUpdate = () => {
    const data = parsePayload();
    if (!data) {
      alert("Invalid JSON payload");
      return;
    }
    
    const { id, documentId, ...updateData } = data;
    const recordId = documentId || id;
    
    if (!recordId) {
      alert(`Update requires 'documentId' in payload.`);
      return;
    }
    
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
      alert(`Delete requires 'documentId' in payload.`);
      return;
    }
    
    deleteMutation.mutate(recordId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strapi API Diagnostics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test CRUD operations on your Strapi collections
        </p>
      </div>

      {!selectedCollection ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select a Collection</h3>
              <p className="text-muted-foreground">
                Choose a collection to begin testing
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Selector */}
          <div className="lg:col-span-3 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Collection Selection</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSchemas ? (
                  <p className="text-sm text-muted-foreground">Loading collections...</p>
                ) : schemasError ? (
                  <p className="text-sm text-destructive">Error loading collections</p>
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
              </CardContent>
            </Card>
          </div>

          {/* API Testing Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>API Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Payload (JSON)</label>
                  <Textarea
                    value={testPayload}
                    onChange={(e: any) => setTestPayload(e.target.value)}
                    rows={8}
                    className="font-mono text-xs"
                    placeholder='{"field": "value"}'
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Create: data only | Update/Delete: include documentId
                  </p>
                </div>

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

                {/* Status indicators */}
                <div className="space-y-2 text-sm">
                  {createMutation.isSuccess && (
                    <Alert>CREATE ✓ Success</Alert>
                  )}
                  {createMutation.isError && (
                    <Alert variant="destructive">
                      CREATE ✗ {(createMutation.error as Error)?.message}
                    </Alert>
                  )}
                  
                  {updateMutation.isSuccess && (
                    <Alert>UPDATE ✓ Success</Alert>
                  )}
                  {updateMutation.isError && (
                    <Alert variant="destructive">
                      UPDATE ✗ {(updateMutation.error as Error)?.message}
                    </Alert>
                  )}
                  
                  {deleteMutation.isSuccess && (
                    <Alert>DELETE ✓ Success</Alert>
                  )}
                  {deleteMutation.isError && (
                    <Alert variant="destructive">
                      DELETE ✗ {(deleteMutation.error as Error)?.message}
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Data & Table Operations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {collectionData?.meta?.pagination?.total || 0} records
                </p>
              </CardHeader>
              <CardContent>
                {selectedSchema && (
                  <SmartDataTable
                    schema={selectedSchema}
                    data={collectionData?.data || []}
                    isLoading={isLoadingData}
                    pagination={{
                      pageCount: collectionData?.meta?.pagination?.pageCount || 1,
                      currentPage: collectionData?.meta?.pagination?.page || 1,
                      onPageChange: (page) => {
                        console.log("Page change:", page);
                      },
                    }}
                    onCreate={(data) => {
                      const { id, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                      return createMutation.mutateAsync(cleanData);
                    }}
                    onUpdate={(id, data) => {
                      const { id: dataId, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                      return updateMutation.mutateAsync({ id, data: cleanData });
                    }}
                    onDelete={(id) => deleteMutation.mutateAsync(id)}
                  />
                )}
                
                {dataError && (
                  <div className="text-center py-8">
                    <p className="text-destructive">Error loading collection data</p>
                    <p className="text-sm text-muted-foreground">{(dataError as Error).message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}