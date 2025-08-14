<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { loginSchema, validateForm } from '$lib/utils/validation';
  import { toast } from '$lib/stores/toast';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { cn } from '$lib/utils/cn';

  let email = $state('admin@admin.com');
  let password = $state('A123456*a');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  async function handleSubmit() {
    // Limpiar errores previos
    errors = {};
    
    // Validar formulario
    const validation = validateForm(loginSchema, { email, password });
    
    if (!validation.success) {
      errors = validation.errors;
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    loading = true;
    
    try {
      const result = await auth.signIn(validation.data.email, validation.data.password);
      
      if (result.success) {
        toast.success('Inicio de sesión exitoso');
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      loading = false;
    }
  }

  function getFieldError(field: string): string | undefined {
    return errors[field];
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
  <Card class="w-full max-w-md">
    <CardHeader class="space-y-1">
      <div class="flex justify-center mb-4">
        <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
      </div>
      <CardTitle class="text-2xl text-center">Panel de Gestión</CardTitle>
      <CardDescription class="text-center">
        Inicia sesión para acceder al panel de gestión
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            class={cn(getFieldError('email') && "border-destructive focus-visible:ring-destructive")}
            placeholder="admin@admin.com"
          />
          {#if getFieldError('email')}
            <p class="text-sm text-destructive">{getFieldError('email')}</p>
          {/if}
        </div>
        
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class={cn(getFieldError('password') && "border-destructive focus-visible:ring-destructive")}
            placeholder="••••••••"
          />
          {#if getFieldError('password')}
            <p class="text-sm text-destructive">{getFieldError('password')}</p>
          {/if}
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          {:else}
            Iniciar sesión
          {/if}
        </Button>

        <div class="text-center">
          <p class="text-xs text-muted-foreground">
            Credenciales por defecto: admin@admin.com / A123456*a
          </p>
        </div>
      </form>
    </CardContent>
  </Card>
</div> 