<script lang="ts">
  import { enhance } from '$app/forms';
  import { toast } from '$lib/stores/toast';
  import { generarPDF } from '$lib/utils/pdf';
  import { ticketSchema, validateForm } from '$lib/utils/validation';
  import { Input } from '$lib/components/ui/input';

  import * as Select from "$lib/components/ui/select/index";

  let { data, form } = $props();
  let sucursal_id = $state('');
  let servicios_seleccionados = $state<string[]>([]);
  let doc_tipo = $state('CC');
  let doc_num = $state('');
  let nombre_cliente = $state('');
  let telefono = $state('');
  let email = $state('');
  let observaciones = $state('');
  let errors = $state<Record<string, string>>({});
  let loading = $state(false);

  const tiposDocumento = [
    {
      value: "CC",
      label: "Cédula Ciudadanía"
    },
    {
      value: "CD",
      label: "Carnet Diplómatico"
    },
    {
      value: "CE",
      label: "Cédula Extranjería"
    },
    {
      value: "NI",
      label: "NIT"
    },
    {
      value: "PT",
      label: "Permiso por protección temporal"
    },
    {
      value: "SC",
      label: "Salvoconducto"
    },
    {
      value: "TI",
      label: "Tarjeta de identidad"
    }
  ];

  function toggleServicio(codigo: string) {
    if (servicios_seleccionados.includes(codigo)) {
      servicios_seleccionados = servicios_seleccionados.filter(s => s !== codigo);
    } else {
      servicios_seleccionados = [...servicios_seleccionados, codigo];
    }
  }

  function limpiarFormulario() {
    sucursal_id = '';
    servicios_seleccionados = [];
    doc_tipo = 'CC';
    doc_num = '';
    nombre_cliente = '';
    telefono = '';
    email = '';
    observaciones = '';
    errors = {};
  }

  function validateFormData() {
    // Limpiar errores previos
    errors = {};
    
    // Validación específica para servicios
    if (servicios_seleccionados.length === 0) {
      errors.servicios = 'Debe seleccionar al menos un servicio';
      toast.error('Debe seleccionar al menos un servicio');
      return false;
    }
    
    // Preparar datos para validación
    const formData = {
      sucursal_id,
      servicios: servicios_seleccionados,
      nombre_cliente,
      doc_tipo,
      doc_num,
      telefono,
      email: email || '',
      observaciones: observaciones || ''
    };
    
    // Validar con Zod
    const validation = validateForm(ticketSchema, formData);
    
    if (!validation.success) {
      errors = validation.errors;
      toast.error('Por favor corrige los errores en el formulario');
      return false;
    }
    
    return true;
  }

  function getFieldError(field: string): string | undefined {
    return errors[field];
  }

  async function descargar() {
    if (!form?.ticket) return;
    const t = form.ticket as { turno: string; tipo: string; numero: number; fecha: string };
    await generarPDF({ turno: t.turno, tipo: t.tipo, numero: t.numero, fechaISO: t.fecha });
  }

  $effect(() => {
    if (form?.ticket) {
      toast.success(`Ticket ${form.ticket.turno} creado exitosamente`);
    }
  });
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
  <div class="text-center">
    <h1 class="text-3xl font-bold">Mesa de Ayuda</h1>
    <p class="text-slate-600 mt-2">Crear tickets con múltiples servicios</p>
  </div>

  {#if !form?.ticket}
    <form method="post" action="?/crear" use:enhance={() => {
      return async ({ result }) => {
        loading = false;
        if (result.type === 'failure') {
          toast.error('Error al crear el ticket');
        }
      };
    }} class="space-y-6" onsubmit={(e) => {
      e.preventDefault();
      if (validateFormData()) {
        loading = true;
        (e.target as HTMLFormElement).submit();
      }
    }}>
      <!-- Selección de Sucursal -->
      <div class="rounded-xl border bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Sucursal</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 w-full gap-y-3 gap-x-10">
          {#each data.sucursales as sucursal}
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sucursal_id"
                value={sucursal.id}
                bind:group={sucursal_id}
                required
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="font-medium">{sucursal.nombre}</span>
              <span class="text-sm text-slate-500">({sucursal.codigo})</span>
            </label>
          {/each}
        </div>
        {#if getFieldError('sucursal_id')}
          <p class="mt-2 text-sm text-red-600">{getFieldError('sucursal_id')}</p>
        {/if}
      </div>

      <!-- Selección de Servicios -->
      <div class="rounded-xl border bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Servicios</h2>
        <div class="grid gap-3 md:grid-cols-2">
          {#each data.servicios as servicio}
            <label class="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-slate-50">
              <input
                type="checkbox"
                value={servicio.codigo}
                bind:group={servicios_seleccionados}
                class="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div class="font-medium">{servicio.nombre}</div>
                {#if servicio.descripcion}
                  <div class="text-sm text-slate-500">{servicio.descripcion}</div>
                {/if}
              </div>
            </label>
          {/each}
        </div>
                 <input type="hidden" name="servicios_codigos" value={servicios_seleccionados.join(',')} />
         {#if servicios_seleccionados.length === 0 && errors.servicios}
           <p class="mt-2 text-sm text-red-600">Debe seleccionar al menos un servicio</p>
         {/if}
      </div>

      <!-- Información del Cliente -->
      <div class="rounded-xl border bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Información del Cliente</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label for="doc_tipo" class="text-sm font-medium text-slate-700">
              Tipo de documento
            </label>
                         <Select.Root bind:value={doc_tipo} type="single">
               <Select.Trigger class="w-full">
                 {doc_tipo
                   ? tiposDocumento.find(t => t.value === doc_tipo)?.label
                   : "Selecciona un tipo"}
               </Select.Trigger>
               <Select.Content>
                 {#each tiposDocumento as tipo}
                   <Select.Item value={tipo.value}>{tipo.label}</Select.Item>
                 {/each}
               </Select.Content>
             </Select.Root>
             <input type="hidden" name="doc_tipo" value={doc_tipo} required />
          </div>
          <div class="space-y-2">
            <label for="doc_num" class="text-sm font-medium text-slate-700">Número de documento</label>
            <Input
              id="doc_num"
              name="doc_num"
              type="text"
              bind:value={doc_num}
              placeholder="Ej: 1234567890"
              required
              maxlength={20}
              pattern="[0-9]+"
              title="Solo números permitidos"
              class={getFieldError('doc_num') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {#if getFieldError('doc_num')}
              <p class="text-sm text-red-600">{getFieldError('doc_num')}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <label for="nombre_cliente" class="text-sm font-medium text-slate-700">Nombre completo</label>
            <Input
              id="nombre_cliente"
              name="nombre_cliente"
              type="text"
              bind:value={nombre_cliente}
              placeholder="Nombre del cliente"
              required
              maxlength={100}
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
              title="Solo letras y espacios permitidos"
              class={getFieldError('nombre_cliente') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {#if getFieldError('nombre_cliente')}
              <p class="text-sm text-red-600">{getFieldError('nombre_cliente')}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <label for="telefono" class="text-sm font-medium text-slate-700">Teléfono</label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              bind:value={telefono}
              placeholder="Ej: 3001234567"
              required
              maxlength={15}
              pattern="[0-9]+"
              title="Solo números permitidos"
              class={getFieldError('telefono') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {#if getFieldError('telefono')}
              <p class="text-sm text-red-600">{getFieldError('telefono')}</p>
            {/if}
          </div>
          <div class="space-y-2 md:col-span-2">
            <label for="email" class="text-sm font-medium text-slate-700">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              bind:value={email}
              placeholder="cliente@ejemplo.com"
              maxlength={254}
              required
              class={getFieldError('email') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {#if getFieldError('email')}
              <p class="text-sm text-red-600">{getFieldError('email')}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 justify-center">
        <button
          type="button"
          onclick={limpiarFormulario}
          class="px-6 py-3 rounded-lg border text-slate-700 hover:bg-slate-50 transition"
        >
          Limpiar
        </button>
        <button
          type="submit"
          disabled={loading}
          class="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando ticket...
          {:else}
            Crear Ticket
          {/if}
        </button>
      </div>
    </form>
  {:else}
    {#key form.ticket.turno}
      <div class="text-center space-y-6">
        <div class="rounded-xl border bg-white p-8 shadow-sm">
          <div class="text-slate-600 mb-2">Ticket creado</div>
          <div class="text-6xl font-extrabold tracking-wide text-blue-600">{form.ticket.turno}</div>
          <div class="text-slate-500 mt-2">
            {form.ticket.nombre_cliente || 'Cliente'}
          </div>
        </div>
        
        <div class="flex items-center justify-center gap-3">
          <button
            onclick={() => window.location.reload()}
            class="px-6 py-3 rounded-lg border text-slate-700 hover:bg-slate-50 transition"
          >
            Crear otro ticket
          </button>
          <button
            onclick={descargar}
            class="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    {/key}
  {/if}
</div> 