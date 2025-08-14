<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Toasts from '$lib/components/Toasts.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="sticky top-0 z-40 backdrop-blur bg-[#fefefe] border-b">
  <div class="mx-auto max-w-6xl px-4 h-14 flex items-center gap-5">
    <a href="/" class="font-semibold">Turnos</a>
    <nav class="ml-auto flex items-center gap-4 sm:gap-10 text-sm">
      <a class="hover:underline max-w-max" href="/">Inicio</a>
      <a class="hover:underline max-w-max" href="/mesa-ayuda">Mesa de Ayuda</a>
      <a class="hover:underline max-w-max" href="/login">Panel de Gestión</a>
      <!-- <a class="hover:underline" href="/pantalla">Pantalla</a> -->
    </nav>
  </div>
</header>

<main class="min-h-[calc(100dvh-3.5rem)] bg-[#fefefe]">
  {@render children?.()}
  <Toasts />
</main>
