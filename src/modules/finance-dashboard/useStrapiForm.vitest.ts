import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStrapiForm } from './hooks/useStrapiForm';
import strapi from '@/services/strapi';

vi.mock('@/services/strapi');

const mockSchema = {
  data: [
    {
      uid: 'api::finance-record.finance-record',
      schema: {
        attributes: {
          title: { type: 'string', required: true },
          amount: { type: 'integer' },
        },
      },
    },
  ],
};

describe('useStrapiForm', () => {
  beforeEach(() => {
    (strapi.post as any).mockResolvedValue(mockSchema);
  });

  it('generates schema and default values from strapi model', async () => {
    const { result } = renderHook(() => useStrapiForm('api::finance-record.finance-record', 'create'));
    await waitFor(() => result.current.fields.length > 0);
    expect(Object.keys(result.current.defaultValues)).toEqual(['title', 'amount']);
    expect(result.current.defaultValues.title).toBe('');
    expect(result.current.defaultValues.amount).toBeUndefined();
    expect((result.current.schema as any).shape.title).toBeDefined();
    expect((result.current.schema as any).shape.amount).toBeDefined();
  });
});
