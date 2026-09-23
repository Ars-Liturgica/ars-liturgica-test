# Cancellazione delle attività — contratto di implementazione

## Comportamento per la parrocchia

Un solo comando `Cancella attività`, disponibile per ogni tipo di attività in
bozza o pubblicata. Il parroco (o un delegato autorizzato) vede un testo già
pronto, può modificarlo e conferma. Per le bozze senza iscritti l'avviso resta
nel registro della pratica, senza destinatari. Non chiedere di eliminare prima
i gruppi. Non alterare automaticamente iscrizioni o importi già registrati.

Testo predefinito: «L’attività [titolo] è stata cancellata. Per informazioni,
vi invitiamo a contattare il parroco o la segreteria parrocchiale.»

L'attività cancellata scompare dalle attività aperte, non accetta nuove
iscrizioni e rende inoperanti i gruppi. La parrocchia conserva una vista
riservata con iscrizioni, pagamenti e stato dei recapiti. L'avviso rimane nella
bacheca riservata dell'attività. Il testo inviato direttamente a ogni famiglia
è identico a quello affisso in bacheca.

## Contratto dell'operazione

`ars_cancella_attivita_parroco(p_attivita_id uuid, p_messaggio text) → jsonb`

Risposta minima: `{ "stato": "annullata", "destinatari_in_attesa": N,
"destinatari_da_contattare": M }`.
Autorizzazione lato database con `ars_puo_gestire_attivita`, controllo della
parrocchia e blocco della riga dell'attività. Un solo commit registra lo stato
cancellato, l'avviso e le consegne individuali in attesa. La seconda chiamata
non crea duplicati né cambia il testo già confermato: ritorna lo stato corrente.
Se manca un recapito, registra `da_contattare` nella vista riservata; non
attribuisce al destinatario uno stato `inviato` o `consegnato`.

Il database deve bloccare nuove iscrizioni alle attività cancellate; il solo
filtro della pagina non è sufficiente. Le funzioni pubbliche di elenco devono
escluderle, mentre quelle riservate della parrocchia le devono poter leggere.
Una pagina della bacheca per i partecipanti richiede un accesso che verifichi
l'appartenenza all'attività, anche per chi si è iscritto senza account. Evitare
un URL indovinabile che esponga dati o avvisi riservati.
La migrazione include `ars_bacheca_cancellazioni_mie_attivita`: restituisce
solo il titolo e il messaggio ai richiedenti con un account Supabase associato
all'iscrizione; la vista del fedele li mostra nella bacheca delle sue attività.
I genitori con solo telefono non possono ancora accedervi: il canale diretto
resta indispensabile. L'accesso completo alla bacheca riservata per genitori
senza account richiede la verifica di possesso del recapito.

L'invio esterno usa una coda persistente per ogni famiglia e un servizio
configurato dalla parrocchia. Stato distinto: `in_attesa`, `inviato`,
`consegnato` (solo con riscontro del fornitore), `fallito`, `da_contattare`.
Ritenta gli errori transitori senza duplicare gli invii. Non presentare
l'operazione come invio completato se nessun canale è collegato. Per le
iscrizioni GREST il telefono è obbligatorio e l'email facoltativa; alcuni
richiedenti non hanno un account.

## Chiusura della pratica e dati

`Questioni concluse` è una dichiarazione del parroco, successiva alla
cancellazione operativa. Non elimina subito ogni record. Le scadenze dei dati
personali vanno configurate per finalità con la parrocchia e i suoi consulenti;
il servizio cancella o anonimizza i dati alle rispettive scadenze e conserva
soltanto i documenti per i quali sussiste ancora una ragione di conservazione.
Non introdurre in codice un unico termine indiscriminato.

## Verifiche prima della migrazione

La query ricevuta il 23 settembre 2026 ha confermato lo stato `annullata`,
l'elenco pubblico limitato a `pubblicata`, il vincolo che preserva le iscrizioni
e le colonne dei recapiti GREST. La migrazione proposta in
`backend/sql/07_cancellazione_attivita.sql` prepara l'annullamento atomico,
il registro riservato, una bacheca per i richiedenti autenticati e una coda
degli avvisi. Non spedisce ancora messaggi: servono l'accesso riservato anche
ai genitori senza account e un canale di recapito effettivo.
I vincoli dei pagamenti sono stati verificati: il riferimento a iscrizione e
attività usa `ON DELETE RESTRICT` e l'archivio indica quanti pagamenti sono
registrati o in attesa, senza cambiarne importi o stati. Le definizioni delle
funzioni dei gruppi hanno mostrato che salvataggio ed eliminazione non
controllano lo stato `annullata`. La migrazione aggiunge trigger su gruppi,
assegnazioni dei ragazzi e volontari per impedirne le modifiche dopo la
cancellazione, anche quando una funzione vecchia rimane utilizzabile. La
futura pulizia dei dati dovrà rimuovere i gruppi tramite una procedura
controllata compatibile con questa protezione.
Non applicare la migrazione né unire
questa branch a `main` fino al completamento e alla prova end-to-end.

Query diagnostica di sola lettura per l'editor SQL di Supabase:

```sql
select 'colonna' as tipo, table_name as oggetto, column_name as nome,
       data_type || coalesce(' / ' || column_default, '') as definizione
from information_schema.columns
where table_schema = 'public'
  and table_name in ('attivita_parrocchiali', 'iscrizioni_attivita',
    'grest_schede_iscrizione', 'pagamenti_parrocchia', 'notifiche')
union all
select 'vincolo', rel.relname, con.conname, pg_get_constraintdef(con.oid)
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace ns on ns.oid = rel.relnamespace
where ns.nspname = 'public'
  and rel.relname in ('attivita_parrocchiali', 'iscrizioni_attivita',
    'grest_schede_iscrizione', 'pagamenti_parrocchia')
order by oggetto, tipo, nome;
```

Raccogliere anche la definizione delle funzioni
`ars_elenco_attivita_parroco`, `ars_elenco_attivita_pubbliche` e
`ars_salva_attivita_parrocchiale`, senza modificare il database.
