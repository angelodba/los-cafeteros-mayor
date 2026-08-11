import React from 'react';
import { PRODUCTS } from '../../data/products';

export default function ProductSchema() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'WholesaleStore',
    name: 'LOS CAFETEROS',
    description: 'Feria de Hortalizas y Frutas al Mayor en Caracas.',
    url: 'https://los-cafeteros-mayor.vercel.app',
    image: 'https://los-cafeteros-mayor.vercel.app/logo-cropped.png',
    telephone: '+584247087749',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Caracas',
      addressRegion: 'Distrito Capital',
      addressCountry: 'VE',
    },
    priceRange: '$$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Hortalizas y Frutas',
      itemListElement: PRODUCTS.map((prod, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: prod.name,
          category: prod.category,
          productID: prod.id,
          description: prod.highlight || `Compra ${prod.name} fresco al mayor o detal.`,
        },
        price: prod.priceMayor || prod.priceDetal,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        position: index + 1,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
    />
  );
}
