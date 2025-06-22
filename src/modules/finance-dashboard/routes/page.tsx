'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider, AppShellLayout } from '@k2600x/design-system';
import { useUser } from '../hooks/useUser';
import { useStrapiSchema } from '../hooks/useStrapiSchema';
import { useStrapiCollection } from '../hooks/useStrapiCollection';
import { useStrapiForm } from '../hooks/useStrapiForm';
import { SmartDataTable } from '../components/SmartDataTable';
import { DynamicForm } from '../components/DynamicForm';

export default function FinanceDashboardPage() {
  const { user, loading: userLoading } = useUser();
  if (userLoading) return <div>Cargando sesión...</div>;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4">Debes iniciar sesión para acceder al admin.</p>
        <button
          onClick={() => (window.location.href = '/admin')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Ir a Login
        </button>
      </div>
    );
  }

  const { schemas, loading: schemasLoading, error: schemasError } = useStrapiSchema();
  const [model, setModel] = useState<string>('');
  if (schemasLoading) return <div>Cargando esquemas...</div>;
  if (schemasError || schemas.length === 0) return <div>Error al cargar esquemas</div>;
  if (!model) setModel(schemas[0].uid);

  const { data, columns, pagination, refetch } = useStrapiCollection(model);
  const { schema, defaultValues, fields, onSubmit } = useStrapiForm(model, 'update');

  return (
    <ThemeProvider initialTheme="futuristic">
      <AppShellLayout title="Admin v2: Dynamic Collections" theme="futuristic">
        <div className="p-4 space-y-6">
          <div className="flex space-x-4 mb-4">
            <Link href="/admin" className="underline">Admin v1</Link>
            <Link href="/admin/finance-dashboard" className="underline font-semibold">Admin v2</Link>
          </div>
          <section>
            <label htmlFor="collection-select" className="block mb-2 font-medium text-sm">Colección</label>
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
            <h2 className="text-lg font-semibold">Listado de {model}</h2>
            <SmartDataTable
              data={data}
              columns={columns}
              pagination={pagination}
              onPageChange={() => {}}
              onEdit={(row) => {
                onSubmit(row);
                refetch();
              }}
              collection={model}
            />
          </section>
          <section>
            <h2 className="text-lg font-semibold">Editar / Crear {model}</h2>
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
    </ThemeProvider>
  );
}
