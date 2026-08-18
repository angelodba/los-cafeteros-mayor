'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, AlertTriangle, XCircle, Slash, ShoppingBag, Sparkles } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { Product, CartItem, StockData } from '../../types/catalog';
import { useStore } from '../../context/StoreContext';
import { getProductUpdate } from '../../data/products';

interface ProductCardProps {
  product: Product;
  index: number;
  cartItem?: CartItem;
  stockData: StockData;
  onAddToCart: (id: string, qty: number) => void;
  onOpenCart?: () => void;
}

export default function ProductCard({ product, index, cartItem, stockData, onAddToCart, onOpenCart }: ProductCardProps) {
  const [qtyInput, setQtyInput] = useState<number | string>(1);
  const { productUpdates } = useStore();

  // Aplicar actualizaciones reactivas del Google Sheet de forma segura sin colisiones
  const updates = getProductUpdate(product, productUpdates);
  const prod: Product = updates ? { ...product, ...updates } : product;

  const itemStock = stockData[prod.id] || { stockQty: 100, minAlert: 15, status: 'disponible' };
  const availableQty = itemStock.stockQty;
  const isOutOfStock = availableQty <= 0 || prod.priceDetal <= 0 || (prod as any).isAvailable === false;
  const isLowStock = !isOutOfStock && availableQty <= itemStock.minAlert;

  const effectiveQty = (cartItem ? parseFloat(String(cartItem.qty)) || 0 : 0) + (parseFloat(qtyInput as string) || 0);
  const minWholesaleQty = prod.minWholesaleQty || 30;
  const isItemWholesaleActive = effectiveQty >= minWholesaleQty;
  const currentPrice = isItemWholesaleActive ? prod.priceMayor : prod.priceDetal;
  const savingPercent = prod.priceDetal > 0
    ? Math.round(((prod.priceDetal - prod.priceMayor) / prod.priceDetal) * 100)
    : 0;

  const isNoWholesale = minWholesaleQty >= 99999 || prod.priceMayor <= 0 || prod.changes === 'sin mayor';

  const handleAdd = () => {
    let qtyToAdd = parseFloat(qtyInput as string) || 1;
    if (qtyToAdd < 1) qtyToAdd = 1;
    if (availableQty > 0 && qtyToAdd > availableQty) qtyToAdd = availableQty;

    if (qtyToAdd > 0 && !isOutOfStock) {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        try {
          navigator.vibrate([15, 30, 20]); // Micro-patrón háptico de éxito
        } catch (e) {
          // Safe fallback
        }
      }
      onAddToCart(prod.id, qtyToAdd);
      if (onOpenCart) onOpenCart();
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''} ${isItemWholesaleActive ? '!border-[#65A61A] shadow-[4px_4px_0px_0px_rgba(101,166,26,1)]' : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
      <div className="product-image-container">
        <span className="product-card-num">#{String(index + 1).padStart(2, '0')}</span>

        {isOutOfStock ? (
          <span className="stock-status-badge empty">
            <XCircle size={12} /> No disponible
          </span>
        ) : isLowStock ? (
          <span className="stock-status-badge warning">
            <AlertTriangle size={12} /> ¡Últimas {availableQty} {prod.unit}!
          </span>
        ) : (
          <span className="stock-status-badge available">
            <CheckCircle2 size={12} /> Disponible
          </span>
        )}

        {prod.wholesaleNote && !isNoWholesale && !isOutOfStock && (
          <span className="wholesale-cesta-tag">
            📦 {prod.wholesaleNote}
          </span>
        )}

        {prod.changes && (
          <span className="product-change-badge" title={prod.changes}>
            <Sparkles size={12} className="product-change-icon" />
            <span>{prod.changes}</span>
          </span>
        )}

        {/* Real Product Image with Emoji Fallback */}
        <div className="product-image-wrapper">
          <img
            src={`/products/${prod.id}.webp`}
            alt={prod.name}
            className="product-real-img"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div className="product-emoji" style={{ display: 'none' }}>{prod.emoji}</div>
        </div>
      </div>

      <div className="product-details">
        <span className="product-category-tag">{prod.highlight}</span>
        <h3 className="product-title">{prod.name}</h3>

        {/* Contenedor Dual de Precios Detal y Mayor */}
        <div className="product-dual-pricing">
          {/* Tarjeta Detal */}
          <div className={`price-tier-card detal-tier ${isOutOfStock ? 'no-mayor-tier' : (!isItemWholesaleActive && !isNoWholesale ? 'active-tier' : '')}`}>
            <div className="price-tier-badge-row">
              <span className="price-tier-name">AL DETAL</span>
              {!isOutOfStock && !isItemWholesaleActive && !isNoWholesale && (
                <span className="active-dot-pill">ACTIVO</span>
              )}
            </div>
            <div className="price-tier-amount">
              {prod.priceDetal > 0 && !isOutOfStock ? (
                <>
                  <span className="price-symbol">$</span>
                  <span className="price-val">{prod.priceDetal.toFixed(2)}</span>
                </>
              ) : (
                <span className="no-scale-text">No disponible</span>
              )}
            </div>
            <div className="price-tier-sub">
              <span>{prod.priceDetal > 0 && !isOutOfStock ? `por ${prod.unit}` : 'Sin stock'}</span>
            </div>
          </div>

          {/* Tarjeta Mayor */}
          {!isNoWholesale && !isOutOfStock ? (
            <div className={`price-tier-card mayor-tier ${isItemWholesaleActive ? 'active-tier' : ''}`}>
              <div className="price-tier-badge-row">
                <span className="price-tier-name mayor-accent">AL MAYOR</span>
                {savingPercent > 0 && (
                  <span className="saving-badge-pill">-{savingPercent}%</span>
                )}
              </div>
              <div className="price-tier-amount">
                <span className="price-symbol">$</span>
                <span className="price-val">{prod.priceMayor.toFixed(2)}</span>
              </div>
              <div className="price-tier-sub">
                <span>desde {minWholesaleQty} {prod.unit}</span>
              </div>
            </div>
          ) : (
            <div className="price-tier-card no-mayor-tier">
              <div className="price-tier-badge-row">
                <span className="price-tier-name">AL MAYOR</span>
              </div>
              <div className="price-tier-amount no-val">
                <span className="no-scale-text">{isOutOfStock ? 'No disponible' : 'No aplica'}</span>
              </div>
              <div className="price-tier-sub">
                <span>{isOutOfStock ? 'Sin stock' : 'Venta solo detal'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="product-actions-v2">
          <QuantitySelector
            value={qtyInput}
            onChange={(val: number | string) => setQtyInput(val)}
            unit={prod.unit}
            min={1}
            max={availableQty}
            disabled={isOutOfStock}
            showQuickPills={true}
            isWholesaleActive={isItemWholesaleActive}
            minWholesaleQty={minWholesaleQty}
            savingPercent={savingPercent}
            isNoWholesale={isNoWholesale}
          />

          <button
            type="button"
            className="btn btn-add-cart-haptic"
            onClick={handleAdd}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? <Slash size={18} /> : <ShoppingBag size={18} />}
            <span>{isOutOfStock ? 'No disponible' : `Agregar al Pedido`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

