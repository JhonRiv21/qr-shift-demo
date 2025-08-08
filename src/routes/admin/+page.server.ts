import type { PageServerLoad } from './$types';
import { supabase } from '$lib/utils/supabase';

export const load: PageServerLoad = async () => {
  // Provide initial data for SSR
  const [{ data: current }, { data: pending }] = await Promise.all([
    supabase.from('turnos').select('*').eq('estado', 'atendiendo').order('fecha', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('turnos').select('*').eq('estado', 'pendiente').order('fecha', { ascending: true })
  ]);

  return { current, pending };
};

