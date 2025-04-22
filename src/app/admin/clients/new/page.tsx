"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DynamicStrapiForm from "@/components/dynamic-form/DynamicStrapiForm";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <DynamicStrapiForm
      collection="api::client.client"
      mode="create"
      onSuccess={() => router.push("/admin/clients")}
    />
  );
}
