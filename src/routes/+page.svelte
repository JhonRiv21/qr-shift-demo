<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<div class="mx-auto max-w-4xl p-6 space-y-8">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-foreground">Sistema de Turnos</h1>
    <p class="text-muted-foreground mt-2">Gestión integral de tickets con múltiples servicios</p>
  </div>

  <div class="grid gap-6 grid-cols-1 md:grid-cols-2">
    <!-- Mesa de Ayuda -->
    <Card class="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <div>
            <CardTitle class="text-lg">Mesa de Ayuda</CardTitle>
            <CardDescription>Crear tickets</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-4">Crear nuevos tickets para clientes con múltiples servicios y seguimiento completo.</p>
        <a href="/mesa-ayuda" class="w-full">
          <Button variant="outline" class="w-full">
            Ir a Mesa de Ayuda
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
        </a>
      </CardContent>
    </Card>

    <!-- Panel de Gestión -->
    <Card class="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <CardTitle class="text-lg">Panel de Gestión</CardTitle>
            <CardDescription>Gestionar sucursales</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-4">Panel para gestionar tickets por sucursal, llamar turnos y actualizar estados.</p>
        <a href="/login" class="w-full">
          <Button variant="outline" class="w-full">
            Ir al Panel
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
        </a>
      </CardContent>
    </Card>

    <!-- Pantalla -->
    <!-- <Card class="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <CardTitle class="text-lg">Pantalla</CardTitle>
            <CardDescription>Visualización pública</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-4">Pantalla pública para mostrar turnos actuales y siguientes en tiempo real.</p>
        <a href="/pantalla" class="w-full">
          <Button variant="outline" class="w-full">
            Ver Pantalla
            <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
        </a>
      </CardContent>
    </Card> -->
  </div>
</div>
