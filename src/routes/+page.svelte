<script lang="ts">
  import { enhance } from '$app/forms';
  import { generarPDF } from '$lib/utils/pdf';

  let { form } = $props();
  let tipo: 'A' | 'B' | 'C' | 'D' | '' = $state('');
  let doc_tipo = $state('CC');
  let doc_num = $state('');

  function selectTipo(t: 'A' | 'B' | 'C' | 'D') {
    tipo = t;
  }

  $effect(() => {
    if (form?.turno) {
      // nada
    }
  });

  async function descargar() {
    if (!form?.turno) return;
    const t = form.turno as { turno: string; tipo: string; numero: number; fecha: string };
    await generarPDF({ turno: t.turno, tipo: t.tipo, numero: t.numero, fechaISO: t.fecha });
  }
</script>

<div class="mx-auto max-w-3xl p-6 space-y-6">
  <h1 class="text-2xl font-bold text-center">Sistema de Turnos</h1>

  {#if !form?.turno}
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <button
        class="group rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md focus-visible:shadow-md outline-none border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 bg-white"
        onclick={() => selectTipo('A')}
        aria-label="Caja (A)"
      >
        <div class="text-sm text-slate-500">Servicio</div>
        <div class="mt-1 text-xl font-semibold">Caja</div>
        <div class="mt-2 text-xs text-slate-400">Código A</div>
      </button>
      <button
        class="group rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md focus-visible:shadow-md outline-none border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 bg-white"
        onclick={() => selectTipo('B')}
        aria-label="Asesoría (B)"
      >
        <div class="text-sm text-slate-500">Servicio</div>
        <div class="mt-1 text-xl font-semibold">Asesoría</div>
        <div class="mt-2 text-xs text-slate-400">Código B</div>
      </button>
      <button
        class="group rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md focus-visible:shadow-md outline-none border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 bg-white"
        onclick={() => selectTipo('C')}
        aria-label="Pagos (C)"
      >
        <div class="text-sm text-slate-500">Servicio</div>
        <div class="mt-1 text-xl font-semibold">Pagos</div>
        <div class="mt-2 text-xs text-slate-400">Código C</div>
      </button>
      <button
        class="group rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md focus-visible:shadow-md outline-none border-slate-200 hover:border-slate-300 focus-visible:border-slate-400 bg-white"
        onclick={() => selectTipo('D')}
        aria-label="Otros (D)"
      >
        <div class="text-sm text-slate-500">Servicio</div>
        <div class="mt-1 text-xl font-semibold">Otros</div>
        <div class="mt-2 text-xs text-slate-400">Código D</div>
      </button>
    </div>

    {#if tipo}
      <form method="post" action="?/crear" use:enhance class="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <input type="hidden" name="tipo" value={tipo} />
        <div class="grid gap-2">
          <label class="text-sm text-gray-600" for="doc_tipo">Tipo de documento</label>
          <select id="doc_tipo" name="doc_tipo" class="rounded border p-2" bind:value={doc_tipo}>
            <option>Cédula de ciudadanía</option>
            <option>Tarjeta de identidad</option>
            <option>Cédula de extranjería</option>
            <option>Pasaporte</option>
          </select>
        </div>
        <div class="grid gap-2">
          <label class="text-sm text-gray-600" for="doc_num">Número de documento</label>
          <input id="doc_num" name="doc_num" class="rounded border p-2" bind:value={doc_num} placeholder="Ej: 1234567890" />
        </div>
        <button class="w-full rounded bg-black p-3 text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-black/30">Generar turno</button>
      </form>
    {/if}
  {:else}
    {#key form.turno.turno}
      <div class="text-center space-y-4">
        <div class="text-gray-600">Tu turno es</div>
        <div class="text-5xl font-extrabold tracking-wide">{form.turno.turno}</div>
        <div class="flex items-center justify-center gap-3">
          <a href="/" class="rounded border px-4 py-2 text-slate-700 hover:bg-slate-50">Volver</a>
          <button class="rounded bg-indigo-600 text-white px-4 py-2 transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400" onclick={descargar}>Descargar PDF</button>
        </div>
      </div>
    {/key}
  {/if}

  <div class="pt-6 text-center text-sm text-slate-500">
    Accesos rápidos: <a class="underline" href="/pantalla">Pantalla</a> · <a class="underline" href="/admin">Admin</a>
  </div>
</div>
