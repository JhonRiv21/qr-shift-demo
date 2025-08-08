<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  let current: any = $state(null);
  let next: any = $state(null);

  async function refresh() {
    const [c, n] = await Promise.all([
      supabase.from('turnos').select('*').eq('estado', 'atendiendo').order('fecha', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('turnos').select('*').eq('estado', 'pendiente').order('fecha', { ascending: true }).limit(1).maybeSingle()
    ]);
    current = c.data;
    next = n.data;
  }

  const channel = supabase
    .channel('pantalla-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos' }, () => refresh())
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
  <div class="w-full max-w-3xl">
    <div class="text-center">
      <div class="text-6xl font-extrabold tracking-wider">{current ? current.turno : '--'}</div>
      <div class="text-gray-400 mt-2">Atendiendo</div>
    </div>

    <div class="mt-12 text-center">
      <div class="text-4xl font-bold">Siguiente: {next ? next.turno : '--'}</div>
    </div>
  </div>
</div>

