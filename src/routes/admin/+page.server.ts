import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/utils/supabase.server';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  // Provide initial data for SSR
  const [{ data: current }, { data: pending }] = await Promise.all([
    supabaseAdmin
      .from('turnos')
      .select('*')
      .eq('estado', 'atendiendo')
      .order('fecha', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('turnos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('fecha', { ascending: true })
  ]);

  return { current, pending };
};

export const actions: Actions = {
  login: async ({ request }) => {
    const form = await request.formData();
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    // Using admin to authenticate users via auth.admin API is not ideal; instead, use client API on +page.svelte
    // Here we just validate fixed credentials for PoC SSR-only flow
    if (email !== 'admin@admin.com' || password !== 'A123456*a') {
      return fail(400, { message: 'Credenciales inválidas' });
    }

    // Simple cookie flag for PoC
    return { ok: true };
  },

  llamarSiguiente: async () => {
    // Finaliza el actual y pone el más antiguo pendiente en atendiendo
    // Use RPC to ensure atomicity
    const { data, error } = await supabaseAdmin.rpc('llamar_siguiente');
    if (error) {
      return fail(500, { message: error.message });
    }
    return { ok: true, data };
  },

  finalizarActual: async () => {
    const { data, error } = await supabaseAdmin
      .from('turnos')
      .update({ estado: 'finalizado' })
      .eq('estado', 'atendiendo')
      .select('*')
      .limit(1);
    if (error) return fail(500, { message: error.message });
    return { ok: true, data };
  }
};

