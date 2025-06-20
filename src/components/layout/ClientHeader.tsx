"use client";

import UserIndicator from "@/components/UserIndicator";
import { ThemeToggle } from "./ThemeToggle";

interface ClientHeaderProps {
  className?: string;
}

export function ClientHeader({ className = "" }: ClientHeaderProps) {
  return (
    <div className={`flex items-center justify-end gap-4 ${className}`}>
      <UserIndicator />
      <ThemeToggle />
    </div>
  );
}
