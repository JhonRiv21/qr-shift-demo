import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/utils/supabase';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  crear: async ({ request }) => {
    const form = await request.formData();
    const tipo = String(form.get('tipo') || '').toUpperCase();
    const doc_tipo = String(form.get('doc_tipo') || '');
    const doc_num = String(form.get('doc_num') || '');

    if (!['A', 'B', 'C', 'D'].includes(tipo)) {
      return fail(400, { message: 'Tipo inválido' });
    }
    if (!doc_tipo || !doc_num) {
      return fail(400, { message: 'Documento requerido' });
    }

    const { data, error } = await supabase.rpc('crear_turno', { p_tipo: tipo, p_doc_tipo: doc_tipo, p_doc_num: doc_num });
    if (error) {
      return fail(500, { message: error.message });
    }
    return { turno: data };
  }
};

