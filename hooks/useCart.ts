'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PRODUCTS } from '../data/products';
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
            const normalized: NormalizedCartItem[] = parsed
              .map((item: any) => {
                // Backward compatibility: Support legacy format { product: { id: "1", ... }, qty }
                if (item && item.product && item.product.id) {
                  return {
                    productId: String(item.product.id),
                    qty: item.qty,
                  };
                }
                // Standard normalized format: { productId: "1", qty }
                if (item && item.productId) {
                  return {
                    productId: String(item.productId),
                    qty: item.qty,
                  };
                }
                return null;
              })
              .filter((item): item is NormalizedCartItem => Boolean(item));

            setRawCart(normalized);
          }
        } catch (e) {
          console.warn('[useCart] No se pudo restaurar el carrito desde localStorage:', e);
        }
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Persist ONLY normalized items to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('loscafeteros_cart', JSON.stringify(rawCart));
    }
  }, [rawCart, isLoaded]);

  // 3. Dynamically resolve cart items with latest product attributes
  const cart = useMemo<CartItem[]>(() => {
    const catalogList = resolvedProducts && resolvedProducts.length > 0 ? resolvedProducts : PRODUCTS;
    const productMap = new Map<string, Product>();

    catalogList.forEach((p) => {
      let currentProd = p;
      if (productUpdates) {
        const slug = p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : '';
        const updates = productUpdates[p.id] || productUpdates[slug] || productUpdates[p.name];
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
