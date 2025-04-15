import { authenticate } from "@/lib/strapi-auth";

export async function deleteStrapiFile(fileId: string | number) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!baseUrl) throw new Error("Strapi URL not defined");
  const jwt = await authenticate();
  const url = `${baseUrl}/api/upload/files/${fileId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!res.ok) throw new Error("Error deleting file from Strapi");
  return await res.json();
}
