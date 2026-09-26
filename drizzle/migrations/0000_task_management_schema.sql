
create type public.app_role as enum ('admin','user');
create type public.project_status as enum ('PLANNING','IN_PROGRESS','COMPLETED','ARCHIVED');
create type public.project_priority as enum ('LOW','MEDIUM','HIGH');
create type public.task_status as enum ('TODO','IN_PROGRESS','REVIEW','COMPLETED');
create type public.task_priority as enum ('LOW','MEDIUM','HIGH','CRITICAL');

create table public.profiles (
  id uuid primary key,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by signed in" on public.profiles for select to authenticated using (true);
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "read own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  status project_status not null default 'PLANNING',
  priority project_priority not null default 'MEDIUM',
  start_date date,
  due_date date,
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date)
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);
grant select, insert, delete on public.project_members to authenticated;
grant all on public.project_members to service_role;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  project_id uuid not null references public.projects(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  status task_status not null default 'TODO',
  priority task_priority not null default 'MEDIUM',
  priority_rank int generated always as (case priority when 'LOW' then 1 when 'MEDIUM' then 2 when 'HIGH' then 3 else 4 end) stored,
  due_date date,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  message text not null,
  link text,
  kind text not null,
  ref_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
create unique index notifications_due_unique on public.notifications(user_id, kind, ref_id) where kind = 'TASK_DUE_SOON';

create or replace function public.is_project_owner(_pid uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.projects where id=_pid and owner_id=_uid) $$;

create or replace function public.is_project_member(_pid uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_project_owner(_pid,_uid) or exists (select 1 from public.project_members where project_id=_pid and user_id=_uid) $$;

alter table public.projects enable row level security;
create policy "view projects" on public.projects for select to authenticated
  using (public.is_project_member(id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "create projects" on public.projects for insert to authenticated with check (owner_id = auth.uid());
create policy "owner updates" on public.projects for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner deletes" on public.projects for delete to authenticated using (owner_id = auth.uid());

alter table public.project_members enable row level security;
create policy "view members" on public.project_members for select to authenticated
  using (public.is_project_member(project_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "owner adds" on public.project_members for insert to authenticated with check (public.is_project_owner(project_id, auth.uid()));
create policy "owner removes" on public.project_members for delete to authenticated using (public.is_project_owner(project_id, auth.uid()));

alter table public.tasks enable row level security;
create policy "view tasks" on public.tasks for select to authenticated
  using (public.is_project_member(project_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "members create tasks" on public.tasks for insert to authenticated
  with check (created_by = auth.uid() and public.is_project_member(project_id, auth.uid())
    and (assigned_to is null or public.is_project_member(project_id, assigned_to)));
create policy "owner or assignee updates" on public.tasks for update to authenticated
  using (public.is_project_owner(project_id, auth.uid()) or (assigned_to = auth.uid() and public.is_project_member(project_id, auth.uid())))
  with check (public.is_project_member(project_id, auth.uid()) and (assigned_to is null or public.is_project_member(project_id, assigned_to)));
create policy "owner deletes tasks" on public.tasks for delete to authenticated using (public.is_project_owner(project_id, auth.uid()));

alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "mark own read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.guard_task_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.project_id <> old.project_id then raise exception 'Cannot move task to another project'; end if;
  if auth.uid() is not null and not public.is_project_owner(old.project_id, auth.uid()) then
    if new.title <> old.title or new.description <> old.description or new.assigned_to is distinct from old.assigned_to
       or new.priority <> old.priority or new.due_date is distinct from old.due_date then
      raise exception 'Only the project owner can edit task details; assignees can change status';
    end if;
  end if;
  return new;
end $$;
create trigger tasks_guard before update on public.tasks for each row execute function public.guard_task_update();

create or replace function public.touch_updated() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  end if;
  insert into public.user_roles(user_id, role) values (new.id,'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.notify_member_added() returns trigger language plpgsql security definer set search_path = public as $$
declare pname text;
begin
  select name into pname from public.projects where id = new.project_id;
  insert into public.notifications(user_id,message,link,kind,ref_id)
  values (new.user_id, 'You were added to project "' || pname || '"', '/projects/' || new.project_id, 'MEMBER_ADDED', new.project_id);
  return new;
end $$;
create trigger member_added after insert on public.project_members for each row execute function public.notify_member_added();

create or replace function public.notify_task_change() returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if new.assigned_to is not null and new.assigned_to is distinct from auth.uid()
     and (tg_op = 'INSERT' or new.assigned_to is distinct from old.assigned_to) then
    insert into public.notifications(user_id,message,link,kind,ref_id)
    values (new.assigned_to, 'Task assigned to you: "' || new.title || '"', '/projects/' || new.project_id, 'TASK_ASSIGNED', new.id);
  end if;
  if tg_op = 'UPDATE' and new.status = 'COMPLETED' and old.status <> 'COMPLETED' then
    select owner_id into owner from public.projects where id = new.project_id;
    if owner is distinct from auth.uid() then
      insert into public.notifications(user_id,message,link,kind,ref_id)
      values (owner, 'Task completed: "' || new.title || '"', '/projects/' || new.project_id, 'TASK_COMPLETED', new.id);
    end if;
  end if;
  return new;
end $$;
create trigger task_notify after insert or update on public.tasks for each row execute function public.notify_task_change();

create or replace function public.generate_due_notifications() returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id,message,link,kind,ref_id)
  select t.assigned_to, 'Task due soon: "' || t.title || '" (' || t.due_date || ')', '/projects/' || t.project_id, 'TASK_DUE_SOON', t.id
  from public.tasks t
  where t.assigned_to = auth.uid() and t.status <> 'COMPLETED'
    and t.due_date between current_date and current_date + 2
  on conflict do nothing;
$$;
grant execute on function public.generate_due_notifications() to authenticated;
