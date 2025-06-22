/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useStrapiSchema } from '../hooks/useStrapiSchema';
import { strapiService } from '@/services/strapiService';

jest.mock('@/services/strapiService');

describe('useStrapiSchema', () => {
  function TestComponent() {
    const { schemas, loading } = useStrapiSchema();
    if (loading) return <div>Loading</div>;
    return <div>count:{schemas.length}</div>;
  }

  test('fetches schemas on mount', async () => {
    (strapiService.getCollection as jest.Mock).mockResolvedValue({
      data: { data: [{ uid: 'a', info: { displayName: 'A' }, attributes: {} }] },
    });

    render(<TestComponent />);

    expect(strapiService.getCollection).toHaveBeenCalledWith(
      'content-type-builder/content-types'
    );

    await waitFor(() => {
      expect(screen.getByText('count:1')).toBeTruthy();
    });
  });
});
