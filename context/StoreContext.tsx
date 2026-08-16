'use client';

import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { useBcvRate } from '../hooks/useBcvRate';
import { useStock } from '../hooks/useStock';
import { useCart } from '../hooks/useCart';
import type { CartItem, StockData, ProductUpdatesMap } from '../types/catalog';

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
  // Stock & Product Updates from Google Sheets
  stockData: StockData;
  isStockLoading: boolean;
  /** Actualizaciones de precios/datos provenientes del Google Sheet (reactivo, NO mutación directa) */
  productUpdates: ProductUpdatesMap;
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
  const { stockData, isStockLoading, productUpdates } = useStock();
  const { cart, cartCount, addToCart, updateQty, removeItem, clearCart } = useCart();

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
      stockData,
      isStockLoading,
      productUpdates,
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
      stockData,
      isStockLoading,
      productUpdates,
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

