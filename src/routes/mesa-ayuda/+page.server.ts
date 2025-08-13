import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/utils/supabase.server';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  try {
    // Cargar sucursales y servicios disponibles
    const [sucursales, servicios] = await Promise.all([
      supabaseAdmin.from('turnos_sucursales').select('*').eq('activa', true).order('nombre'),
      supabaseAdmin.from('turnos_servicios').select('*').eq('activo', true).order('nombre')
    ]);

    console.log('Sucursales cargadas:', sucursales.data?.length || 0);
    console.log('Servicios cargados:', servicios.data?.length || 0);

    return {
      sucursales: sucursales.data ?? [],
      servicios: servicios.data ?? []
    };
  } catch (error) {
    console.error('Error en load de mesa-ayuda:', error);
    throw error;
  }
};

export const actions: Actions = {
  crear: async ({ request }) => {
    try {
      const form = await request.formData();
      const sucursal_id = String(form.get('sucursal_id') || '');
      const servicios_codigos = String(form.get('servicios_codigos') || '').split(',').filter(Boolean);
      const doc_tipo = String(form.get('doc_tipo') || '');
      const doc_num = String(form.get('doc_num') || '');
      const nombre_cliente = String(form.get('nombre_cliente') || '');
      const telefono = String(form.get('telefono') || '');
      const email = String(form.get('email') || '');

      console.log('Datos recibidos:', {
        sucursal_id,
        servicios_codigos,
        doc_tipo,
        doc_num,
        nombre_cliente,
        telefono,
        email
      });

      if (!sucursal_id) {
        return fail(400, { message: 'Debe seleccionar una sucursal' });
      }
      if (servicios_codigos.length === 0) {
        return fail(400, { message: 'Debe seleccionar al menos un servicio' });
      }
      if (!doc_tipo || !doc_num) {
        return fail(400, { message: 'Documento requerido' });
      }

      const { data, error } = await supabaseAdmin.rpc('turnos_crear_ticket', {
        p_sucursal_id: sucursal_id,
        p_servicios_codigos: servicios_codigos,
        p_doc_tipo: doc_tipo,
        p_doc_num: doc_num,
        p_nombre_cliente: nombre_cliente || null,
        p_telefono: telefono || null,
        p_email: email || null
      });

      if (error) {
        console.error('Error en RPC:', error);
        return fail(500, { message: error.message });
      }

      console.log('Ticket creado exitosamente:', data);
      return { ticket: data };
    } catch (error) {
      console.error('Error en acción crear:', error);
      return fail(500, { message: 'Error interno del servidor' });
    }
  }
}; 