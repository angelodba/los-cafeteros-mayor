'use client';

import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { useBcvRate } from '../hooks/useBcvRate';
import { useStock } from '../hooks/useStock';
import { useCart } from '../hooks/useCart';
import { PRODUCTS } from '../data/products';
import type { CartItem, Product, StockData, ProductUpdatesMap } from '../types/catalog';

type BillingData = {
  restName: string;
  rif: string;
  zone: string;
  phone: string;
};

type StoreContextType = {
  // BCV Rate
  bcvRate: number;
  isBcvLoading: boolean;
  // Dynamic unified catalog & stock
  products: Product[];
  stockData: StockData;
  isStockLoading: boolean;
  /** Actualizaciones de precios/datos provenientes del Google Sheet (reactivo, NO mutación directa) */
  productUpdates: ProductUpdatesMap;
  refreshStock: () => Promise<void>;
  // Cart
  cart: CartItem[];
  cartCount: number;
  addToCart: (productId: string, qty: number | string) => void;
  updateCartItemQuantity: (productId: string, newQty: number | string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Billing
  billingData: BillingData;
  setBillingData: React.Dispatch<React.SetStateAction<BillingData>>;
  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { bcvRate, isLoading: isBcvLoading } = useBcvRate();
  const { stockData, isStockLoading, productUpdates, refreshStock } = useStock();

  // Unified reactive catalog: Merges static defaults with live overrides (names, prices, units, notes)
  const products = useMemo<Product[]>(() => {
    return PRODUCTS.map((baseProduct) => {
      const slug = baseProduct.name ? baseProduct.name.toLowerCase().replace(/\s+/g, '-') : '';
      const updates = productUpdates[baseProduct.id] || productUpdates[slug] || productUpdates[baseProduct.name];
      if (!updates) return baseProduct;
      return { ...baseProduct, ...updates };
    });
  }, [productUpdates]);

  const { cart, cartCount, addToCart, updateQty, removeItem, clearCart } = useCart(products, productUpdates);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [billingData, setBillingData] = useState<BillingData>({
    restName: '',
    rif: '',
    zone: '',
    phone: '',
  });

  const value = useMemo(
    () => ({
      bcvRate,
      isBcvLoading,
      products,
      stockData,
      isStockLoading,
      productUpdates,
      refreshStock,
      cart,
      cartCount,
      billingData,
      setBillingData,
      addToCart,
      updateCartItemQuantity: updateQty,
      removeFromCart: removeItem,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      isLocationModalOpen,
      setIsLocationModalOpen,
    }),
    [
      bcvRate,
      isBcvLoading,
      products,
      stockData,
      isStockLoading,
      productUpdates,
      refreshStock,
      cart,
      cartCount,
      billingData,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      isCartOpen,
      isLocationModalOpen,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore debe usarse dentro de un StoreProvider');
  }
  return context;
}
