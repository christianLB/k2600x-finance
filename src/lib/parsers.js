export function parseBBVA(text) {
  let descriptionMatch = text.match(/Descripción (.*?) Importe/);
  let amountMatch = text.match(/Importe (.*?) Divisa/);
  let currencyMatch = text.match(/Divisa (.*?) Fecha del movimiento/);
  let dateMatch = text.match(/Fecha del movimiento (.*?) Fecha valor/);
  let valueDateMatch = text.match(/Fecha valor (.*?) Cuenta cargo\/abono/);
  let accountMatch = text.match(/Cuenta cargo\/abono (.*?) Titular de la cuenta/);
  let observationsMatch = text.match(/Observaciones (.*?) BANCO BILBAO VIZCAYA ARGENTARIA/);

  if (!descriptionMatch || !amountMatch || !currencyMatch || !dateMatch || !valueDateMatch || !accountMatch) {
    descriptionMatch = text.match(/Justificante de la operación (.*?) Fecha de la operación/);
    dateMatch = text.match(/Fecha de la operación (.*?) Tipo de transferencia/);
    amountMatch = text.match(/Importe (.*?) € Comisión/);
    currencyMatch = text.match(/Importe .*? (.*?) € Comisión/);
    valueDateMatch = text.match(/Fecha de abono al beneficiario (.*?) Ordenante/);
    accountMatch = text.match(/Cuenta destino \(beneficiario\) (.*?) Fecha de abono al beneficiario/);
    observationsMatch = text.match(/Concepto (.*?) Referencia BBVA/);
  }

  const name = (
    descriptionMatch
      ? descriptionMatch[1] + (observationsMatch ? observationsMatch[1] : "")
      : ""
  ).replace(/\s+/g, " ");
  const amount = amountMatch
    ? Math.abs(parseFloat(amountMatch[1].replace(".", "").replace(",", ".")))
    : null;
  const date = dateMatch ? formatDate(dateMatch[1]) : "";
  const account = accountMatch ? accountMatch[1] : "";
  const valueDate = valueDateMatch ? formatDate(valueDateMatch[1]) : "";
  const currency = currencyMatch ? currencyMatch[1] : "";

  return { name, amount, date, account, valueDate, currency };
}

export function extractDateAndTotalAmount(text) { //mercadonga
  const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
  const dateMatch = text.match(dateRegex);
  const date = dateMatch ? dateMatch[0] : null;

  const totalAmountRegex = /TOTAL \(€\)\s+(\d+,\d{2})/;
  const totalAmountMatch = text.match(totalAmountRegex);
  const totalAmount = totalAmountMatch
    ? parseFloat(totalAmountMatch[1].replace(",", "."))
    : null;

  return { date, totalAmount };
}

// Format day/month into a Date
export function formatDate(date) {
  const dateString = `${date}/${new Date().getFullYear()}`;
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`);
}


// Suponiendo que ya tienes formatDate(diaMes) -> Date

// Busca líneas que parecen representar el inicio de un movimiento:
// "DD/MM DD/MM ALGO..."
function isStartOfMovement(line) {
  return /^[0-3]\d\/[0-1]\d\s+[0-3]\d\/[0-1]\d\s+/.test(line);
}

// Busca línea de importe, saldo y divisa con el patrón:
// "-59,60 17.478,15 EUR"
function isAmountLine(line) {
  return /^-?\d{1,3}(\.\d{3})*,\d{2}\s+\d{1,3}(\.\d{3})*,\d{2}\s+[A-Z]{3}$/.test(line);
}

/**
 * Convierte un “bloque” de líneas en un objeto con la misma forma que parseBBVA.
 * Estructura típica:
 *   línea 0 -> "07/01 04/01 PAGO CON TARJETA EN..."
 *   línea 1..n-1 -> posibles líneas adicionales de concepto
 *   última línea -> "-7,70 20.652,85 EUR"
 */
function parseMovementBlock(lines) {
  if (lines.length < 2) return null; // no hay info suficiente

  // 1) Parseamos la primera línea para obtener las fechas y la primera parte del concepto
  const headerMatch = lines[0].match(/^([0-3]\d\/[0-1]\d)\s+([0-3]\d\/[0-1]\d)\s+(.*)$/);
  if (!headerMatch) {
    // no coincide con un patrón "dd/mm dd/mm resto"
    return null;
  }
  const [, operDateRaw, valDateRaw, firstConcept] = headerMatch;

  // 2) Concatenamos las líneas intermedias como parte del concepto
  // (excepto la última, que es la línea del importe)
  const conceptLines = [firstConcept];
  let amountLine = "";

  for (let i = 1; i < lines.length; i++) {
    if (isAmountLine(lines[i])) {
      amountLine = lines[i];
      break;
    } else {
      conceptLines.push(lines[i]);
    }
  }

  // 3) Interpretamos la línea de importe
  //     -7,70 20.652,85 EUR
  const amountMatch = amountLine.match(/^(-?\d{1,3}(\.\d{3})*,\d{2})\s+(\d{1,3}(\.\d{3})*,\d{2})\s+([A-Z]{3})$/);
  if (!amountMatch) {
    return null;
  }
  const [_, amountRaw, , , , currencyRaw] = amountMatch;

  // Armamos los campos
  const name = conceptLines.join(" ").replace(/\s+/g, " ").trim();

  // Convertimos "-19,52" -> number
  const amount = parseFloat(amountRaw.replace(".", "").replace(",", "."));
  const isIncome = !amountRaw.startsWith('-');

  return {
    name,
    amount: Math.abs(amount),
    date: formatDate(operDateRaw),
    account: "",
    valueDate: formatDate(valDateRaw),
    currency: currencyRaw,
    type: isIncome ? 'income' : 'expense'
  };
}

function extractPeriodDates(fullText) {
  // Busca algo como “Movimientos en cuenta en Enero 01/01/2025 31/01/2025Z”
  // Capturamos el mes textual y las dos fechas:
  const periodRegex = /Movimientos en cuenta en\s+([A-Za-z]+)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})Z?/;
  const match = fullText.match(periodRegex);
  if (!match) return {};

  const [, monthLabel, startDateRaw, endDateRaw] = match;
  return {
    periodMonth: monthLabel,
    startPeriod: formatDate(startDateRaw),
    endPeriod: formatDate(endDateRaw),
  };
}

function extractInitialBalance(fullText) {
  // “Saldo inicial: 18.455,00 EUR”
  const initBalRegex = /Saldo\s+inicial:\s+([\d.,]+)\s+EUR/;
  const match = fullText.match(initBalRegex);
  if (match) {
    return parseFloat(match[1].replace(/\./g, "").replace(",", "."));
  }
  return null;
}

function extractFinalBalance(fullText) {
  // “Saldo fin de mes: 47.366,79 EUR”
  const finalBalRegex = /Saldo\s+fin\s+de\s+mes:\s+([\d.,]+)\s+EUR/;
  const match = fullText.match(finalBalRegex);
  if (match) {
    return parseFloat(match[1].replace(/\./g, "").replace(",", "."));
  }
  return null;
}

function extractIbanBicHolder(fullText) {
  // IBAN ES36 0182 6165 ... BIC: BBVAESMM Titular/es: ...
  const ibanRegex = /IBAN\s+(ES\d{2}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4})/;
  const bicRegex = /BIC:\s+(\S+)/;
  const holderRegex = /Titular(?:\/es)?:\s+(.*)/;

  const ibanMatch = fullText.match(ibanRegex);
  const bicMatch = fullText.match(bicRegex);
  const holderMatch = fullText.match(holderRegex);

  return {
    iban: ibanMatch ? ibanMatch[1].replace(/\s+/g, "") : null,
    bic: bicMatch ? bicMatch[1] : null,
    holder: holderMatch ? holderMatch[1].trim() : null,
  };
}

function extractEmissionDate(fullText) {
  // “Fecha de emisión: 7 de Febrero de 2025”
  const emissionRegex = /Fecha de emisión:\s+(\d{1,2})\s+de\s+([A-Za-z]+)\s+de\s+(\d{4})/;
  const match = fullText.match(emissionRegex);
  if (!match) return null;

  // match: ["Fecha de emisión: 7 de Febrero de 2025", "7", "Febrero", "2025"]
  // Conviertes el mes textual a número si lo deseas o lo dejas textual
  const [_, day, monthWord, year] = match;
  // Podrías mapear "Febrero" -> 02, etc. Para simplificar, retórnalo en string.
  return `${day} ${monthWord} ${year}`;
}

/**
 * Parser principal para el reporte mensual de BBVA.
 * Devuelve un objeto con:
 * {
 *   periodMonth,
 *   startPeriod,
 *   endPeriod,
 *   initialBalance,
 *   finalBalance,
 *   iban,
 *   bic,
 *   holder,
 *   emissionDate,
 *   totalMovements,
 *   expenses: [ array de movimientos ],
 * }
 */
export function parseBBVAMonthlyReport(fullText) {
  // Extraemos los movimientos con la lógica anterior
  const lines = fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const movements = [];
  let currentBlock = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isStartOfMovement(line)) {
      if (currentBlock.length > 0) {
        const parsed = parseMovementBlock(currentBlock);
        if (parsed) movements.push(parsed);
        currentBlock = [];
      }
    }
    currentBlock.push(line);
  }
  // Parsear último bloque
  if (currentBlock.length > 0) {
    const parsed = parseMovementBlock(currentBlock);
    if (parsed) movements.push(parsed);
  }

  // Extra info
  const { periodMonth, startPeriod, endPeriod } = extractPeriodDates(fullText);
  const initialBalance = extractInitialBalance(fullText);
  const finalBalance = extractFinalBalance(fullText);
  const { iban, bic, holder } = extractIbanBicHolder(fullText);
  const emissionDate = extractEmissionDate(fullText);

  return {
    periodMonth: periodMonth || null,
    startPeriod: startPeriod || null,
    endPeriod: endPeriod || null,
    initialBalance,
    finalBalance,
    iban,
    bic,
    holder,
    emissionDate,
    totalMovements: movements.length,
    expenses: movements.filter(m => !m.type || m.type === 'expense'),
    incomes: movements.filter(m => m.type === 'income'),
    totalExpenses: movements.filter(m => !m.type || m.type === 'expense').length,
    totalIncomes: movements.filter(m => m.type === 'income').length
  };
}
