import React from "react";
import type { NavbarProps, SidebarProps } from "@k2600x/design-system";

import { Navbar, Sidebar, Container } from "@k2600x/design-system";
import { ThemeToggle } from "./ThemeToggle";

export interface AppShellLayoutProps {
  children: React.ReactNode;
  navbarItems: NavbarProps["items"];
  sidebarItems: SidebarProps["items"];
  logo?: React.ReactNode;
}

export function AppShellLayout({
  children,
  navbarItems,
  sidebarItems,
  logo,
}: AppShellLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar items={sidebarItems} className="border-r border-border" />
      <div className="flex flex-col flex-1">
        <Navbar
          items={navbarItems}
          logo={logo}
          cta={<ThemeToggle />}
          className="border-b border-border"
        />
        <main className="flex-1 py-[var(--spacing-md)]">
          <Container className="h-full">{children}</Container>
        </main>
      </div>
    </div>
  );
}

