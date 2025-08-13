import type { PageServerLoad } from './$types';
import { supabase } from '$lib/utils/supabase';

export const load: PageServerLoad = async () => {
  // Cargar sucursales para selección
  const { data: sucursales } = await supabase
    .from('turnos_sucursales')
    .select('*')
    .eq('activa', true)
    .order('nombre');

  return {
    sucursales: sucursales ?? []
  };
}; 