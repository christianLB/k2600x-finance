import React, { createContext, useContext, useEffect, useState } from "react";
import strapi from "@/services/strapi";

// Types
export type SchemaMap = Record<string, any>;

interface StrapiSchemaContextValue {
  schemas: SchemaMap;
  loading: boolean;
  error: string | null;
  refreshSchemas: () => Promise<void>;
}

const StrapiSchemaContext = createContext<StrapiSchemaContextValue>({
  schemas: {},
  loading: true,
  error: null,
  refreshSchemas: async () => {},
});

export const StrapiSchemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schemas, setSchemas] = useState<SchemaMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await strapi.post({ method: "SCHEMA" });
      const map: SchemaMap = {};
      (Array.isArray(res.data) ? res.data : []).forEach((s: any) => {
        if (s.uid) map[s.uid] = s;
      });
      setSchemas(map);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch Strapi schemas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  return (
    <StrapiSchemaContext.Provider value={{ schemas, loading, error, refreshSchemas: fetchSchemas }}>
      {children}
    </StrapiSchemaContext.Provider>
  );
};

export function useStrapiSchemas() {
  return useContext(StrapiSchemaContext);
}
