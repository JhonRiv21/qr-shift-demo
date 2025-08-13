import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

// Verificar variables de entorno
console.log('SUPABASE_URL:', PUBLIC_SUPABASE_URL);
console.log('SERVICE_ROLE_KEY existe:', !!env.SUPABASE_SERVICE_ROLE_KEY);

// Server-side Supabase client using the service role key for privileged operations (bypasses RLS)
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
  auth: {
    persistSession: false
  }
});

