"use client";
import React from 'react';
import { Table } from '@k2600x/design-system';
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

  return <Table data={data} columns={columns as any} />;
}

export default AccountList;
