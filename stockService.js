/**
 * LOS CAFETEROS - SERVICIO DE MANEJO AVANZADO DE STOCK E INVENTARIO
 * Soporte para Supabase (PostgreSQL + Realtime) y Fallback Local Persistente
 */

// ⚙️ COLOCA AQUÍ TUS CREDENCIALES DE SUPABASE DASHBOARD (Opcional si usas Supabase)
const SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('supabase_url') || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

// 📊 COLOCA AQUÍ LA URL DE TU HOJA DE GOOGLE SHEETS EN FORMATO CSV (Publicar en la web -> CSV)
const GOOGLE_SHEETS_CSV_URL = window.GOOGLE_SHEETS_CSV_URL || localStorage.getItem('google_sheets_csv_url') || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyT1fXfW-Ddf5kQ5uP60rGWtq7GJj0ZTYaB2OO8a15Qbi3GuRuv6eAFj_Tvh-iVATCJ0SoiF7Mvlwd/pub?gid=0&single=true&output=csv';

class StockServiceManager {
    constructor() {
        this.supabase = null;
        this.isCloudConnected = false;
        this.listeners = [];
        this.storageKey = 'los_cafeteros_stock_v1';
        this.movementsKey = 'los_cafeteros_stock_movements_v1';
        
        this.init();
    }

    async init() {
        const url = SUPABASE_URL || localStorage.getItem('supabase_url');
        const key = SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key');

        if (window.supabase && url && key && url.includes('supabase')) {
            try {
                this.supabase = window.supabase.createClient(url, key);
                this.isCloudConnected = true;
                console.log('✅ Supabase PostgreSQL + Realtime conectado exitosamente.');
                this.setupRealtimeSubscription();
                this.seedSupabaseIfNeeded();
            } catch (err) {
                console.warn('⚠️ Error conectando Supabase:', err);
                this.isCloudConnected = false;
            }
        } else {
            this.isCloudConnected = false;
        }

        this.initLocalStorageDefaults();

        // Sincronizar existencias automáticamente desde Google Sheets si está configurada la URL
        if (GOOGLE_SHEETS_CSV_URL || localStorage.getItem('google_sheets_csv_url')) {
            await this.fetchFromGoogleSheets();
        }
    }

    setCredentials(url, key) {
        if (url && key) {
            localStorage.setItem('supabase_url', url.trim());
            localStorage.setItem('supabase_anon_key', key.trim());
            window.location.reload();
        }
    }

    setGoogleSheetsUrl(url) {
        if (url) {
            localStorage.setItem('google_sheets_csv_url', url.trim());
            this.fetchFromGoogleSheets(url.trim());
        }
    }

    async fetchFromGoogleSheets(urlOverride = '') {
        const url = urlOverride || GOOGLE_SHEETS_CSV_URL || localStorage.getItem('google_sheets_csv_url');
        if (!url) return false;

        try {
            console.log('📊 Sincronizando existencias y precios en vivo desde Google Sheets...');
            const response = await fetch(url);
            if (!response.ok) throw new Error('No se pudo descargar el archivo de Google Sheets');
            const text = await response.text();
            
            const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
            if (lines.length === 0) return false;

            const delimiter = text.includes('\t') ? '\t' : ',';

            let headerIdx = -1;
            let colMap = {};

            for (let i = 0; i < Math.min(lines.length, 15); i++) {
                const cols = lines[i].split(delimiter).map(c => c.trim().toLowerCase());
                if (cols.some(c => c.includes('product') || c.includes('rubro') || c.includes('nombre') || c.includes('retail') || c.includes('precio'))) {
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

            const stockMap = JSON.parse(localStorage.getItem(this.storageKey) || '{}');

            const dataLines = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines;

            dataLines.forEach(line => {
                const parts = line.split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));
                if (parts.length < 2) return;

                const rawName = colMap.name !== undefined ? parts[colMap.name] : (parts[1] || parts[0]);
                if (!rawName) return;

                const matchProd = (window.PRODUCTS || []).find(p => 
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
                    if (bulkText && bulkText !== '—') {
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
            console.log('✅ Catálogo e inventario sincronizados desde Google Sheets exitosamente.');
            this.notifyListeners();
            return true;
        } catch (err) {
            console.warn('⚠️ Error leyendo datos de Google Sheets:', err);
            return false;
        }
    }

    initLocalStorageDefaults() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialStock = {
                'pimenton': { stockQty: 150, minAlert: 20, status: 'disponible', harvestDate: '2026-08-07' },
                'tomate': { stockQty: 300, minAlert: 40, status: 'disponible', harvestDate: '2026-08-07' },
                'cebolla-blanca': { stockQty: 250, minAlert: 35, status: 'disponible', harvestDate: '2026-08-06' },
                'papa': { stockQty: 400, minAlert: 50, status: 'disponible', harvestDate: '2026-08-06' },
                'zanahoria': { stockQty: 180, minAlert: 25, status: 'disponible', harvestDate: '2026-08-06' },
                'aguacate-polo': { stockQty: 90, minAlert: 20, status: 'disponible', harvestDate: '2026-08-07' },
                'ajo-pelado': { stockQty: 45, minAlert: 10, status: 'disponible', harvestDate: '2026-08-05' },
                'cilantro': { stockQty: 120, minAlert: 30, status: 'disponible', harvestDate: '2026-08-07' },
                'pina': { stockQty: 75, minAlert: 15, status: 'disponible', harvestDate: '2026-08-05' },
                'calabacin': { stockQty: 110, minAlert: 20, status: 'disponible', harvestDate: '2026-08-07' }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialStock));
        }

        if (!localStorage.getItem(this.movementsKey)) {
            const initialLogs = [
                {
                    id: 'mov-1',
                    productId: 'tomate-perita',
                    productName: 'Tomate Perita Cosecha Diaria',
                    type: 'entrada',
                    qty: 300,
                    notes: 'Cosecha fresca recibida de Mérida',
                    date: new Date().toISOString()
                },
                {
                    id: 'mov-2',
                    productId: 'papa-lavada',
                    productName: 'Papa Lavada Granola',
                    type: 'entrada',
                    qty: 400,
                    notes: 'Lote despacho mayorista',
                    date: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.movementsKey, JSON.stringify(initialLogs));
        }
    }

    async seedSupabaseIfNeeded() {
        if (!this.supabase) return;
        try {
            const { data, error } = await this.supabase.from('products').select('id').limit(1);
            if (!error && data && data.length === 0 && window.PRODUCTS) {
                console.log('🌱 Poblando catálogo inicial de hortalizas en Supabase...');
                const seedRows = window.PRODUCTS.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    price_detal: p.priceDetal,
                    price_mayor: p.priceMayor,
                    min_wholesale_qty: p.minWholesaleQty,
                    unit: p.unit,
                    emoji: p.emoji,
                    highlight: p.highlight,
                    tags: p.tags || [],
                    stock_qty: 150,
                    min_stock_alert: 20,
                    status: 'disponible'
                }));
                await this.supabase.from('products').insert(seedRows);
                console.log('✅ Catálogo registrado exitosamente en la base de datos Supabase.');
            }
        } catch (err) {
            console.warn('Información de sembrado Supabase:', err);
        }
    }

    setupRealtimeSubscription() {
        if (!this.supabase) return;
        this.supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                console.log('⚡ Cambio de stock recibido en tiempo real:', payload);
                this.notifyListeners();
            })
            .subscribe();
    }

    // Obtener inventario actualizado de todos los productos
    async getStockData() {
        if (this.isCloudConnected) {
            try {
                const { data, error } = await this.supabase.from('products').select('*');
                if (!error && data) {
                    const result = {};
                    data.forEach(item => {
                        result[item.id] = {
                            stockQty: parseFloat(item.stock_qty),
                            minAlert: parseFloat(item.min_stock_alert),
                            status: item.stock_qty <= 0 ? 'agotado' : (item.stock_qty <= item.min_stock_alert ? 'poco_stock' : 'disponible'),
                            harvestDate: item.harvest_date
                        };
                    });
                    return result;
                }
            } catch (err) {
                console.warn('Fallo consulta Supabase, cayendo a almacenamiento local:', err);
            }
        }

        // Fallback a LocalStorage
        try {
            const localData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            Object.keys(localData).forEach(id => {
                const item = localData[id];
                if (item.stockQty <= 0) item.status = 'agotado';
                else if (item.stockQty <= item.minAlert) item.status = 'poco_stock';
                else item.status = 'disponible';
            });
            return localData;
        } catch (e) {
            return {};
        }
    }

    // Actualizar stock de un producto específico (Entrada, Venta, Merma, Ajuste)
    async updateStock(productId, qtyChange, type = 'ajuste', notes = '', productName = '') {
        const stockData = await this.getStockData();
        const currentItem = stockData[productId] || { stockQty: 100, minAlert: 15 };
        
        let newQty = currentItem.stockQty + qtyChange;
        if (newQty < 0) newQty = 0;

        let status = 'disponible';
        if (newQty <= 0) status = 'agotado';
        else if (newQty <= currentItem.minAlert) status = 'poco_stock';

        if (this.isCloudConnected) {
            try {
                await this.supabase.from('products').update({
                    stock_qty: newQty,
                    status: status,
                    updated_at: new Date()
                }).eq('id', productId);

                await this.supabase.from('stock_movements').insert({
                    product_id: productId,
                    type: type,
                    qty: qtyChange,
                    notes: notes
                });
            } catch (err) {
                console.warn('Error actualizando Supabase:', err);
            }
        }

        // Actualizar en LocalStorage siempre para máxima resiliencia
        const localData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        localData[productId] = {
            ...currentItem,
            stockQty: newQty,
            status: status
        };
        localStorage.setItem(this.storageKey, JSON.stringify(localData));

        // Registrar movimiento
        const movements = JSON.parse(localStorage.getItem(this.movementsKey) || '[]');
        movements.unshift({
            id: 'mov-' + Date.now(),
            productId: productId,
            productName: productName || productId,
            type: type,
            qty: qtyChange,
            notes: notes || `Operación: ${type}`,
            date: new Date().toISOString()
        });
        localStorage.setItem(this.movementsKey, JSON.stringify(movements.slice(0, 50)));

        this.notifyListeners();
        return { newQty, status };
    }

    // Descontar inventario al confirmar o enviar cotización
    async processCartOrder(cartItems) {
        for (const item of cartItems) {
            await this.updateStock(
                item.product.id,
                -item.qty,
                'venta',
                `Despacho Cotización (${item.qty} ${item.product.unit})`,
                item.product.name
            );
        }
    }

    // Obtener historial de movimientos
    getMovements() {
        try {
            return JSON.parse(localStorage.getItem(this.movementsKey) || '[]');
        } catch (e) {
            return [];
        }
    }

    // Suscribirse a cambios de stock en la UI
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    notifyListeners() {
        this.listeners.forEach(fn => fn());
    }
}

// Instancia global exportada para uso directo en la aplicación
window.StockService = new StockServiceManager();
