'use client';

import React from "react";

import { DarkThemeToggle } from "@k2600x/design-system";
import { AppShellLayout } from "@/components/layout";

export default function FinancePage() {
  const navbar = [
    { label: "Home", href: "/" },
    { label: "Finance", href: "/finance" },
  ];
  const sidebar = [
    { label: "Finance", href: "/finance" },
    { label: "Admin", href: "/admin" },
  ];
  return (
    <AppShellLayout navbarItems={navbar} sidebarItems={sidebar}>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8 gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <rect width="24" height="24" rx="6" fill="var(--color-primary)" fillOpacity="0.10"/>
              <path d="M7 17h10M7 13h10M7 9h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Finance Management
          </h1>
        <DarkThemeToggle />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Finance Dashboard</h2>
        <p>This is a simplified version of the finance page.</p>
      </div>
      </div>
    </AppShellLayout>
  );
}
