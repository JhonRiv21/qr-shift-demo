<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import { onMount } from 'svelte';

  let { data } = $props();
  let email = $state('admin@admin.com');
  let password = $state('A123456*a');
  let loggedIn = $state(false);

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Subscribe for realtime updates
  let current = $state(data.current);
  let pending = $state(data.pending ?? []);

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

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    loggedIn = !!data.session;
  });

  $effect(() => () => {
    supabase.removeChannel(channel);
  });

  async function login() {
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Intentar registro automático para PoC
      const su = await supabase.auth.signUp({ email, password });
      if (su.error && su.error.message && !su.error.message.includes('already registered')) {
        return;
      }
      ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
    }
    loggedIn = !!data.session && !error;
    if (loggedIn) await refresh();
  }

  async function logout() {
    await supabase.auth.signOut();
    loggedIn = false;
  }

  async function llamarSiguiente() {
    const { error } = await supabase.rpc('llamar_siguiente');
    if (!error) await refresh();
  }

  async function finalizarActual() {
    const { error } = await supabase.rpc('finalizar_actual');
    if (!error) await refresh();
  }
</script>

<div class="mx-auto max-w-3xl p-4 space-y-6">
  {#if !loggedIn}
    <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); login(); }}>
      <h1 class="text-2xl font-bold">Admin</h1>
      <div class="grid gap-2">
        <label for="adm_email" class="text-sm text-slate-600">Email</label>
        <input id="adm_email" class="border p-3 rounded" name="email" placeholder="Email" bind:value={email} />
        <label for="adm_pwd" class="text-sm text-slate-600">Contraseña</label>
        <input id="adm_pwd" class="border p-3 rounded" name="password" placeholder="Password" bind:value={password} type="password" />
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400">Ingresar</button>
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
        <button class="bg-green-600 text-white px-4 py-2 rounded" onclick={llamarSiguiente}>Llamar siguiente</button>
        <button class="bg-red-600 text-white px-4 py-2 rounded" onclick={finalizarActual}>Finalizar actual</button>
        <button class="ml-auto bg-gray-200 px-4 py-2 rounded" onclick={logout}>Salir</button>
      </div>

      <h2 class="text-xl font-semibold">Pendientes</h2>
      <ul class="divide-y rounded border bg-white">
        {#each pending as p}
          <li class="p-3 flex justify-between"><span class="font-mono">{p.turno}</span><span>{new Date(p.fecha).toLocaleTimeString()}</span></li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

