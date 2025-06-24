"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { StrapiSchemaProvider } from "@/context/StrapiSchemaProvider";
import { AuthProvider } from "@/context/AuthContext";
import { useTheme } from "@k2600x/design-system";
import dynamic from "next/dynamic";

// Dynamically import ThemeProvider to avoid SSR issues with localStorage
const ThemeProvider = dynamic(
  () => import("@k2600x/design-system").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

// A component to apply the theme programmatically
const ApplyTheme = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Set the futuristic theme on mount
    setTheme('futuristic');
  }, [setTheme]);

  return null; // This component does not render anything
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StrapiSchemaProvider>
        <ThemeProvider>
          <ApplyTheme />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </StrapiSchemaProvider>
    </QueryClientProvider>
  );
}
