'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PRODUCTS, getProductUpdate } from '../data/products';
import type { CartItem, Product, NormalizedCartItem, ProductUpdatesMap } from '../types/catalog';

export function useCart(resolvedProducts?: Product[], productUpdates?: ProductUpdatesMap) {
  const [rawCart, setRawCart] = useState<NormalizedCartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Rehydrate & Migrate from localStorage safely on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loscafeteros_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Migrate legacy { product, qty } schema if encountered
            const normalized: NormalizedCartItem[] = parsed
              .filter((item) => item && (item.productId || item.product?.id))
              .map((item) => ({
                productId: String(item.productId || item.product?.id),
                qty: item.qty,
              }));
            setRawCart(normalized);
          }
        } catch {
          // Graceful fallback for corrupted cache
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist minimal payload { productId, qty } to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('loscafeteros_cart', JSON.stringify(rawCart));
      } catch {
        // Ignore quota/private mode errors
      }
    }
  }, [rawCart, isLoaded]);

  // 3. Dynamically resolve cart items with latest product attributes
  const cart = useMemo<CartItem[]>(() => {
    const catalogList = resolvedProducts && resolvedProducts.length > 0 ? resolvedProducts : PRODUCTS;
    const productMap = new Map<string, Product>();

    catalogList.forEach((p) => {
      let currentProd = p;
      if (productUpdates) {
        const updates = getProductUpdate(p, productUpdates);
        if (updates) {
          currentProd = { ...p, ...updates };
        }
      }
      productMap.set(String(p.id), currentProd);
    });

    return rawCart
      .map((item) => {
        const product = productMap.get(String(item.productId));
        if (!product) return null;
        return {
          product,
          qty: item.qty,
        };
      })
      .filter((item): item is CartItem => Boolean(item));
  }, [rawCart, resolvedProducts, productUpdates]);

  const cartCount = rawCart.length;

  const addToCart = useCallback((productId: string, qty: number | string) => {
    const qtyNum = parseFloat(qty as string) || 1;
    setRawCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => String(i.productId) === String(productId));
      if (existingIdx > -1) {
        const updated = [...prevCart];
        const prevQty = parseFloat(String(updated[existingIdx].qty)) || 0;
        updated[existingIdx] = { ...updated[existingIdx], qty: prevQty + qtyNum };
        return updated;
      }
      return [...prevCart, { productId: String(productId), qty: qtyNum }];
    });
  }, []);

  const updateQty = useCallback((productId: string, newQty: number | string) => {
    if (newQty === '') {
      setRawCart((prevCart) =>
        prevCart.map((item) =>
          String(item.productId) === String(productId) ? { ...item, qty: '' } : item
        )
      );
      return;
    }

    const qtyNum = parseFloat(newQty as string);
    if (!isNaN(qtyNum) && qtyNum <= 0) {
      setRawCart((prevCart) => prevCart.filter((i) => String(i.productId) !== String(productId)));
    } else if (!isNaN(qtyNum)) {
      setRawCart((prevCart) =>
        prevCart.map((item) =>
          String(item.productId) === String(productId) ? { ...item, qty: qtyNum } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setRawCart((prevCart) => prevCart.filter((i) => String(i.productId) !== String(productId)));
  }, []);

  const clearCart = useCallback(() => {
    setRawCart([]);
  }, []);

  return {
    cart,
    cartCount,
    rawCart,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
  };
}
