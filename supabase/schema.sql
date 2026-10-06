-- =====================================================================
-- Rancho DLC · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase → SQL Editor → Run
-- Es seguro volver a ejecutarlo: no duplica tablas, tipos ni políticas.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Respaldo de la tabla anterior
-- ---------------------------------------------------------------------
alter table if exists public.horses rename to horses_backup;

-- Una versión anterior de "caballos" (con created_at, padre_nombre, etc.) no es
-- compatible con esta: se aparta como caballos_v1_backup en vez de borrarla.
-- Se reconoce porque no tiene la columna creado_en.
do $$
declare
  idx record;
begin
  if to_regclass('public.caballos') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'caballos' and column_name = 'creado_en'
     ) then
    alter table public.caballos rename to caballos_v1_backup;
    -- Los índices (p. ej. caballos_pkey) conservan su nombre al renombrar la tabla
    -- y chocarían con los de la tabla nueva.
    for idx in
      select indexname from pg_indexes
      where schemaname = 'public' and tablename = 'caballos_v1_backup'
    loop
      execute format('alter index public.%I rename to %I', idx.indexname, 'v1_' || idx.indexname);
    end loop;
  end if;
end $$;

-- Los respaldos no deben quedar expuestos a la web.
do $$
begin
  if to_regclass('public.horses_backup') is not null then
    execute 'revoke all on public.horses_backup from anon, authenticated';
  end if;
  if to_regclass('public.caballos_v1_backup') is not null then
    execute 'revoke all on public.caballos_v1_backup from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Tipos
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'categoria_caballo') then
    create type public.categoria_caballo as enum ('Semental', 'Yegua', 'Potro', 'Potranca');
  end if;
  if not exists (select 1 from pg_type where typname = 'sexo_caballo') then
    create type public.sexo_caballo as enum ('Entero', 'Castrado', 'Yegua');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 3. Tabla caballos (mapea con lib/stallions.ts)
-- ---------------------------------------------------------------------
create table if not exists public.caballos (
  id               text primary key
                   check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),          -- slug: 'valor-dlc'
  nombre           text not null check (char_length(nombre) between 1 and 120),
  categoria        public.categoria_caballo,                         -- NULL = ancestro externo (solo pedigrí)
  sexo             public.sexo_caballo,
  raza             text,
  registro         text,                                             -- p. ej. 'CCDM'
  color            text,                                             -- 'Colorado', 'Alazana', 'Prieto'…
  actualmente_saltando boolean not null default false,
  anio_nacimiento  smallint check (anio_nacimiento between 1950 and 2100),
  alzada           numeric(3,2) check (alzada between 1.00 and 2.20), -- metros; NULL en crías
  comportamiento   text[] not null default '{}',                     -- {'Amateur Friendly','Fácil Manejo'}
  precio_rango     smallint check (precio_rango between 1 and 5),    -- $* a $*****; NULL si no está a la venta
  imagen_url       text,
  retrato_url      text,
  galeria          text[] not null default '{}',
  padre_id         text references public.caballos (id) on update cascade on delete set null,
  madre_id         text references public.caballos (id) on update cascade on delete set null,
  activo           boolean not null default false,                   -- true = visible en la web
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),
  constraint caballos_padre_distinto check (padre_id is null or padre_id <> id),
  constraint caballos_madre_distinta check (madre_id is null or madre_id <> id)
);

-- Si la tabla ya existía de una ejecución anterior, agrega las columnas nuevas.
alter table public.caballos add column if not exists sexo public.sexo_caballo;
alter table public.caballos add column if not exists registro text;
alter table public.caballos add column if not exists color text;
alter table public.caballos add column if not exists actualmente_saltando boolean not null default false;
alter table public.caballos add column if not exists retrato_url text;

-- Progenie y preventa de cruzas (ficha pública de cada semental).
alter table public.caballos add column if not exists nivel text
  check (char_length(nivel) <= 40);                                  -- '1.30 m', 'Jóvenes caballos'
alter table public.caballos add column if not exists preventa_activa boolean not null default false;
alter table public.caballos add column if not exists preventa_pareja text
  check (char_length(preventa_pareja) <= 120);                       -- yegua de la cruza anunciada
alter table public.caballos add column if not exists preventa_anio smallint
  check (preventa_anio between 2000 and 2100);                       -- año proyectado del potro

-- Video del caballo en su ficha (YouTube, Vimeo o .mp4 del bucket media).
alter table public.caballos add column if not exists video_url text
  check (char_length(video_url) <= 500);

create index if not exists caballos_categoria_activos_idx
  on public.caballos (categoria) where activo;
create index if not exists caballos_padre_idx on public.caballos (padre_id);
create index if not exists caballos_madre_idx on public.caballos (madre_id);

-- actualizado_en se mantiene solo en cada UPDATE.
create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists caballos_actualizado_en on public.caballos;
create trigger caballos_actualizado_en
  before update on public.caballos
  for each row execute function public.set_actualizado_en();

-- ---------------------------------------------------------------------
-- 4. Tabla prospectos (leads del formulario de contacto)
-- ---------------------------------------------------------------------
create table if not exists public.prospectos (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null check (char_length(nombre) between 1 and 120),
  telefono            text check (char_length(telefono) <= 30),        -- WhatsApp del cliente
  correo              text check (
                        char_length(correo) <= 254
                        and correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                      ),
  mensaje             text check (char_length(mensaje) <= 2000),
  caballo_interes_id  text references public.caballos (id) on update cascade on delete set null,
  fecha_creacion      timestamptz not null default now()
);

create index if not exists prospectos_fecha_idx on public.prospectos (fecha_creacion desc);

-- ---------------------------------------------------------------------
-- 5. Seguridad: Row Level Security
--    (el panel de Supabase y la service_role key no están sujetos a RLS)
-- ---------------------------------------------------------------------
-- Se borran TODAS las políticas existentes de estas tablas (también las creadas a mano
-- en el panel de Supabase): una política permisiva olvidada dejaría leer caballos
-- ocultos o editar la portada con la anon key. Después se crean solo las de abajo.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('caballos', 'prospectos', 'configuracion_sitio', 'concursos', 'pruebas', 'inscripciones')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.caballos   enable row level security;
alter table public.prospectos enable row level security;

-- caballos: la web solo puede LEER caballos activos.
revoke all on public.caballos from anon, authenticated;
grant select on public.caballos to anon, authenticated;

drop policy if exists "Web: leer caballos activos" on public.caballos;
create policy "Web: leer caballos activos"
  on public.caballos
  for select
  to anon, authenticated
  using (activo = true);

-- prospectos: la web solo puede INSERTAR (nunca leer, editar ni borrar).
-- Solo se permiten estas columnas: id y fecha_creacion los pone la base de datos.
revoke all on public.prospectos from anon, authenticated;
grant insert (nombre, telefono, correo, mensaje, caballo_interes_id)
  on public.prospectos to anon, authenticated;

drop policy if exists "Web: registrar prospectos" on public.prospectos;
create policy "Web: registrar prospectos"
  on public.prospectos
  for insert
  to anon, authenticated
  with check (
    -- Solo se puede asociar un caballo que esté publicado.
    caballo_interes_id is null
    or exists (
      select 1 from public.caballos c
      where c.id = caballo_interes_id and c.activo
    )
  );

-- ---------------------------------------------------------------------
-- 6. Vista de pedigrí
--    Los ancestros (abuelos, bisabuelos) no están a la venta y no son
--    "activos", pero la web necesita sus nombres para el árbol genealógico.
--    Esta vista expone SOLO id, nombre, padre y madre de todos los caballos;
--    precio, fotos y demás datos siguen protegidos por la política de arriba.
--    (Supabase la marcará como "security definer view": es intencional.)
-- ---------------------------------------------------------------------
create or replace view public.pedigri as
  select id, nombre, padre_id, madre_id
  from public.caballos;

revoke all on public.pedigri from anon, authenticated;
grant select on public.pedigri to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. Tabla configuracion_sitio (textos globales: portada, legado, eventos)
--    Se edita desde /admin/contenido con la service role key.
-- ---------------------------------------------------------------------
create table if not exists public.configuracion_sitio (
  id          text primary key,                 -- 'portada', 'legado', 'eventos'
  titulo      text,
  subtitulo   text,
  descripcion text,
  imagen_url  text,
  datos       jsonb,
  updated_at  timestamptz default timezone('utc'::text, now())
);

insert into public.configuracion_sitio (id) values ('portada'), ('legado'), ('eventos')
on conflict (id) do nothing;

-- La web solo puede LEER: sin esto, cualquiera con la anon key (que va en el
-- navegador) podría cambiar los textos de la portada.
alter table public.configuracion_sitio enable row level security;
revoke all on public.configuracion_sitio from anon, authenticated;
grant select on public.configuracion_sitio to anon, authenticated;

drop policy if exists "Web: leer configuracion" on public.configuracion_sitio;
create policy "Web: leer configuracion"
  on public.configuracion_sitio
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 8. Módulo de concursos: concursos → pruebas → inscripciones
--    Se gestionan desde /admin/concursos con la service role key.
-- ---------------------------------------------------------------------
create table if not exists public.concursos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  fecha_inicio date not null,
  fecha_fin    date not null,
  estado       text default 'proximo'
               constraint concursos_estado_check check (estado in ('proximo', 'activo', 'finalizado')),
  imagen_url   text,
  created_at   timestamptz default timezone('utc'::text, now())
);

create table if not exists public.pruebas (
  id          uuid primary key default gen_random_uuid(),
  concurso_id uuid references public.concursos (id),
  nombre      text not null,
  fecha       date not null,
  hora_inicio time not null,
  estado      text default 'abierta'
              constraint pruebas_estado_check check (estado in ('abierta', 'en_curso', 'finalizada')),
  created_at  timestamptz default timezone('utc'::text, now())
);

create table if not exists public.inscripciones (
  id             uuid primary key default gen_random_uuid(),
  prueba_id      uuid references public.pruebas (id),
  jinete_nombre  text not null,
  caballo_nombre text not null,
  caballo_id     text references public.caballos (id),
  orden_salida   integer,
  faltas         integer,
  tiempo         numeric,
  posicion       integer,
  pagado         boolean default false,
  created_at     timestamptz default timezone('utc'::text, now())
);

-- Transmisión en vivo (YouTube Live o Vimeo) que se muestra mientras el concurso está 'activo'.
alter table public.concursos add column if not exists livestream_url text
  check (char_length(livestream_url) <= 500);

create index if not exists pruebas_concurso_idx on public.pruebas (concurso_id);
create index if not exists inscripciones_prueba_idx on public.inscripciones (prueba_id);

-- Calendario público: la web solo puede LEER concursos y pruebas.
-- Inscripciones (nombres de jinetes, pagos): sin acceso con la anon key.
alter table public.concursos     enable row level security;
alter table public.pruebas       enable row level security;
alter table public.inscripciones enable row level security;

revoke all on public.concursos, public.pruebas, public.inscripciones from anon, authenticated;
grant select on public.concursos, public.pruebas to anon, authenticated;

drop policy if exists "Web: leer concursos" on public.concursos;
create policy "Web: leer concursos"
  on public.concursos for select to anon, authenticated using (true);

drop policy if exists "Web: leer pruebas" on public.pruebas;
create policy "Web: leer pruebas"
  on public.pruebas for select to anon, authenticated using (true);

-- La API de Supabase (PostgREST) relee las columnas nuevas.
notify pgrst, 'reload schema';

commit;
