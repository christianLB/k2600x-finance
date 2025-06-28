"use client";

import React from "react";
import SmartDataTable from "./SmartDataTable";
import { useCollectionData } from "../hooks/useCollectionData";

interface CollectionDataTableProps {
  collectionUid: string;
  initialPageSize?: number;
  initialPage?: number;
  initialSort?: string;
  filters?: Record<string, any>;
  populate?: string | string[] | Record<string, any>;
}

/**
 * Connected component that fetches collection data from the server-side API
 * and renders it using the SmartDataTable presentational component.
 * 
 * This component encapsulates all data fetching and CRUD operations
 * while using only server-side API routes, never directly calling Strapi.
 */
export function CollectionDataTable({
  collectionUid,
  initialPageSize = 10,
  initialPage = 1,
  initialSort,
  filters,
  populate = "*",
}: CollectionDataTableProps) {
  const {
    data,
    columns,
    pagination,
    loading,
    error,
    create,
    update,
    remove,
    setPage,
  } = useCollectionData(collectionUid, {
    initialPageSize,
    initialPage,
    initialSort,
    filters,
    populate,
    enabled: !!collectionUid,
  });

  if (error) {
    return (
      <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">
        Error: {error.message || "Failed to load collection data"}
      </div>
    );
  }

  // Construct the schema object required by SmartDataTable
  // This is derived from the collection UID and other data
  const schema = {
    uid: collectionUid,
    primaryKey: "id",
    primaryField: "id", // This should ideally be derived from the schema
    attributes: columns.reduce((acc, col) => {
      acc[col.accessorKey] = { type: "string" }; // Default to string type
      return acc;
    }, {} as Record<string, { type: string; relation?: { targetUID: string } }>),
  };

  // Transform pagination structure to match what SmartDataTable expects
  const tablePagination = {
    pageCount: pagination.pageCount,
    currentPage: pagination.page,
    onPageChange: setPage,
  };

  return (
    <SmartDataTable
      schema={schema}
      data={data}
      isLoading={loading}
      onCreate={create}
      onUpdate={(id, values) => update({ id, ...values })}
      onDelete={remove}
      pagination={tablePagination}
    />
  );
}
