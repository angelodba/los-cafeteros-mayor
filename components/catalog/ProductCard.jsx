'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, AlertTriangle, XCircle, Slash, ShoppingBag } from 'lucide-react';
import QuantitySelector from './QuantitySelector';

export default function ProductCard({ product, index, cartItem, stockData, onAddToCart }) {
  const [qtyInput, setQtyInput] = useState(1);

  const itemStock = stockData[product.id] || { stockQty: 100, minAlert: 15, status: 'disponible' };
  const availableQty = itemStock.stockQty;
  const isOutOfStock = availableQty <= 0;
  const isLowStock = !isOutOfStock && availableQty <= itemStock.minAlert;

  const effectiveQty = (cartItem ? cartItem.qty : 0) + (parseFloat(qtyInput) || 0);
  const minWholesaleQty = product.minWholesaleQty || 30;
  const isItemWholesaleActive = effectiveQty >= minWholesaleQty;
  const currentPrice = isItemWholesaleActive ? product.priceMayor : product.priceDetal;
  const savingPercent = Math.round(((product.priceDetal - product.priceMayor) / product.priceDetal) * 100);

  const handleAdd = () => {
    const qtyToAdd = parseFloat(qtyInput) || 1;
    if (qtyToAdd > 0) {
      onAddToCart(product.id, qtyToAdd);
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''} ${isItemWholesaleActive ? 'wholesale-card-active' : ''}`}>
      <div className="product-image-container">
        <span className="product-card-num">#{String(index + 1).padStart(2, '0')}</span>

        {isOutOfStock ? (
          <span className="stock-status-badge empty">
            <XCircle size={11} /> Agotado / Bajo Pedido
          </span>
        ) : isLowStock ? (
          <span className="stock-status-badge warning">
            <AlertTriangle size={11} /> ¡Últimas {availableQty} {product.unit}!
          </span>
        ) : (
          <span className="stock-status-badge available">
            <CheckCircle2 size={11} /> Disponible
          </span>
        )}

        {product.wholesaleNote && (
          <span className="wholesale-cesta-tag">
            📦 {product.wholesaleNote}
          </span>
        )}

        <div className="product-emoji">{product.emoji}</div>
      </div>

      <div className="product-details">
        <span className="product-category-tag">{product.highlight}</span>
        <h3 className="product-title">{product.name}</h3>

        <div className="product-prices">
          <div className="price-main">
            <span className="price-amount" style={{ color: isItemWholesaleActive ? 'var(--verde-hoja)' : undefined }}>
              ${currentPrice.toFixed(2)}
            </span>
            <span className="price-unit">
              / {product.unit} {isItemWholesaleActive ? '(Al Mayor)' : '(Detal)'}
            </span>
          </div>
          <div className="price-comparison">
            {isItemWholesaleActive ? (
              <>
                Detal normal: <s>${product.priceDetal.toFixed(2)}</s>{' '}
                <span className="price-saving">(-{savingPercent}% Ahorro Mayor)</span>
              </>
            ) : (
              <>
                Al Mayor (desde {minWholesaleQty} {product.unit}):{' '}
                <strong style={{ color: 'var(--verde-hoja)', fontWeight: 800 }}>
                  ${product.priceMayor.toFixed(2)}
                </strong>
              </>
            )}
          </div>
        </div>

        <div className="product-actions-v2">
          <QuantitySelector
            value={qtyInput}
            onChange={(val) => setQtyInput(val)}
            unit={product.unit}
            min={1}
            max={availableQty}
            disabled={isOutOfStock}
            showQuickPills={true}
            isWholesaleActive={isItemWholesaleActive}
            minWholesaleQty={minWholesaleQty}
            savingPercent={savingPercent}
          />

          <button
            className="btn btn-add-cart-haptic"
            onClick={handleAdd}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? <Slash size={16} /> : <ShoppingBag size={16} />}
            <span>{isOutOfStock ? 'Agotado' : `Agregar al Pedido`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
