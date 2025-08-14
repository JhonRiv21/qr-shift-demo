<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import { toast } from '$lib/stores/toast';
  import { auth } from '$lib/stores/auth';
  import LoginForm from '$lib/components/LoginForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
  import { cn } from '$lib/utils/cn';

  let { data } = $props();
  let sucursal_seleccionada = $state('');
  let current = $state<any>(null);
  let pending = $state<any[]>([]);
  let servicios_ticket = $state<any[]>([]);
  let authState = $state({ user: null, loading: true });
  let pendientesPorSucursal = $state<Record<string, number>>({});
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Suscribirse al estado de autenticación
  $effect(() => {
    const unsubscribe = auth.subscribe((state) => {
      authState = state;
    });
    return unsubscribe;
  });

  async function cargarPendientesTodasSucursales() {
    const { data: pendientes } = await supabase
      .from('turnos_tickets')
      .select('sucursal_id')
      .eq('estado', 'pendiente');

    if (pendientes) {
      const conteo: Record<string, number> = {};
      data.sucursales.forEach(sucursal => {
        conteo[sucursal.id] = pendientes.filter(p => p.sucursal_id === sucursal.id).length;
      });
      pendientesPorSucursal = conteo;
    }
  }

  async function cargarDatosSucursal() {
    if (!sucursal_seleccionada) return;

    const [currentRes, pendingRes] = await Promise.all([
      supabase
        .from('turnos_tickets')
        .select(`
          *,
          turnos_sucursales!inner(nombre, codigo)
        `)
        .eq('sucursal_id', sucursal_seleccionada)
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
        .eq('sucursal_id', sucursal_seleccionada)
        .eq('estado', 'pendiente')
        .order('fecha', { ascending: true })
    ]);

    current = currentRes.data;
    pending = pendingRes.data ?? [];

    // Cargar servicios del ticket actual si existe
    if (current) {
      const { data: servicios } = await supabase
        .from('turnos_tickets_servicios')
        .select(`
          *,
          turnos_servicios(nombre, codigo, descripcion)
        `)
        .eq('ticket_id', current.id)
        .order('created_at', { ascending: true });
      
      servicios_ticket = servicios ?? [];
    } else {
      servicios_ticket = [];
    }
  }

  async function llamarSiguiente() {
    if (!sucursal_seleccionada) return;

    const { error } = await supabase.rpc('turnos_llamar_siguiente_sucursal', {
      p_sucursal_id: sucursal_seleccionada
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Siguiente ticket llamado');
    }
  }

  async function finalizarActual() {
    if (!sucursal_seleccionada) return;

    const { error } = await supabase.rpc('turnos_finalizar_actual_sucursal', {
      p_sucursal_id: sucursal_seleccionada
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Ticket finalizado');
    }
  }

  async function actualizarServicio(servicio_id: string, nuevo_estado: string) {
    const { error } = await supabase.rpc('turnos_actualizar_servicio_ticket', {
      p_ticket_servicio_id: servicio_id,
      p_estado: nuevo_estado
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Servicio actualizado');
    }
  }

  // Cargar pendientes inicialmente y suscripción global
  let globalChannel: any;
  $effect(() => {
    cargarPendientesTodasSucursales();
    
    // Suscripción global para actualizar conteos
    globalChannel = supabase
      .channel('global-pendientes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'turnos_tickets' },
        () => {
          cargarPendientesTodasSucursales();
        }
      )
      .subscribe();

    return () => {
      if (globalChannel) {
        supabase.removeChannel(globalChannel);
      }
    };
  });

  // Suscripción Realtime
  let channel: any;
  $effect(() => {
    if (sucursal_seleccionada) {
      cargarDatosSucursal();
      
      // Configurar Realtime
      channel = supabase
        .channel(`sucursal-${sucursal_seleccionada}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'turnos_tickets' },
          (payload) => {
            if (payload.new && (payload.new as any).sucursal_id === sucursal_seleccionada) {
              cargarDatosSucursal();
            }
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'turnos_tickets_servicios' },
          () => {
            if (current) {
              cargarDatosSucursal();
            }
          }
        )
        .subscribe();

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  });

  $effect(() => () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    if (globalChannel) {
      supabase.removeChannel(globalChannel);
    }
  });

  async function handleLogout() {
    try {
      const result = await auth.signOut();
      
      if (result.success) {
        toast.success('Sesión cerrada');
      } else {
        toast.error(result.error || 'Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  }
</script>

{#if authState.loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
{:else if !authState.user}
  <LoginForm />
{:else}

<div class="mx-auto max-w-6xl p-6 space-y-6">
  <!-- Header con logout -->
  <div class="flex flex-row flex-wrap gap-4 items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Panel de Gestión</h1>
      <p class="text-muted-foreground mt-2">Gestionar tickets por sucursal</p>
    </div>
    <Button variant="outline" onclick={handleLogout}>
      <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
      Cerrar sesión
    </Button>
  </div>

  <!-- Selección de Sucursal -->
  <Card>
    <CardHeader>
      <CardTitle>Seleccionar Sucursal</CardTitle>
      <CardDescription>Elige la sucursal que vas a gestionar</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-3 md:grid-cols-3">
        {#each data.sucursales as sucursal}
          <button
            onclick={() => sucursal_seleccionada = sucursal.id}
            class={cn(
              "p-4 rounded-lg border text-left transition hover:shadow-md",
              sucursal_seleccionada === sucursal.id 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-border/50'
            )}
          >
            <div class="font-medium text-foreground">{sucursal.nombre} ({pendientesPorSucursal[sucursal.id] || 0})</div>
            <div class="text-sm text-muted-foreground">({sucursal.codigo})</div>
            {#if sucursal_seleccionada === sucursal.id}
              <div class="mt-2 text-xs text-primary font-medium">✓ Seleccionada</div>
            {/if}
          </button>
        {/each}
      </div>
    </CardContent>
  </Card>

  {#if sucursal_seleccionada}
    <!-- Ticket Actual -->
    <Card>
      <CardHeader>
        <CardTitle>Ticket Actual</CardTitle>
        <CardDescription>Ticket que se está atendiendo en este momento</CardDescription>
      </CardHeader>
      <CardContent>
        {#if current}
          <div class="space-y-6">
            <div class="text-center">
              <div class="text-4xl font-extrabold tracking-wide text-primary">{current.turno}</div>
              <div class="text-muted-foreground mt-1">{current.turnos_sucursales.nombre}</div>
              {#if current.nombre_cliente}
                <div class="text-foreground mt-1 font-medium">{current.nombre_cliente}</div>
              {/if}
            </div>

            <!-- Servicios del Ticket -->
            <div class="border-t pt-4">
              <h3 class="font-semibold mb-3 text-foreground">Servicios</h3>
              <div class="grid gap-3">
                {#each servicios_ticket as servicio}
                  <div class="flex flex-row flex-wrap gap-2 items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div class="font-medium text-foreground">{servicio.turnos_servicios.nombre}</div>
                      {#if servicio.turnos_servicios.descripcion}
                        <div class="text-sm text-muted-foreground">{servicio.turnos_servicios.descripcion}</div>
                      {/if}
                    </div>
                    <div class="flex items-center gap-3">
                      <span class={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        servicio.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        servicio.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                        servicio.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {servicio.estado.replace('_', ' ')}
                      </span>
                      <select
                        value={servicio.estado}
                        onchange={(e) => actualizarServicio(servicio.id, (e.target as HTMLSelectElement).value)}
                        class="w-32 px-3 py-1 text-sm border rounded-md bg-background"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {:else}
          <div class="text-center text-muted-foreground py-8">
            No hay ticket atendiendo actualmente
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Controles -->
    <div class="flex gap-6 flex-wrap flex-row justify-center">
      <Button
        onclick={llamarSiguiente}
        disabled={(pendientesPorSucursal[sucursal_seleccionada] || 0) === 0}
        variant="default"
        class="bg-green-600 hover:bg-green-700 h-11"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        </svg>
        Llamar siguiente ({pending.length})
      </Button>
      <Button
        onclick={finalizarActual}
        disabled={!current}
        variant="destructive"
        class="h-11"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Finalizar actual
      </Button>
    </div>

    <!-- Lista de Pendientes -->
    <Card>
      <CardHeader>
        <CardTitle>Pendientes ({pending.length})</CardTitle>
        <CardDescription>Tickets en espera de atención</CardDescription>
      </CardHeader>
      <CardContent>
        {#if pending.length > 0}
          <div class="space-y-3">
            {#each pending as ticket}
              <div class="flex flex-row flex-wrap gap-2 items-center justify-between p-4 rounded-lg border">
                <div>
                  <div class="font-mono text-lg text-foreground">{ticket.turno}</div>
                  <div class="text-sm text-muted-foreground">
                    {new Date(ticket.fecha).toLocaleTimeString()}
                    <span class="capitalize">
                      {#if ticket.nombre_cliente} • {ticket.nombre_cliente}{/if}
                    </span>
                  </div>
                </div>
                <div class="text-sm text-muted-foreground">
                  {ticket.doc_tipo}: {ticket.doc_num}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center text-muted-foreground py-4">
            No hay tickets pendientes
          </div>
        {/if}
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardContent class="text-center py-12">
        <div class="text-4xl mb-4">🏢</div>
        <div class="text-lg font-medium mb-2 text-foreground">Selecciona una sucursal</div>
        <div class="text-sm text-muted-foreground">Para comenzar a gestionar tickets</div>
      </CardContent>
    </Card>
  {/if}
</div>
{/if} 