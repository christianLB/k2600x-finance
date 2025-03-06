import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { getAuthHeaders } from '@/lib/strapi-auth';
import { convertHtmlToPdf } from '@/services/pdfServiceStirling';
import { uploadPdfToStrapi } from '@/lib/uploadPdfToStrapi';
import { generateInvoiceHtml } from '@/lib/invoice-template';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceNumber,
      precioUnitario,
      cantidad,
      fechaInvoice,
      monthFacturado,
      yearFacturado,
      documentId,
      dueDate,          // Opcional, si se pasa
      billToName,
      billToAddress,
      billToCity,
      billToState,
      billToZip,
      taxId,
      tax  // Si aplica
    } = body;

    if (
      !invoiceNumber ||
      !precioUnitario ||
      !cantidad ||
      !fechaInvoice ||
      !monthFacturado ||
      !yearFacturado ||
      !documentId ||
      !billToName ||
      !billToAddress ||
      !billToCity ||
      !billToState ||
      !billToZip ||
      !taxId
    ) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Leer el template HTML desde el filesystem
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'invoice-template.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // 2. Generar el HTML final con los reemplazos
    const htmlFinal = generateInvoiceHtml(htmlTemplate, {
      invoiceNumber,
      fechaInvoice,
      dueDate, // Puede estar vacío
      precioUnitario,
      cantidad,
      monthFacturado,
      yearFacturado,
      billToName,
      billToAddress,
      billToCity,
      billToState,
      billToZip,
      taxId,
      // Para TAX en resumen; si no se pasa, lo dejamos vacío o "0.00"
      tax: tax || "0.00"
    });

    // Opcional: aplicar Juice si aún necesitas convertir estilos a inline
    //const htmlWithInlineStyles = juice(htmlFinal);

    // 3. Convertir el HTML a PDF usando el endpoint de Stirling
    const pdfBuffer = await convertHtmlToPdf(htmlFinal, 1);

    // 4. Subir el PDF a Strapi
    const fileName = `invoice-${monthFacturado}-${yearFacturado}-${documentId}`;
    const uploadedPdf = await uploadPdfToStrapi(pdfBuffer, fileName);
    console.log('Archivo PDF subido:', uploadedPdf);

    // 5. Actualizar el invoice en Strapi para asociarle el PDF generado.
    const authHeaders = await getAuthHeaders();
    const updateInvoiceUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices/${documentId}`;
    const updateResponse = await fetch(updateInvoiceUrl, {
      method: 'PUT',
      headers: {//@ts-ignore
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
        data: {
          archivos: uploadedPdf.id
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

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);//@ts-ignore
    return NextResponse.json({ error: 'Error al procesar el archivo', details: error.message }, { status: 500 });
  }
}



