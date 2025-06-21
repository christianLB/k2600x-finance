'use client';
import React from 'react';
import { AppShellLayout } from '@/components/layout';

export default function FinanceDashboardModulePage() {
  const navbar = [{ label: 'Home', href: '/' }, { label: 'Finance Dashboard', href: '/finance-dashboard' }];
  const sidebar = [{ label: 'Finance Dashboard', href: '/finance-dashboard' }];
  return (
    <AppShellLayout navbarItems={navbar} sidebarItems={sidebar}>
      <div>Finance Dashboard Module page</div>
    </AppShellLayout>
  );
}
