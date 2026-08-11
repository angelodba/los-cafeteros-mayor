'use client';

import { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { StockData } from '../types/catalog';

export function useStock() {
  const [stockData, setStockData] = useState<StockData>({});
  const [isStockLoading, setIsStockLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/stock')
      .then((res) => res.json())
      .then((data) => {
        if (data.stockMap) {
          setStockData(data.stockMap);
        }
        if (data.productUpdates) {
          PRODUCTS.forEach((prod) => {
            const slug = prod.name ? prod.name.toLowerCase().replace(/\s+/g, '-') : '';
            const updates =
              data.productUpdates[prod.id] ||
              data.productUpdates[slug] ||
              data.productUpdates[prod.name];

            if (updates) {
              if (updates.priceDetal) prod.priceDetal = updates.priceDetal;
              if (updates.priceMayor) prod.priceMayor = updates.priceMayor;
              if (updates.wholesaleNote) prod.wholesaleNote = updates.wholesaleNote;
              if (updates.highlight) prod.highlight = updates.highlight;
            }
          });
        }
      })
      .catch((err) => console.error('Error sincronizando stock:', err))
      .finally(() => {
        setIsStockLoading(false);
      });
  }, []);

  return { stockData, isStockLoading };
}
