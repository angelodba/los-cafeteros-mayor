'use client';

// URL por defecto del documento Google Sheets en formato TSV/CSV
export const GOOGLE_SHEETS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyT1fXfW-Ddf5kQ5uP60rGWtq7GJj0ZTYaB2OO8a15Qbi3GuRuv6eAFj_Tvh-iVATCJ0SoiF7Mvlwd/pub?gid=0&single=true&output=tsv';

class StockServiceManager {
  constructor() {
    this.storageKey = 'los_cafeteros_stock_v1';
    this.listeners = [];
    this.cachedProducts = null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.getStockData()));
  }

  initDefaults() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(this.storageKey)) {
      const initialStock = {
        'pimenton': { stockQty: 150, minAlert: 20, status: 'disponible' },
        'tomate': { stockQty: 300, minAlert: 40, status: 'disponible' },
        'cebolla-blanca': { stockQty: 250, minAlert: 35, status: 'disponible' },
        'papa': { stockQty: 400, minAlert: 50, status: 'disponible' },
        'zanahoria': { stockQty: 180, minAlert: 25, status: 'disponible' },
        'aguacate-polo': { stockQty: 90, minAlert: 20, status: 'disponible' }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialStock));
    }
  }

  getStockData() {
    if (typeof window === 'undefined') return {};
    this.initDefaults();
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch (e) {
      return {};
    }
  }

  /**
   * Sincroniza dinámicamente el catálogo y stock desde Google Sheets en vivo
   */
  async fetchFromGoogleSheets(urlOverride = '', productsArray = []) {
    if (typeof window === 'undefined') return false;

    const url = urlOverride || GOOGLE_SHEETS_URL;
    if (!url) return false;

    try {
      console.log('📊 [Google Sheets] Sincronizando catálogo y existencias en vivo...');
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const text = await res.text();

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return false;

      const delimiter = text.includes('\t') ? '\t' : ',';

      let headerIdx = -1;
      let colMap = {};

      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim().toLowerCase());
        if (
          cols.some(
            (c) =>
              c.includes('product') ||
              c.includes('rubro') ||
              c.includes('nombre') ||
              c.includes('retail') ||
              c.includes('precio')
          )
        ) {
          headerIdx = i;
          cols.forEach((col, idx) => {
            if (col.includes('product') || col === 'nombre' || col === 'rubro' || col === 'name') colMap.name = idx;
            else if (col.includes('retail') || col === 'precio_detal' || col === 'precio') colMap.priceDetal = idx;
            else if (col.includes('wholesale') || col.includes('mayor')) colMap.priceMayor = idx;
            else if (col.includes('bulk') || col.includes('cesta') || col.includes('bulto')) colMap.bulkInfo = idx;
            else if (col.includes('cat')) colMap.category = idx;
            else if (col.includes('unit') || col === 'unidad') colMap.unit = idx;
            else if (col.includes('avail') || col.includes('dispon')) colMap.isAvailable = idx;
            else if (col === 'id') colMap.id = idx;
          });
          break;
        }
      }

      const stockMap = this.getStockData();
      const dataLines = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines;

      dataLines.forEach((line) => {
        const parts = line.split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length < 2) return;

        const rawName = colMap.name !== undefined ? parts[colMap.name] : parts[1] || parts[0];
        if (!rawName) return;

        const matchProd = (productsArray || []).find(
          (p) =>
            (p.id && p.id.toLowerCase() === rawName.toLowerCase()) ||
            (p.name && p.name.toLowerCase() === rawName.toLowerCase()) ||
            (p.name && p.name.toLowerCase().includes(rawName.toLowerCase()))
        );

        const targetId = matchProd ? matchProd.id : rawName.toLowerCase().replace(/\s+/g, '-');

        let retailVal = colMap.priceDetal !== undefined ? parseFloat(parts[colMap.priceDetal]) : NaN;
        let wholesaleVal = colMap.priceMayor !== undefined ? parseFloat(parts[colMap.priceMayor]) : NaN;
        let bulkText = colMap.bulkInfo !== undefined ? parts[colMap.bulkInfo] : '';
        let availText = colMap.isAvailable !== undefined ? parts[colMap.isAvailable].toUpperCase() : 'TRUE';

        const isAvail = availText === 'TRUE' || availText === 'SI' || availText === 'DISPONIBLE' || availText === '1';

        if (matchProd) {
          if (!isNaN(retailVal) && retailVal > 0) matchProd.priceDetal = retailVal;
          if (!isNaN(wholesaleVal) && wholesaleVal > 0) matchProd.priceMayor = wholesaleVal;
          if (bulkText && bulkText !== '—' && bulkText !== '') {
            matchProd.wholesaleNote = bulkText;
            matchProd.highlight = bulkText;
          }
        }

        stockMap[targetId] = {
          stockQty: isAvail ? 100 : 0,
          minAlert: 15,
          status: isAvail ? 'disponible' : 'agotado',
          harvestDate: new Date().toISOString().split('T')[0]
        };
      });

      localStorage.setItem(this.storageKey, JSON.stringify(stockMap));
      console.log('✅ [Google Sheets] Catálogo e inventario sincronizados exitosamente.');
      this.notify();
      return true;
    } catch (err) {
      console.warn('⚠️ [Google Sheets] Error al sincronizar datos:', err.message);
      return false;
    }
  }
}

export const stockService = new StockServiceManager();
