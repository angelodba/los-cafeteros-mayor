import { Syne, Space_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

export const metadata = {
  metadataBase: new URL('https://los-cafeteros-mayor.vercel.app'),
  title: 'LOS CAFETEROS | Feria de Hortalizas en Caracas - Precios al Mayor y Detal',
  description: 'Hortalizas frescas de Mérida a la cocina de tu restaurante. Precios al mayor y detal. Despacho en Caracas.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LOS CAFETEROS',
  },
  formatDetection: {
    telephone: false, // Evita que iOS confunda IDs numéricos con números telefónicos
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,       // Permite zoom de accesibilidad (WCAG 2.1 AA)
  userScalable: true,    // Cumplimiento WCAG
  viewportFit: 'cover',  // Safe areas para Notch, Dynamic Island y barras Android
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2EEDC' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${spaceMono.variable} ${jakarta.variable}`}>
      <head>
        {/* Script de inicio: purga Service Workers y CacheStorage para garantizar versión en vivo en móviles */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) { r.unregister(); }
                  }).catch(function() {});
                }
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    for (var k of keys) { caches.delete(k); }
                  }).catch(function() {});
                }
              }
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
