<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import { enhance } from '$app/forms';

  let { data } = $props();
  let email = 'admin@admin.com';
  let password = 'A123456*a';
  let loggedIn = false;

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Subscribe for realtime updates
  let current = data.current;
  let pending = data.pending ?? [];

  const channel = supabase
    .channel('turnos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos' }, (payload) => {
      // Minimal client-side refresh of lists
      refresh();
    })
    .subscribe();

  async function refresh() {
    const [currentRes, pendingRes] = await Promise.all([
      supabase.from('turnos').select('*').eq('estado', 'atendiendo').order('fecha', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('turnos').select('*').eq('estado', 'pendiente').order('fecha', { ascending: true })
    ]);
    current = currentRes.data;
    pending = pendingRes.data ?? [];
  }

  $effect(() => () => {
    supabase.removeChannel(channel);
  });
</script>

<div class="mx-auto max-w-3xl p-4 space-y-6">
  {#if !loggedIn}
    <form method="post" use:enhance class="space-y-4" action="?/login" on:submit={() => (loggedIn = true)}>
      <h1 class="text-2xl font-bold">Admin</h1>
      <div class="grid gap-2">
        <input class="border p-3 rounded" name="email" placeholder="Email" value={email} />
        <input class="border p-3 rounded" name="password" placeholder="Password" value={password} type="password" />
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded">Ingresar</button>
    </form>
  {:else}
    <div class="space-y-6">
      <h2 class="text-xl font-semibold">Turno actual</h2>
      {#if current}
        <div class="rounded border p-4 text-3xl font-bold">{current.turno}</div>
      {:else}
        <div class="text-gray-500">No hay turno atendiendo</div>
      {/if}

      <div class="flex gap-3">
        <form method="post" use:enhance action="?/llamarSiguiente">
          <button class="bg-green-600 text-white px-4 py-2 rounded">Llamar siguiente</button>
        </form>
        <form method="post" use:enhance action="?/finalizarActual">
          <button class="bg-red-600 text-white px-4 py-2 rounded">Finalizar actual</button>
        </form>
      </div>

      <h2 class="text-xl font-semibold">Pendientes</h2>
      <ul class="divide-y rounded border">
        {#each pending as p}
          <li class="p-3 flex justify-between"><span class="font-mono">{p.turno}</span><span>{new Date(p.fecha).toLocaleTimeString()}</span></li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

