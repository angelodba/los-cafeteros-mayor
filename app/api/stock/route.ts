import { NextResponse } from 'next/server';

export const revalidate = 60; // ISR: Revalidar cada 60 segundos

// SECURITY: Variable server-only (sin prefijo NEXT_PUBLIC_).
// La URL del Sheet no debe exponerse al bundle del cliente.
const GOOGLE_SHEETS_URL =
  process.env.GOOGLE_SHEETS_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyT1fXfW-Ddf5kQ5uP60rGWtq7GJj0ZTYaB2OO8a15Qbi3GuRuv6eAFj_Tvh-iVATCJ0SoiF7Mvlwd/pub?gid=0&single=true&output=tsv';

/**
 * Parsea un valor de precio de Google Sheets de forma ultra-defensiva.
 * Maneja:
 * - Símbolos de moneda y prefijos/sufijos: $, USD, US$, Bs., Bs, €, etc.
 * - Coma decimal estilo VE/ES (ej: "1,50" → 1.50)
 * - Separadores de miles estilo US ("$1,250.50" → 1250.50) o estilo VE/ES ("1.250,50 €" → 1250.50)
 * - Espacios y comillas
 */
export function parsePrice(val: string | undefined): number {
  if (!val) return NaN;
  // 1. Quitar caracteres que no sean dígitos, coma, punto o signo negativo
  // Esto remueve limpiamente $, USD, US$, Bs., Bs, €, comillas y espacios
  let cleaned = val.replace(/[^\d.,-]/g, '').trim();
  if (!cleaned) return NaN;

  // 2. Si contiene tanto punto como coma (ej: 1,234.56 o 1.234,56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot > lastComma) {
      // Formato US / Estándar: 1,234.56 -> Quitar coma de miles
      cleaned = cleaned.replaceAll(',', '');
    } else {
      // Formato Europeo / VE: 1.234,56 -> Quitar punto de miles y cambiar coma a punto
      cleaned = cleaned.replaceAll('.', '').replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    // Solo tiene coma (ej: 1,50 o 1250,50) -> Cambiar coma decimal a punto
    cleaned = cleaned.replace(',', '.');
  }

  // 3. Extraer el valor numérico
  const match = cleaned.match(/^-?\d+(\.\d+)?/);
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
    if (lines.length < 2) {
      throw new Error('El archivo de Google Sheets está vacío o mal formado (faltan datos).');
    }

    const delimiter = text.includes('\t') ? '\t' : ',';
    let headerIdx = -1;
    let colMap: Record<string, number> = {};

    // Helper to sanitize row values
    const sanitizeValue = (val: string | undefined) => {
      if (!val) return '';
      const trimmed = val.trim().replace(/^"|"$/g, '');
      if (['', '—', '-', 'n/a', 'null'].includes(trimmed.toLowerCase())) return '';
      return trimmed;
    };

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const headerLine = lines[i];
      // Detectar delimitador en la línea de encabezado específicamente
      const lineDelimiter = headerLine.includes('\t') ? '\t' : ',';
      const cols = headerLine
        .split(lineDelimiter)
        .map((c) =>
          c
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/^"|"$/g, '')
        );

      if (
        cols.some(
          (c) =>
            c === 'id' ||
            c === 'sku' ||
            c.includes('product') ||
            c.includes('rubro') ||
            c.includes('nombre') ||
            c.includes('articulo') ||
            c.includes('item') ||
            c.includes('retail') ||
            c.includes('precio')
        )
      ) {
        headerIdx = i;
        // Actualizar delimitador basado en el encabezado real
        Object.assign(colMap, {});
        cols.forEach((col, idx) => {
          if (col === 'id' || col === 'sku') colMap.id = idx;
          else if (
            col.includes('product') ||
            col.includes('nombre') ||
            col.includes('rubro') ||
            col.includes('articulo') ||
            col === 'name' ||
            col === 'item' ||
            col === 'title' ||
            col === 'titulo'
          ) {
            colMap.name = idx;
          }
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
          else if (
            col.includes('cambio') ||
            col.includes('nota') ||
            col.includes('observacion') ||
            col.includes('change') ||
            col.includes('aviso') ||
            col.includes('info')
          ) {
            colMap.changes = idx;
          }
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

      const rawId = sanitizeValue(colMap.id !== undefined ? parts[colMap.id] : '');
      let rawName = sanitizeValue(colMap.name !== undefined ? parts[colMap.name] : parts[1] || parts[0]);
      if (!rawName && !rawId) return;

      const slugId = rawName ? rawName.toLowerCase().replace(/\s+/g, '-') : '';

      const retailVal = colMap.priceDetal !== undefined ? parsePrice(sanitizeValue(parts[colMap.priceDetal])) : NaN;
      const wholesaleVal = colMap.priceMayor !== undefined ? parsePrice(sanitizeValue(parts[colMap.priceMayor])) : NaN;
      const bulkText = sanitizeValue(colMap.bulkInfo !== undefined ? parts[colMap.bulkInfo] : '');
      const availRaw = sanitizeValue(colMap.isAvailable !== undefined ? parts[colMap.isAvailable] : 'TRUE') || 'TRUE';
      const availText = availRaw.toUpperCase()
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
      if (rawName) {
        updateObj.name = rawName;
      }
      if (!isNaN(retailVal) && retailVal > 0) updateObj.priceDetal = retailVal;
      if (!isNaN(wholesaleVal) && wholesaleVal > 0) updateObj.priceMayor = wholesaleVal;
      if (bulkText) {
        updateObj.wholesaleNote = bulkText;
        updateObj.highlight = bulkText;
      }
      // Columnas adicionales del Sheet
      if (colMap.unit !== undefined) {
        const unitVal = sanitizeValue(parts[colMap.unit]);
        if (unitVal) updateObj.unit = unitVal;
      }
      if (colMap.category !== undefined) {
        const catVal = sanitizeValue(parts[colMap.category]);
        if (catVal) updateObj.category = catVal.toLowerCase();
      }
      if (colMap.minWholesaleQty !== undefined) {
        const minWqVal = sanitizeValue(parts[colMap.minWholesaleQty]);
        if (minWqVal) {
          const minWq = parseInt(minWqVal, 10);
          if (!isNaN(minWq) && minWq > 0) updateObj.minWholesaleQty = minWq;
        }
      }

      // Parsear la columna de cambios / business rules en lenguaje natural
      if (colMap.changes !== undefined) {
        const rawChanges = sanitizeValue(parts[colMap.changes]);
        const changesText = rawChanges.toLowerCase();

        // Preservar la nota de cambios si no es un placeholder vacío
        if (rawChanges) {
          updateObj.changes = rawChanges;
        }

        if (changesText) {
          // Extraer umbral de mayorista: "despues de 10", "a partir de 20", "mayor a 30"
          const qtyMatch = changesText.match(/(?:despues de|a partir de|mayor a)\s*(\d+)/);
          if (qtyMatch) {
            const parsedQty = parseInt(qtyMatch[1], 10);
            if (!isNaN(parsedQty) && parsedQty > 0) updateObj.minWholesaleQty = parsedQty;
          }
          // Extraer unidad
          if (changesText.includes('por unidades') || changesText.includes('unidad') || changesText.includes('unidades')) {
            updateObj.unit = 'unid';
          } else if (changesText.includes('a kg') || changesText.includes('por kg') || changesText.includes('kilo')) {
            updateObj.unit = 'kg';
          }
          // Manejar "sin mayor" para deshabilitar wholesale
          if (changesText.includes('sin mayor')) {
            updateObj.minWholesaleQty = 999999;
            updateObj.priceMayor = !isNaN(retailVal) && retailVal > 0 ? retailVal : -1;
          }
        }
      }

      // Guardar mapeos por ID numérico (ej: "1"), por slug (ej: "aguacate-polo") y por nombre exacto/normalizado
      const normalizedRawName = rawName ? rawName.toLowerCase().trim() : '';
      const keysToRegister = [rawId, slugId, rawName, normalizedRawName].filter(Boolean);

      keysToRegister.forEach((key) => {
        stockMap[key] = stockObj;
        if (Object.keys(updateObj).length > 0) {
          productUpdates[key] = updateObj;
        }
      });
    });

    return NextResponse.json(
      { stockMap, productUpdates, totalItems: Object.keys(stockMap).length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
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
