'use client';

import { useState, useEffect, useCallback } from 'react';
import { StockData, ProductUpdatesMap } from '../types/catalog';

/**
 * Hook para sincronizar el catálogo de Google Sheets en tiempo real.
 * Soporta polling periódico configurable y re-sincronización automática
 * cuando el usuario regresa a la pestaña activa (window focus).
 */
export function useStock(pollingIntervalMs: number = 60000) {
  const [stockData, setStockData] = useState<StockData>({});
  const [productUpdates, setProductUpdates] = useState<ProductUpdatesMap>({});
  const [isStockLoading, setIsStockLoading] = useState<boolean>(true);

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/stock', {
        cache: 'no-store', // Asegura respuesta fresca del servidor
      });
      if (!res.ok) throw new Error(`Stock API error: ${res.status}`);
      const data: { stockMap?: StockData; productUpdates?: ProductUpdatesMap } = await res.json();

      if (data.stockMap) {
        setStockData(data.stockMap);
      }

      if (data.productUpdates) {
        setProductUpdates(data.productUpdates);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[useStock] Error al sincronizar catálogo con Google Sheets:', msg);
    } finally {
      setIsStockLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();

    // 1. Polling periódico automático (por defecto cada 60s)
    let intervalId: NodeJS.Timeout | null = null;
    if (pollingIntervalMs > 0) {
      intervalId = setInterval(fetchStock, pollingIntervalMs);
    }

    // 2. Re-sincronizar automáticamente cuando el usuario regresa a la pestaña (focus & visibilitychange)
    const handleRevalidate = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchStock();
      }
    };
    window.addEventListener('focus', fetchStock);
    document.addEventListener('visibilitychange', handleRevalidate);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', fetchStock);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [fetchStock, pollingIntervalMs]);

  return { stockData, isStockLoading, productUpdates, refreshStock: fetchStock };
}
