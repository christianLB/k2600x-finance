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

  const { data, columns, pagination, refetch } = useStrapiCollection(selectedModel);

  const sidebarItems = useMemo(() => {
    return schemas.map((s: StrapiSchema) => ({
      label: s.info.displayName,
      href: `${pathname}?collection=${s.uid}`,
    }));
  }, [schemas, pathname]);

  const navbarItems = [{ label: "Admin Dashboard", href: "/admin/finance-dashboard" }];

  const tablePagination = {
    currentPage: pagination.page,
    itemsPerPage: pagination.pageSize,
    totalItems: pagination.total,
  };

  return (
    <AppShellLayout navbarItems={navbarItems} sidebarItems={sidebarItems}>
      <div className="flex flex-col gap-8">
        {schemasLoading ? (
          <div>Loading schemas...</div>
        ) : selectedModel ? (
          <section>
            <h1 className="text-2xl font-bold mb-4">
              {schemas.find((s: StrapiSchema) => s.uid === selectedModel)?.info.displayName}
            </h1>
            <SmartDataTable
              data={data}
              columns={columns}
              pagination={tablePagination}
              onEdit={(row) => {
                console.log("Editing row:", row);
              }}
              onPageChange={() => refetch()}
              collection={selectedModel}
            />
          </section>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">No Collections Found</h1>
            <p>Could not find any collections in your Strapi instance.</p>
          </div>
        )}
      </div>
    </AppShellLayout>
  );
}
