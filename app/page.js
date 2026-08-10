'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/layout/Header';
import TechFrame from '../components/layout/TechFrame';
import PageLoader from '../components/layout/PageLoader';
import HeroSection from '../components/sections/HeroSection';
import TickerBar from '../components/sections/TickerBar';
import CatalogSection, { PRODUCTS } from '../components/catalog/CatalogSection';
import CartDrawer from '../components/cart/CartDrawer';
import LocationModal from '../components/modals/LocationModal';
import CanvaIntroModal from '../components/sections/CanvaIntroModal';
import LenisProvider from '../components/providers/LenisProvider';
import { stockService } from '../services/stockService';

// Dynamic import R3F Canvas to ensure SSR safe rendering
const CanvasScene = dynamic(() => import('../components/canvas/CanvasScene'), {
  ssr: false,
});

export default function Home() {
  const [bcvRate, setBcvRate] = useState(36.50);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCanvaOpen, setIsCanvaOpen] = useState(false);
  const [stockData, setStockData] = useState({});


  // Constantes de caché BCV
  const BCV_CACHE_KEY = 'cafeteros_bcv_cache';
  const BCV_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  // Fetch BCV exchange rate on mount with cache + daily refresh
  useEffect(() => {
    const endpoints = [
      {
        url: 'https://ve.dolarapi.com/v1/dolares/oficial',
        parse: (data) => {
          if (data?.promedio && !isNaN(parseFloat(data.promedio))) {
            return parseFloat(data.promedio);
          }
          return null;
        }
      },
      {
        url: 'https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv',
        parse: (data) => {
          if (data?.monitors?.bcv?.price && !isNaN(parseFloat(data.monitors.bcv.price))) {
            return parseFloat(data.monitors.bcv.price);
          }
          return null;
        }
      },
      {
        url: 'https://rates.dolarvzla.com/bcv/current.json',
        parse: (data) => {
          const rate = data && (data.rate || data.value || data.price || data.promedio);
          if (rate && !isNaN(parseFloat(rate))) return parseFloat(rate);
          return null;
        }
      }
    ];

    async function fetchLiveBcv() {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(endpoint.url, {
            signal: controller.signal,
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            const rate = endpoint.parse(data);
            if (rate && rate > 0) {
              setBcvRate(rate);
              try {
                localStorage.setItem(BCV_CACHE_KEY, JSON.stringify({ rate, savedAt: Date.now() }));
              } catch (_) {}
              console.info(`[BCV] ✓ En vivo: Bs ${rate}`);
              return;
            }
          }
        } catch (e) {
          if (e.name !== 'AbortError') console.warn('[BCV] Error:', e.message);
        }
      }
      console.warn('[BCV] Sin conexión — usando tasa de respaldo.');
    }

    async function initBcv() {
      // Verificar caché localStorage
      try {
        const raw = localStorage.getItem(BCV_CACHE_KEY);
        if (raw) {
          const cache = JSON.parse(raw);
          const age = Date.now() - (cache.savedAt || 0);
          if (age < BCV_CACHE_TTL_MS && cache.rate && !isNaN(cache.rate)) {
            setBcvRate(cache.rate);
            console.info(`[BCV] Caché válido: Bs ${cache.rate}`);
            // Si ya pasaron 12h, renovar en background
            if (age > BCV_CACHE_TTL_MS / 2) fetchLiveBcv();
            return;
          }
        }
      } catch (_) {}
      // Sin caché válido → obtener en vivo
      await fetchLiveBcv();
    }

    initBcv();
    setStockData(stockService.getStockData());
    stockService.fetchFromGoogleSheets(undefined, PRODUCTS).then(() => {
      setStockData(stockService.getStockData());
    });
  }, []);


  const handleAddToCart = (productId, qty) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.product.id === productId);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].qty += qty;
        return updated;
      }
      return [...prevCart, { product, qty }];
    });
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId ? { ...item, qty: newQty } : item
        )
      );
    }
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
  };

  return (
    <LenisProvider>
      <div id="main-scroll-container">
        <PageLoader />
        <CanvasScene />
        <div id="grain-overlay" aria-hidden="true"></div>
        <TechFrame bcvRate={bcvRate} />

        <Header
          onOpenLocation={() => setIsLocationOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cart.length}
        />

      <HeroSection
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenCanvaIntro={() => setIsCanvaOpen(true)}
      />
      <TickerBar bcvRate={bcvRate} />

      <CatalogSection
        cart={cart}
        stockData={stockData}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        bcvRate={bcvRate}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
      />

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      <CanvaIntroModal
        isOpen={isCanvaOpen}
        onClose={() => setIsCanvaOpen(false)}
      />

      <footer className="main-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <a href="#" className="logo-wrapper">
              <img src="/logo-cropped.png" alt="LOS CAFETEROS Feria de Hortalizas" className="original-footer-logo" />
            </a>
            <p className="footer-desc">
              El proveedor confiable de hortalizas, tubérculos y frutas de calidad superior para los mejores restaurantes, hoteles y hogares de Caracas.
            </p>
          </div>

          <div className="footer-col">
            <h4>Contacto y Ventas</h4>
            <ul className="footer-links">
              <li>+58 (424) 708-7749</li>
              <li>
                <a href="https://wa.me/584247087749" target="_blank" rel="noopener noreferrer">
                  WhatsApp Directo Ventas
                </a>
              </li>
              <li>ventas@loscafeterosferia.ve</li>
              <li>
                <a href="https://maps.app.goo.gl/JGqm7WzSMJofa2Ah6" target="_blank" rel="noopener noreferrer">
                  La Urbina, Caracas (Ver Ubicación)
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Horarios de Atención</h4>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
              <strong style={{ color: '#fff' }}>Lunes, Martes y Miércoles:</strong>
            </p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
              6:00 AM — 7:30 PM
            </p>
            <div className="footer-badges">
              <span className="f-badge">Ventas al Mayor</span>
              <span className="f-badge">Ventas al Detal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </LenisProvider>
);
}

