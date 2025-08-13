<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  let current: any = $state(null);
  let next: any = $state(null);
  let sucursales: any[] = $state([]);

  async function refresh() {
    const [c, n, s] = await Promise.all([
      supabase
        .from('turnos_tickets')
        .select(`
          *,
          turnos_sucursales!inner(nombre, codigo)
        `)
        .eq('estado', 'atendiendo')
        .order('fecha_atencion', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('turnos_tickets')
        .select(`
          *,
          turnos_sucursales!inner(nombre, codigo)
        `)
        .eq('estado', 'pendiente')
        .order('fecha', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from('turnos_sucursales').select('*').eq('activa', true).order('nombre')
    ]);
    current = c.data;
    next = n.data;
    sucursales = s.data ?? [];
  }

  const channel = supabase
    .channel('pantalla-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos_tickets' }, () => refresh())
    .subscribe();

  refresh();

  $effect(() => () => supabase.removeChannel(channel));
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<style>
  :global(html, body, #svelte) { height: 100%; }
</style>

<div class="min-h-screen w-full bg-black text-white grid place-items-center p-6">
  <div class="w-full max-w-4xl">
    <div class="text-center">
      <div class="text-7xl font-extrabold tracking-wider text-blue-400">{current ? current.turno : '--'}</div>
      <div class="text-gray-400 mt-2 text-xl">Atendiendo</div>
      {#if current?.turnos_sucursales}
        <div class="text-gray-500 mt-1">{current.turnos_sucursales.nombre}</div>
      {/if}
    </div>

    <div class="mt-16 text-center">
      <div class="text-5xl font-bold text-green-400">Siguiente: {next ? next.turno : '--'}</div>
      {#if next?.turnos_sucursales}
        <div class="text-gray-500 mt-1">{next.turnos_sucursales.nombre}</div>
      {/if}
    </div>
  </div>
</div>

