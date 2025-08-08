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

<div class="mx-auto max-w-md p-6 space-y-6">
  <h1 class="text-2xl font-bold text-center">Sistema de Turnos</h1>

  {#if !form?.turno}
    <div class="grid grid-cols-2 gap-3">
      <button class="rounded bg-blue-600 p-4 text-white font-semibold" onclick={() => selectTipo('A')}>Caja (A)</button>
      <button class="rounded bg-green-600 p-4 text-white font-semibold" onclick={() => selectTipo('B')}>Asesoría (B)</button>
      <button class="rounded bg-purple-600 p-4 text-white font-semibold" onclick={() => selectTipo('C')}>Pagos (C)</button>
      <button class="rounded bg-gray-700 p-4 text-white font-semibold" onclick={() => selectTipo('D')}>Otros (D)</button>
    </div>

    {#if tipo}
      <form method="post" action="?/crear" use:enhance class="space-y-4">
        <input type="hidden" name="tipo" value={tipo} />
        <div class="grid gap-2">
          <label class="text-sm text-gray-600" for="doc_tipo">Tipo de documento</label>
          <select id="doc_tipo" name="doc_tipo" class="rounded border p-2" bind:value={doc_tipo}>
            <option>CC</option>
            <option>TI</option>
            <option>CE</option>
            <option>PAS</option>
          </select>
        </div>
        <div class="grid gap-2">
          <label class="text-sm text-gray-600" for="doc_num">Número de documento</label>
          <input id="doc_num" name="doc_num" class="rounded border p-2" bind:value={doc_num} />
        </div>
        <button class="w-full rounded bg-black p-3 text-white">Generar turno</button>
      </form>
    {/if}
  {:else}
    {#key form.turno.turno}
      <div class="text-center space-y-4">
        <div class="text-gray-600">Tu turno es</div>
        <div class="text-5xl font-extrabold tracking-wide">{form.turno.turno}</div>
        <button class="rounded bg-indigo-600 text-white px-4 py-2" onclick={descargar}>Descargar PDF</button>
      </div>
    {/key}
  {/if}
</div>
