// @ts-nocheck
'use client';

import { useRef, useEffect, useState } from 'react';
import { Truck, Scale, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function HeroSection() {
  const { setIsLocationModalOpen } = useStore();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('[iOS Video] Autoplay handler:', err);
      });
    }
  }, []);

  return (
    <section className="hero-banner">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line"></div>
            <span className="hero-eyebrow-text">Cosecha Diaria · Caracas, Venezuela</span>
          </div>

          <div className="hero-badge">
            <Truck size={15} /> Despacho Directo a Restaurantes y Comercios
          </div>

          <h1 className="hero-title">
            Hortalizas<br />
            del Campo<br />
            a tu <span className="text-accent">Cocina</span>
          </h1>

          <p className="hero-description">
            Garantizamos la máxima calidad, frescura de cosecha diaria y la mejor relación costo-rendimiento para la alta gastronomía caraqueña y compras familiares.
          </p>

          <div className="wholesale-info-box">
            <div className="info-icon">
              <Scale size={20} />
            </div>
            <div className="info-text">
              <strong>Tarifas Especiales Al Mayor</strong>
              <p>Precios preferenciales automáticos al alcanzar <strong>30 kg por rubro</strong> en tu cotización.</p>
            </div>
          </div>

          <div className="hero-buttons">
            <a
              href="https://wa.me/584247087749?text=Hola%20Feria%20LOS%20CAFETEROS,%20quisiera%20consultar%20disponibilidad%20y%20precios"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Contactar WhatsApp</span>
            </a>

            <button className="btn btn-secondary" onClick={() => setIsLocationModalOpen(true)}>
              <MapPin size={18} />
              <span>Ubicación</span>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">

            {/* Video Corto HTML5 Ajustado al Marco para iOS/Android */}
            <div className="hero-card-video-container">
              <video
                ref={videoRef}
                src="/feria-los-cafeteros.mp4"
                autoPlay
                muted
                loop
                playsInline
                webkit-playsinline="true"
                preload="auto"
                disablePictureInPicture
                className="hero-card-short-video"
              />
            </div>

            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-val">100%</span>
                <span className="metric-lbl">Frescura a tu<br />Establecimiento</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-val">Entregas</span>
                <span className="metric-lbl">Lunes, Martes<br />y Miércoles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

