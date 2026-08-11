import dynamic from 'next/dynamic';
import React from 'react';
import Image from 'next/image';

import StoreClientWrapper from '../components/layout/StoreClientWrapper';
import Header from '../components/layout/Header';
import TechFrame from '../components/layout/TechFrame';
import PageLoader from '../components/layout/PageLoader';
import HeroSection from '../components/sections/HeroSection';
import TickerBar from '../components/sections/TickerBar';
import CatalogSection from '../components/catalog/CatalogSection';
import ProductSchema from '../components/seo/ProductSchema';

const CartDrawer = dynamic(() => import('../components/cart/CartDrawer'));
const LocationModal = dynamic(() => import('../components/modals/LocationModal'));

// Metadata SEO Dinámico (Server Component)
export const metadata = {
  title: 'LOS CAFETEROS | Hortalizas Frescas al Mayor',
  description: 'Garantizamos la máxima calidad y frescura de cosecha diaria para la alta gastronomía caraqueña.',
  openGraph: {
    title: 'LOS CAFETEROS Feria de Hortalizas',
    description: 'Directo del campo a tu cocina. Venta al mayor y detal en Caracas.',
    images: ['/logo-cropped.png'],
  },
};



export default function Home() {
  return (
    <StoreClientWrapper>
      <ProductSchema />
      <div id="main-scroll-container">
        <PageLoader videoSrc="" />
        <div id="grain-overlay" aria-hidden="true"></div>
        <TechFrame />

        <Header />
        <HeroSection />
        <TickerBar />
        <CatalogSection />
        <CartDrawer />
        <LocationModal />

        <footer className="main-footer">
          <div className="container footer-grid">
            <div className="footer-col">
              <a href="#" className="logo-wrapper">
                <Image 
                  src="/logo-cropped.png" 
                  alt="LOS CAFETEROS Feria de Hortalizas" 
                  className="original-footer-logo"
                  width={702}
                  height={380}
                />
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
                <li><a href="mailto:urbinaiglesia2020@gmail.com">urbinaiglesia2020@gmail.com</a></li>
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
    </StoreClientWrapper>
  );
}
