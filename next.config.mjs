import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.110.252', 'localhost', '127.0.0.1', '0.0.0.0'],
  turbopack: {},

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Control de caché para asegurar que clientes móviles siempre obtengan la versión en vivo
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          // Evita que la app sea embebida en iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Evita MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla información del referer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deshabilita funcionalidades del navegador innecesarias
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // XSS Protection para navegadores legacy
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);

