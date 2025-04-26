export interface StrapiRequestBody {
  method: "GET" | "POST" | "PUT" | "DELETE" | "SCHEMA";
  collection?: string;
  id?: string;
  data?: any;
  query?: any;
  schemaUid?: string;
}

export async function strapiRequest<T = any>(body: StrapiRequestBody): Promise<T> {
  const res = await fetch("/api/strapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Strapi request failed");
  return json;
}

const strapi = {
  post: strapiRequest,
};
export default strapi;
