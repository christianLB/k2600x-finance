"use client";

import UserIndicator from "@/components/UserIndicator";
import { DarkThemeToggle } from "@k2600x/design-system";

interface ClientHeaderProps {
  className?: string;
}

export function ClientHeader({ className = "" }: ClientHeaderProps) {
  return (
    <div className={`flex items-center justify-end gap-4 ${className}`}>
      <UserIndicator />
      <DarkThemeToggle />
    </div>
  );
}
