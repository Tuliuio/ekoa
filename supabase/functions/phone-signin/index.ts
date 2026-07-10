import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const raw = String(body?.phone || '');
    const phone = raw.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 15) {
      return new Response(JSON.stringify({ error: 'invalid_phone' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const email = `wa-${phone}@sooly.app`;
    // Generate one-time password client will use to sign in immediately
    const password = crypto.randomUUID() + 'A1!';

    // Find existing profile by phone
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    let userId: string;
    let isNew = false;
    let resolvedEmail = email;

    if (existingProfile?.id) {
      userId = existingProfile.id;
      const { data: u } = await admin.auth.admin.getUserById(userId);
      resolvedEmail = u?.user?.email || email;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password });
      if (updErr) throw updErr;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, signup_source: 'whatsapp' },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
      isNew = true;

      // Ensure profile has phone (handle_new_user trigger creates row, but without phone)
      await admin.from('profiles').upsert(
        { id: userId, phone },
        { onConflict: 'id' }
      );
    }

    return new Response(JSON.stringify({ email: resolvedEmail, password, isNew }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('phone-signin error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
