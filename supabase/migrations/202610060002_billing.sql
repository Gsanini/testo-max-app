create table public.billing_events (
  provider text not null,
  event_id text not null,
  user_id uuid not null references auth.users(id),
  product_id text not null references public.products(id),
  kind text not null check (kind in ('purchase_approved','renewed','refunded','revoked')),
  occurred_at timestamptz not null,
  processed_at timestamptz not null default now(),
  primary key (provider,event_id)
);
alter table public.billing_events enable row level security;
revoke all on public.billing_events from anon,authenticated;
grant all on public.billing_events to service_role;

create function public.apply_billing_event(provider_name text, external_id text, buyer_id uuid, product text, event_kind text, occurred timestamptz, valid_until timestamptz default null) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  if provider_name is null or length(provider_name) not between 1 and 100 or external_id is null or length(external_id) not between 1 and 200 or occurred is null or occurred > now()+interval '5 minutes' then raise exception 'Evento inválido'; end if;
  insert into public.billing_events(provider,event_id,user_id,product_id,kind,occurred_at)
    values(provider_name,external_id,buyer_id,product,event_kind,occurred) on conflict do nothing;
  if not found then return false; end if;
  insert into public.entitlements(user_id,product_id,status,expires_at,last_event_at)
    values(buyer_id,product,case when event_kind in ('purchase_approved','renewed') then 'active' else 'revoked' end,valid_until,occurred)
  on conflict(user_id,product_id) do update set status=excluded.status,expires_at=excluded.expires_at,last_event_at=excluded.last_event_at,updated_at=now()
    where public.entitlements.last_event_at < excluded.last_event_at
      or (public.entitlements.last_event_at = excluded.last_event_at and excluded.status='revoked');
  return true;
end $$;

create function public.admin_grant_access(buyer_id uuid, valid_until timestamptz default null) returns void
language plpgsql security definer set search_path='' as $$
begin
  if valid_until is not null and valid_until<=now() then raise exception 'Validade deve estar no futuro'; end if;
  perform public.apply_billing_event('administrative',gen_random_uuid()::text,buyer_id,'testomax','purchase_approved',clock_timestamp(),valid_until);
end $$;

create function public.admin_assign_protocol(buyer_id uuid, selected_protocol uuid, selected_phase uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.protocols p join public.program_phases ph on ph.protocol_id=p.id where p.id=selected_protocol and ph.id=selected_phase and p.product_id='testomax' and p.published) then raise exception 'Programa/fase inválidos'; end if;
  insert into public.enrollments(user_id,protocol_id,phase_id) values(buyer_id,selected_protocol,selected_phase)
    on conflict(user_id) do update set protocol_id=excluded.protocol_id,phase_id=excluded.phase_id;
  delete from public.daily_activities a where a.user_id=buyer_id and a.day > (now() at time zone coalesce((select preferences->>'timezone' from public.profiles where user_id=buyer_id),'America/Sao_Paulo'))::date and not exists(select 1 from public.activity_completions c where c.activity_id=a.id);
  delete from public.daily_meals m where m.user_id=buyer_id and m.day > (now() at time zone coalesce((select preferences->>'timezone' from public.profiles where user_id=buyer_id),'America/Sao_Paulo'))::date and not exists(select 1 from public.meal_completions c where c.meal_id=m.id);
end $$;
revoke execute on function public.apply_billing_event(text,text,uuid,text,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke execute on function public.admin_grant_access(uuid,timestamptz) from public,anon,authenticated;
revoke execute on function public.admin_assign_protocol(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.apply_billing_event(text,text,uuid,text,text,timestamptz,timestamptz) to service_role;
grant execute on function public.admin_grant_access(uuid,timestamptz) to service_role;
grant execute on function public.admin_assign_protocol(uuid,uuid,uuid) to service_role;
