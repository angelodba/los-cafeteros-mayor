// @ts-nocheck
'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({
  value,
  onChange,
  unit = 'kg',
  min = 1,
  max = 999,
  disabled = false,
  showQuickPills = true,
  isWholesaleActive = false,
  minWholesaleQty = 30,
  savingPercent = 0
}) {
  const [bounce, setBounce] = useState(false);

  const triggerBounce = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 200);
  };

  const handleDecrement = () => {
    if (disabled) return;
    triggerBounce();
    const nextVal = Math.max(0, (parseFloat(value) || 1) - 1);
    onChange(nextVal);
  };

  const handleIncrement = () => {
    if (disabled) return;
    triggerBounce();
    const nextVal = Math.min(max, (parseFloat(value) || 0) + 1);
    onChange(nextVal);
  };

  const handleQuickAdd = (amount) => {
    if (disabled) return;
    triggerBounce();
    const nextVal = Math.min(max, (parseFloat(value) || 0) + amount);
    onChange(nextVal);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(0, val)));
    }
  };

  const currentQty = parseFloat(value) || 0;
  const isThresholdClose = !isWholesaleActive && currentQty >= (minWholesaleQty / 2);

  return (
    <div className="quantity-selector-wrapper">
      {/* Insignia Dinámica de Tarifa */}
      <div className="qty-tier-badge-container">
        {isWholesaleActive ? (
          <span className="qty-badge-pill wholesale-active">
            ✨ AL MAYOR ({savingPercent}% OFF)
          </span>
        ) : (
          <span className={`qty-badge-pill detal-active ${isThresholdClose ? 'threshold-close' : ''}`}>
            {isThresholdClose ? `Faltan ${minWholesaleQty - currentQty} ${unit} para Precio Al Mayor` : `AL DETAL`}
          </span>
        )}
      </div>

      {/* Control Principal con Botones Hápticos de 44px */}
      <div className={`quantity-control-haptic ${bounce ? 'haptic-bounce' : ''}`}>
        <button
          type="button"
          className="btn-haptic-qty minus"
          onClick={handleDecrement}
          disabled={disabled || currentQty <= min}
          aria-label="Disminuir cantidad"
        >
          <Minus size={16} />
        </button>

        <div className="input-qty-wrapper">
          <input
            type="number"
            inputMode="decimal"
            className="haptic-qty-input"
            value={value}
            min={min}
            max={max}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            disabled={disabled}
            placeholder="1"
          />
          <span className="qty-unit-label">{unit}</span>
        </div>

        <button
          type="button"
          className="btn-haptic-qty plus"
          onClick={handleIncrement}
          disabled={disabled || currentQty >= max}
          aria-label="Aumentar cantidad"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Botones de Pasos Rápidos (+1, +5, +10 kg) */}
      {showQuickPills && !disabled && (
        <div className="quick-qty-pills">
          <span className="quick-label">+Rápido:</span>
          {[1, 5, 10, 30].map((amt) => (
            <button
              key={amt}
              type="button"
              className={`quick-pill-btn ${amt === 30 ? 'pill-wholesale-trigger' : ''}`}
              onClick={() => handleQuickAdd(amt)}
            >
              +{amt} {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

