// =============================================================
// File: src/services/strapiService.ts  (cliente limpio)
// =============================================================
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
interface ProxyBody {
  method: HttpMethod;
  path: string; // '/api/expenses' o '/api/expenses/42'
  body?: unknown;
  query?: Record<string, unknown>;
}

async function call<T = any>(body: ProxyBody): Promise<T> {
  const res = await fetch("/api/strapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = res.status === 204 ? undefined : await res.json();
  if (!res.ok) throw new Error(json?.message || "Strapi request failed");
  return json as T;
}

export const strapiService = {
  get: <T = any>(path: string, query?: Record<string, unknown>) =>
    call<T>({ method: "GET", path, query }),

  post: <T = any>(path: string, data: unknown) =>
    call<T>({ method: "POST", path, body: { data } }),

  put: <T = any>(path: string, data: unknown) =>
    call<T>({ method: "PUT", path, body: { data } }),

  del: <T = any>(path: string) => call<T>({ method: "DELETE", path }),

  schema: <T = any>(uid?: string) =>
    call<T>({
      method: "GET",
      path: "/api/content-type-builder/content-types",
      query: uid ? { "filters[uid][$eq]": uid } : undefined,
    }),
};

export default strapiService;
