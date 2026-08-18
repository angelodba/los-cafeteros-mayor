'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  X, 
  Scale, 
  ShoppingBag, 
  ClipboardList, 
  Send, 
  Trash2, 
  Percent, 
  Truck, 
  ArrowRight, 
  MapPin, 
  Sparkles 
} from 'lucide-react';
import QuantitySelector from '../catalog/QuantitySelector';
import { useStore } from '../../context/StoreContext';
import { createQuoteAction } from '../../app/actions/orders';
import type { CartItem } from '../../types/catalog';
import { formatUSD, formatVES } from '../../lib/currency';

const WHATSAPP_PHONE = '584247087749'; // Número Oficial Feria Los Cafeteros: +58 424-7087749

const CARACAS_ZONES = [
  'Las Mercedes',
  'Chacao',
  'Altamira',
  'Los Palos Grandes',
  'El Hatillo',
  'La Castellana',
  'Bello Monte',
  'San Román',
  'Sebucán',
  'La Trinidad'
];

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

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [notes, setNotes] = useState('');

  const onClose = () => setIsCartOpen(false);
  const onClearCart = () => clearCart();

  const handleBillingChange = (field: keyof typeof billingData, value: string) => {
    setBillingData((prev) => ({ ...prev, [field]: value }));
  };

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
    const qty = item.qty === '' ? 0 : parseFloat(String(item.qty)) || 0;
    const minWholesaleQty = prod.minWholesaleQty || 30;
    const isWholesale = qty >= minWholesaleQty;

    const itemDetalCost = prod.priceDetal * qty;
    const itemActualPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
    const itemActualCost = itemActualPrice * qty;

    subtotalDetalUsd += itemDetalCost;
    totalUsd += itemActualCost;
    totalItemsCount += qty;
    if (isWholesale && qty > 0) wholesaleItemsCount++;
  });

  // Floating-Point Arithmetic Safety
  subtotalDetalUsd = Math.round((subtotalDetalUsd + Number.EPSILON) * 100) / 100;
  totalUsd = Math.round((totalUsd + Number.EPSILON) * 100) / 100;
  
  totalSavingsUsd = Math.max(0, subtotalDetalUsd - totalUsd);
  totalSavingsUsd = Math.round((totalSavingsUsd + Number.EPSILON) * 100) / 100;

  const activeBcvRate = bcvRate && bcvRate > 0 ? bcvRate : 36.50;
  let totalBs = totalUsd * activeBcvRate;
  totalBs = Math.round((totalBs + Number.EPSILON) * 100) / 100;

  const isStep2Valid = Boolean(billingData?.restName?.trim() && billingData?.zone?.trim());

  // Generador del mensaje con formato Markdown profesional para WhatsApp
  const generateWhatsappMessage = () => {
    const customerName = billingData?.restName?.trim() || 'Cliente';
    const deliveryZone = billingData?.zone?.trim() || 'Caracas';

    const now = new Date();
    // Zona horaria Venezuela: UTC-4 (America/Caracas)
    const vzlaOptions: Intl.DateTimeFormatOptions = { timeZone: 'America/Caracas' };
    const dateStr = now.toLocaleDateString('es-VE', { ...vzlaOptions, day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { ...vzlaOptions, hour: '2-digit', minute: '2-digit', hour12: true });

    let itemsText = '';
    cart.forEach((item: CartItem) => {
      const prod = item.product;
      const qty = item.qty === '' ? 0 : parseFloat(String(item.qty)) || 0;
      if (qty === 0) return;
      
      const minWholesaleQty = prod.minWholesaleQty || 30;
      const isWholesale = qty >= minWholesaleQty;
      const unitPrice = isWholesale ? prod.priceMayor : prod.priceDetal;
      const sub = Math.round(((unitPrice * qty) + Number.EPSILON) * 100) / 100;
      const badgeInfo = (prod.changes || prod.wholesaleNote || '').trim();

      itemsText += `▪️ *${qty} ${prod.unit}* — *${prod.name}* ${isWholesale ? '(Tarifa Al Mayor)' : '(Detal)'}\n`;
      itemsText += `   Precio: ${formatUSD(unitPrice)}/${prod.unit}  ➔  Subtotal: *${formatUSD(sub)} USD*\n`;
      if (badgeInfo) {
        itemsText += `   ℹ️ _${badgeInfo}_\n`;
      }
      itemsText += `\n`;
    });

    let msg = `🌿 *LOS CAFETEROS | FERIA DE HORTALIZAS*\n`;
    msg += `📋 *SOLICITUD DE COTIZACIÓN AL MAYOR*\n`;
    msg += `────────────────────────────\n`;
    msg += `📅 *Fecha:* ${dateStr}  •  🕒 *Hora:* ${timeStr}\n\n`;

    msg += `👤 *DATOS DEL CLIENTE:*\n`;
    msg += `• *Nombre / Negocio:* ${customerName}\n`;
    if (billingData?.rif?.trim()) {
      msg += `• *RIF / Cédula:* ${billingData.rif.trim()}\n`;
    }
    if (billingData?.phone?.trim()) {
      msg += `• *Teléfono:* ${billingData.phone.trim()}\n`;
    }
    msg += `• *Zona de Despacho:* 📍 ${deliveryZone}\n\n`;

    msg += `🛒 *DETALLE DEL PEDIDO (${cart.length} ${cart.length === 1 ? 'rubro' : 'rubros'}):*\n`;
    msg += `────────────────────────────\n`;
    msg += itemsText.trimEnd() + `\n\n`;

    if (notes.trim()) {
      msg += `📝 *OBSERVACIONES:*\n`;
      msg += `"${notes.trim()}"\n\n`;
    }

    msg += `────────────────────────────\n`;
    msg += `💰 *RESUMEN DE COTIZACIÓN:*\n`;
    msg += `• *Subtotal Base (Detal):* ${formatUSD(subtotalDetalUsd)} USD\n`;
    if (totalSavingsUsd > 0) {
      msg += `• ✨ *Ahorro por Volumen:* -${formatUSD(totalSavingsUsd)} USD\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 *TOTAL ESTIMADO (USD):* *${formatUSD(totalUsd)} USD*\n`;
    msg += `🇻🇪 *TOTAL OFICIAL BCV:* *${formatVES(totalUsd, activeBcvRate)}*\n`;
    msg += `_(Tasa Oficial BCV: ${activeBcvRate.toFixed(2)} Bs/USD)_\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `🚚 _Solicitud generada desde la plataforma web oficial de LOS CAFETEROS._\n`;
    msg += `_Favor confirmar disponibilidad y coordinar despacho._`;

    return msg;
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(generateWhatsappMessage())}`;

  const handleWhatsappClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const customerName = billingData?.restName?.trim();
    const deliveryZone = billingData?.zone?.trim();

    if (cart.length === 0) {
      e.preventDefault();
      alert('Tu carrito está vacío. Agrega productos antes de cotizar.');
      return;
    }

    if (!customerName || !deliveryZone) {
      e.preventDefault();
      alert('Por favor completa los Datos del Cliente y la Zona de Despacho antes de enviar la cotización.');
      return;
    }

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
          subtotal: Math.round(((unitPrice * parsedQty) + Number.EPSILON) * 100) / 100,
          isWholesale: parsedQty >= minWq
        };
      }),
      notes: notes
    }).catch(err => console.warn('Mock Supabase failed silently:', err));

    // Limpiar carrito y reiniciar drawer, pero manteniendo los datos de facturación en localStorage
    setTimeout(() => {
      onClearCart();
      setNotes('');
      setActiveStep(1);
      onClose();
    }, 1000);
  };

  return (
    <div className="drawer-overlay">
      <div className="cart-drawer">
        <div className="mobile-drawer-handle" aria-hidden="true" />
        
        {/* Encabezado del Cotizador */}
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

        {/* Pestañas Superiores de Pasos Simétricas (50% / 50%) */}
        <div className="drawer-steps-nav">
          <button
            type="button"
            className={`drawer-step-tab ${activeStep === 1 ? 'active' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <ShoppingCart size={16} />
            <span>1. Rubros ({cart.length})</span>
          </button>
          <button
            type="button"
            className={`drawer-step-tab ${activeStep === 2 ? 'active' : ''}`}
            onClick={() => {
              if (cart.length === 0) {
                alert('Agrega rubros a la cotización primero.');
                return;
              }
              setActiveStep(2);
            }}
          >
            <Truck size={16} />
            <span>2. Datos de Despacho</span>
          </button>
        </div>

        {/* Cuerpo del Drawer según Paso Activo */}
        <div className="drawer-body">
          {activeStep === 1 ? (
            /* ============================================================
               PASO 1: RUBROS Y COTIZACIÓN (PANTALLA COMPLETA)
               ============================================================ */
            <>
              {/* Barra de Progreso de Descuento por Volumen */}
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
                </>
              )}
            </>
          ) : (
            /* ============================================================
               PASO 2: DATOS DEL CLIENTE Y DESPACHO (ESPACIOSO CON PÍLDORAS)
               ============================================================ */
            <div className="restaurant-form-section-step2">
              <div className="step2-intro-header">
                <div className="step2-badge"><Truck size={14} /> Despacho en Caracas</div>
                <h4>Datos del Cliente & Punto de Despacho</h4>
                <p>Completa la información para que nuestro equipo coordine la entrega de tus hortalizas.</p>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre o Razón Social (Restaurante / Negocio) *</label>
                  <input
                    type="text"
                    placeholder="Ej: Trattoria Bellini / Juan Pérez"
                    value={billingData?.restName || ''}
                    onChange={(e) => handleBillingChange('restName', e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>RIF o Cédula (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: J-12345678-0"
                    value={billingData?.rif || ''}
                    onChange={(e) => handleBillingChange('rif', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono WhatsApp (Opcional)</label>
                  <input
                    type="tel"
                    placeholder="Ej: 0414-1234567"
                    value={billingData?.phone || ''}
                    onChange={(e) => handleBillingChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Zona o Dirección de Entrega en Caracas *</label>
                  <div className="zone-input-wrapper">
                    <MapPin size={16} className="zone-input-icon" />
                    <input
                      type="text"
                      className="zone-text-input"
                      placeholder="Ej: Las Mercedes, Calle París / San Bernardino..."
                      value={billingData?.zone || ''}
                      onChange={(e) => handleBillingChange('zone', e.target.value)}
                    />
                  </div>

                  {/* Píldoras interactivas de Caracas */}
                  <div className="zone-pills-container">
                    <span className="zone-pills-title">Zonas frecuentes en Caracas:</span>
                    <div className="zone-pills-grid">
                      {CARACAS_ZONES.map((zone) => {
                        const isSelected = billingData?.zone?.toLowerCase().includes(zone.toLowerCase());
                        return (
                          <button
                            key={zone}
                            type="button"
                            className={`zone-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleBillingChange('zone', zone)}
                          >
                            📍 {zone}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Observaciones o Requerimientos Especiales</label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Hortalizas seleccionadas para ensaladas, tomates maduros, entrega en la mañana..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
           PIE DEL DRAWER (FOOTERS DIFERENCIADOS POR PASO)
           ============================================================ */}
        {cart.length > 0 && (
          <>
            {activeStep === 1 ? (
              /* Footer Paso 1: Barra delgada y fija para continuar */
              <div className="drawer-footer-step1">
                <div className="step1-footer-summary">
                  <div className="step1-total-info">
                    <span className="step1-total-label">Total Estimado:</span>
                    <strong className="step1-total-usd">{formatUSD(totalUsd)}</strong>
                    <span className="step1-total-bcv">({formatVES(totalUsd, activeBcvRate)})</span>
                  </div>
                  {totalSavingsUsd > 0 && (
                    <span className="step1-saving-tag">
                      <Sparkles size={12} /> Ahorro: -{formatUSD(totalSavingsUsd)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-step1-continue"
                  onClick={() => setActiveStep(2)}
                >
                  <span>Continuar a Despacho</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              /* Footer Paso 2: Pestaña Inferior Dinámica (Reducida -> Expandida) */
              <div className={`drawer-footer-step2 ${isStep2Valid ? 'is-expanded' : 'is-collapsed'}`}>
                {!isStep2Valid ? (
                  /* Estado 1: Ultra reducida (~34px), no estorba al escribir */
                  <div className="quote-summary-card-collapsed">
                    <div className="collapsed-info-bar">
                      <div className="collapsed-left">
                        <span className="collapsed-prefix">Total:</span>
                        <strong className="collapsed-amount">{formatUSD(totalUsd)}</strong>
                      </div>
                      <div className="collapsed-right">
                        <span>✍️ Completa tu <strong>Nombre</strong> y <strong>Zona</strong> para activar WhatsApp</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Estado 2: Desplegada con resumen y enlace directo a la API de WhatsApp */
                  <div className="quote-summary-card-expanded">
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

                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-block" 
                      onClick={handleWhatsappClick}
                      style={{ textDecoration: 'none' }}
                    >
                      <Send size={18} />
                      <span>Enviar Cotización a WhatsApp 📲</span>
                    </a>
                    <p className="whatsapp-disclaimer">Recibirás confirmación inmediata de peso exacto y horario de despacho.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
