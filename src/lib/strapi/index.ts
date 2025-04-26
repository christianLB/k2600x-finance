import type { StrapiRequestBody } from "@/types/strapi";

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

const strapi = {
  post: strapiRequest,
};
export default strapi;
