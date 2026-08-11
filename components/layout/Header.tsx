'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useHasHydrated } from '../../hooks/useHasHydrated';

export default function Header() {
  const { cart, setIsCartOpen, setIsLocationModalOpen } = useCartStore();
  const cartCount = cart.length;
  const hasHydrated = useHasHydrated();
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
          <Image 
            src="/logo-cropped.png" 
            alt="LOS CAFETEROS - Feria de Hortalizas" 
            className="original-brand-logo" 
            width={702} 
            height={380} 
            priority
          />
          <div className="header-sys-tag">
            <span>MAYORISTA · DETAL</span>
            <span>CARACAS · VE</span>
          </div>
        </a>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setIsLocationModalOpen(true)}>
            <MapPin size={16} />
            <span>Ubicación</span>
          </button>
          <button className="btn btn-cart" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={16} />
            <span>Cotización</span>
            {hasHydrated ? (
              <span className="cart-badge">{cartCount}</span>
            ) : (
              <span className="cart-badge" style={{ opacity: 0.5 }}>0</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
