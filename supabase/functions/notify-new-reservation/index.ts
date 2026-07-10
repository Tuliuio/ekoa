import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    const CHAT_ID = Deno.env.get('TELEGRAM_NOTIFY_CHAT_ID');
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) {
      throw new Error('Missing env: LOVABLE_API_KEY / TELEGRAM_API_KEY / TELEGRAM_NOTIFY_CHAT_ID');
    }

    const { reservation_id } = await req.json();
    if (!reservation_id) throw new Error('reservation_id required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: r, error } = await supabase
      .from('reservations')
      .select('id, start_time, end_time, total_price, delivery_city, delivery_neighborhood, delivery_address, status, payment_status, user_id, notes')
      .eq('id', reservation_id)
      .maybeSingle();
    if (error) throw error;
    if (!r) throw new Error('reservation not found');

    let userName = '—';
    let userPhone = '';
    if (r.user_id) {
      const { data: p } = await supabase.from('profiles').select('full_name, phone').eq('id', r.user_id).maybeSingle();
      if (p) { userName = p.full_name || '—'; userPhone = (p as any).phone || ''; }
    }

    const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const customTimeMatch = (r.notes as string | null)?.match(/Horário solicitado: ([^|]+)\(pendente aprovação\)/);
    const customTimeLine = customTimeMatch
      ? `\n⏰ <b>Horário alternativo solicitado: ${customTimeMatch[1].trim()}</b> ← requer confirmação`
      : '';

    const text = `🚲 <b>Nova reserva Ekoa</b>
👤 ${userName}${userPhone ? ` (${userPhone})` : ''}
📍 ${r.delivery_city || '—'}${r.delivery_neighborhood ? ' / ' + r.delivery_neighborhood : ''}
🏠 ${r.delivery_address || '—'}
🗓 ${fmt(r.start_time)} → ${fmt(r.end_time)}${customTimeLine}
💰 R$ ${Number(r.total_price || 0).toFixed(2)}
📦 Status: ${r.status} | 💳 ${r.payment_status}
ID: <code>${r.id}</code>`;

    const tg = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
    const tgData = await tg.json();
    if (!tg.ok) throw new Error(`Telegram failed [${tg.status}]: ${JSON.stringify(tgData)}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-new-reservation error', e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
