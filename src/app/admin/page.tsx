"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import strapi from "@/lib/strapi";
import { Button, Tooltip } from "@k2600x/design-system";
import { PlusCircle, Settings } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ColumnSelectorDialog } from "@/components/admin/ColumnSelectorDialog";
import { RecordFormDialog } from "@/components/admin/RecordFormDialog";
import { useColumnPreferences } from "@/hooks/useColumnPreferences";
import { useAdminRecords } from "@/hooks/useAdminRecords";
import { getTableColumns } from "@/lib/admin-table";
import { getSchemaAttributeKeys, getSchemaDisplayName } from "@/lib/schema-utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Section } from "@/components/layout/Section";

export default function AdminPage() {
  /*
  DEPRECATED: This entire legacy admin page is commented out to prevent build errors.
  It is kept for reference only. The new admin interface is at /admin/finance-dashboard.
  */
  return (
    <div>
      <h1>Legacy Admin - DEPRECATED</h1>
      <p>This admin interface is no longer maintained.</p>
      <Link href="/admin/finance-dashboard">Go to Admin V2</Link>
    </div>
  );
}
