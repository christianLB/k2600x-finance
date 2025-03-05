import { getAuthHeaders } from '@/lib/strapi-auth';

export async function downloadStrapiFile(fileUrl) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!baseUrl) {
    throw new Error('La variable NEXT_PUBLIC_STRAPI_URL no está definida');
  }
  const fullFileUrl = new URL(fileUrl, baseUrl).href;
  console.log('[downloadStrapiFile] Full URL:', fullFileUrl);

  // Obtén los headers de autenticación
  const authHeaders = await getAuthHeaders();
  // Extraemos solo el header de autorización
  const { Authorization } = authHeaders;
  console.log('[downloadStrapiFile] Using Authorization header:', Authorization);

  // Realiza la solicitud GET únicamente con el header de Authorization
  const response = await fetch(fullFileUrl, {
    method: 'GET',
    headers: { Authorization }
  });
  console.log('[downloadStrapiFile] Response status:', response.status);

  if (!response.ok) {
    throw new Error(`Error fetching file. Status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
