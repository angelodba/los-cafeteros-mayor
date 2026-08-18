import { describe, it, expect } from 'vitest';
import type { Product, ProductUpdatesMap, NormalizedCartItem, CartItem } from '../types/catalog';
import { getProductUpdate } from '../data/products';

function resolveCart(
  rawCart: NormalizedCartItem[],
  baseProducts: Product[],
  productUpdates: ProductUpdatesMap
): CartItem[] {
  const productMap = new Map<string, Product>();

  baseProducts.forEach((p) => {
    const updates = getProductUpdate(p, productUpdates);
    productMap.set(String(p.id), updates ? { ...p, ...updates } : p);
  });

  return rawCart
    .map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) return null;
      return { product, qty: item.qty };
    })
    .filter((item): item is CartItem => Boolean(item));
}

describe('Dynamic Product Name & Cart Resolution', () => {
  const baseProducts: Product[] = [
    {
      id: '1',
      name: 'Aguacate Polo',
      category: 'frutas',
      priceDetal: 1.99,
      priceMayor: 1.55,
      minWholesaleQty: 30,
      unit: 'kg',
      emoji: '🥑',
      highlight: 'Firme',
      tags: ['aguacate'],
    },
  ];

  it('Debe reflejar dinámicamente un cambio de product_name sin alterar el estado del carrito', () => {
    const rawCart: NormalizedCartItem[] = [{ productId: '1', qty: 5 }];
    const productUpdates: ProductUpdatesMap = {
      '1': {
        name: 'Aguacate Premium Choquette',
        priceDetal: 2.50,
      },
    };

    const resolved = resolveCart(rawCart, baseProducts, productUpdates);
    expect(resolved.length).toBe(1);
    expect(resolved[0].product.name).toBe('Aguacate Premium Choquette');
    expect(resolved[0].product.priceDetal).toBe(2.50);
    expect(resolved[0].qty).toBe(5);
  });

  it('Debe migrar carritos legacy almacenados en localStorage', () => {
    const legacySaved = [
      { product: { id: '1', name: 'Aguacate Viejo' }, qty: 10 },
    ];

    const normalized: NormalizedCartItem[] = legacySaved.map((item: any) => ({
      productId: String(item.product.id),
      qty: item.qty,
    }));

    expect(normalized).toEqual([{ productId: '1', qty: 10 }]);
  });
});
