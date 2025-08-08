-- Habilitar RLS
alter table public.turnos enable row level security;

-- Políticas: cualquiera puede insertar (crear turno)
drop policy if exists "insert_turnos_public" on public.turnos;
create policy "insert_turnos_public" on public.turnos
for insert to anon, authenticated
with check (true);

-- Cualquiera puede leer para las pantallas públicas
drop policy if exists "select_turnos_public" on public.turnos;
create policy "select_turnos_public" on public.turnos
for select to anon, authenticated
using (true);

-- No se crean políticas de UPDATE para impedir actualizaciones directas; usar RPCs SECURITY DEFINER

-- Para reforzar, se recomienda usar funciones SECURITY DEFINER (ya definidas) y deshabilitar updates directos en el cliente.

