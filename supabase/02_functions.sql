-- Crear turno de forma atómica evitando colisiones
create or replace function public.crear_turno(p_tipo text, p_doc_tipo text, p_doc_num text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_numero integer;
  v_fecha date := now()::date;
  v_row turnos;
begin
  if p_tipo not in ('A','B','C','D') then
    raise exception 'Tipo inválido';
  end if;

  -- Bloqueo asesorado por tipo y fecha para evitar colisiones entre transacciones
  perform pg_advisory_xact_lock(hashtext('turnos_' || p_tipo || '_' || v_fecha::text));

  select coalesce(max(numero), 0) + 1 into v_numero
  from turnos
  where tipo = p_tipo and fecha::date = v_fecha;

  insert into turnos (tipo, numero, doc_tipo, doc_num, estado)
  values (p_tipo, v_numero, p_doc_tipo, p_doc_num, 'pendiente')
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

-- Llamar siguiente (finaliza actual y mueve el más antiguo pendiente a atendiendo)
create or replace function public.llamar_siguiente()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actual turnos;
  v_siguiente turnos;
begin
  -- Solo admin puede operar
  if coalesce((select email from auth.users where id = auth.uid()), '') <> 'admin@admin.com' then
    raise exception 'No autorizado';
  end if;

  -- Finaliza actual si existe
  update turnos set estado = 'finalizado'
  where id in (select id from turnos where estado = 'atendiendo' order by fecha asc limit 1)
  returning * into v_actual;

  -- Pasa más antiguo pendiente a atendiendo
  update turnos set estado = 'atendiendo'
  where id in (select id from turnos where estado = 'pendiente' order by fecha asc limit 1)
  returning * into v_siguiente;

  return jsonb_build_object('finalizado', to_jsonb(v_actual), 'atendiendo', to_jsonb(v_siguiente));
end;
$$;

-- Finalizar actual
create or replace function public.finalizar_actual()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actual turnos;
begin
  -- Solo admin puede operar
  if coalesce((select email from auth.users where id = auth.uid()), '') <> 'admin@admin.com' then
    raise exception 'No autorizado';
  end if;

  update turnos set estado = 'finalizado'
  where id in (select id from turnos where estado = 'atendiendo' order by fecha asc limit 1)
  returning * into v_actual;

  return to_jsonb(v_actual);
end;
$$;

-- Permisos de ejecución
revoke all on function public.crear_turno(text, text, text) from public;
revoke all on function public.llamar_siguiente() from public;
revoke all on function public.finalizar_actual() from public;

grant execute on function public.crear_turno(text, text, text) to anon, authenticated;
grant execute on function public.llamar_siguiente() to authenticated;
grant execute on function public.finalizar_actual() to authenticated;

