import { NextRequest } from "next/server";
import { authenticate } from "@/lib/strapi-auth";

export const runtime = "nodejs"; // Ensure this runs in Node.js, not Edge

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // Authenticate with Strapi
    const jwt = await authenticate();
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    if (!strapiUrl) {
      return new Response(JSON.stringify({ error: "Strapi URL not defined" }), { status: 500 });
    }

    // Prepare FormData for Strapi
    const strapiForm = new FormData();
    strapiForm.append("files", file, file.name);

    // Upload to Strapi
    const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`
        // Note: Do NOT set Content-Type; browser/FormData will set it
      },
      body: strapiForm,
    });

    const data = await uploadRes.json();
    if (!uploadRes.ok) {
      return new Response(JSON.stringify(data), { status: uploadRes.status });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "No media id provided" }), { status: 400 });
    }
    const jwt = await authenticate();
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    if (!strapiUrl) {
      return new Response(JSON.stringify({ error: "Strapi URL not defined" }), { status: 500 });
    }
    const deleteRes = await fetch(`${strapiUrl}/api/upload/files/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await deleteRes.json();
    if (!deleteRes.ok) {
      return new Response(JSON.stringify(data), { status: deleteRes.status });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
