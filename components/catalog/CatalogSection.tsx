'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Sparkles, Scale, SearchX } from 'lucide-react';
import ProductCard from './ProductCard';

import { PRODUCTS } from '../../data/products';
import { useStore } from '../../context/StoreContext';

const normalizeText = (text: string): string => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export default function CatalogSection() {
  const { cart, stockData, addToCart: onAddToCart, setIsCartOpen } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Keyboard shortcut Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('product-search-input') as HTMLInputElement | null;
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    const normQuery = normalizeText(debouncedQuery);
    const tokens = normQuery ? normQuery.split(/\s+/).filter(t => t.length > 0) : [];

    return PRODUCTS.filter((prod) => {
      const matchCat = activeCategory === 'all' || prod.category === activeCategory;
      if (!matchCat) return false;
      if (tokens.length === 0) return true;

      const normName = normalizeText(prod.name);
      const normCat = normalizeText(prod.category);
      const normHighlight = normalizeText(prod.highlight);
      const normTags = (prod.tags || []).map(t => normalizeText(t)).join(' ');
      const text = `${normName} ${normCat} ${normHighlight} ${normTags}`;

      return tokens.every(token => text.includes(token));
    });
  }, [debouncedQuery, activeCategory]);

  const [visibleCount, setVisibleCount] = useState(12);

  // Reiniciar la cuenta visible al buscar
  useEffect(() => {
    setVisibleCount(12);
  }, [debouncedQuery, activeCategory]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="main-catalog container">
      <div className="catalog-header">
        <div>
          <div className="section-eyebrow">
            <span className="section-eyebrow-num">02 — CATÁLOGO</span>
            <div className="section-eyebrow-line"></div>
          </div>
          <h2 className="section-title">Nuestras Hortalizas<br />&amp; Productos</h2>
          <p className="section-subtitle">Selecciona los rubros para armar la cotización de tu pedido en vivo</p>
        </div>

        <div className="category-tabs">
          {['all', 'hortalizas', 'tuberculos', 'hojas', 'alinos', 'frutas'].map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'Todos' : cat === 'alinos' ? 'Aliños & Ajos' : cat === 'hojas' ? 'Hojas & Hortalizas' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-search-container">
        <div className="search-bar-wrapper">
          <div className="search-left-icon">
            <Search size={22} />
          </div>
          <input
            type="text"
            id="product-search-input"
            className="search-bar-input"
            placeholder="Buscar por nombre, categoría (ej: papa, pimentón, aliños)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <>
              <span className="search-count-pill">{filteredProducts.length} rubros</span>
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            </>
          )}
          <kbd className="search-shortcut-badge">Ctrl K</kbd>
        </div>

        <div className="quick-search-chips">
          <span className="chip-label"><Sparkles size={13} /> Populares:</span>
          {['Tomate', 'Pimentón', 'Cebolla', 'Papa', 'Aguacate', 'Ajo'].map((term) => (
            <button
              key={term}
              className={`search-chip ${searchQuery === term ? 'active' : ''}`}
              onClick={() => setSearchQuery(searchQuery === term ? '' : term)}
            >
              {term === 'Tomate' && '🍅 '}
              {term === 'Pimentón' && '🫑 '}
              {term === 'Cebolla' && '🧅 '}
              {term === 'Papa' && '🥔 '}
              {term === 'Aguacate' && '🥑 '}
              {term === 'Ajo' && '🧄 '}
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="pricing-mode-banner">
        <div className="mode-banner-icon">
          <Scale size={20} />
        </div>
        <div>
          <h3>Descuentos Automáticos Al Mayor a partir de 30 kg</h3>
          <p>Arma tu cotización: al alcanzar 30 kg por rubro obtienes Precios Al Mayor automáticamente.</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products-found">
          <div className="no-products-icon">
            <SearchX size={32} />
          </div>
          <h3>No encontramos hortalizas para &quot;{searchQuery}&quot;</h3>
          <p>Prueba buscando sin tildes, con otro término o limpia los filtros.</p>
          <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {visibleProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              cartItem={cart.find((i) => i.product.id === product.id)}
              stockData={stockData}
              onAddToCart={onAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
            />
          ))}
          {visibleProducts.length < filteredProducts.length && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={handleLoadMore}>
                Cargar más productos
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

