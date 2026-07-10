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

    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('id', user_id)
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new Error('profile not found');

    // Phone may not be in profile yet (race with phone-signin upsert) — fall back to auth metadata
    let rawPhone = profile.phone;
    if (!rawPhone) {
      const { data: authData } = await supabase.auth.admin.getUserById(user_id);
      rawPhone = authData?.user?.user_metadata?.phone || null;
    }

    const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const waPhone = rawPhone ? String(rawPhone).replace(/\D/g, '') : null;
    const waLink = waPhone ? `<a href="https://wa.me/${waPhone}">wa.me/${waPhone}</a>` : '—';
    const text = `👤 <b>Novo usuário Ekoa</b>
📝 ${profile.full_name || '—'}
📱 ${waLink}
🆔 <code>${profile.id}</code>
🕐 ${fmt(profile.created_at)}`;

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
    console.error('notify-new-user error', e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
