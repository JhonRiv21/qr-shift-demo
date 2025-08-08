import { writable } from 'svelte/store';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);
  let idCounter = 1;
  const recent = new Map<string, number>();

  function push(message: string, kind: ToastKind = 'info', ttlMs = 3500) {
    const now = Date.now();
    const last = recent.get(message) ?? 0;
    if (now - last < 1500) return; // anti-spam básico por mensaje
    recent.set(message, now);

    const id = idCounter++;
    const item: ToastItem = { id, message, kind };
    update((arr) => [...arr, item]);
    setTimeout(() => {
      update((arr) => arr.filter((t) => t.id !== id));
    }, ttlMs);
  }

  return {
    subscribe,
    push,
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error'),
    info: (msg: string) => push(msg, 'info')
  };
}

export const toast = createToastStore();

