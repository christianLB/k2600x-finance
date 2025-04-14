import { getAuthHeaders } from "./strapi-auth";

export async function uploadPdfToStrapi(pdfFile: File, fileName: string) {
  // Upload to our own API route for secure server-side authentication
  const response = await fetch("/api/strapi-upload", {
    method: "POST",
    body: (() => {
      const formData = new FormData();
      formData.append("file", pdfFile, fileName);
      return formData;
    })(),
  });
  if (!response.ok) throw new Error("Error uploading file to Strapi");
  const result = await response.json();
  // Strapi returns an array of files; return the first
  return result[0] || result;
}
