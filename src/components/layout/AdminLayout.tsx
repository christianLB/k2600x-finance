import React from "react";
import { ClientHeader } from "./ClientHeader";

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-[240px] border-r border-border flex-shrink-0">
        {sidebar}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <ClientHeader className="py-4 px-6 border-b border-border" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
