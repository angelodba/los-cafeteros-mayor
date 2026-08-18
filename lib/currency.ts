/**
 * Domain Currency Utility para LOS CAFETEROS.
 * Regla de negocio: El Bolívar venezolano (VES) siempre se formatea con 2 decimales y coma como separador decimal.
 */

export function formatUSD(amount: number): string {
  if (isNaN(amount) || amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatVES(amountUSD: number, bcvRate: number): string {
  if (isNaN(amountUSD) || isNaN(bcvRate) || amountUSD == null || bcvRate == null) {
    return 'Bs. 0,00';
  }
  
  // Redondeo bancario estricto a 2 decimales
  const totalVES = Math.round(amountUSD * bcvRate * 100) / 100;
  
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalVES);

  return `Bs. ${formatted}`;
}

export function calculateSubtotal(cartItems: { product: { priceMayor: number; priceDetal: number; minWholesaleQty?: number }; qty: number }[]): number {
  return cartItems.reduce((acc, item) => {
    const qty = item.qty;
    const minMayor = item.product.minWholesaleQty || 30;
    const price = qty >= minMayor ? item.product.priceMayor : item.product.priceDetal;
    return acc + (price * qty);
  }, 0);
}
