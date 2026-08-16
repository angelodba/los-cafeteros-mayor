'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Scale, ShoppingBag, ClipboardList, Send, Trash2, Tag, Percent } from 'lucide-react';
import QuantitySelector from '../catalog/QuantitySelector';
import { useStore } from '../../context/StoreContext';
import { createQuoteAction } from '../../app/actions/orders';
import type { CartItem } from '../../types/catalog';
import { formatUSD, formatVES } from '../../lib/currency';

export default function CartDrawer() {
  const { 
    isCartOpen: isOpen, 
    setIsCartOpen, 
    cart, 
    bcvRate, 
    updateCartItemQuantity: onUpdateQty, 
    removeFromCart: onRemoveItem,
    clearCart,
    billingData,
    setBillingData
  } = useStore();

  const onClose = () => setIsCartOpen(false);
  const onClearCart = () => clearCart();

  const handleBillingChange = (field: keyof typeof billingData, value: string) => {
    setBillingData((prev) => ({ ...prev, [field]: value }));
  };

  const [notes, setNotes] = useState('');



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

  cart.forEach((item: CartItem) => {
    const prod = item.product;
    const qty = parseFloat(String(item.qty)) || 0;
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
    const customerName = billingData?.restName?.trim();
    const deliveryZone = billingData?.zone?.trim();

    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de cotizar.');
      return;
    }

    if (!customerName || !deliveryZone) {
      alert('Por favor completa los Datos del Cliente y la Zona de Despacho antes de enviar la cotización.');
      return;
    }

    const now = new Date();
    // Zona horaria Venezuela: UTC-4 (America/Caracas)
    const vzlaOptions: Intl.DateTimeFormatOptions = { timeZone: 'America/Caracas' };
    const dateStr = now.toLocaleDateString('es-VE', { ...vzlaOptions, day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { ...vzlaOptions, hour: '2-digit', minute: '2-digit', hour12: true });

    let itemsText = '';
    cart.forEach((item: CartItem) => {
      const prod = item.product;
      const qty = parseFloat(String(item.qty)) || 0;
      const minWholesaleQty = prod.minWholesaleQty || 30;
      const isWholesale = qty >= minWholesaleQty;
      const unitPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
      const sub = unitPrice * qty;

      itemsText += `• ${qty} ${prod.unit} — *${prod.name}* ${isWholesale ? '(Al Mayor)' : '(Detal)'} ➡️ *${formatUSD(sub)}* (${formatUSD(unitPrice)}/${prod.unit})\n`;
    });

    let msg = `*NUEVA COTIZACIÓN AL MAYOR - LOS CAFETEROS* 🚛\n\n`;
    msg += `📅 *Fecha:* ${dateStr} | 🕒 *Hora:* ${timeStr}\n\n`;

    msg += `👤 *Cliente:* ${customerName}\n`;
    if (billingData?.rif) msg += `📝 *RIF:* ${billingData.rif}\n`;
    if (billingData?.phone) msg += `📞 *Teléfono:* ${billingData.phone}\n`;
    msg += `📍 *Zona Despacho:* ${deliveryZone}\n`;
    msg += `\n🛒 *DETALLE DEL PEDIDO:*\n${itemsText}\n`;

    msg += `-----------------------------------\n`;
    msg += `💵 *Subtotal al Detal:* ${formatUSD(subtotalDetalUsd)}\n`;
    if (totalSavingsUsd > 0) {
      msg += `🌟 *Descuento por Volumen:* -${formatUSD(totalSavingsUsd)}\n`;
    }
    msg += `💵 *TOTAL ESTIMADO (USD):* *${formatUSD(totalUsd)}*\n`;
    msg += `🇻🇪 *TOTAL BCV (Bs):* *${formatVES(totalUsd, activeBcvRate)}* (Tasa: ${activeBcvRate.toFixed(2)})\n`;
    msg += `-----------------------------------\n\n`;

    if (notes.trim()) {
      msg += `📝 *Observaciones:* ${notes.trim()}\n\n`;
    }

    msg += `_Solicitud generada automáticamente desde la web oficial de LOS CAFETEROS._`;

    // Trigger Server Action en background (fire and forget)
    createQuoteAction({
      customerName: customerName,
      rif: billingData?.rif || '',
      phone: billingData?.phone || '',
      zone: deliveryZone,
      totalUsd: totalUsd,
      totalBs: totalBs,
      bcvRate: activeBcvRate,
      items: cart.map((item: CartItem) => {
        const parsedQty = parseFloat(String(item.qty)) || 0;
        const minWq = item.product.minWholesaleQty || 30;
        const unitPrice = parsedQty >= minWq ? item.product.priceMayor : item.product.priceDetal;
        return {
          id: item.product.id,
          name: item.product.name,
          qty: parsedQty,
          unitPrice: unitPrice,
          subtotal: unitPrice * parsedQty,
          isWholesale: parsedQty >= minWq
        };
      }),
      notes: notes
    }).catch(err => console.warn('Mock Supabase failed silently:', err));

    const encoded = encodeURIComponent(msg);
    // SECURITY: Agregar rel="noopener noreferrer" equivalente para window.open
    const waWindow = window.open(`https://wa.me/584247087749?text=${encoded}`, '_blank', 'noopener,noreferrer');
    if (waWindow) waWindow.opener = null;

    // Limpiar el carrito después de abrir WhatsApp.
    // Usamos un timeout breve para asegurar que el navegador procese la apertura primero.
    setTimeout(() => {
      onClearCart();
      setBillingData({ restName: '', rif: '', zone: '', phone: '' });
      setNotes('');
      onClose();
    }, 800);
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
                  const qty = parseFloat(String(item.qty)) || 0;
                  const minWholesaleQty = prod.minWholesaleQty || 30;
                  const isWholesale = qty >= minWholesaleQty;
                  const unitPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
                  const itemSubtotal = unitPrice * qty;
                  const savingPercent = prod.priceDetal > 0
                    ? Math.round(((prod.priceDetal - prod.priceMayor) / prod.priceDetal) * 100)
                    : 0;

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
                          value={item.qty}
                          onChange={(newQty) => {
                            if (newQty !== '' && parseFloat(String(newQty)) <= 0) onRemoveItem(prod.id);
                            else onUpdateQty(prod.id, newQty);
                          }}
                          unit={prod.unit}
                          min={0}
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
                      value={billingData?.restName || ''}
                      onChange={(e) => handleBillingChange('restName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>RIF o Cédula</label>
                    <input
                      type="text"
                      placeholder="Ej: J-12345678-0"
                      value={billingData?.rif || ''}
                      onChange={(e) => handleBillingChange('rif', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Zona de Entrega en Caracas *</label>
                    <input
                      type="text"
                      placeholder="Ej: Las Mercedes"
                      value={billingData?.zone || ''}
                      onChange={(e) => handleBillingChange('zone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="Ej: 0414-1234567"
                      value={billingData?.phone || ''}
                      onChange={(e) => handleBillingChange('phone', e.target.value)}
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
                <span>{formatUSD(subtotalDetalUsd)}</span>
              </div>
              {totalSavingsUsd > 0 && (
                <div className="summary-row saving-row">
                  <span><Percent size={12} /> Ahorro por Volumen (Al Mayor):</span>
                  <span className="saving-amount">-{formatUSD(totalSavingsUsd)}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total Estimado USD:</span>
                <strong className="total-price-usd">{formatUSD(totalUsd)}</strong>
              </div>
              <div className="summary-row bcv-row">
                <span>Ref. en Bs (Tasa Oficial BCV):</span>
                <span>{formatVES(totalUsd, activeBcvRate)}</span>
              </div>
            </div>

            {(!billingData?.restName?.trim() || !billingData?.zone?.trim()) ? (
              <div style={{ background: 'rgba(216,30,19,0.1)', color: '#D81E13', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                ⚠️ Rellena tus Datos de Cliente y Punto de Despacho arriba para poder enviar la cotización.
              </div>
            ) : null}
            <button 
              type="button" 
              className="btn btn-whatsapp btn-block" 
              onClick={handleSendWhatsapp}
              disabled={!billingData?.restName?.trim() || !billingData?.zone?.trim()}
              style={{ opacity: (!billingData?.restName?.trim() || !billingData?.zone?.trim()) ? 0.5 : 1 }}
            >
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

