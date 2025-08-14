import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { goto } from '$app/navigation';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  return {
    subscribe,
    
    async signIn(email: string, password: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      update(state => ({ 
        ...state, 
        user: data.user, 
        loading: false, 
        error: null 
      }));
      
      // Redirigir al panel de gestión
      goto('/sucursal');
      
      return { success: true };
    },

    async signOut() {
      update(state => ({ ...state, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      update(state => ({ 
        ...state, 
        user: null, 
        loading: false, 
        error: null 
      }));
      
      // Redirigir al login
      goto('/login');
      
      return { success: true };
    },

    async checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      update(state => ({ 
        ...state, 
        user, 
        loading: false,
        error: error ? error.message : null
      }));
    },

    setError(error: string) {
      update(state => ({ ...state, error }));
    },

    clearError() {
      update(state => ({ ...state, error: null }));
    },

    updateState(newState: Partial<AuthState>) {
      update(state => ({ ...state, ...newState }));
    }
  };
}

export const auth = createAuthStore();

// Inicializar autenticación
auth.checkAuth();

// Escuchar cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Actualizar el estado directamente
    auth.updateState({ 
      user: session?.user || null, 
      loading: false, 
      error: null 
    });
    // Redirigir al panel de gestión después del login
    goto('/sucursal');
  } else if (event === 'SIGNED_OUT') {
    // Actualizar el estado directamente
    auth.updateState({ 
      user: null, 
      loading: false, 
      error: null 
    });
    // Redirigir al login después del logout
    goto('/login');
  }
}); 