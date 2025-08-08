-- Extensiones necesarias
create extension if not exists pgcrypto;

-- Tabla turnos
create table if not exists public.turnos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('A','B','C','D')),
  numero integer not null,
  turno text not null,
  doc_tipo text not null,
  doc_num text not null,
  fecha timestamptz not null default now(),
  estado text not null check (estado in ('pendiente','atendiendo','finalizado'))
);

-- Único por tipo, día y número
create unique index if not exists turnos_tipo_dia_numero_idx
  on public.turnos (tipo, (fecha::date), numero);

-- Índices de ayuda
create index if not exists turnos_estado_fecha_idx on public.turnos (estado, fecha);

-- Asegurar que el campo turno coincide con tipo-numero
create or replace function public.turnos_set_turno()
returns trigger language plpgsql as $$
begin
  new.turno := new.tipo || '-' || new.numero::text;
  return new;
end;$$;

drop trigger if exists trg_turnos_set_turno on public.turnos;
create trigger trg_turnos_set_turno
before insert or update of tipo, numero on public.turnos
for each row execute function public.turnos_set_turno();

-- Habilitar Realtime
alter publication supabase_realtime add table public.turnos;

