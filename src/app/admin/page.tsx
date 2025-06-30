"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ThemeProvider,
  AppLayout,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Badge,
} from "@k2600x/design-system";
import SmartDataTable from "@/modules/finance-dashboard/components/SmartDataTable";
import { useRouter, useSearchParams } from "next/navigation";
import { FinanceDashboardView } from "./components/FinanceDashboardView";
import { DiagnosticsView } from "./components/DiagnosticsView";

type ViewType = 'collections' | 'finance-dashboard' | 'diagnostics';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewType>('collections');

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
        `/api/strapi/collections/${btoa(selectedCollection)}?page=1&pageSize=25`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!selectedCollection,
  });

  // Auto-select collection and view from URL
  React.useEffect(() => {
    const collectionFromUrl = searchParams.get('collection');
    const viewFromUrl = searchParams.get('view') as ViewType;
    
    if (viewFromUrl && ['finance-dashboard', 'diagnostics'].includes(viewFromUrl)) {
      setCurrentView(viewFromUrl);
    } else if (collectionFromUrl && apiCollections.some(c => c.uid === collectionFromUrl)) {
      setSelectedCollection(collectionFromUrl);
      setCurrentView('collections');
    } else if (!selectedCollection && apiCollections.length > 0) {
      setSelectedCollection(apiCollections[0].uid);
      setCurrentView('collections');
    }
  }, [apiCollections, selectedCollection, searchParams]);

  const handleCollectionChange = (collectionUid: string) => {
    setSelectedCollection(collectionUid);
    setCurrentView('collections');
    router.push(`/admin?collection=${encodeURIComponent(collectionUid)}`, { scroll: false });
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === 'collections') {
      router.push('/admin', { scroll: false });
    } else {
      router.push(`/admin?view=${view}`, { scroll: false });
    }
  };

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

  const navbarItems = [
    { label: "Finance Dashboard", href: "/finance-dashboard" },
    { label: "Admin", href: "/admin", active: true },
  ];

  // Sidebar with collection links
  const sidebar = (
    <div className="flex flex-col h-full w-72 min-w-72">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Content Management</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your collections</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">Collections</h3>
            {isLoadingSchemas ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-9 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : schemasError ? (
              <p className="text-sm text-destructive">Error loading collections</p>
            ) : (
              <div className="space-y-1">
                {apiCollections.map((collection) => {
                  const isActive = selectedCollection === collection.uid;
                  const recordCount = selectedCollection === collection.uid ? collectionData?.meta?.pagination?.total : null;
                  
                  return (
                    <Button
                      key={collection.uid}
                      variant="ghost"
                      className={`w-full justify-between h-auto p-3 text-left ${isActive && currentView === 'collections' ? 'bg-muted' : ''}`}
                      onClick={() => handleCollectionChange(collection.uid)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{collection.schema.displayName}</span>
                        <span className="text-xs text-muted-foreground">{collection.uid}</span>
                      </div>
                      {recordCount !== null && (
                        <Badge className="ml-2">
                          {recordCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">Navigation</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className={`w-full justify-start h-auto p-2 ${currentView === 'finance-dashboard' ? 'bg-muted' : ''}`}
            onClick={() => handleViewChange('finance-dashboard')}
          >
            Finance Dashboard
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`w-full justify-start h-auto p-2 ${currentView === 'diagnostics' ? 'bg-muted' : ''}`}
            onClick={() => handleViewChange('diagnostics')}
          >
            Diagnostics
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <AppLayout 
        title="Admin - Content Management"
        sidebar={sidebar}
      >
        <div className="space-y-6">
          {currentView === 'finance-dashboard' && <FinanceDashboardView />}
          
          {currentView === 'diagnostics' && (
            <DiagnosticsView 
              schemas={schemas}
              isLoadingSchemas={isLoadingSchemas}
              schemasError={schemasError}
            />
          )}
          
          {currentView === 'collections' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {selectedCollection 
                      ? apiCollections.find(c => c.uid === selectedCollection)?.schema.displayName
                      : "Content Management"
                    }
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCollection 
                      ? `${collectionData?.meta?.pagination?.total || 0} records in ${selectedCollection}`
                      : "Select a collection to manage content"
                    }
                  </p>
                </div>
                {selectedCollection && (
                  <Badge className="text-xs">
                    {selectedCollection}
                  </Badge>
                )}
              </div>

              {!selectedCollection ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apiCollections.map((collection) => (
                    <Card 
                      key={collection.uid} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCollectionChange(collection.uid)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{collection.schema.displayName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{collection.uid}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {collection.schema.description || "Manage records in this collection"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Click to manage</span>
                          <Button size="sm" variant="ghost">Open →</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
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
                        onCreate={async (data) => {
                          console.log('🆕 CREATE:', data);
                          const { id, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                          
                          const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(cleanData),
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || `HTTP ${response.status}`);
                          }
                          
                          return response.json();
                        }}
                        onUpdate={async (id, data) => {
                          console.log('✏️ UPDATE:', { id, data });
                          const { id: dataId, documentId, createdAt, updatedAt, publishedAt, ...cleanData } = data;
                          
                          const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(cleanData),
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || `HTTP ${response.status}`);
                          }
                          
                          return response.json();
                        }}
                        onDelete={async (id) => {
                          console.log('🗑️ DELETE:', id);
                          const response = await fetch(`/api/strapi/collections/${btoa(selectedCollection)}/${id}`, {
                            method: 'DELETE',
                          });
                          
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || `HTTP ${response.status}`);
                          }
                          
                          return { success: true };
                        }}
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
              )}
            </>
          )}
        </div>
      </AppLayout>
    </ThemeProvider>
  );
}
