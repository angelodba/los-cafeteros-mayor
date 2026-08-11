import { NextResponse } from 'next/server';

export const revalidate = 60; // ISR: Revalidar cada 60 segundos

const GOOGLE_SHEETS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyT1fXfW-Ddf5kQ5uP60rGWtq7GJj0ZTYaB2OO8a15Qbi3GuRuv6eAFj_Tvh-iVATCJ0SoiF7Mvlwd/pub?gid=0&single=true&output=tsv';

function parsePrice(val: string | undefined): number {
  if (!val) return NaN;
  const cleaned = val.replace(',', '.').trim();
  const match = cleaned.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : NaN;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SHEETS_URL, {
      next: { revalidate: 60 },
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!res.ok) {
      throw new Error(`Google Sheets respondió con status ${res.status}`);
    }

    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return NextResponse.json({ stockMap: {}, productUpdates: {} });
    }

    const delimiter = text.includes('\t') ? '\t' : ',';
    let headerIdx = -1;
    let colMap: Record<string, number> = {};

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const cols = lines[i].split(delimiter).map((c) => c.trim().toLowerCase());
      if (
        cols.some(
          (c) =>
            c === 'id' ||
            c.includes('product') ||
            c.includes('rubro') ||
            c.includes('nombre') ||
            c.includes('retail') ||
            c.includes('precio')
        )
      ) {
        headerIdx = i;
        cols.forEach((col, idx) => {
          if (col === 'id') colMap.id = idx;
          else if (col.includes('product') || col === 'nombre' || col === 'rubro' || col === 'name') colMap.name = idx;
          else if (col.includes('retail') || col === 'precio_detal' || col === 'precio') colMap.priceDetal = idx;
          else if (col.includes('wholesale') || col.includes('mayor')) colMap.priceMayor = idx;
          else if (col.includes('bulk') || col.includes('cesta') || col.includes('bulto')) colMap.bulkInfo = idx;
          else if (col.includes('avail') || col.includes('dispon')) colMap.isAvailable = idx;
        });
        break;
      }
    }

    const dataLines = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines;
    const stockMap: Record<string, any> = {};
    const productUpdates: Record<string, any> = {};

    dataLines.forEach((line) => {
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) return;

      const rawId = colMap.id !== undefined ? parts[colMap.id] : '';
      const rawName = colMap.name !== undefined ? parts[colMap.name] : parts[1] || parts[0];
      if (!rawName && !rawId) return;

      const slugId = rawName ? rawName.toLowerCase().replace(/\s+/g, '-') : '';

      const retailVal = colMap.priceDetal !== undefined ? parsePrice(parts[colMap.priceDetal]) : NaN;
      const wholesaleVal = colMap.priceMayor !== undefined ? parsePrice(parts[colMap.priceMayor]) : NaN;
      const bulkText = colMap.bulkInfo !== undefined ? parts[colMap.bulkInfo] : '';
      const availText = colMap.isAvailable !== undefined ? parts[colMap.isAvailable].toUpperCase() : 'TRUE';

      const isAvail = availText === 'TRUE' || availText === 'SI' || availText === 'DISPONIBLE' || availText === '1';

      const stockObj = {
        stockQty: isAvail ? 100 : 0,
        minAlert: 15,
        status: isAvail ? 'disponible' : 'agotado',
        harvestDate: new Date().toISOString().split('T')[0]
      };

      const updateObj: Record<string, any> = {};
      if (!isNaN(retailVal) && retailVal > 0) updateObj.priceDetal = retailVal;
      if (!isNaN(wholesaleVal) && wholesaleVal > 0) updateObj.priceMayor = wholesaleVal;
      if (bulkText && bulkText !== '—' && bulkText !== '' && bulkText !== '-') {
        updateObj.wholesaleNote = bulkText;
        updateObj.highlight = bulkText;
      }

      // Guardar mapeos por ID numérico (ej: "1"), por slug (ej: "aguacate-polo") y por nombre exacto
      const keysToRegister = [rawId, slugId, rawName].filter(Boolean);

      keysToRegister.forEach((key) => {
        stockMap[key] = stockObj;
        if (Object.keys(updateObj).length > 0) {
          productUpdates[key] = updateObj;
        }
      });
    });

    return NextResponse.json({ stockMap, productUpdates, totalItems: Object.keys(stockMap).length });
  } catch (error: any) {
    console.error('Error fetching stock from Google Sheets API Route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
