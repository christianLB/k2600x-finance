import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useStrapiCollection } from './hooks/useStrapiCollection';
import strapi from '@/services/strapi';

vi.mock('@/services/strapi');

const mockSchema = {
  data: [
    {
      uid: 'api::record.record',
      schema: {
        attributes: {
          title: { type: 'string' },
          amount: { type: 'integer' },
        },
      },
    },
  ],
};

const mockData = {
  data: [{ id: 1, title: 'A', amount: 10 }],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 } },
};

describe('useStrapiCollection', () => {
  it('fetches schema and data, generating columns', async () => {
    (strapi.post as any).mockResolvedValueOnce(mockSchema);
    (strapi.post as any).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useStrapiCollection('api::record.record'));

    await waitFor(() => result.current.columns.length > 0);
    await waitFor(() => result.current.data.length > 0);

    expect(result.current.data).toEqual(mockData.data);
    expect(result.current.columns.map((c) => c.accessorKey)).toEqual(['title', 'amount']);
    expect(result.current.pagination.total).toBe(1);
  });
});
