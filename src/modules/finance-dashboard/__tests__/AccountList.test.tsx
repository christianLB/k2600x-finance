/**
 * @jest-environment jsdom
 */
import React from 'react';
import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { AccountList } from '../components/AccountList';
import { useAccounts } from '../hooks/useAccounts';

jest.mock('../hooks/useAccounts');

jest.mock('@k2600x/design-system', () => {
  const React = require('react');
  return {
    Table: ({ data, columns }: any) => (
      <table>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id}>
              {columns.map((c: any) => (
                <td key={c.accessorKey}>{row[c.accessorKey]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

describe('AccountList', () => {
  test('renders accounts from hook', () => {
    (useAccounts as jest.Mock).mockReturnValue({
      data: [{ id: 1, name: 'Test', balance: 20 }],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<AccountList />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
