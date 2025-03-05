import ExcelJS from 'exceljs';
import FormData from 'form-data';
import { NextRequest, NextResponse } from 'next/server';
import { convertFileToPdf } from '@/services/pdfServiceStirling'; // Asegúrate de tener esta función implementada
import fetch from 'node-fetch';
import { getAuthHeaders } from '@/lib/strapi-auth';

export async function uploadPdfToStrapi(pdfBuffer, fileName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!baseUrl) {
    throw new Error('La variable NEXT_PUBLIC_STRAPI_URL no está definida');
  }
  // Usamos la ruta de uploads de Strapi; en Strapi 5 suele ser /upload
  const uploadUrl = `${baseUrl}/api/upload`;
  console.log('[uploadPdfToStrapi] Upload URL:', uploadUrl);

  const formData = new FormData();
  // Agregar el archivo con metadata
  formData.append('files', pdfBuffer, {
    filename: `${fileName}.pdf`,
    contentType: 'application/pdf'
  });

  const authHeaders = await getAuthHeaders();
  // Eliminar cualquier header de Content-Type que pueda venir en authHeaders
  const { "Content-Type": omit1, "content-type": omit2, ...headersWithoutCT } = authHeaders;

  // Combina los headers de auth (sin Content-Type) con los generados por formData
  const headers = {
    ...headersWithoutCT,
    ...formData.getHeaders()
  };

  console.log('[uploadPdfToStrapi] Headers enviados:', headers);

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

  const result = await response.json();
  console.log('[uploadPdfToStrapi] Resultado del upload:', result);
  // Strapi devuelve un array con la información del archivo subido; se retorna el primero
  return result[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Se espera que el body contenga estos datos, incluido documentId para actualizar el invoice:
    const {
      invoiceNumber,
      precioUnitario,
      cantidad,
      fechaInvoice,
      monthFacturado,
      yearFacturado,
      documentId
    } = body;

    if (!invoiceNumber || !precioUnitario || !cantidad || !fechaInvoice || !monthFacturado || !yearFacturado || !documentId) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Obtener la plantilla desde Strapi usando el endpoint interno
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const strapiResponse = await fetch(`${baseUrl}/api/strapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        collection: 'templates',
        query: { populate: 'archivo' }
      })
    });

    if (!strapiResponse.ok) {
      const errorData = await strapiResponse.json();
      console.error('Error al obtener template de Strapi:', errorData);
      return NextResponse.json({ error: 'Error al obtener template de Strapi' }, { status: 500 });
    }

    const strapiResult = await strapiResponse.json();
    const templateEntry = strapiResult?.data?.[0];
    if (!templateEntry) {
      return NextResponse.json({ error: 'No se encontró la plantilla en Strapi' }, { status: 404 });
    }

    // 2. Obtener la URL del archivo XLSX
    const fileUrl = templateEntry?.archivo?.url;
    if (!fileUrl) {
      return NextResponse.json({ error: 'No se encontró el archivo dentro de la plantilla' }, { status: 404 });
    }

    // 3. Descargar el archivo XLSX desde Strapi
    const fullFileUrl = new URL(fileUrl, process.env.NEXT_PUBLIC_STRAPI_URL).href;
    const authHeaders = await getAuthHeaders();
    // Eliminamos 'Content-Type' para la solicitud GET
    const { 'Content-Type': _omit, ...headersWithoutCT } = authHeaders;
    const fileResponse = await fetch(fullFileUrl, {
      headers: { ...headersWithoutCT }
    });
    if (!fileResponse.ok) {
      console.error('Error descargando archivo XLSX desde Strapi:', fileResponse.status);
      return NextResponse.json({ error: 'No se pudo descargar el archivo XLSX' }, { status: 500 });
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 4. Leer y modificar el Excel con ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const hoja = workbook.worksheets[0];

    const reemplazos = {
      'H23': precioUnitario,
      'B23': cantidad,
      'C23': `Professional Services ${monthFacturado} ${yearFacturado} / Climate: Climate - EMEA`,
      'I11': fechaInvoice,
      'I10': invoiceNumber
    };

    for (const [celda, nuevoValor] of Object.entries(reemplazos)) {
      hoja.getCell(celda).value = nuevoValor;
    }

    // Obtener el buffer del Excel modificado
    const bufferModificado = await workbook.xlsx.writeBuffer();

    // 5. Convertir el Excel modificado a PDF usando convertFileToPdf
    const pdfBuffer = await convertFileToPdf(bufferModificado, 'archivo_modificado.xlsx');

    // 6. Subir el PDF a Strapi y obtener la información del archivo subido
    const uploadedPdf = await uploadPdfToStrapi(pdfBuffer, `invoice-${monthFacturado}-${yearFacturado}-${documentId}`);
    console.log('Archivo PDF subido:', uploadedPdf);

    // 7. Actualizar el invoice en Strapi para asociarle el PDF generado.
    // Aquí se asume que la colección se llama "invoices" y que el campo para el archivo se llama "document"
    const updateInvoiceUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices/${documentId}`;
    const updateResponse = await fetch(updateInvoiceUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        data: {
          archivos: uploadedPdf.id  // Actualiza el campo con el ID del archivo subido
        }
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Error actualizando invoice en Strapi:', errorData);
      return NextResponse.json({ error: 'Error al actualizar el invoice' }, { status: 500 });
    }

    const updatedInvoice = await updateResponse.json();
    console.log('Invoice actualizado:', updatedInvoice);

    // Retornar el resultado de la actualización del invoice
    return NextResponse.json(updatedInvoice, { status: 200 });

  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return NextResponse.json({ error: 'Error al procesar el archivo', details: error.message }, { status: 500 });
  }
}


