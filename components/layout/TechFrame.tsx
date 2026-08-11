'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export default function TechFrame() {
  const { bcvRate } = useStore();
  const [timeStr, setTimeStr] = useState('--:-- HRS');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m} HRS`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="tech-frame tech-frame--tl" aria-hidden="true">
        <span>SYS::LOS_CAFETEROS</span>
        <span>FERIA DE HORTALIZAS</span>
        <span>CARACAS · VE</span>
      </div>
      <div className="tech-frame tech-frame--tr" aria-hidden="true">
        <span>LAT: 10.48°N / LONG: 66.89°W</span>
        <span>DESPACHO DIRECTO</span>
        <span>{timeStr}</span>
      </div>
      <div className="tech-frame tech-frame--bl" aria-hidden="true">
        <span>COSECHA DIARIA · MÉRIDA</span>
        <span>FRESCURA GARANTIZADA</span>
      </div>
      <div className="tech-frame tech-frame--br" aria-hidden="true">
        <span>TASA BCV EN VIVO</span>
        <span>{bcvRate ? `Bs ${bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} / $` : 'CARGANDO...'}</span>
      </div>
    </>
  );
}
