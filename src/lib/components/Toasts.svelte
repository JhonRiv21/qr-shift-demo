<script lang="ts">
  import { toast, type ToastItem } from '$lib/stores/toast';
  let items: ToastItem[] = $state([]);
  $effect(() => {
    const unsub = toast.subscribe((v) => (items = v));
    return () => unsub();
  });

  const kindToClasses: Record<string, string> = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
    info: 'bg-slate-700'
  };
</script>

<div class="fixed inset-x-0 top-2 z-50 grid place-items-center gap-2 px-3">
  {#each items as t (t.id)}
    <div class="pointer-events-auto w-full max-w-sm rounded-lg text-white shadow-lg ring-1 ring-black/10 overflow-hidden">
      <div class={`px-4 py-3 ${kindToClasses[t.kind]}`}>{t.message}</div>
    </div>
  {/each}
  <div class="pointer-events-none"></div>
  <!-- spacer -->
</div>

