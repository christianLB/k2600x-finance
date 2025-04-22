"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import DynamicStrapiForm from "@/components/dynamic-form/DynamicStrapiForm";

export default function EditClientPage() {
  const { id } = useParams();
  const clientId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  if (!clientId) {
    return <div style={{ color: "red" }}>Client ID is missing</div>;
  }
  return (
    <DynamicStrapiForm
      collection="api::client.client"
      mode="edit"
      entityId={clientId}
      onSuccess={() => router.push("/admin/clients")}
      onError={(err) => console.error(err)}
    />
  );
}
