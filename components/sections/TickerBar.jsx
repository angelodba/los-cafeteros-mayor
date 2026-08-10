'use client';

import { CheckCircle2, Sparkles, Building2, Truck } from 'lucide-react';

export default function TickerBar({ bcvRate }) {
  const formattedRate = bcvRate
    ? `Bs ${bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} / $`
    : 'Cargando en vivo...';

  return (
    <section className="ticker-bar" aria-label="Información en vivo">
      <div className="ticker-track">
        {/* Set 1 */}
        <div className="ticker-item">
          <CheckCircle2 size={16} className="icon-green" />
          <span>Atención especializada a Chef y Compradores de Alimentos</span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Sparkles size={16} className="icon-yellow" />
          <span><strong>Precios Al Mayor:</strong> Automáticos al alcanzar 30 kg por rubro</span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Building2 size={16} className="icon-green" />
          <span>Tasa BCV Oficial: <strong>{formattedRate}</strong></span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Truck size={16} className="icon-yellow" />
          <span>Despacho: Lunes, Martes y Miércoles · 6:00 AM – 7:30 PM</span>
        </div>
        <span className="ticker-sep">//</span>

        {/* Set 2 Duplicate */}
        <div className="ticker-item">
          <CheckCircle2 size={16} className="icon-green" />
          <span>Atención especializada a Chef y Compradores de Alimentos</span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Sparkles size={16} className="icon-yellow" />
          <span><strong>Precios Al Mayor:</strong> Automáticos al alcanzar 30 kg por rubro</span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Building2 size={16} className="icon-green" />
          <span>Tasa BCV Oficial: <strong>{formattedRate}</strong></span>
        </div>
        <span className="ticker-sep">//</span>
        <div className="ticker-item">
          <Truck size={16} className="icon-yellow" />
          <span>Despacho: Lunes, Martes y Miércoles · 6:00 AM – 7:30 PM</span>
        </div>
        <span className="ticker-sep">//</span>
      </div>
    </section>
  );
}
