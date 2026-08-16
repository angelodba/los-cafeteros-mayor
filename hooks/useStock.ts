'use client';

import { useState, useEffect } from 'react';
import { StockData, ProductUpdatesMap } from '../types/catalog';

export function useStock() {
  const [stockData, setStockData] = useState<StockData>({});
  const [productUpdates, setProductUpdates] = useState<ProductUpdatesMap>({});
  const [isStockLoading, setIsStockLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/stock')
      .then((res) => {
        if (!res.ok) throw new Error(`Stock API error: ${res.status}`);
        return res.json();
      })
      .then((data: { stockMap?: StockData; productUpdates?: ProductUpdatesMap }) => {
        if (cancelled) return;

        if (data.stockMap) {
          setStockData(data.stockMap);
        }

        // CORRECCIÓN CRÍTICA: En lugar de mutar el array PRODUCTS directamente
        // (lo cual NO activa re-renders de React), almacenamos las actualizaciones
        // como estado reactivo que los componentes leen a través del contexto.
        if (data.productUpdates) {
          setProductUpdates(data.productUpdates);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('[useStock] Error al sincronizar catálogo con Google Sheets:', err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsStockLoading(false);
      });

    // Cleanup: evitar actualizar estado si el componente se desmonta
    return () => {
      cancelled = true;
    };
  }, []);

  return { stockData, isStockLoading, productUpdates };
}

