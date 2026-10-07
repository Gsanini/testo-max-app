-- TestoMAX: Auth e autorização são independentes. Nenhuma concessão é gravável pelo comprador.
create table public.products (
  id text primary key,
  name text not null
);
insert into public.products values ('testomax', 'TestoMAX');

create table public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  status text not null check (status in ('active','pending','expired','revoked')),
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  last_event_at timestamptz not null default '-infinity',
  primary key (user_id, product_id)
);
create index entitlements_status_idx on public.entitlements (product_id, status, expires_at);

create function public.has_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.entitlements e
    where e.user_id = (select auth.uid()) and e.product_id = 'testomax' and e.status = 'active'
    and (e.expires_at is null or e.expires_at > now()));
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Você' check (length(name) between 2 and 60),
  preferences jsonb not null default '{"goal":"consistencia","experience":"iniciante","trainingDays":[1,3,5],"minutes":30,"wakeTime":"07:00","sleepTime":"22:00","diet":"variada","timezone":"America/Sao_Paulo"}',
  onboarded boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id),
  name text not null,
  published boolean not null default false,
  is_demo boolean not null default true
);
create table public.program_phases (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id),
  name text not null,
  description text not null,
  position integer not null check (position > 0),
  unique (protocol_id, position)
);
create table public.enrollments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  protocol_id uuid not null references public.protocols(id),
  phase_id uuid references public.program_phases(id),
  started_on date not null default current_date
);
create table public.activity_templates (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id),
  phase_id uuid references public.program_phases(id),
  category text not null check (category in ('movimento','alimentacao','sono','bem-estar')),
  content jsonb not null,
  schedule text not null default 'daily' check (schedule in ('daily','training')),
  time_preference text check (time_preference in ('wakeTime','sleepTime')),
  goals text[] not null default array['consistencia','forca','energia'],
  experiences text[] not null default array['iniciante','intermediario','avancado'],
  active boolean not null default true
);
create index activity_templates_protocol_idx on public.activity_templates (protocol_id, active);

create table public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.activity_templates(id),
  day date not null,
  scheduled_time time not null,
  snapshot jsonb not null,
  unique (user_id, template_id, day),
  unique (id, user_id)
);
create index daily_activities_user_day_idx on public.daily_activities (user_id, day);
create table public.activity_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, activity_id),
  foreign key (activity_id, user_id) references public.daily_activities (id, user_id) on delete cascade
);

create table public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id),
  content jsonb not null,
  diets text[] not null default array['variada','vegetariana'],
  active boolean not null default true
);
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null
);
create table public.meal_ingredients (
  meal_template_id uuid not null references public.meal_templates(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  quantity numeric not null check (quantity > 0),
  unit text not null check (unit in ('g','kg','ml','L','un')),
  primary key (meal_template_id, ingredient_id, unit)
);
create table public.daily_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.meal_templates(id),
  day date not null,
  snapshot jsonb not null,
  unique (user_id, template_id, day),
  unique (id, user_id)
);
create index daily_meals_user_day_idx on public.daily_meals (user_id, day);
create table public.meal_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, meal_id),
  foreign key (meal_id, user_id) references public.daily_meals (id, user_id) on delete cascade
);
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  quantity numeric not null check (quantity > 0 and quantity <= 100000),
  unit text not null check (unit in ('g','kg','ml','L','un')),
  category text not null check (length(category) between 1 and 100),
  checked boolean not null default false,
  personal boolean not null default true,
  source_key text,
  updated_at timestamptz not null default now()
);
create index shopping_items_user_idx on public.shopping_items (user_id);
create unique index shopping_items_source_idx on public.shopping_items (user_id, source_key) where source_key is not null and not personal;

-- RLS em todas as tabelas; acesso direto de escrita fica revogado.
do $$ declare tab text; begin
  foreach tab in array array['products','entitlements','profiles','protocols','program_phases','enrollments','activity_templates','daily_activities','activity_completions','meal_templates','ingredients','meal_ingredients','daily_meals','meal_completions','shopping_items'] loop
    execute format('alter table public.%I enable row level security', tab);
    execute format('revoke all on public.%I from anon, authenticated', tab);
    execute format('grant select on public.%I to authenticated', tab);
    execute format('grant all on public.%I to service_role', tab);
  end loop;
end $$;
create policy product_read on public.products for select to authenticated using ((select public.has_access()));
create policy entitlement_own on public.entitlements for select to authenticated using (user_id = (select auth.uid()));
create policy profile_own on public.profiles for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy enrollment_own on public.enrollments for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy activities_own on public.daily_activities for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy activity_completions_own on public.activity_completions for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy meals_own on public.daily_meals for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy meal_completions_own on public.meal_completions for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy shopping_own on public.shopping_items for select to authenticated using (user_id = (select auth.uid()) and (select public.has_access()));
create policy protocol_assigned on public.protocols for select to authenticated using (
  (select public.has_access()) and published and product_id = 'testomax' and exists (select 1 from public.enrollments e where e.user_id = (select auth.uid()) and e.protocol_id = id));
create policy phase_assigned on public.program_phases for select to authenticated using (
  (select public.has_access()) and exists (select 1 from public.protocols p where p.id = protocol_id));
create policy template_assigned on public.activity_templates for select to authenticated using (
  (select public.has_access()) and exists (select 1 from public.protocols p where p.id = protocol_id));
create policy meal_template_assigned on public.meal_templates for select to authenticated using (
  (select public.has_access()) and exists (select 1 from public.protocols p where p.id = protocol_id));
create policy meal_ingredients_assigned on public.meal_ingredients for select to authenticated using (
  (select public.has_access()) and exists (select 1 from public.meal_templates m where m.id = meal_template_id));
create policy ingredients_assigned on public.ingredients for select to authenticated using (
  (select public.has_access()) and exists (select 1 from public.meal_ingredients mi where mi.ingredient_id = id));

create function public.require_access() returns uuid
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.has_access() then raise exception 'Acesso não autorizado' using errcode = '42501'; end if;
  return auth.uid();
end $$;

create function public.ensure_routine() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.require_access();
  pref jsonb;
  is_onboarded boolean;
  local_today date;
  enrollment public.enrollments%rowtype;
begin
  insert into public.profiles (user_id) values (uid) on conflict do nothing;
  select preferences,onboarded into pref,is_onboarded from public.profiles where user_id = uid;
  if not is_onboarded then return; end if;
  local_today := (now() at time zone (pref->>'timezone'))::date;
  select e.* into enrollment from public.enrollments e join public.protocols p on p.id=e.protocol_id
    where e.user_id=uid and p.published and p.product_id='testomax';
  if not found then return; end if;
  -- Snapshots não são recalculados: apenas dias ainda não atribuídos são inseridos.
  insert into public.daily_activities (user_id, template_id, day, scheduled_time, snapshot)
  select uid, t.id, local_today + d.n,
    coalesce(pref->>t.time_preference, t.content->>'time', '09:00')::time,
    t.content || jsonb_build_object('category',t.category, 'demo',p.is_demo,
      'minutes', case when t.schedule='training' then (pref->>'minutes')::integer else (t.content->>'minutes')::integer end)
  from public.activity_templates t join public.protocols p on p.id=t.protocol_id
  cross join generate_series(0,7) as d(n)
  where t.protocol_id=enrollment.protocol_id and t.active
    and (t.phase_id is null or t.phase_id=enrollment.phase_id)
    and (pref->>'goal')=any(t.goals) and (pref->>'experience')=any(t.experiences)
    and (local_today+d.n)>=enrollment.started_on
    and (t.schedule='daily' or (pref->'trainingDays') @> to_jsonb(extract(dow from local_today+d.n)::integer))
  on conflict (user_id,template_id,day) do nothing;

  insert into public.daily_meals (user_id, template_id, day, snapshot)
  select uid, m.id, local_today+d.n,
    m.content || jsonb_build_object('demo', p.is_demo,'ingredients',coalesce((
      select jsonb_agg(jsonb_build_object('name',i.name,'quantity',mi.quantity,'unit',mi.unit,'category',i.category) order by i.name)
      from public.meal_ingredients mi join public.ingredients i on i.id=mi.ingredient_id where mi.meal_template_id=m.id), '[]'::jsonb))
  from public.meal_templates m join public.protocols p on p.id=m.protocol_id cross join generate_series(0,7) d(n)
  where m.protocol_id=enrollment.protocol_id and m.active and (pref->>'diet')=any(m.diets) and (local_today+d.n)>=enrollment.started_on
  on conflict (user_id,template_id,day) do nothing;
end $$;

create function public.load_workspace() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access(); result jsonb;
begin
  perform public.ensure_routine();
  select jsonb_build_object(
    'profile', (select preferences || jsonb_build_object('id',user_id,'name',name,'onboarded',onboarded) from public.profiles where user_id=uid),
    'activities', coalesce((select jsonb_agg(a.snapshot || jsonb_build_object('id',a.id,'templateId',a.template_id,'date',a.day,'time',to_char(a.scheduled_time,'HH24:MI'),'done',c.activity_id is not null) order by a.day,a.scheduled_time) from public.daily_activities a left join public.activity_completions c on c.activity_id=a.id and c.user_id=uid where a.user_id=uid), '[]'::jsonb),
    'meals', coalesce((select jsonb_agg(m.snapshot || jsonb_build_object('id',m.id,'templateId',m.template_id,'date',m.day,'done',c.meal_id is not null) order by m.day,m.snapshot->>'time') from public.daily_meals m left join public.meal_completions c on c.meal_id=m.id and c.user_id=uid where m.user_id=uid), '[]'::jsonb),
    'grocery', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'quantity',s.quantity,'unit',s.unit,'category',s.category,'checked',s.checked,'personal',s.personal,'sourceKey',s.source_key) order by s.category,s.name) from public.shopping_items s where s.user_id=uid),'[]'::jsonb),
    'phases', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'description',p.description,'current',p.id=e.phase_id) order by p.position) from public.program_phases p join public.enrollments e on e.protocol_id=p.protocol_id where e.user_id=uid),'[]'::jsonb)
  ) into result;
  return result;
end $$;

create function public.set_activity_completion(activity_id uuid, completed boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access();
begin
  if not exists (select 1 from public.daily_activities a join public.profiles p on p.user_id=a.user_id
    where a.id=activity_id and a.user_id=uid and a.day <= (now() at time zone (p.preferences->>'timezone'))::date)
    then raise exception 'Atividade indisponível' using errcode='42501'; end if;
  if completed then
    insert into public.activity_completions (user_id,activity_id) values (uid,activity_id) on conflict do nothing;
  else
    delete from public.activity_completions c where c.user_id=uid and c.activity_id=set_activity_completion.activity_id;
  end if;
end $$;

create function public.set_meal_completion(meal_id uuid, completed boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access();
begin
  if not exists (select 1 from public.daily_meals m join public.profiles p on p.user_id=m.user_id
    where m.id=meal_id and m.user_id=uid and m.day <= (now() at time zone (p.preferences->>'timezone'))::date)
    then raise exception 'Refeição indisponível' using errcode='42501'; end if;
  if completed then
    insert into public.meal_completions (user_id,meal_id) values (uid,meal_id) on conflict do nothing;
  else
    delete from public.meal_completions c where c.user_id=uid and c.meal_id=set_meal_completion.meal_id;
  end if;
end $$;

create function public.set_activity_time(activity_id uuid, new_time text) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access();
begin
  if new_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Horário inválido'; end if;
  update public.daily_activities a set scheduled_time=new_time::time from public.profiles p
    where a.id=activity_id and a.user_id=uid and p.user_id=uid and (a.snapshot->>'editable')::boolean
    and a.day >= (now() at time zone (p.preferences->>'timezone'))::date;
  if not found then raise exception 'Atividade não editável' using errcode='42501'; end if;
end $$;

create function public.save_profile(profile jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access(); pref jsonb; local_today date; old_today date;
begin
  if jsonb_typeof(profile) <> 'object' or not profile ?& array['name','goal','experience','trainingDays','minutes','wakeTime','sleepTime','diet','timezone','onboarded'] then raise exception 'Perfil inválido'; end if;
  if length(trim(profile->>'name')) not between 2 and 60
    or (profile->>'goal') not in ('consistencia','forca','energia')
    or (profile->>'experience') not in ('iniciante','intermediario','avancado')
    or (profile->>'diet') not in ('variada','vegetariana')
    or (profile->>'minutes')::integer not between 10 and 90
    or (profile->>'wakeTime') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or (profile->>'sleepTime') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or jsonb_typeof(profile->'trainingDays') <> 'array'
    or jsonb_array_length(profile->'trainingDays') not between 1 and 7
    or exists(select 1 from jsonb_array_elements_text(profile->'trainingDays') d(value) where d.value !~ '^[0-6]$')
    or not exists(select 1 from pg_catalog.pg_timezone_names where name=profile->>'timezone')
  then raise exception 'Preferências inválidas'; end if;
  pref := profile - array['id','name','onboarded'];
  local_today := (now() at time zone (pref->>'timezone'))::date;
  select (now() at time zone (preferences->>'timezone'))::date into old_today from public.profiles where user_id=uid;
  insert into public.profiles (user_id,name,preferences,onboarded) values (uid,trim(profile->>'name'),pref,(profile->>'onboarded')::boolean)
  on conflict (user_id) do update set name=excluded.name,preferences=excluded.preferences,onboarded=excluded.onboarded,updated_at=now();
  -- Mesmo na troca de fuso, não reescreve o dia que já era atual nem conclusões.
  delete from public.daily_activities a where a.user_id=uid and a.day > greatest(local_today,coalesce(old_today,local_today)) and not exists(select 1 from public.activity_completions c where c.activity_id=a.id);
  delete from public.daily_meals m where m.user_id=uid and m.day > greatest(local_today,coalesce(old_today,local_today)) and not exists(select 1 from public.meal_completions c where c.meal_id=m.id);
  perform public.ensure_routine();
end $$;

create function public.save_groceries(items jsonb, replace_generated boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access(); item jsonb;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items)>500 then raise exception 'Lista inválida'; end if;
  if replace_generated then delete from public.shopping_items where user_id=uid and not personal; end if;
  for item in select value from jsonb_array_elements(items) loop
    if not item ?& array['id','name','quantity','unit','category','checked','personal','sourceKey'] then raise exception 'Item inválido'; end if;
    if exists(select 1 from public.shopping_items s where s.id=(item->>'id')::uuid and s.user_id<>uid) then raise exception 'Item não autorizado' using errcode='42501'; end if;
    insert into public.shopping_items (id,user_id,name,quantity,unit,category,checked,personal,source_key)
    values ((item->>'id')::uuid,uid,item->>'name',(item->>'quantity')::numeric,item->>'unit',item->>'category',(item->>'checked')::boolean,(item->>'personal')::boolean,item->>'sourceKey')
    on conflict (id) do update set name=excluded.name,quantity=excluded.quantity,unit=excluded.unit,category=excluded.category,checked=excluded.checked,personal=excluded.personal,source_key=excluded.source_key,updated_at=now()
    where public.shopping_items.user_id=uid;
  end loop;
end $$;

create function public.remove_grocery(item_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := public.require_access();
begin
  delete from public.shopping_items where id=item_id and user_id=uid;
  if not found then raise exception 'Item indisponível' using errcode='42501'; end if;
end $$;

-- Definer usa search_path vazio e identidade do JWT, nunca user_id fornecido pelo cliente.
revoke execute on function public.has_access(),public.require_access(),public.ensure_routine(),
  public.load_workspace(),public.set_activity_completion(uuid,boolean),public.set_meal_completion(uuid,boolean),
  public.set_activity_time(uuid,text),public.save_profile(jsonb),public.save_groceries(jsonb,boolean),public.remove_grocery(uuid)
  from public, anon, authenticated;
grant execute on function public.has_access() to authenticated;
grant execute on function public.load_workspace() to authenticated;
grant execute on function public.set_activity_completion(uuid,boolean) to authenticated;
grant execute on function public.set_meal_completion(uuid,boolean) to authenticated;
grant execute on function public.set_activity_time(uuid,text) to authenticated;
grant execute on function public.save_profile(jsonb) to authenticated;
grant execute on function public.save_groceries(jsonb,boolean) to authenticated;
grant execute on function public.remove_grocery(uuid) to authenticated;
