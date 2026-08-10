'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Scale, ShoppingBag, ClipboardList, Send, Trash2, Tag, Percent } from 'lucide-react';
import QuantitySelector from '../catalog/QuantitySelector';

export default function CartDrawer({ isOpen, onClose, cart, bcvRate, onUpdateQty, onRemoveItem, onClearCart }) {
  const [restName, setRestName] = useState('');
  const [rif, setRif] = useState('');
  const [zone, setZone] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Persistir datos del formulario del cliente en localStorage
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('los_cafeteros_customer_form');
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setRestName(parsed.restName || '');
        setRif(parsed.rif || '');
        setZone(parsed.zone || '');
        setPhone(parsed.phone || '');
      }
    } catch (_) {}
  }, []);

  // Lock body scroll when cart drawer is active on mobile devices
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
    return () => {
      document.body.classList.remove('cart-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculos Multi-Moneda y Descuentos en Tiempo Real
  let subtotalDetalUsd = 0;
  let totalUsd = 0;
  let totalSavingsUsd = 0;
  let totalItemsCount = 0;
  let wholesaleItemsCount = 0;

  cart.forEach((item) => {
    const prod = item.product;
    const qty = parseFloat(item.qty) || 0;
    const minWholesaleQty = prod.minWholesaleQty || 30;
    const isWholesale = qty >= minWholesaleQty;

    const itemDetalCost = prod.priceDetal * qty;
    const itemActualPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
    const itemActualCost = itemActualPrice * qty;

    subtotalDetalUsd += itemDetalCost;
    totalUsd += itemActualCost;
    totalItemsCount += qty;
    if (isWholesale) wholesaleItemsCount++;
  });

  totalSavingsUsd = Math.max(0, subtotalDetalUsd - totalUsd);
  const activeBcvRate = bcvRate && bcvRate > 0 ? bcvRate : 36.50;
  const totalBs = totalUsd * activeBcvRate;

  // Generador de Cotizaciones por WhatsApp automatizado con Markdown estructurado
  const handleSendWhatsapp = () => {
    if (cart.length === 0) return;
    if (!restName.trim() || !zone.trim()) {
      alert('Por favor completa el Nombre del Restaurante/Cliente y la Zona de Entrega en Caracas.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });

    let itemsText = '';
    cart.forEach((item) => {
      const prod = item.product;
      const qty = parseFloat(item.qty) || 0;
      const minWholesaleQty = prod.minWholesaleQty || 30;
      const isWholesale = qty >= minWholesaleQty;
      const unitPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
      const sub = unitPrice * qty;

      itemsText += `• ${qty} ${prod.unit} — *${prod.name}* ${isWholesale ? '(Al Mayor)' : '(Detal)'} ➡️ *$${sub.toFixed(2)}* ($${unitPrice.toFixed(2)}/${prod.unit})\n`;
    });

    let msg = `🛒 *NUEVA COTIZACIÓN — LOS CAFETEROS CARACAS*\n`;
    msg += `📅 *Fecha:* ${dateStr} | 🕒 *Hora:* ${timeStr}\n\n`;

    msg += `🏢 *DATOS DEL CLIENTE:* \n`;
    msg += `• *Cliente/Restaurante:* ${restName.trim()}\n`;
    if (rif.trim()) msg += `• *RIF/Cédula:* ${rif.trim()}\n`;
    msg += `• *Zona de Entrega:* ${zone.trim()}\n`;
    if (phone.trim()) msg += `• *Teléfono:* ${phone.trim()}\n\n`;

    msg += `📋 *DETALLE DEL PEDIDO:* \n${itemsText}\n`;

    msg += `-----------------------------------\n`;
    msg += `💵 *Subtotal al Detal:* $${subtotalDetalUsd.toFixed(2)}\n`;
    if (totalSavingsUsd > 0) {
      msg += `🌟 *Descuento por Volumen:* -$${totalSavingsUsd.toFixed(2)}\n`;
    }
    msg += `💵 *TOTAL ESTIMADO (USD):* *$${totalUsd.toFixed(2)}*\n`;
    msg += `🇻🇪 *TOTAL BCV (Bs):* *Bs ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}* (Tasa: ${activeBcvRate.toFixed(2)})\n`;
    msg += `-----------------------------------\n\n`;

    if (notes.trim()) {
      msg += `📝 *Observaciones:* ${notes.trim()}\n\n`;
    }

    msg += `_Solicitud generada automáticamente desde la web oficial de LOS CAFETEROS._`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/584247087749?text=${encoded}`, '_blank');
  };

  return (
    <div className="drawer-overlay">
      <div className="cart-drawer">
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingCart size={22} color="var(--verde-hoja)" />
            <div>
              <h3>Cotización de Pedido</h3>
              <span className="drawer-subtitle">Cotizador Automatizado B2B & Detal</span>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Cerrar carrito">
            <X size={17} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Caja de Progreso de Descuento por Volumen */}
          <div className="cart-wholesale-progress-box">
            <div className="progress-info">
              <span><Scale size={13} /> Descuento Al Mayor por Rubro (30+ kg)</span>
              <span><strong>{wholesaleItemsCount} de {cart.length} con Tarifa Mayor</strong></span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, (wholesaleItemsCount / Math.max(1, cart.length)) * 100)}%` }}
              ></div>
            </div>
            {totalSavingsUsd > 0 ? (
              <p className="progress-status-msg text-success">
                ✨ ¡Estás ahorrando <strong>${totalSavingsUsd.toFixed(2)} USD</strong> en este pedido con tarifa al mayor!
              </p>
            ) : (
              <p className="progress-status-msg">
                💡 Agrega 30 kg o más de un rubro individual para activar su tarifa especial al mayor.
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <ShoppingBag size={56} className="empty-cart-icon" />
              <h4>Tu cotización está vacía</h4>
              <p>Agrega hortalizas y frutas frescas desde el catálogo para calcular tu pedido en vivo.</p>
            </div>
          ) : (
            <>
              <div className="cart-items-header-bar">
                <span>Rubros en Cotización ({cart.length})</span>
                <button className="btn-clear-all" onClick={onClearCart}>
                  <Trash2 size={13} /> Vaciar
                </button>
              </div>

              <div className="cart-items-list-v2">
                {cart.map((item) => {
                  const prod = item.product;
                  const qty = parseFloat(item.qty) || 0;
                  const minWholesaleQty = prod.minWholesaleQty || 30;
                  const isWholesale = qty >= minWholesaleQty;
                  const unitPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
                  const itemSubtotal = unitPrice * qty;
                  const savingPercent = Math.round(((prod.priceDetal - prod.priceMayor) / prod.priceDetal) * 100);

                  return (
                    <div key={prod.id} className={`cart-item-card ${isWholesale ? 'item-wholesale-active' : ''}`}>
                      <div className="item-card-top">
                        <div className="item-emoji">{prod.emoji}</div>
                        <div className="item-meta">
                          <div className="item-title">{prod.name}</div>
                          <div className="item-unit-rate">
                            ${unitPrice.toFixed(2)} / {prod.unit}{' '}
                            {isWholesale ? (
                              <span className="badge-wholesale-inline">✨ Al Mayor (-{savingPercent}%)</span>
                            ) : (
                              <span className="badge-detal-inline">Al Detal</span>
                            )}
                          </div>
                        </div>
                        <div className="item-total-col">
                          <span className="item-subtotal-val">${itemSubtotal.toFixed(2)}</span>
                          <button
                            className="btn-remove-item"
                            onClick={() => onRemoveItem(prod.id)}
                            title="Eliminar rubro"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="item-card-bottom">
                        <QuantitySelector
                          value={qty}
                          onChange={(newQty) => {
                            if (newQty <= 0) onRemoveItem(prod.id);
                            else onUpdateQty(prod.id, newQty);
                          }}
                          unit={prod.unit}
                          min={1}
                          max={999}
                          showQuickPills={false}
                          isWholesaleActive={isWholesale}
                          minWholesaleQty={minWholesaleQty}
                          savingPercent={savingPercent}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formulario de Datos del Cliente */}
              <div className="restaurant-form-section">
                <h4 className="form-section-title">
                  <ClipboardList size={16} color="var(--verde-hoja)" /> Datos del Cliente / Punto de Despacho
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre / Restaurante *</label>
                    <input
                      type="text"
                      placeholder="Ej: Trattoria Bellini"
                      value={restName}
                      onChange={(e) => {
                        setRestName(e.target.value);
                        saveFormFields('restName', e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>RIF o Cédula</label>
                    <input
                      type="text"
                      placeholder="Ej: J-12345678-0"
                      value={rif}
                      onChange={(e) => {
                        setRif(e.target.value);
                        saveFormFields('rif', e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Zona de Entrega en Caracas *</label>
                    <input
                      type="text"
                      placeholder="Ej: Las Mercedes"
                      value={zone}
                      onChange={(e) => {
                        setZone(e.target.value);
                        saveFormFields('zone', e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="Ej: 0414-1234567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        saveFormFields('phone', e.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Observaciones del Pedido</label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Pimentones bien verdes, tomates firmes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal (Precio Detal):</span>
                <span>${subtotalDetalUsd.toFixed(2)}</span>
              </div>
              {totalSavingsUsd > 0 && (
                <div className="summary-row saving-row">
                  <span><Percent size={12} /> Ahorro por Volumen (Al Mayor):</span>
                  <span className="saving-amount">-${totalSavingsUsd.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total Estimado USD:</span>
                <strong className="total-price-usd">${totalUsd.toFixed(2)}</strong>
              </div>
              <div className="summary-row bcv-row">
                <span>Ref. en Bs (Tasa Oficial BCV):</span>
                <span>Bs {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button className="btn btn-whatsapp btn-block" onClick={handleSendWhatsapp}>
              <Send size={18} />
              <span>Enviar Cotización a WhatsApp</span>
            </button>
            <p className="whatsapp-disclaimer">Recibirás confirmación inmediata de peso exacto y horario de despacho.</p>
          </div>
        )}
      </div>
    </div>
  );
}
