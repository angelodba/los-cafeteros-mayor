'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { useBcvRate } from '../hooks/useBcvRate';
import { useStock } from '../hooks/useStock';
import { useCart } from '../hooks/useCart';

type StoreContextType = {
  bcvRate: any;
  isBcvLoading: boolean;
  stockData: any;
  isStockLoading: boolean;
  cart: any;
  cartCount: number;
  billingData: { restName: string; rif: string; zone: string; phone?: string };
  setBillingData: (data: { restName: string; rif: string; zone: string; phone?: string }) => void;
  addToCart: any;
  updateCartItemQuantity: any;
  removeFromCart: any;
  clearCart: any;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { bcvRate, isLoading: isBcvLoading } = useBcvRate();
  const { stockData, isStockLoading } = useStock();
  const { cart, cartCount, addToCart, updateQty, removeItem, clearCart } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(true);

  const [billingData, setBillingData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loscafeteros_billing');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return { restName: '', rif: '', zone: '', phone: '' };
  });

  // useEffect para sincronizar billingData
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loscafeteros_billing', JSON.stringify(billingData));
    }
  }, [billingData]);

  const value = useMemo(() => ({
    bcvRate,
    isBcvLoading,
    stockData,
    isStockLoading,
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
  }), [
    bcvRate, isBcvLoading, stockData, isStockLoading, cart, cartCount, billingData, addToCart, 
    updateQty, removeItem, clearCart,
    isCartOpen, isLocationModalOpen
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
