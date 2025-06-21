/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useFinanceData } from '../hooks/useFinanceData';
import strapi from '@/services/strapi';

jest.mock('@/services/strapi');

describe('useFinanceData', () => {
  function TestComponent() {
    const { data, loading } = useFinanceData();
    if (loading) return <div>Loading</div>;
    return <div>count:{data.length}</div>;
  }

  test('fetches data on mount and displays length', async () => {
    (strapi.post as jest.Mock).mockResolvedValue({
      data: [{ id: 1, name: 'A', amount: 10 }],
    });

    render(<TestComponent />);

    expect(strapi.post).toHaveBeenCalledWith({ method: 'GET', collection: 'finance-data' });

    await waitFor(() => {
      expect(screen.getByText('count:1')).toBeTruthy();
    });
  });
});
