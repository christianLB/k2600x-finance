"use client";
import React, { useMemo, useEffect } from "react";
import useStrapiSchema from "../../../hooks/useStrapiSchema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppShellLayout } from "../../../components/layout";

// Remove the direct import of useStrapiCollection since we're now using CollectionDataTable
// import { useStrapiCollection } from "../../../modules/finance-dashboard/hooks/useStrapiCollection";
// Remove direct import of SmartDataTable as we're now using the wrapped component
// import SmartDataTable from "../../../modules/finance-dashboard/components/SmartDataTable";
import { CollectionDataTable } from "../../../modules/finance-dashboard/components/CollectionDataTable";

interface StrapiSchema {
  uid: string;
  kind: "collectionType" | "singleType";
  info: {
    displayName: string;
  };
}

export default function AdminFinanceDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  

  const { data: schemaData, isLoading: schemasLoading } = useStrapiSchema();

  const schemas: StrapiSchema[] = useMemo(() => {
    return (schemaData || []).filter(
      (s: StrapiSchema) =>
        s.kind === "collectionType" && s.uid.startsWith("api::")
    );
  }, [schemaData]);

  const selectedModelFromParams = searchParams.get("collection");

  useEffect(() => {
    if (!schemasLoading && !selectedModelFromParams && schemas.length > 0) {
      router.replace(`${pathname}?collection=${schemas[0].uid}`);
    }
  }, [schemasLoading, selectedModelFromParams, schemas, router, pathname]);

  const selectedModel = selectedModelFromParams || "";

  // We no longer need to use useStrapiCollection directly
  // All data fetching is now handled by CollectionDataTable

  const sidebarItems = useMemo(() => {
    return schemas.map((s: StrapiSchema) => ({
      label: s.info.displayName,
      href: `${pathname}?collection=${s.uid}`,
    }));
  }, [schemas, pathname]);

  const navbarItems = [
    { label: "Admin Dashboard", href: "/admin/finance-dashboard" },
  ];

  // We no longer need to convert pagination format for SmartDataTable
  // Pagination is now handled internally by CollectionDataTable

  return (
    <AppShellLayout navbarItems={navbarItems} sidebarItems={sidebarItems}>
      <div className="flex flex-col gap-8">
        {schemasLoading ? (
          <div className="p-4 text-center">Loading schemas...</div>
        ) : selectedModel ? (
          <section>
            <h1 className="text-2xl font-bold mb-4">
              {
                schemas.find((s: StrapiSchema) => s.uid === selectedModel)?.info
                  .displayName
              }
            </h1>
            <CollectionDataTable 
              collectionUid={selectedModel} 
              initialPageSize={10}
            />
          </section>
        ) : (
          <div className="p-4">
            <h1 className="text-2xl font-bold">No Collections Found</h1>
            <p>Could not find any collections in your Strapi instance.</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure your Strapi server is running and accessible.
            </p>
          </div>
        )}
      </div>
    </AppShellLayout>
  );
}
