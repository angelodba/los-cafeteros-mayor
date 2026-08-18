export interface Product {
  id: string;
  name: string;
  category: string;
  priceDetal: number;
  priceMayor: number;
  minWholesaleQty: number;
  unit: string;
  emoji: string;
  highlight: string;
  tags: string[];
  wholesaleNote?: string;
  isOffer?: boolean;
  changes?: string;
}

/**
 * CartItem.qty es `number | string` porque el QuantitySelector permite
 * un campo vacío temporal ('') mientras el usuario está escribiendo.
 */
export interface CartItem {
  product: Product;
  qty: number | string;
}

export interface StockInfo {
  stockQty: number;
  minAlert: number;
  status: 'disponible' | 'bajo_pedido' | 'agotado';
  harvestDate?: string;
}

export type StockData = Record<string, StockInfo>;

export interface NormalizedCartItem {
  productId: string;
  qty: number | string;
}

/**
 * Actualizaciones de producto provenientes del Google Sheet o API.
 * Solo incluye los campos que el origen remoto puede sobrescribir.
 */
export interface ProductUpdate {
  name?: string;
  priceDetal?: number;
  priceMayor?: number;
  wholesaleNote?: string;
  highlight?: string;
  unit?: string;
  category?: string;
  minWholesaleQty?: number;
  changes?: string;
}

export type ProductUpdatesMap = Record<string, ProductUpdate>;


