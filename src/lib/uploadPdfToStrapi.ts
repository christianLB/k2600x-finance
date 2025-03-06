import { getAuthHeaders } from "./strapi-auth";
import fetch from 'node-fetch';
import FormData from 'form-data';

export async function uploadPdfToStrapi(pdfBuffer: any, fileName: any) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!baseUrl) {
    throw new Error('La variable NEXT_PUBLIC_STRAPI_URL no está definida');
  }
  // Usamos la ruta de upload de Strapi (en Strapi 5 suele ser /api/upload)
  const uploadUrl = `${baseUrl}/api/upload`;
  console.log('[uploadPdfToStrapi] Upload URL:', uploadUrl);

  const formData = new FormData();
  // Agregamos el pdfBuffer directamente, ya que es un Buffer de Node
  formData.append('files', pdfBuffer, {
    filename: `${fileName}.pdf`,
    contentType: 'application/pdf'
  });

  // Obtenemos los auth headers y eliminamos cualquier "Content-Type" conflictivo
  const authHeaders = await getAuthHeaders();//@ts-ignore
  const { "Content-Type": omit1, "content-type": omit2, ...headersWithoutCT } = authHeaders;
  const headers = {
    ...headersWithoutCT,
    ...formData.getHeaders()
  };

  console.log('[uploadPdfToStrapi] Headers enviados:', headers, omit2, omit1);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers,
    body: formData
  });

  console.log('[uploadPdfToStrapi] Response status:', response.status);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[uploadPdfToStrapi] Error uploading PDF, response body:', errorBody);
    throw new Error(`Error uploading PDF. Status: ${response.status}`);
  }

  const result = await response.json() as any;
  console.log('[uploadPdfToStrapi] Resultado del upload:', result);
  // Se asume que Strapi devuelve un array con la información del archivo subido; retornamos el primero.
  return result[0];
}

