'use server';

import { createClient } from '@supabase/supabase-js';

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  isWholesale: boolean;
}

export interface OrderPayload {
  customerName: string;
  rif: string;
  phone: string;
  zone: string;
  totalUsd: number;
  totalBs: number;
  bcvRate: number;
  items: OrderItem[];
  notes: string;
}

/**
 * Sanitiza strings del usuario antes de persistir o loggear.
 * Evita que datos del usuario expongan detalles internos en logs del servidor.
 */
function sanitizeString(value: unknown, maxLen = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export async function createQuoteAction(
  payload: OrderPayload
): Promise<{ success: boolean; mocked?: boolean; fallback?: boolean }> {
  // SECURITY: Solo usar SUPABASE_ANON_KEY (server-only, sin prefijo NEXT_PUBLIC_).
  // NUNCA usar SUPABASE_SERVICE_ROLE_KEY — bypasea todas las RLS policies de Supabase.
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // En desarrollo sin .env.local — loggear en servidor únicamente, nunca al cliente.
    console.warn('⚠️ [Supabase] Credenciales no encontradas. Pedido registrado localmente:', {
      customerName: sanitizeString(payload.customerName),
      zone: sanitizeString(payload.zone),
      totalUsd: payload.totalUsd,
      itemCount: payload.items?.length,
    });
    return { success: true, mocked: true };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('quotes').insert([
      {
        customer_name: sanitizeString(payload.customerName, 150),
        rif: sanitizeString(payload.rif, 20),
        phone: sanitizeString(payload.phone, 20),
        zone: sanitizeString(payload.zone, 100),
        total_usd: typeof payload.totalUsd === 'number' ? payload.totalUsd : 0,
        total_bs: typeof payload.totalBs === 'number' ? payload.totalBs : 0,
        bcv_rate: typeof payload.bcvRate === 'number' ? payload.bcvRate : 0,
        items: payload.items ?? [],
        notes: sanitizeString(payload.notes, 500),
        status: 'pending',
      },
    ]);

    if (error) throw error;

    console.info('✅ [Supabase] Cotización registrada exitosamente en base de datos.');
    return { success: true };
  } catch (error: unknown) {
    // SECURITY: No filtrar detalles del error de BD al cliente.
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.warn('⚠️ [Supabase] Error de BD (no visible al cliente):', msg);
    return { success: true, fallback: true };
  }
}
