import axios from "axios";
import FormData from "form-data";

/**
 * Llama al endpoint para quitar la protección por contraseña.
 * Se espera que el endpoint devuelva el PDF sin protección en formato binario.
 */
export async function removePasswordFromPdf(buffer, password) {
  const url = "http://192.168.1.11:7890/api/v1/security/remove-password";
  console.log("[Stirling] RemovePassword URL:", url);
  console.log("[Stirling] Buffer size:", buffer.length);

  const formData = new FormData();
  // Según el Swagger de 'text', se usa "fileInput" para el archivo
  formData.append("fileInput", buffer, "document.pdf");
  // Agregamos el campo password
  formData.append("password", password);

  const headers = formData.getHeaders();
  console.log("[Stirling] RemovePassword FormData headers:", headers);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...headers,
        Accept: "application/pdf"
      },
      // Indicamos que la respuesta es binaria (arraybuffer)
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("[Stirling] RemovePassword Response status:", response.status);
    // Se obtiene el PDF sin protección como Buffer
    const unprotectedPdfBuffer = Buffer.from(response.data);
    return unprotectedPdfBuffer;
  } catch (error) {
    console.error("[Stirling] RemovePassword Request error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error(`Stirling RemovePassword error: ${error.message}`);
  }
}

/**
 * Llama al endpoint de conversión para extraer el texto del PDF.
 * Se espera que el endpoint reciba multipart/form-data con:
 *  - fileInput: PDF
 *  - outputFormat: "txt"
 */
export async function extractTextWithStirling(buffer) {
  const url = "http://192.168.1.11:7890/api/v1/convert/pdf/text";
  console.log("[Stirling] ExtractText URL:", url);
  console.log("[Stirling] Buffer size:", buffer.length);

  const formData = new FormData();
  formData.append("fileInput", buffer, "document.pdf");
  // Usamos "txt" en minúsculas según el test
  formData.append("outputFormat", "txt");

  const headers = formData.getHeaders();
  console.log("[Stirling] ExtractText FormData headers:", headers);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...headers,
        Accept: "text/plain"
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("[Stirling] ExtractText Response status:", response.status);
    console.log("[Stirling] ExtractText Response data:", response.data);

    const data = response.data;
    if (Array.isArray(data)) {
      return { text: data.join("\n") };
    }
    return { text: data };
  } catch (error) {
    console.error("[Stirling] ExtractText Request error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error(`StirlingPDF error: ${error.message}`);
  }
}


/**
 * Convierte un archivo a PDF usando el endpoint de Stirling.
 * @param {Buffer} fileBuffer - Buffer del archivo original (e.g. XLSX, DOCX, etc.)
 * @param {string} [originalFileName="document.xlsx"] - Nombre del archivo (opcional).
 * @returns {Promise<Buffer>} - Retorna un Buffer con el PDF resultante.
 */
export async function convertFileToPdf(fileBuffer, originalFileName = "document.xlsx") {
  const url = "http://192.168.1.11:7890/api/v1/convert/file/pdf";
  console.log("[Stirling] ConvertFileToPdf URL:", url);
  console.log("[Stirling] Buffer size:", fileBuffer.length);

  const formData = new FormData();
  // "fileInput" es el nombre de campo esperado por la API de Stirling
  formData.append("fileInput", fileBuffer, originalFileName);

  const headers = formData.getHeaders();
  console.log("[Stirling] ConvertFileToPdf FormData headers:", headers);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...headers,
        Accept: "application/pdf"
      },
      // Indicamos que la respuesta es binaria
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("[Stirling] ConvertFileToPdf Response status:", response.status);

    // Recibimos el PDF como arraybuffer
    const pdfBuffer = Buffer.from(response.data);
    return pdfBuffer;
  } catch (error) {
    console.error("[Stirling] ConvertFileToPdf Request error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error(`Stirling ConvertFileToPdf error: ${error.message}`);
  }
}

/**
 * Convierte un HTML a PDF usando el endpoint /api/v1/convert/html/pdf de Stirling.
 * @param {string} htmlContent - El contenido HTML a convertir.
 * @param {number} [zoom=1] - Zoom level para la conversión (por defecto 1).
 * @returns {Promise<Buffer>} - Devuelve un Buffer con el PDF resultante.
 */
export async function convertHtmlToPdf(htmlContent, zoom = 1) {
  const url = "http://192.168.1.11:7890/api/v1/convert/html/pdf";
  console.log("[Stirling] ConvertHtmlToPdf URL:", url);

  const formData = new FormData();
  // 'fileInput' es el campo que espera el endpoint de Stirling
  // Le pasamos el contenido HTML como si fuera un archivo "document.html"
  formData.append("fileInput", Buffer.from(htmlContent, "utf8"), "document.html");

  // Opcional: puedes pasar el zoom como string
  formData.append("zoom", String(zoom));

  const headers = formData.getHeaders();
  console.log("[Stirling] ConvertHtmlToPdf FormData headers:", headers);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...headers,
        Accept: "application/pdf"
      },
      responseType: "arraybuffer", // Recibimos el PDF en binario
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("[Stirling] ConvertHtmlToPdf Response status:", response.status);
    if (response.status !== 200) {
      throw new Error(`Stirling ConvertHtmlToPdf error: ${response.status}`);
    }

    // Retornamos el PDF como Buffer
    return Buffer.from(response.data);
  } catch (error) {
    console.error("[Stirling] ConvertHtmlToPdf Request error:", error);
    throw error;
  }
}


