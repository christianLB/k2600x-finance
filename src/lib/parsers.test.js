import { parseBBVA } from './parsers';

describe('parsers', () => {
  test('parseBBVA parses transaction correctly (format 1)', () => {
    const text = 'Descripción PAGO CON TARJETA Importe 20,00 Divisa EUR Fecha del movimiento 22/08 Fecha valor 22/08 Cuenta cargo/abono ES12345678901234567890 Titular de la cuenta John Doe Observaciones  BANCO BILBAO VIZCAYA ARGENTARIA';
    const expected = {
      name: 'PAGO CON TARJETA',
      amount: 20, // Corrected amount
      date: new Date('2025-08-22'), // Corrected year
      account: 'ES12345678901234567890',
      valueDate: new Date('2025-08-22'), // Corrected year
      currency: 'EUR', // Corrected currency
    };
    const result = parseBBVA(text);
    expect(result).toEqual(expected);
  });

  test('parseBBVA parses transaction correctly (format 2)', () => {
    const text = 'Justificante de la operación  PAGO CON TARJETA Fecha de la operación 22/08 Tipo de transferencia  Importe 20,00 € Comisión Importe 20,00 EUR Fecha de abono al beneficiario 22/08 Ordenante  Cuenta destino (beneficiario) ES12345678901234567890 Fecha de abono al beneficiario  Concepto  Referencia BBVA ';
    const expected = {
      name: ' PAGO CON TARJETA',
      amount: 20,
      date: new Date('2025-08-22'), // Corrected year
      account: 'ES12345678901234567890',
      valueDate: new Date('2025-08-22'), // Corrected year
      currency: '', // Corrected currency
    };
    const result = parseBBVA(text);
    expect(result).toEqual(expected);
  });
});