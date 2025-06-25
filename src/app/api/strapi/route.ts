import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, clearJWT } from "@/lib/strapi-auth";

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL!;

/**
 * Reenvía la request a Strapi con cabeceras de autenticación.
 * Si Strapi devuelve 401, limpia JWT y reintenta una vez.
 */
async function fetchStrapi(path: string, init: RequestInit): Promise<Response> {
  // 1º intento
  let headers = await getAuthHeaders();
  let res = await fetch(`${STRAPI}${path}`, { ...init, headers });

  // Si token expiró, limpiamos y reintentamos una vez
  if (res.status === 401) {
    clearJWT();
    headers = await getAuthHeaders();
    res = await fetch(`${STRAPI}${path}`, { ...init, headers });
  }
  return res;
}

/**
 * Proxy para todas las llamadas Strapi.
 * El cliente envía { method, path, body?, query? } en el POST.
 */
export async function POST(req: NextRequest) {
  try {
    const { method, path, body, query } = await req.json();

    if (!method || !path) {
      return NextResponse.json(
        { message: "method y path requeridos" },
        { status: 400 }
      );
    }

    const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
    const url = `${path}${qs}`;

    const init: RequestInit = {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetchStrapi(url, init);
    if (res.status === 204) {
      // 204 No Content → devolver respuesta vacía
      return new NextResponse(null, { status: 204 });
    }
    const payload = await res.json();
    return NextResponse.json(payload ?? {}, { status: res.status });
  } catch (err) {
    console.error("Strapi proxy error", err);
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
