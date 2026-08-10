'use client';

import { useState, useEffect } from 'react';
import { MapPin, ShoppingBag } from 'lucide-react';

export default function Header({ onOpenLocation, onOpenCart, cartCount }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <a href="#" className="logo-wrapper">
          <img src="/logo-cropped.png" alt="LOS CAFETEROS - Feria de Hortalizas" className="original-brand-logo" />
          <div className="header-sys-tag">
            <span>MAYORISTA · DETAL</span>
            <span>CARACAS · VE</span>
          </div>
        </a>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={onOpenLocation}>
            <MapPin size={16} />
            <span>Ubicación</span>
          </button>
          <button className="btn btn-cart" onClick={onOpenCart}>
            <ShoppingBag size={16} />
            <span>Cotización</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
