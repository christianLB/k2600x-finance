import { useQuery } from "@tanstack/react-query";
import strapi from "@/services/strapi";

/**
 * useStrapiSchema - Fetches Strapi content-type schemas via the API proxy
 * @param schemaUid (optional) - specific content-type UID to fetch
 */
const useStrapiSchema = (schemaUid?: string) => {
  return useQuery<any, any>({
    queryKey: ["strapi-schema", schemaUid],
    queryFn: () => strapi.post({ method: "SCHEMA", ...(schemaUid && { schemaUid }) }),
  });
};

export default useStrapiSchema;
