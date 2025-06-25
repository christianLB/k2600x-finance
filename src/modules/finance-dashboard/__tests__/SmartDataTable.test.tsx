/**
 * @jest-environment jsdom
 */
import React from 'react';
import "@testing-library/jest-dom";
import { render, fireEvent, screen } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { SmartDataTable } from '../components/SmartDataTable';

jest.mock('../../../components/dynamic-form/DynamicStrapiForm', () => ({
  DynamicStrapiForm: () => <div>DynamicForm</div>,
}));

describe('SmartDataTable', () => {
  const data = [{ id: 1, name: 'A', amount: 10 }];
  const columns: ColumnDef<typeof data[0]>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'amount', header: 'Amount' },
  ];

  test('opens edit dialog when edit button clicked', () => {
    render(
      <SmartDataTable
        data={data}
        columns={columns}
        pagination={{ totalItems: 1, itemsPerPage: 10, currentPage: 1 }}
        onMutationSuccess={jest.fn()}
        onPageChange={jest.fn()}
        collection="finance-data"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByText('Edit Record')).toBeInTheDocument();
  });
});
