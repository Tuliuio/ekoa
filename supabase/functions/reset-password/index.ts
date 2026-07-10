import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const email = String(body?.email || '').toLowerCase().trim();

    if (!email || !email.includes('@sooly.whatsapp')) {
      return new Response(JSON.stringify({ error: 'invalid_email_format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data: user, error: getUserError } = await admin.auth.admin.getUserByEmail(email);

    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ error: 'user_not_found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const phoneMatch = email.match(/^(\d+)@/);
    if (!phoneMatch) {
      return new Response(JSON.stringify({ error: 'invalid_phone_format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fullPhone = phoneMatch[1];
    const newPassword = `sooly_${fullPhone}`.substring(0, 32);

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, email, password: newPassword }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('reset-password error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
