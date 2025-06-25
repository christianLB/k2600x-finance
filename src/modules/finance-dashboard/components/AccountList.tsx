"use client";
import React from 'react';
import { SmartDataTable as Table, PaginationState } from '@/modules/finance-dashboard/components/SmartDataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { useAccounts } from '../hooks/useAccounts';
import type { Account } from '../schemas/accountSchemas';

export function AccountList() {
  const { data, loading, error } = useAccounts();

  const columns: ColumnDef<Account>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => Number(row.original.balance).toFixed(2),
    },
  ];

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-destructive">{error}</div>;

  const pagination: PaginationState = { totalItems: data.length, itemsPerPage: data.length, currentPage: 1 };
  return (
    <Table
      data={data}
      columns={columns as any}
      pagination={pagination}
      onPageChange={() => {}}
      collection="accounts"
    />
  );
}

export default AccountList;
