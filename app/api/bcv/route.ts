import { NextResponse } from 'next/server';

export const revalidate = 3600; // ISR: Revalidar cada hora

const FALLBACK_RATE = 36.50; // Fallback estático de emergencia

function isValidRate(rate: any): boolean {
  return typeof rate === 'number' && !isNaN(rate) && rate > 1 && isFinite(rate);
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
};

export async function GET() {
  try {
    // 1. Primary Attempt: Official BCV API (Simulated or via Aggregator)
    const primaryRes = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      if (data?.monitors?.usd?.price && isValidRate(data.monitors.usd.price)) {
        return NextResponse.json(
          { rate: data.monitors.usd.price, source: 'primary' },
          { headers: CACHE_HEADERS }
        );
      }
    }
  } catch (error) {
    console.warn('⚠️ Primary BCV API failed, attempting secondary...', error);
  }

  try {
    // 2. Secondary Attempt: Alternative API
    const secondaryRes = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (secondaryRes.ok) {
      const data = await secondaryRes.json();
      if (data?.promedio && isValidRate(data.promedio)) {
        return NextResponse.json(
          { rate: data.promedio, source: 'secondary' },
          { headers: CACHE_HEADERS }
        );
      }
    }
  } catch (error) {
    console.warn('⚠️ Secondary BCV API failed, using static fallback.', error);
  }

  // 3. Last Resort Fallback
  return NextResponse.json(
    { rate: FALLBACK_RATE, source: 'fallback' },
    { headers: CACHE_HEADERS }
  );
}
