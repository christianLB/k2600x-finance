// Accepts File (browser) or Buffer (Node.js) for compatibility
export async function uploadPdfToStrapi(pdfFile: File | Buffer, fileName: string) {
  // Upload to our own API route for secure server-side authentication
  const formData = new FormData();
  // If running in Node.js, pdfFile is Buffer. If browser, it's File.
  if (typeof File !== 'undefined' && pdfFile instanceof File) {
    formData.append("file", pdfFile, fileName);
  } else {
    // Node.js: Buffer
    // @ts-expect-error: Buffer is not File, but this works in our current usage
    formData.append("file", pdfFile, fileName);
  }

  const response = await fetch("/api/strapi-upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Error uploading file to Strapi");
  const result = await response.json();
  // Strapi returns an array of files; return the first
  return result[0] || result;
}
