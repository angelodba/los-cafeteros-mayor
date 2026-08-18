import { describe, it, expect } from 'vitest';
import { parsePrice, isAvailabilityString } from '../app/api/stock/route';

describe('Google Sheets Price Parsing (parsePrice)', () => {
  it('Debe parsear números planos y con decimales', () => {
    expect(parsePrice('1.99')).toBe(1.99);
    expect(parsePrice('15.0')).toBe(15.0);
    expect(parsePrice('0.35')).toBe(0.35);
  });

  it('Debe parsear celdas con formato de moneda estándar ($)', () => {
    expect(parsePrice('$3.50')).toBe(3.5);
    expect(parsePrice('$ 3.50')).toBe(3.5);
    expect(parsePrice('$12.50')).toBe(12.5);
    expect(parsePrice('3.50 $')).toBe(3.5);
  });

  it('Debe soportar formato con coma decimal estilo VE/ES', () => {
    expect(parsePrice('3,50')).toBe(3.5);
    expect(parsePrice('$3,50')).toBe(3.5);
    expect(parsePrice('1,99 $')).toBe(1.99);
  });

  it('Debe soportar prefijos y sufijos de divisas variados (USD, US$, Bs., €)', () => {
    expect(parsePrice('USD 3.50')).toBe(3.5);
    expect(parsePrice('US$ 3.50')).toBe(3.5);
    expect(parsePrice('Bs. 3,50')).toBe(3.5);
    expect(parsePrice('€ 12.50')).toBe(12.5);
    expect(parsePrice('12,50 €')).toBe(12.5);
  });

  it('Debe manejar separadores de miles tanto formato US como formato Europeo', () => {
    expect(parsePrice('1,250.00')).toBe(1250);
    expect(parsePrice('$1,250.50')).toBe(1250.5);
    expect(parsePrice('1.250,50 €')).toBe(1250.5);
    expect(parsePrice('1.250,50')).toBe(1250.5);
  });

  it('Debe devolver 0 para valores explícitos de 0.00 / $0.00', () => {
    expect(parsePrice('0.00')).toBe(0);
    expect(parsePrice('$0.00')).toBe(0);
    expect(parsePrice('0,00')).toBe(0);
  });

  it('Debe devolver NaN para valores vacíos, nulos o no numéricos', () => {
    expect(parsePrice('')).toBeNaN();
    expect(parsePrice(undefined)).toBeNaN();
    expect(parsePrice('—')).toBeNaN();
    expect(parsePrice('N/A')).toBeNaN();
  });
});

describe('Availability & No Disponible Detection (isAvailabilityString)', () => {
  it('Debe detectar palabras afirmativas como true (Disponible)', () => {
    expect(isAvailabilityString('TRUE')).toBe(true);
    expect(isAvailabilityString('true')).toBe(true);
    expect(isAvailabilityString('SI')).toBe(true);
    expect(isAvailabilityString('Sí')).toBe(true);
    expect(isAvailabilityString('DISPONIBLE')).toBe(true);
    expect(isAvailabilityString('ACTIVO')).toBe(true);
    expect(isAvailabilityString('1')).toBe(true);
  });

  it('Debe detectar palabras de no disponibilidad como false (Agotado / No Disponible)', () => {
    expect(isAvailabilityString('FALSE')).toBe(false);
    expect(isAvailabilityString('false')).toBe(false);
    expect(isAvailabilityString('NO')).toBe(false);
    expect(isAvailabilityString('NO DISPONIBLE')).toBe(false);
    expect(isAvailabilityString('nodisponible')).toBe(false);
    expect(isAvailabilityString('no-disponible')).toBe(false);
    expect(isAvailabilityString('AGOTADO')).toBe(false);
    expect(isAvailabilityString('agotada')).toBe(false);
    expect(isAvailabilityString('SIN STOCK')).toBe(false);
    expect(isAvailabilityString('NO HAY')).toBe(false);
    expect(isAvailabilityString('0')).toBe(false);
    expect(isAvailabilityString('INACTIVO')).toBe(false);
    expect(isAvailabilityString('PAUSADO')).toBe(false);
    expect(isAvailabilityString('N/A')).toBe(false);
    expect(isAvailabilityString('ND')).toBe(false);
  });

  it('Debe devolver null para celdas vacías o indefinidas', () => {
    expect(isAvailabilityString('')).toBeNull();
    expect(isAvailabilityString(undefined)).toBeNull();
  });
});

describe('Changes & Operational Notes Rules', () => {
  it('Debe extraer umbral mayorista de frases naturales', () => {
    const extractMinQty = (text: string) => {
      const match = text.toLowerCase().match(/(?:despues de|a partir de|mayor a)\s*(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    };

    expect(extractMinQty('despues de 10 cajas')).toBe(10);
    expect(extractMinQty('a partir de 20 unidades')).toBe(20);
    expect(extractMinQty('mayor a 30 kg')).toBe(30);
    expect(extractMinQty('sin mayor')).toBeUndefined();
  });

  it('Debe filtrar placeholders vacíos en la columna changes', () => {
    const sanitizeChanges = (raw?: string) => {
      if (!raw) return undefined;
      const trimmed = raw.trim();
      if (['', '—', '-', 'N/A', 'null', '""'].includes(trimmed)) return undefined;
      return trimmed;
    };

    expect(sanitizeChanges('—')).toBeUndefined();
    expect(sanitizeChanges('-')).toBeUndefined();
    expect(sanitizeChanges('N/A')).toBeUndefined();
    expect(sanitizeChanges('despues de 10 cajas')).toBe('despues de 10 cajas');
    expect(sanitizeChanges('Oferta especial por bulto')).toBe('Oferta especial por bulto');
  });
});

