'use server';

import { createClient } from '@supabase/supabase-js';

// Payload esperado desde el carrito
export interface OrderPayload {
  customerName: string;
  rif: string;
  phone: string;
  zone: string;
  totalUsd: number;
  totalBs: number;
  bcvRate: number;
  items: Array<{
    id: string;
    name: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    isWholesale: boolean;
  }>;
  notes: string;
}

export async function createQuoteAction(payload: OrderPayload) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ [Supabase] No credentials found in .env.local. Order mock logged:', payload);
    return { success: true, mocked: true };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insertar en la tabla "quotes"
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          customer_name: payload.customerName,
          rif: payload.rif,
          phone: payload.phone,
          zone: payload.zone,
          total_usd: payload.totalUsd,
          total_bs: payload.totalBs,
          bcv_rate: payload.bcvRate,
          items: payload.items,
          notes: payload.notes,
          status: 'pending' // Estado inicial
        }
      ]);

    if (error) throw error;
    
    console.info('✅ [Supabase] Quote successfully logged in database.');
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ [Supabase] Error inserting quote:', error.message);
    return { success: false, error: error.message };
  }
}
