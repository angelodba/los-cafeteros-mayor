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
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface StockInfo {
  stockQty: number;
  minAlert: number;
  status: 'disponible' | 'bajo_pedido' | 'agotado';
}

export type StockData = Record<string, StockInfo>;
