"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AppShellLayout } from "@/components/layout";
import { DynamicForm } from "@/modules/finance-dashboard/components/DynamicForm";
import { SmartDataTable } from "@/modules/finance-dashboard/components/SmartDataTable";
import { useStrapiCollection } from "@/modules/finance-dashboard/hooks/useStrapiCollection";
import { useStrapiForm } from "@/modules/finance-dashboard/hooks/useStrapiForm";
import useStrapiSchema from "@/hooks/useStrapiSchema";

export default function AdminFinanceDashboardPage() {
  const { schemas } = useStrapiSchema();
  const [model, setModel] = useState<string>(schemas[0]?.uid || "");

  const { data, columns, pagination, refetch } = useStrapiCollection(model);
  const { schema, defaultValues, fields, onSubmit } = useStrapiForm(model, "update");

  const handlePageChange = () => {
    refetch();
  };

  return (
    <AppShellLayout title="Admin v2: Dynamic Collections" navbarItems={[]} sidebarItems={[]}> 
      <div className="p-4 space-y-6">
        <div className="flex space-x-4 mb-4">
          <Link href="/admin" className="underline hover:text-primary">
            Go to Admin v1
          </Link>
          <Link href="/admin/finance-dashboard" className="underline font-semibold hover:text-primary">
            Admin v2 (Current)
          </Link>
        </div>

        <section>
          <label htmlFor="collection-select" className="block mb-2 font-medium text-sm">Select Collection</label>
          <select
            id="collection-select"
            className="p-2 border rounded"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {schemas.map((s) => (
              <option key={s.uid} value={s.uid}>
                {s.info.displayName}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h2 className="text-lg font-semibold">List of {model}</h2>
          <SmartDataTable
            data={data}
            columns={columns}
            pagination={{
              totalItems: pagination.total,
              itemsPerPage: pagination.pageSize,
              currentPage: pagination.page,
            }}
            onEdit={(row) => {
              onSubmit(row);
              refetch();
            }}
            onPageChange={handlePageChange}
            collection={model}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold">Edit or Create {model}</h2>
          <DynamicForm
            schema={schema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={async (values) => {
              await onSubmit(values);
              refetch();
            }}
          />
        </section>
      </div>
    </AppShellLayout>
  );
}

