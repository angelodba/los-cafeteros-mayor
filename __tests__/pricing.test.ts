import { describe, it, expect } from 'vitest';

export function calculateItemPrice(qty: number, priceDetal: number, priceMayor: number, minWholesaleQty: number) {
  return qty >= minWholesaleQty ? qty * priceMayor : qty * priceDetal;
}

describe('Lógica de Precios LOS CAFETEROS', () => {
  it('Debe aplicar precio al detal si la cantidad es menor al mínimo para mayorista', () => {
    const total = calculateItemPrice(15, 1.99, 1.55, 30);
    expect(total).toBeCloseTo(15 * 1.99); // 29.85
  });

  it('Debe aplicar precio al mayor si la cantidad alcanza o supera el mínimo', () => {
    const total = calculateItemPrice(30, 1.99, 1.55, 30);
    expect(total).toBeCloseTo(30 * 1.55); // 46.50
  });

  it('Debe calcular correctamente para rubros de alto volumen (Papas)', () => {
    const total = calculateItemPrice(55, 1.20, 0.90, 50);
    expect(total).toBeCloseTo(55 * 0.90); // 49.50
  });
});
