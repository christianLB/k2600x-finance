"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { StrapiSchemaProvider } from "@/context/StrapiSchemaProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@k2600x/design-system";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StrapiSchemaProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </StrapiSchemaProvider>
    </QueryClientProvider>
  );
}
