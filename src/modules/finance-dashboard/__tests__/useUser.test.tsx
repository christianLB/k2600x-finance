/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useUser } from '../hooks/useUser';
import { strapiService } from '@/services/strapiService';

jest.mock('@/services/strapiService');

describe('useUser', () => {
  function TestComponent() {
    const { user, loading } = useUser();
    if (loading) return <div>Loading</div>;
    return <div>{user?.username}</div>;
  }

  test('fetches current user and renders username', async () => {
    (strapiService.getCollection as jest.Mock).mockResolvedValue({
      user: { id: 1, username: 'tester', email: 't@test.com' },
    });

    render(<TestComponent />);

    expect(strapiService.getCollection).toHaveBeenCalledWith('me');

    await waitFor(() => {
      expect(screen.getByText('tester')).toBeTruthy();
    });
  });
});
