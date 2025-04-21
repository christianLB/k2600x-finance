import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders, clearJWT } from "@/lib/strapi-auth";

const strapiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_STRAPI_URL,
};

export async function POST(req: NextRequest) {
  try {
    // Añadimos schemaUid para pedir el esquema
    const { method, collection, id, ids, data, query, schemaUid } = await req.json();

    /***********************************************************
     * 0) SCHEMA: obtener estructura de un content-type
     ***********************************************************/
    if (method === 'SCHEMA') {
      // Intentamos dos veces por si hay que refrescar JWT
      for (let attempt = 0; attempt < 2; attempt++) {
        const headers = await getAuthHeaders(); // lleva tu Full Access token
        // Si schemaUid está definido, filtramos por uid, si no devolvemos todos
        const url = `${strapiConfig.baseUrl}/api/content-type-builder/content-types` +
          (schemaUid
            ? `?filters[uid][$eq]=${encodeURIComponent(schemaUid)}`
            : ''
          );

        const response = await fetch(url, { method: 'GET', headers });
        // Si 401 en el primer intento, forzamos clearJWT() y reintentamos
        if (response.status === 401 && attempt === 0) {
          clearJWT();
          continue;
        }
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          return NextResponse.json(
            { error: true, message: err?.error?.message || 'Error fetching schema' },
            { status: response.status }
          );
        }
        const result = await response.json();
        // Devolvemos directamente el JSON con la/s definiciones
        return NextResponse.json(result, { status: 200 });
      }
      throw new Error('Authentication failed after retry (SCHEMA)');
    }

    if (!collection && method !== 'SCHEMA') {
      return NextResponse.json(
        { error: true, message: "Collection is required" },
        { status: 400 }
      );
    }

    // NOTA: El método "GET" y "POST" se mantienen como siempre para un solo documento.
    // Si quieres soportar GET/POST múltiples, deberías extenderlo igual que PUT/DELETE.

    /***********************************************************
     * 1) DELETE (uno o varios)
     ***********************************************************/
    if (method === "DELETE") {
      // a) Borrado múltiple (ids es un array)
      if (Array.isArray(ids) && ids.length > 0) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const headers = await getAuthHeaders();
          let allOk = true; // Para saber si falló en algún ID

          for (const currentId of ids) {
            const url = `${strapiConfig.baseUrl}/api/${collection}/${currentId}`;
            console.log("📡 Strapi DELETE request:", url);

            const response = await fetch(url, { method: "DELETE", headers });
            console.log("📡 Strapi response status:", response.status);

            // Si 401 => limpiamos token y reintentamos
            if (response.status === 401 && attempt === 0) {
              console.log("🔑 Auth failed, retrying multiple delete...");
              clearJWT();
              allOk = false;
              break; // rompemos el for, pasamos a attempt=1
            }

            if (!response.ok) {
              // si falla en algún ID, devolvemos error
              const result = response.status !== 204 ? await response.json() : null;
              return NextResponse.json(
                { error: true, message: result?.error?.message || "Error deleting item" },
                { status: response.status }
              );
            }
          }

          // Si pasamos todo el for sin 401 ni otros errores, terminamos
          if (allOk) {
            return NextResponse.json({ success: true }, { status: 200 });
          }
        }
        // si terminamos los attempts sin éxito
        throw new Error("Authentication failed after retry (multiple DELETE)");
      }

      // b) Borrado de un solo documento (id)
      if (id) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const headers = await getAuthHeaders();
          const url = `${strapiConfig.baseUrl}/api/${collection}/${id}`;
          console.log("📡 Strapi DELETE single:", url);

          const response = await fetch(url, { method: "DELETE", headers });
          if (response.status === 401 && attempt === 0) {
            console.log("🔑 Auth failed, retrying single delete...");
            clearJWT();
            continue;
          }
          if (!response.ok) {
            const result = response.status !== 204 ? await response.json() : null;
            return NextResponse.json(
              { error: true, message: result?.error?.message || "Error deleting item" },
              { status: response.status }
            );
          }
          return NextResponse.json({ success: true }, { status: 200 });
        }
        throw new Error("Authentication failed after retry (single DELETE)");
      }

      // si no hay ni "id" ni "ids", error
      return NextResponse.json(
        { error: true, message: "No valid ID or IDs provided for DELETE" },
        { status: 400 }
      );
    } // FIN if (method === "DELETE")

    /***********************************************************
     * 2) PUT (update uno o varios)
     ***********************************************************/
    if (method === "PUT") {
      // Aseguramos que "data" exista
      if (!data) {
        return NextResponse.json(
          { error: true, message: "Data is required for PUT" },
          { status: 400 }
        );
      }

      // a) Update múltiple (ids es un array)
      if (Array.isArray(ids) && ids.length > 0) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const headers = await getAuthHeaders();
          let allOk = true;

          for (const currentId of ids) {
            const url = `${strapiConfig.baseUrl}/api/${collection}/${currentId}`;
            console.log("📡 Strapi PUT request:", url);

            const response = await fetch(url, {
              method: "PUT",
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ data }),
            });
            console.log("📡 Strapi response status:", response.status);

            // Manejo 401 => reintento
            if (response.status === 401 && attempt === 0) {
              console.log("🔑 Auth failed, retrying multiple update...");
              clearJWT();
              allOk = false;
              break;
            }

            if (!response.ok) {
              const result = await response.json();
              return NextResponse.json(
                { error: true, message: result?.error?.message || "Error updating item" },
                { status: response.status }
              );
            }
          }

          if (allOk) {
            return NextResponse.json({ success: true }, { status: 200 });
          }
        }
        throw new Error("Authentication failed after retry (multiple PUT)");
      }

      // b) Update de un solo documento (id)
      if (id) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const headers = await getAuthHeaders();
          const url = `${strapiConfig.baseUrl}/api/${collection}/${id}`;
          console.log("📡 Strapi PUT single:", url);

          const response = await fetch(url, {
            method: "PUT",
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data }),
          });

          if (response.status === 401 && attempt === 0) {
            console.log("🔑 Auth failed, retrying single update...");
            clearJWT();
            continue;
          }

          if (!response.ok) {
            const result = await response.json();
            return NextResponse.json(
              { error: true, message: result?.error?.message || "Error updating item" },
              { status: response.status }
            );
          }
          const result = await response.json();
          return NextResponse.json(result, { status: 200 });
        }
        throw new Error("Authentication failed after retry (single PUT)");
      }

      // si no hay ni "id" ni "ids", error
      return NextResponse.json(
        { error: true, message: "No valid ID or IDs provided for PUT" },
        { status: 400 }
      );
    } // FIN if (method === "PUT")

    /***********************************************************
     * 3) GET o POST (comportamiento original, solo 1 doc)
     ***********************************************************/
    let response;
    const baseUrl = `${strapiConfig.baseUrl}/api/${collection}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const headers = await getAuthHeaders();
      const requestConfig: RequestInit = { headers, method };

      let url = id ? `${baseUrl}/${id}` : baseUrl;

      if (query && Object.keys(query).length > 0) {
        const queryString = objectToQueryString(query); // usa la función helper aquí
        url += `?${queryString}`;
      }

      console.log("📡 Strapi request:", { url, method, query });

      if (["POST"].includes(method)) {
        if (!data) {
          return NextResponse.json(
            { error: true, message: `Data is required for POST` },
            { status: 400 }
          );
        }
        requestConfig.body = JSON.stringify({ data });
        requestConfig.headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }

      response = await fetch(url, requestConfig);
      console.log("📡 Strapi response status:", response.status);

      let result = null;
      if (response.status !== 204) {
        result = await response.json();
      }

      if (response.status === 401 && attempt === 0) {
        console.log("🔑 Auth failed, retrying...");
        clearJWT();
        continue;
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: true, message: result?.error?.message || "An error occurred" },
          { status: response.status }
        );
      }

      return NextResponse.json(result || {}, { status: 200 });
    }

    throw new Error("Authentication failed after retry (GET/POST)");
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: true, message: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

// Helper que convierte objetos anidados en query strings compatibles con Strapi
function objectToQueryString(obj: any, prefix = ''): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      const finalKey = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === 'object' && value !== null) {
        return objectToQueryString(value, finalKey);
      }
      return `${encodeURIComponent(finalKey)}=${encodeURIComponent(value as string)}`;
    })
    .join('&');
}
