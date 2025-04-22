"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { Button } from "@/components/ui/button";

export default function AdminClientsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useStrapiCollection<any>("clients", { pagination: { page: 1, pageSize: 50 } });

  if (isLoading) {
    return <div>Loading clients...</div>;
  }
  if (error) {
    return <div style={{ color: "red" }}>Error: {error.message}</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Clients</h1>
      <div style={{ marginBottom: 16 }}>
        <Button asChild>
          <Link href="/admin/clients/new">New Client</Link>
        </Button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
            <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map(item => (
            <tr key={item.id}>
              <td style={{ padding: 8 }}>{item.id}</td>
              <td style={{ padding: 8 }}>{item.attributes?.displayName || item.attributes?.name || item.id}</td>
              <td style={{ padding: 8 }}>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/clients/${item.id}`}>Edit</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
