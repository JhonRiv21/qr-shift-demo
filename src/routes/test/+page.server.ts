import { supabaseAdmin } from '$lib/utils/supabase.server';

export async function load() {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Probar una consulta simple
    const { data, error } = await supabaseAdmin
      .from('turnos_sucursales')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error en consulta de prueba:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Conexión exitosa');
    return { success: true, data };
  } catch (error) {
    console.error('Error general:', error);
    return { success: false, error: String(error) };
  }
} 