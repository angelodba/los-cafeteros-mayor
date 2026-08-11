import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LOS CAFETEROS - Mayor y Detal',
    short_name: 'Cafeteros',
    description: 'Feria de hortalizas y frutas al mayor en Caracas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#65A61A',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.png', // Fallback a PNG 
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png', // Idealmente tener 512x512
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
