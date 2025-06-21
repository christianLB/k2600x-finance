'use client';

import React from 'react';
import { AppShellLayout } from '@/components/layout';

export default function FinanceDashboardPage() {
  const navbar = [
    { label: 'Home', href: '/' },
    { label: 'Finance Dashboard', href: '/finance-dashboard' },
  ];
  const sidebar = [
    { label: 'Dashboard', href: '/finance-dashboard' },
    { label: 'Admin', href: '/admin' },
  ];

  return (
    <AppShellLayout navbarItems={navbar} sidebarItems={sidebar}>
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Finance Dashboard</h1>
        <p>Welcome to the finance dashboard.</p>
      </div>
    </AppShellLayout>
  );
}
