"use client";

import UserIndicator from "@/components/UserIndicator";
import { ThemeToggle } from "@k2600x/design-system";

export function ClientHeader() {
  return (
    <div style={{ padding: "1rem 0", textAlign: "right", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
      <UserIndicator />
      <ThemeToggle />
    </div>
  );
}
