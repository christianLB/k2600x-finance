import { useQuery } from "@tanstack/react-query";

/**
 * useStrapiSchema - Fetches Strapi content-type schemas via the API proxy
 * @param schemaUid (optional) - specific content-type UID to fetch
 */
const useStrapiSchema = (schemaUid?: string) => {
  return useQuery<any, any>({
    queryKey: ["strapi-schema", schemaUid],
    queryFn: async () => {
      const res = await fetch("/api/strapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "SCHEMA",
          ...(schemaUid && { schemaUid }),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Error fetching schema");
      }
      return json;
    },
  });
};

export default useStrapiSchema;
