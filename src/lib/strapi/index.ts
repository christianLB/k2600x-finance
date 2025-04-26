import type { StrapiRequestBody } from "@/types/strapi";

/**
 * Sends a request to the Strapi API via the local API route.
 *
 * @template T - The expected response data type.
 * @param body - The request body containing method, collection, data, etc.
 * @returns The response data from Strapi.
 * @throws If the request fails (non-OK response).
 */
export async function strapiRequest<T = any>(body: StrapiRequestBody): Promise<T> {
  const res = await fetch("/api/strapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Strapi request failed");
  }
  return res.json();
}

/**
 * Strapi API helper object with a post method for convenience.
 */
const strapi = {
  post: strapiRequest,
};
export default strapi;
