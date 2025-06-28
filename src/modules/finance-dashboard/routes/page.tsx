"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ThemeProvider } from "@k2600x/design-system";
import { AppShellLayout } from "@/components/layout";
// import { useUser } from "../hooks/useUser"; // REMOVED
// import { useStrapiSchema } from "../hooks/useStrapiSchema"; // REMOVED
// import { useStrapiCollection } from "../hooks/useStrapiCollection"; // REMOVED  
// import { useStrapiForm } from "../hooks/useStrapiForm"; // REMOVED
// import { SmartDataTable } from "../components/SmartDataTable"; // REMOVED
// import { DynamicForm } from "../components/DynamicForm"; // REMOVED

export default function FinanceDashboardPage() {
  // DEPRECATED: This page uses removed hooks
  return (
    <ThemeProvider>
      <AppShellLayout navbarItems={[]} sidebarItems={[]}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Finance Dashboard - DEPRECATED</h1>
          <p className="text-orange-600">
            This page is deprecated. Please use the new admin interface at{" "}
            <Link href="/admin/diagnostics" className="underline">
              /admin/diagnostics
            </Link>
          </p>
        </div>
      </AppShellLayout>
    </ThemeProvider>
  );
}
