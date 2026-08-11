'use client';

import { useState, useCallback, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

export function useCart() {
  const [cart, setCart] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loscafeteros_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        } catch (e) {}
      }
    }
    setIsLoaded(true);
  }, []);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('loscafeteros_cart', JSON.stringify(cart));
    }
    setCartCount(cart.length);
  }, [cart, isLoaded]);

  const addToCart = useCallback((productId: string, qty: number | string) => {
    const product = PRODUCTS.find((p) => String(p.id) === String(productId));
    const qtyNum = parseFloat(qty as string) || 1;
    if (!product) return;

    setCart((prevCart: any[]) => {
      const existingIdx = prevCart.findIndex((i) => String(i.product.id) === String(productId));
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = { ...updated[existingIdx], qty: updated[existingIdx].qty + qtyNum };
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
    cartCount,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
  };
}
