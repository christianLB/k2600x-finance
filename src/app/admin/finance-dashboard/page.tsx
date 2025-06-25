"use client";
import React, { useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppShellLayout } from "../../../components/layout";
import { useStrapiSchema } from "../../../modules/finance-dashboard/hooks/useStrapiSchema";
import { useStrapiCollection } from "../../../modules/finance-dashboard/hooks/useStrapiCollection";
import { SmartDataTable } from "../../../modules/finance-dashboard/components/SmartDataTable";

interface StrapiSchema {
  uid: string;
  kind: 'collectionType' | 'singleType';
  info: {
    displayName: string;
  };
}

export default function AdminFinanceDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { schemas: schemaData, loading: schemasLoading } = useStrapiSchema();

  const schemas: StrapiSchema[] = useMemo(() => {
    return (schemaData || []).filter(
      (s: StrapiSchema) => s.kind === 'collectionType' && s.uid.startsWith('api::')
    );
  }, [schemaData]);

  const selectedModelFromParams = searchParams.get("collection");

  useEffect(() => {
    if (!schemasLoading && !selectedModelFromParams && schemas.length > 0) {
      router.replace(`${pathname}?collection=${schemas[0].uid}`);
    }
  }, [schemasLoading, selectedModelFromParams, schemas, router, pathname]);

  const selectedModel = selectedModelFromParams || "";

  // Use the enhanced useStrapiCollection hook with proper options
  const { 
    data, 
    columns, 
    pagination, 
    loading: collectionLoading, 
    error: collectionError,
    refetch,
    setPage
  } = useStrapiCollection(selectedModel, {
    initialPageSize: 10
  });

  const sidebarItems = useMemo(() => {
    return schemas.map((s: StrapiSchema) => ({
      label: s.info.displayName,
      href: `${pathname}?collection=${s.uid}`,
    }));
  }, [schemas, pathname]);

  const navbarItems = [{ label: "Admin Dashboard", href: "/admin/finance-dashboard" }];

  // Convert pagination format for SmartDataTable
  const tablePagination = {
    currentPage: pagination.page,
    itemsPerPage: pagination.pageSize,
    totalItems: pagination.total,
  };

  return (
    <AppShellLayout navbarItems={navbarItems} sidebarItems={sidebarItems}>
      <div className="flex flex-col gap-8">
        {schemasLoading ? (
          <div className="p-4 text-center">Loading schemas...</div>
        ) : selectedModel ? (
          <section>
            <h1 className="text-2xl font-bold mb-4">
              {schemas.find((s: StrapiSchema) => s.uid === selectedModel)?.info.displayName}
            </h1>
            {collectionLoading ? (
              <div className="p-4 text-center">Loading data...</div>
            ) : collectionError ? (
              <div className="p-4 text-center text-red-500">
                Error loading data: {collectionError.message}
              </div>
            ) : (
              <SmartDataTable
                data={data}
                columns={columns}
                pagination={tablePagination}
                onPageChange={(page) => setPage(page)}
                onMutationSuccess={() => refetch()}
                collection={selectedModel}
              />
            )}
          </section>
        ) : (
          <div className="p-4">
            <h1 className="text-2xl font-bold">No Collections Found</h1>
            <p>Could not find any collections in your Strapi instance.</p>
            <p className="text-sm text-gray-500 mt-2">Make sure your Strapi server is running and accessible.</p>
          </div>
        )}
      </div>
    </AppShellLayout>
  );
}
