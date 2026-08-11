import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simulación de Rate-Limiter en Memoria (Por Vercel Edge Node)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 20;
const WINDOW_MS = 60 * 1000; // 1 minuto

export function proxy(request: NextRequest) {
  // Solo proteger rutas API críticas
  if (request.nextUrl.pathname.startsWith('/api/stock') || request.nextUrl.pathname.startsWith('/api/bcv')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const now = Date.now();
    
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };
    
    if (now - record.lastReset > WINDOW_MS) {
      record.count = 1;
      record.lastReset = now;
    } else {
      record.count += 1;
    }
    
    rateLimitMap.set(ip, record);

    if (record.count > LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests - Rate Limit Exceeded (Max 20/min)' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Injectar Headers de Seguridad en todas las respuestas
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|models|logo).*)',
  ],
};
