'use client';

import { useState, useEffect } from 'react';

const BCV_CACHE_KEY = 'cafeteros_bcv_cache_v2';

export function useBcvRate(initialRate = 36.50) {
  const [bcvRate, setBcvRate] = useState(initialRate);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initBcv() {
      // 1. Try to load from localStorage cache first for immediate UI render
      try {
        const raw = localStorage.getItem(BCV_CACHE_KEY);
        if (raw) {
          const cache = JSON.parse(raw);
          if (cache.rate && !isNaN(cache.rate)) {
            setBcvRate(cache.rate);
            setIsLoading(false);
          }
        }
      } catch (_) {}

      // 2. Fetch the resilient Server-Side API Route
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch('/api/bcv', { signal: controller.signal });
        clearTimeout(timeout);
        
        if (res.ok) {
          const data = await res.json();
          if (data.rate && data.rate > 0) {
            setBcvRate(data.rate);
            setIsLoading(false);
            try {
              localStorage.setItem(BCV_CACHE_KEY, JSON.stringify({ rate: data.rate, savedAt: Date.now() }));
            } catch (_) {}
            console.info(`[BCV] Tasa sincronizada (${data.source}): Bs ${data.rate}`);
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn('[BCV] Network fail, using fallback or cache.');
        }
        setIsLoading(false);
      }
    }

    initBcv();
  }, []);

  return { bcvRate, isLoading };
}
