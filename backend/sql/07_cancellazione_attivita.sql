-- Chiusura atomica e elenco riservato delle famiglie da avvisare.
-- WhatsApp si apre su richiesta del parroco: l'app non invia messaggi da sola.
-- Applicare dopo aver verificato lo schema della parrocchia test.
begin;

create table if not exists public.ars_cancellazioni_attivita (
  attivita_id uuid primary key references public.attivita_parrocchiali(id) on delete restrict,
  parrocchia_id uuid not null,
  messaggio text not null check (length(btrim(messaggio)) between 1 and 2000),
  cancellata_at timestamptz not null default now(),
  cancellata_da uuid not null references auth.users(id) on delete restrict,
  questioni_concluse_at timestamptz,
  questioni_concluse_da uuid references auth.users(id) on delete set null,
  foreign key (attivita_id, parrocchia_id)
    references public.attivita_parrocchiali(id, parrocchia_id) on delete restrict
);

create table if not exists public.ars_avvisi_cancellazione_famiglie (
  id uuid primary key default gen_random_uuid(),
  attivita_id uuid not null references public.ars_cancellazioni_attivita(attivita_id) on delete restrict,
  chiave_famiglia text not null,
  email text,
  telefono text,
  stato text not null check (stato in ('in_attesa', 'da_contattare', 'inviato', 'consegnato', 'fallito')),
  created_at timestamptz not null default now(),
  inviato_at timestamptz,
  consegnato_at timestamptz,
  unique (attivita_id, chiave_famiglia)
);
create index if not exists ars_avvisi_cancellazione_stato_idx
  on public.ars_avvisi_cancellazione_famiglie(attivita_id, stato);

create table if not exists public.ars_letture_cancellazione_attivita (
  attivita_id uuid not null references public.ars_cancellazioni_attivita(attivita_id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  letta_at timestamptz not null default now(),
  primary key (attivita_id, auth_user_id)
);

alter table public.ars_cancellazioni_attivita enable row level security;
alter table public.ars_avvisi_cancellazione_famiglie enable row level security;
alter table public.ars_letture_cancellazione_attivita enable row level security;
revoke all on public.ars_cancellazioni_attivita,
  public.ars_avvisi_cancellazione_famiglie,
  public.ars_letture_cancellazione_attivita from public, anon, authenticated;

-- Impedisce che la vecchia funzione di salvataggio ripubblichi un'attività
-- annullata o la porti allo stato annullata senza registrare l'avviso.
create or replace function public.ars_proteggi_stato_attivita_cancellata()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $function$
begin
  if tg_op = 'INSERT' and new.stato = 'annullata' then
    raise exception 'La cancellazione richiede un avviso alle famiglie';
  end if;
  if tg_op = 'INSERT' then return new; end if;
  if old.stato = 'annullata' and new.stato is distinct from 'annullata' then
    raise exception 'L’attività cancellata non può essere riaperta';
  end if;
  if old.stato = 'annullata' and new is distinct from old then
    raise exception 'L’attività cancellata è archiviata';
  end if;
  if old.stato <> 'annullata' and new.stato = 'annullata'
     and not exists (select 1 from public.ars_cancellazioni_attivita c
                     where c.attivita_id = new.id and c.parrocchia_id = new.parrocchia_id) then
    raise exception 'La cancellazione richiede un avviso alle famiglie';
  end if;
  return new;
end;
$function$;
drop trigger if exists ars_proteggi_stato_attivita_cancellata
  on public.attivita_parrocchiali;
create trigger ars_proteggi_stato_attivita_cancellata
before insert or update on public.attivita_parrocchiali
for each row execute function public.ars_proteggi_stato_attivita_cancellata();
revoke all on function public.ars_proteggi_stato_attivita_cancellata()
  from public, anon, authenticated;

-- Impedisce anche alle funzioni GREST esistenti di modificare gruppi,
-- assegnazioni e immagini quando la relativa attività è già annullata.
-- Il lock FOR SHARE serializza la modifica con l'annullamento dell'attività.
create or replace function public.ars_blocca_modifiche_gruppo_annullato()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $function$
declare
  v_attivita_id uuid;
  v_stato text;
  v_gruppo_id uuid;
begin
  if tg_table_name = 'grest_gruppi_volontari' then
    v_gruppo_id := case when tg_op = 'DELETE' then old.gruppo_id else new.gruppo_id end;
    select attivita_id into v_attivita_id
    from public.grest_gruppi where id = v_gruppo_id;
  else
    v_attivita_id := case when tg_op = 'DELETE' then old.attivita_id else new.attivita_id end;
  end if;

  select stato into v_stato from public.attivita_parrocchiali
  where id = v_attivita_id for share;
  if v_stato = 'annullata' then
    raise exception 'I gruppi di questa attività annullata non sono più modificabili';
  end if;
  if tg_op = 'UPDATE' and tg_table_name = 'grest_gruppi_volontari' then
    if old.gruppo_id is distinct from new.gruppo_id then
      select a.stato into v_stato from public.grest_gruppi g
      join public.attivita_parrocchiali a on a.id = g.attivita_id
      where g.id = old.gruppo_id for share of a;
      if v_stato = 'annullata' then
        raise exception 'I gruppi di questa attività annullata non sono più modificabili';
      end if;
    end if;
  end if;
  if tg_op = 'UPDATE' and tg_table_name <> 'grest_gruppi_volontari' then
    if old.attivita_id is distinct from new.attivita_id then
      select stato into v_stato from public.attivita_parrocchiali
      where id = old.attivita_id for share;
      if v_stato = 'annullata' then
        raise exception 'I gruppi di questa attività annullata non sono più modificabili';
      end if;
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$function$;
do $do$
declare v_tabella text;
begin
  foreach v_tabella in array array['grest_gruppi', 'grest_gruppi_ragazzi', 'grest_gruppi_volontari'] loop
    execute format('drop trigger if exists ars_blocca_gruppo_annullato on public.%I', v_tabella);
    execute format('create trigger ars_blocca_gruppo_annullato before insert or update or delete on public.%I for each row execute function public.ars_blocca_modifiche_gruppo_annullato()', v_tabella);
  end loop;
end;
$do$;
revoke all on function public.ars_blocca_modifiche_gruppo_annullato()
  from public, anon, authenticated;

create or replace function public.ars_cancella_attivita_parroco(
  p_attivita_id uuid, p_messaggio text
)
returns jsonb language plpgsql security definer
set search_path = public, pg_temp
as $function$
declare
  v_attivita public.attivita_parrocchiali%rowtype;
  v_in_attesa integer;
  v_da_contattare integer;
begin
  if auth.uid() is null then raise exception 'Accesso riservato'; end if;
  select * into v_attivita from public.attivita_parrocchiali
  where id = p_attivita_id for update;
  if not found or not coalesce(public.ars_puo_gestire_attivita(v_attivita.parrocchia_id), false) then
    raise exception 'Non autorizzato a cancellare questa attività';
  end if;
  if v_attivita.stato = 'annullata' then
    if not exists (select 1 from public.ars_cancellazioni_attivita
                   where attivita_id = p_attivita_id) then
      raise exception 'Attività già annullata senza pratica: verifica i dati precedenti';
    end if;
    select count(*) filter (where stato = 'in_attesa'),
           count(*) filter (where stato = 'da_contattare')
    into v_in_attesa, v_da_contattare
    from public.ars_avvisi_cancellazione_famiglie where attivita_id = p_attivita_id;
    return jsonb_build_object('stato', 'annullata',
      'destinatari_in_attesa', v_in_attesa,
      'destinatari_da_contattare', v_da_contattare);
  end if;
  if v_attivita.stato not in ('bozza', 'pubblicata') then
    raise exception 'Questa attività non può essere cancellata';
  end if;
  if length(btrim(coalesce(p_messaggio, ''))) not between 1 and 2000 then
    raise exception 'Inserisci un avviso di massimo 2000 caratteri';
  end if;

  insert into public.ars_cancellazioni_attivita
    (attivita_id, parrocchia_id, messaggio, cancellata_da)
  values (p_attivita_id, v_attivita.parrocchia_id, btrim(p_messaggio), auth.uid());

  -- Una sola riga per recapito: fratelli iscritti con lo stesso numero
  -- ricevono un solo avviso. Le attività senza recapiti restano da contattare.
  insert into public.ars_avvisi_cancellazione_famiglie
    (attivita_id, chiave_famiglia, email, telefono, stato)
  select distinct on (chiave_famiglia)
    p_attivita_id, chiave_famiglia, email, telefono,
    case when telefono is not null then 'in_attesa'
         else 'da_contattare' end
  from (
    select i.id,
      nullif(lower(btrim(coalesce(s.email_contatto, to_jsonb(u)->>'email', ''))), '') as email,
      nullif(btrim(coalesce(s.telefono_contatto, to_jsonb(u)->>'telefono', '')), '') as telefono,
      coalesce(
        nullif(regexp_replace(coalesce(s.telefono_contatto, to_jsonb(u)->>'telefono', ''), '[^0-9]', '', 'g'), ''),
        nullif(lower(btrim(coalesce(s.email_contatto, to_jsonb(u)->>'email', ''))), ''),
        i.id::text
      ) as chiave_famiglia
    from public.iscrizioni_attivita i
    left join public.grest_schede_iscrizione s on s.iscrizione_id = i.id
    left join public.utenti u on u.id = i.richiedente_utente_id
    where i.attivita_id = p_attivita_id
      and i.stato not in ('annullata', 'ritirata')
  ) destinatari
  order by chiave_famiglia, id;

  update public.attivita_parrocchiali
  set stato = 'annullata',
      configurazione_modulo = case when lower(tipo) = 'grest'
        then jsonb_set(configurazione_modulo, '{abilita_iscrizioni_grest}', 'false'::jsonb)
        else configurazione_modulo end,
      updated_at = now()
  where id = p_attivita_id;

  select count(*) filter (where stato = 'in_attesa'),
         count(*) filter (where stato = 'da_contattare')
  into v_in_attesa, v_da_contattare
  from public.ars_avvisi_cancellazione_famiglie where attivita_id = p_attivita_id;
  return jsonb_build_object('stato', 'annullata',
    'destinatari_in_attesa', v_in_attesa,
    'destinatari_da_contattare', v_da_contattare);
end;
$function$;
revoke all on function public.ars_cancella_attivita_parroco(uuid, text)
  from public, anon, authenticated;
grant execute on function public.ars_cancella_attivita_parroco(uuid, text)
  to authenticated;

create or replace function public.ars_elenco_attivita_cancellate_parroco(p_parrocchia_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = public, pg_temp
as $function$
declare v_risultato jsonb;
begin
  if auth.uid() is null or not coalesce(public.ars_puo_gestire_attivita(p_parrocchia_id), false) then
    raise exception 'Non autorizzato a consultare le pratiche';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id, 'tipo', a.tipo, 'titolo', a.titolo,
    'messaggio', c.messaggio, 'cancellata_at', c.cancellata_at,
    'questioni_concluse_at', c.questioni_concluse_at,
    'iscrizioni', (select count(*) from public.iscrizioni_attivita i where i.attivita_id = a.id),
    'pagamenti_registrati', (select count(*) from public.pagamenti_parrocchia p
                             where p.attivita_id = a.id and p.parrocchia_id = a.parrocchia_id),
    'pagamenti_in_attesa', (select count(*) from public.pagamenti_parrocchia p
                           where p.attivita_id = a.id and p.parrocchia_id = a.parrocchia_id
                             and p.stato = 'in_attesa'),
    'avvisi_in_attesa', (select count(*) from public.ars_avvisi_cancellazione_famiglie f
                        where f.attivita_id = a.id and f.stato = 'in_attesa'),
    'da_contattare', (select count(*) from public.ars_avvisi_cancellazione_famiglie f
                     where f.attivita_id = a.id and f.stato = 'da_contattare')
  ) order by c.cancellata_at desc), '[]'::jsonb) into v_risultato
  from public.ars_cancellazioni_attivita c
  join public.attivita_parrocchiali a on a.id = c.attivita_id
  where c.parrocchia_id = p_parrocchia_id;
  return v_risultato;
end;
$function$;
revoke all on function public.ars_elenco_attivita_cancellate_parroco(uuid)
  from public, anon, authenticated;
grant execute on function public.ars_elenco_attivita_cancellate_parroco(uuid)
  to authenticated;

-- Recapiti visibili soltanto a chi gestisce l'attività. Lo stato "inviato"
-- indica la conferma manuale dell'operatore, non una ricevuta WhatsApp.
create or replace function public.ars_famiglie_cancellazione_parroco(p_attivita_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = public, pg_temp
as $function$
declare v_parrocchia_id uuid; v_risultato jsonb;
begin
  select parrocchia_id into v_parrocchia_id
  from public.ars_cancellazioni_attivita where attivita_id = p_attivita_id;
  if auth.uid() is null or v_parrocchia_id is null
     or not coalesce(public.ars_puo_gestire_attivita(v_parrocchia_id), false) then
    raise exception 'Non autorizzato a consultare i recapiti';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', f.id, 'telefono', f.telefono, 'email', f.email, 'stato', f.stato
  ) order by f.created_at, f.id), '[]'::jsonb) into v_risultato
  from public.ars_avvisi_cancellazione_famiglie f
  where f.attivita_id = p_attivita_id;
  return v_risultato;
end;
$function$;
revoke all on function public.ars_famiglie_cancellazione_parroco(uuid)
  from public, anon, authenticated;
grant execute on function public.ars_famiglie_cancellazione_parroco(uuid)
  to authenticated;

create or replace function public.ars_conferma_avviso_whatsapp_parroco(
  p_attivita_id uuid, p_avviso_id uuid
)
returns void language plpgsql security definer
set search_path = public, pg_temp
as $function$
declare v_parrocchia_id uuid;
begin
  select parrocchia_id into v_parrocchia_id
  from public.ars_cancellazioni_attivita where attivita_id = p_attivita_id;
  if auth.uid() is null or v_parrocchia_id is null
     or not coalesce(public.ars_puo_gestire_attivita(v_parrocchia_id), false) then
    raise exception 'Non autorizzato a confermare questo avviso';
  end if;
  update public.ars_avvisi_cancellazione_famiglie
  set stato = 'inviato', inviato_at = now()
  where id = p_avviso_id and attivita_id = p_attivita_id
    and telefono is not null and stato in ('in_attesa', 'fallito');
  if not found then raise exception 'Avviso non disponibile o già confermato'; end if;
end;
$function$;
revoke all on function public.ars_conferma_avviso_whatsapp_parroco(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.ars_conferma_avviso_whatsapp_parroco(uuid, uuid)
  to authenticated;

-- Bacheca dell'attività: solo il richiedente autenticato che risulta
-- nell'iscrizione può leggere l'avviso. Non espone nominativi di minori,
-- recapiti, pagamenti o iscrizioni di altre famiglie.
create or replace function public.ars_bacheca_cancellazioni_mie_attivita(p_parrocchia_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = public, pg_temp
as $function$
declare v_risultato jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'attivita_id', a.id, 'titolo', a.titolo,
    'messaggio', c.messaggio, 'cancellata_at', c.cancellata_at,
    'letta_at', (select l.letta_at from public.ars_letture_cancellazione_attivita l
                 where l.attivita_id = a.id and l.auth_user_id = auth.uid())
  ) order by c.cancellata_at desc), '[]'::jsonb) into v_risultato
  from public.ars_cancellazioni_attivita c
  join public.attivita_parrocchiali a on a.id = c.attivita_id
  where c.parrocchia_id = p_parrocchia_id
    and exists (
      select 1 from public.iscrizioni_attivita i
      left join public.grest_schede_iscrizione s on s.iscrizione_id = i.id
      left join public.utenti u on u.id = i.richiedente_utente_id
      where i.attivita_id = c.attivita_id
        and i.stato not in ('ritirata', 'annullata')
        and (i.richiedente_auth_id = auth.uid()
          or s.richiedente_auth_id = auth.uid()
          or u.auth_user_id = auth.uid())
    );
  return v_risultato;
end;
$function$;
revoke all on function public.ars_bacheca_cancellazioni_mie_attivita(uuid)
  from public, anon, authenticated;
grant execute on function public.ars_bacheca_cancellazioni_mie_attivita(uuid)
  to authenticated;

create or replace function public.ars_segna_avviso_cancellazione_letto(p_attivita_id uuid)
returns void language plpgsql security definer
set search_path = public, pg_temp
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.ars_cancellazioni_attivita c
    join public.iscrizioni_attivita i on i.attivita_id = c.attivita_id
    left join public.grest_schede_iscrizione s on s.iscrizione_id = i.id
    left join public.utenti u on u.id = i.richiedente_utente_id
    where c.attivita_id = p_attivita_id and i.stato not in ('ritirata', 'annullata')
      and (i.richiedente_auth_id = auth.uid()
        or s.richiedente_auth_id = auth.uid()
        or u.auth_user_id = auth.uid())
  ) then
    raise exception 'Avviso non disponibile per questo utente';
  end if;
  insert into public.ars_letture_cancellazione_attivita(attivita_id, auth_user_id)
  values (p_attivita_id, auth.uid()) on conflict do nothing;
end;
$function$;
revoke all on function public.ars_segna_avviso_cancellazione_letto(uuid)
  from public, anon, authenticated;
grant execute on function public.ars_segna_avviso_cancellazione_letto(uuid)
  to authenticated;

-- La chiusura amministrativa è una scelta esplicita della parrocchia.
-- Non elimina iscrizioni o pagamenti: la conservazione sarà gestita
-- separatamente secondo i termini stabiliti per ogni tipo di dato.
create or replace function public.ars_concludi_questioni_attivita_parroco(p_attivita_id uuid)
returns jsonb language plpgsql security definer
set search_path = public, pg_temp
as $function$
declare v_pratica public.ars_cancellazioni_attivita%rowtype;
begin
  if auth.uid() is null then raise exception 'Accesso riservato'; end if;
  select * into v_pratica from public.ars_cancellazioni_attivita
  where attivita_id = p_attivita_id for update;
  if not found or not coalesce(public.ars_puo_gestire_attivita(v_pratica.parrocchia_id), false) then
    raise exception 'Non autorizzato a chiudere questa pratica';
  end if;
  if v_pratica.questioni_concluse_at is null then
    update public.ars_cancellazioni_attivita
      set questioni_concluse_at = now(), questioni_concluse_da = auth.uid()
      where attivita_id = p_attivita_id
      returning * into v_pratica;
  end if;
  return jsonb_build_object('questioni_concluse_at', v_pratica.questioni_concluse_at);
end;
$function$;
revoke all on function public.ars_concludi_questioni_attivita_parroco(uuid)
  from public, anon, authenticated;
grant execute on function public.ars_concludi_questioni_attivita_parroco(uuid)
  to authenticated;

commit;
