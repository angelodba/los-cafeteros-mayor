'use client';

import { useState, useCallback, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

export function useCart() {
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loscafeteros_cart');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loscafeteros_cart', JSON.stringify(cart));
    }
    let count = 0;
    cart.forEach((item) => {
      count += parseFloat(item.qty as string) || 0;
    });
    setCartCount(count);
  }, [cart]);

  const addToCart = useCallback((productId: string, qty: number | string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    const qtyNum = parseFloat(qty as string) || 0;
    if (!product || qtyNum <= 0) return;

    setCart((prevCart: any[]) => {
      const existingIdx = prevCart.findIndex((i) => i.product.id === productId);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].qty += qtyNum;
        return updated;
      }
      return [...prevCart, { product, qty: qtyNum }];
    });
  }, []);

  const updateQty = useCallback((productId: string, newQty: number | string) => {
    const qtyNum = parseFloat(newQty as string) || 0;
    if (qtyNum <= 0) {
      setCart((prevCart: any[]) => prevCart.filter((i) => i.product.id !== productId));
    } else {
      setCart((prevCart: any[]) =>
        prevCart.map((item) =>
          item.product.id === productId ? { ...item, qty: qtyNum } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prevCart: any[]) => prevCart.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    cartCount: cart.length,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
  };
}
