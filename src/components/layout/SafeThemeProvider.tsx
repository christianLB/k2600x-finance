"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ThemeProvider = dynamic(() => import("@k2600x/design-system").then(m => m.ThemeProvider), { ssr: false });

export function SafeThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
