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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,       // Permite zoom de accesibilidad (WCAG 2.1 AA)
  userScalable: true,    // NO desactivar zoom — viola WCAG 2.1 AA
  viewportFit: 'cover',  // iOS notch safe-area
  themeColor: '#F2EEDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${spaceMono.variable} ${jakarta.variable}`}>
      <body style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
