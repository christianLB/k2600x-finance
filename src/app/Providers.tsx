"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { StrapiSchemaProvider } from "@/context/StrapiSchemaProvider";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StrapiSchemaProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </StrapiSchemaProvider>
    </QueryClientProvider>
  );
}
