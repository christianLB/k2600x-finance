const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/**
 * Genera el HTML final a partir del template y los datos de la factura.
 *
 * @param {string} template - El contenido del template HTML.
 * @param {object} data - Los datos para reemplazar en el template.
 *   Se espera que data incluya:
 *      invoiceNumber, fechaInvoice, dueDate (opcional),
 *      precioUnitario, cantidad, monthFacturado, yearFacturado,
 *      billToName, billToAddress, billToCity, billToState, billToZip, taxId.
 * @returns {string} - El HTML resultante con los valores reemplazados.
 */
export function generateInvoiceHtml(template: string, data: any) {
  // Calcula el total multiplicando cantidad por precioUnitario
  const total = Number(data.cantidad) * Number(data.precioUnitario);

  let html = template;
  html = html.replace(/{{INVOICE_NUMBER}}/g, data.invoiceNumber);
  html = html.replace(/{{INVOICE_DATE}}/g, data.fechaInvoice);
  html = html.replace(/{{DUE_DATE}}/g, data.dueDate || '');
  html = html.replace(/{{PRECIO_UNITARIO}}/g, data.precioUnitario);
  html = html.replace(/{{CANTIDAD}}/g, data.cantidad);//@ts-ignore
  html = html.replace(/{{MONTH_FACTURADO}}/g, months.find(month => month.value === data.monthFacturado).label);
  html = html.replace(/{{YEAR_FACTURADO}}/g, data.yearFacturado);
  html = html.replace(/{{SUBTOTAL}}/g, total.toFixed(2));
  html = html.replace(/{{TOTAL}}/g, total.toFixed(2));

  // Datos del cliente
  html = html.replace(/{{BILL_TO_NAME}}/g, data.billToName);
  html = html.replace(/{{BILL_TO_ADDRESS}}/g, data.billToAddress);
  html = html.replace(/{{BILL_TO_CITY}}/g, data.billToCity);
  html = html.replace(/{{BILL_TO_STATE}}/g, data.billToState);
  html = html.replace(/{{BILL_TO_ZIP}}/g, data.billToZip);
  html = html.replace(/{{TAX_ID}}/g, data.taxId);
  html = html.replace(/{{TAX}}/g, data.tax);

  return html;
}
{ }