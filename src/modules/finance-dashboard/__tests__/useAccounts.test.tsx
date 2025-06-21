/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAccounts } from '../hooks/useAccounts';
import { fetchAccounts } from '@/services/accountService';

jest.mock('@/services/accountService');

describe('useAccounts', () => {
  function TestComponent() {
    const { data, loading } = useAccounts();
    if (loading) return <div>Loading</div>;
    return <div>count:{data.length}</div>;
  }

  test('fetches account data and displays length', async () => {
    (fetchAccounts as jest.Mock).mockResolvedValue([
      { id: 1, name: 'A', balance: 10 },
    ]);

    render(<TestComponent />);

    expect(fetchAccounts).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('count:1')).toBeTruthy();
    });
  });
});
