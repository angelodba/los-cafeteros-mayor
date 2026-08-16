import { NextResponse } from 'next/server';

export const revalidate = 60; // ISR: Revalidar cada 60 segundos

// SECURITY: Variable server-only (sin prefijo NEXT_PUBLIC_).
// La URL del Sheet no debe exponerse al bundle del cliente.
const GOOGLE_SHEETS_URL =
  process.env.GOOGLE_SHEETS_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyT1fXfW-Ddf5kQ5uP60rGWtq7GJj0ZTYaB2OO8a15Qbi3GuRuv6eAFj_Tvh-iVATCJ0SoiF7Mvlwd/pub?gid=0&single=true&output=tsv';

/**
 * Parsea un valor de precio de Google Sheets de forma defensiva.
 * Maneja: coma decimal (1,50 → 1.50), separadores de miles (1.234,50 → 1234.50),
 * símbolo $ y espacios.
 */
function parsePrice(val: string | undefined): number {
  if (!val) return NaN;
  // Quitar símbolo de moneda, espacios y comillas
  let cleaned = val.replace(/["$\s]/g, '').trim();
  // Si tiene coma decimal estilo VE/ES (ej: "1,50" o "1.234,50")
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Formato europeo: 1.234,50 → quitar punto de miles, cambiar coma decimal
    cleaned = cleaned.replaceAll('.', '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Solo coma: es decimal (1,50 → 1.50)
    cleaned = cleaned.replace(',', '.');
  }
  const match = cleaned.match(/^[\d.]+/);
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
      const headerLine = lines[i];
      // Detectar delimitador en la línea de encabezado específicamente
      const lineDelimiter = headerLine.includes('\t') ? '\t' : ',';
      const cols = headerLine.split(lineDelimiter).map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ''));

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
        // Actualizar delimitador basado en el encabezado real
        Object.assign(colMap, {});
        cols.forEach((col, idx) => {
          if (col === 'id') colMap.id = idx;
          else if (col.includes('product') || col === 'nombre' || col === 'rubro' || col === 'name') colMap.name = idx;
          // Precio detal (retail)
          else if (col.includes('retail') || col === 'precio_detal' || col === 'precio_detall' || col === 'precio') colMap.priceDetal = idx;
          // Precio mayor (wholesale)
          else if (col.includes('wholesale') || col.includes('mayor') || col === 'precio_mayor') colMap.priceMayor = idx;
          // Info de bulto / cesta
          else if (col.includes('bulk') || col.includes('cesta') || col.includes('bulto') || col.includes('nota')) colMap.bulkInfo = idx;
          // Disponibilidad
          else if (col.includes('avail') || col.includes('dispon') || col === 'activo' || col === 'disponible') colMap.isAvailable = idx;
          // Nuevas columnas: unidad, categoría y umbral mayorista
          else if (col === 'unit' || col === 'unidad' || col.includes('tipo_unidad')) colMap.unit = idx;
          else if (col === 'category' || col === 'categoria' || col === 'rubro_cat') colMap.category = idx;
          else if (col.includes('min_mayor') || col.includes('min_wholesale') || col.includes('umbral')) colMap.minWholesaleQty = idx;
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
      const availRaw = colMap.isAvailable !== undefined ? parts[colMap.isAvailable] : 'TRUE';
      const availText = availRaw.trim().toUpperCase()
        // Normalizar tilde: SÍ → SI
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const isAvail =
        availText === 'TRUE' ||
        availText === 'SI' ||
        availText === 'DISPONIBLE' ||
        availText === '1' ||
        availText === 'YES' ||
        availText === 'ACTIVO';

      const stockObj = {
        stockQty: isAvail ? 100 : 0,
        minAlert: 15,
        status: isAvail ? 'disponible' : 'agotado',
        harvestDate: new Date().toISOString().split('T')[0]
      };

      const updateObj: Record<string, number | string | boolean> = {};
      if (!isNaN(retailVal) && retailVal > 0) updateObj.priceDetal = retailVal;
      if (!isNaN(wholesaleVal) && wholesaleVal > 0) updateObj.priceMayor = wholesaleVal;
      if (bulkText && bulkText !== '—' && bulkText !== '' && bulkText !== '-') {
        updateObj.wholesaleNote = bulkText;
        updateObj.highlight = bulkText;
      }
      // Columnas adicionales del Sheet
      if (colMap.unit !== undefined && parts[colMap.unit]) {
        updateObj.unit = parts[colMap.unit].trim();
      }
      if (colMap.category !== undefined && parts[colMap.category]) {
        updateObj.category = parts[colMap.category].trim().toLowerCase();
      }
      if (colMap.minWholesaleQty !== undefined && parts[colMap.minWholesaleQty]) {
        const minWq = parseInt(parts[colMap.minWholesaleQty].trim(), 10);
        if (!isNaN(minWq) && minWq > 0) updateObj.minWholesaleQty = minWq;
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
  } catch (error: unknown) {
    // SECURITY: No exponer mensajes internos de error al cliente en producción.
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Stock API] Error al obtener datos de Google Sheets:', msg);
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: isProduction ? 'No se pudo obtener el catálogo. Intenta de nuevo.' : msg },
      { status: 500 }
    );
  }
}
