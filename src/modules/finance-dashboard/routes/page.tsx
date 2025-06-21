'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { ThemeProvider } from '@k2600x/design-system';
import { AppShellLayout } from '@/components/layout';
import { DynamicForm } from '../components/DynamicForm';
import { SmartDataTable } from '../components/SmartDataTable';
import { useStrapiCollection } from '../hooks/useStrapiCollection';
import { useStrapiForm } from '../hooks/useStrapiForm';
import useStrapiSchema from '@/hooks/useStrapiSchema';

export default function FinanceDashboardModulePage() {
  // Manejo de sesión similar a Admin v1
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Cargando sesión...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Debes iniciar sesión para acceder al admin.</p>
        <button
          onClick={() => signIn()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  const { data: schemaData } = useStrapiSchema();
  const schemas = Array.isArray(schemaData?.data) ? schemaData.data : [];
  const [model, setModel] = useState<string>('');

  useEffect(() => {
    if (!model && schemas.length > 0) {
      setModel(schemas[0].uid);
    }
  }, [model, schemas]);

  const { data, columns, pagination, refetch } = useStrapiCollection(model);
  const { schema, defaultValues, fields, onSubmit } = useStrapiForm(model, 'update');

  const handlePageChange = () => {
    refetch();
  };

  return (
    <ThemeProvider initialTheme="futuristic">
      <AppShellLayout navbarItems={[]} sidebarItems={[]}>
        <div className="p-4 space-y-6">
          <div className="flex space-x-4 mb-4">
            <Link href="/admin" className="underline hover:text-primary">
              Ir a Admin v1
            </Link>
            <Link
              href="/admin/finance-dashboard"
              className="underline font-semibold hover:text-primary"
            >
              Admin v2 (Actual)
            </Link>
          </div>

          <section>
            <label htmlFor="collection-select" className="block mb-2 font-medium text-sm">
              Colección
            </label>
            <select
              id="collection-select"
              className="p-2 border rounded"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {schemas.map((s: any) => (
                <option key={s.uid} value={s.uid}>
                  {s.info.displayName}
                </option>
              ))}
            </select>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Listado de {model}</h2>
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
            <h2 className="text-lg font-semibold">Editar / Crear {model}</h2>
            <DynamicForm
              schema={schema as any}
              fields={fields as any}
              defaultValues={defaultValues}
              onSubmit={async (values) => {
                await onSubmit(values);
                refetch();
              }}
            />
          </section>
        </div>
      </AppShellLayout>
    </ThemeProvider>
  );
}
