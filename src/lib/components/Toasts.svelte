<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { fade, fly } from 'svelte/transition';

  let items: Toast[] = $state([]);
  $effect(() => {
    const unsub = toast.subscribe((v) => (items = v));
    return () => unsub();
  });

  function getToastStyles(type: string) {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-slate-200 bg-white text-slate-800';
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each items as item (item.id)}
    <div
      class="rounded-lg border p-4 shadow-lg max-w-sm flex items-start gap-3"
      class:border-green-200={item.type === 'success'}
      class:border-red-200={item.type === 'error'}
      class:border-yellow-200={item.type === 'warning'}
      class:border-blue-200={item.type === 'info'}
      class:bg-green-50={item.type === 'success'}
      class:bg-red-50={item.type === 'error'}
      class:bg-yellow-50={item.type === 'warning'}
      class:bg-blue-50={item.type === 'info'}
      in:fly={{ y: -20, duration: 200 }}
      out:fade={{ duration: 200 }}
    >
      <div class="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold
        {item.type === 'success' ? 'bg-green-100 text-green-600' :
         item.type === 'error' ? 'bg-red-100 text-red-600' :
         item.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
         'bg-blue-100 text-blue-600'}">
        {getIcon(item.type)}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium">{item.message}</p>
      </div>
      <button
        onclick={() => toast.remove(item.id)}
        class="flex-shrink-0 text-slate-400 hover:text-slate-600 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  {/each}
</div>

