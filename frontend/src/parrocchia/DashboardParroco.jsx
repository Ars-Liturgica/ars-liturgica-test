import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "../supabaseClient";

import CalendariParroco from "./stanze/Calendari/CalendariParroco";
import BachecaAvvisi from "./stanze/BachecaAvvisi/BachecaAvvisi";
import ArchivioDocumenti from "./stanze/ArchivioDocumenti/ArchivioDocumenti/ArchivioDocumenti";
import ComunitaParrocchia from "./stanze/Comunita/ComunitaParrocchia";
import Celebrazioni from "./stanze/Celebrazioni/Celebrazioni";
import IntenzioniMesseParroco from "./stanze/Celebrazioni/IntenzioniMesseParroco";
import Notifiche from "./stanze/Notifiche/Notifiche";
import CollaboratoriParrocchia from "./stanze/Collaboratori/CollaboratoriParrocchia";
import ProgettiDonazioni from "./stanze/ProgettiDonazioni/ProgettiDonazioni";
import PagamentiParrocchia from "./stanze/PagamentiParrocchia/PagamentiParrocchia";
import AttivitaGruppiParroco from "./stanze/AttivitaGruppi/AttivitaGruppiParroco";

export default function DashboardParroco({
  onCambioVista,
}) {
  const [riepilogo, setRiepilogo] = useState(null);
  const [erroreRiepilogo, setErroreRiepilogo] = useState("");
  const [caricamentoRiepilogo, setCaricamentoRiepilogo] = useState(true);
  const [aggiornamento, setAggiornamento] = useState(0);
  const [parrocchia, setParrocchia] = useState(null);
  const [utenteId, setUtenteId] = useState(null);
  const [stanzaAperta, setStanzaAperta] = useState(null);
  const [
    numeroNotificheNonLette,
    setNumeroNotificheNonLette,
  ] = useState(0);

  useEffect(() => {
    if (typeof onCambioVista === "function") {
      onCambioVista(Boolean(stanzaAperta));
    }
  }, [stanzaAperta, onCambioVista]);

  useEffect(() => {
    async function caricaParrocchia() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      setUtenteId(session.user.id);

      const {
        data: collegamento,
        error: erroreCollegamento,
      } = await supabase
        .from("utenti_parrocchie")
        .select("parrocchia_id")
        .eq("utente_id", session.user.id)
        .single();

      if (erroreCollegamento) {
        console.error(
          "Errore caricamento collegamento parrocchia:",
          erroreCollegamento,
        );
        return;
      }

      if (!collegamento) return;

      const {
        data: parrocchiaCaricata,
        error: erroreParrocchia,
      } = await supabase
        .from("parrocchie")
        .select("id, nome")
        .eq("id", collegamento.parrocchia_id)
        .single();

      if (erroreParrocchia) {
        console.error(
          "Errore caricamento parrocchia:",
          erroreParrocchia,
        );
        return;
      }

      if (parrocchiaCaricata) {
        setParrocchia(parrocchiaCaricata);
      }
    }

    caricaParrocchia();
  }, []);

  const caricaConteggioNotifiche = useCallback(
    async (parrocchiaId, idUtente) => {
      if (!parrocchiaId || !idUtente) {
        setNumeroNotificheNonLette(0);
        return;
      }

      const dataLimiteConservazione = new Date();

      dataLimiteConservazione.setDate(
        dataLimiteConservazione.getDate() - 180,
      );

      const { data, error } = await supabase
        .from("notifiche")
        .select(
          "id, created_at, notifiche_letture (utente_id)",
        )
        .eq("parrocchia_id", parrocchiaId)
        .gte(
          "created_at",
          dataLimiteConservazione.toISOString(),
        );

      if (error) {
        console.error(
          "Errore conteggio notifiche non lette:",
          error,
        );
        return;
      }

      const numeroNonLette = (data || []).filter(
        (notifica) => {
          const letture = Array.isArray(
            notifica.notifiche_letture,
          )
            ? notifica.notifiche_letture
            : [];

          return !letture.some(
            (lettura) =>
              lettura.utente_id === idUtente,
          );
        },
      ).length;

      setNumeroNotificheNonLette(numeroNonLette);
    },
    [],
  );

  useEffect(() => {
    if (!parrocchia?.id || !utenteId) return;

    caricaConteggioNotifiche(
      parrocchia.id,
      utenteId,
    );
  }, [
    parrocchia?.id,
    utenteId,
    stanzaAperta,
    caricaConteggioNotifiche,
  ]);

  useEffect(() => {
    if (!parrocchia?.id || stanzaAperta) return;
    let attivo = true;
    setCaricamentoRiepilogo(true);
    setErroreRiepilogo("");
    setRiepilogo(null);
    async function carica() {
      try {
        const { data, error } = await supabase.rpc(
          "ars_riepilogo_dashboard_parroco",
          { p_parrocchia_id: parrocchia.id }
        );
        if (error) throw error;
        if (!data || !Array.isArray(data.appuntamenti) || !Array.isArray(data.economia)) {
          throw new Error("Riepilogo non disponibile");
        }
        if (attivo) setRiepilogo(data);
      } catch (error) {
        console.error("Errore caricamento riepilogo:", error);
        if (attivo) setErroreRiepilogo("Il riepilogo non è disponibile. Riprova tra poco.");
      } finally {
        if (attivo) setCaricamentoRiepilogo(false);
      }
    }
    carica();
    return () => { attivo = false; };
  }, [parrocchia?.id, stanzaAperta, aggiornamento]);

  useEffect(() => {
    const aggiorna = () => setAggiornamento(n => n + 1);
    const alRientro = () => { if (!document.hidden) aggiorna(); };
    window.addEventListener("focus", aggiorna);
    document.addEventListener("visibilitychange", alRientro);
    return () => {
      window.removeEventListener("focus", aggiorna);
      document.removeEventListener("visibilitychange", alRientro);
    };
  }, []);

  const sezioniGestione = [
    {
      icona: (
        <i className="fa-solid fa-users icona-dashboard"></i>
      ),
      titolo: "Comunità",
      descrizione:
        "Fedeli iscritti, ruoli e autorizzazioni alle stanze riservate.",
      stanza: "comunita",
    },
    {
      icona: (
        <i className="fa-solid fa-thumbtack icona-dashboard"></i>
      ),
      titolo: "Bacheca Avvisi",
      descrizione:
        "Avvisi ufficiali, messaggi del parroco e informazioni pratiche rivolte alla comunità.",
      stanza: "bacheca-avvisi",
    },
    {
      icona: (
        <i className="fa-solid fa-calendar-days icona-dashboard"></i>
      ),
      titolo: "Calendari",
      descrizione:
        "Calendario della parrocchia e calendari personali dei sacerdoti.",
      stanza: "calendari",
    },
    {
      icona: (
        <i className="fa-solid fa-cross icona-dashboard"></i>
      ),
      titolo: "Sacramenti",
      descrizione:
        "Battesimi, Prime Comunioni, Cresime e Matrimoni.",
    },
    {
      icona: (
        <i className="fa-solid fa-church icona-dashboard"></i>
      ),
      titolo: "Celebrazioni",
      descrizione:
        "Orari delle Messe, solennità, celebrazioni straordinarie, confessioni e altre liturgie.",
      stanza: "celebrazioni",
    },
    {
      icona: (
        <i className="fa-solid fa-people-group icona-dashboard"></i>
      ),
      titolo: "Attività e Gruppi",
      descrizione:
        "Catechismo, GrEst, gruppi e attività della comunità parrocchiale.",
      stanza: "attivita-gruppi",
    },
    {
      icona: (
        <i className="fa-solid fa-folder-open icona-dashboard"></i>
      ),
      titolo: "Documenti",
      descrizione:
        "Archivio, modulistica, verbali e materiali utili.",
      stanza: "archivio-documenti",
    },
    {
      icona: (
        <i className="fa-solid fa-hand-holding-heart icona-dashboard"></i>
      ),
      titolo: "Progetti e Donazioni",
      descrizione:
        "Progetti, stanziamenti, raccolte fondi e donazioni online.",
      stanza: "progetti-donazioni",
    },
    {
      icona: (
        <i className="fa-solid fa-receipt icona-dashboard"></i>
      ),
      titolo: "Gestione economica",
      descrizione:
        "Entrate, uscite e saldi",
      stanza: "pagamenti",
    },
    {
      icona: (
        <i className="fa-solid fa-user-group icona-dashboard"></i>
      ),
      titolo: "Collaboratori",
      descrizione:
        "Disponibilità, ruoli e autorizzazioni dei collaboratori della parrocchia.",
      stanza: "collaboratori",
    },
    {
      icona: (
        <i className="fa-solid fa-gear icona-dashboard"></i>
      ),
      titolo: "Impostazioni",
      descrizione:
        "Dati della parrocchia, configurazioni e servizi attivi.",
    },
  ];

  if (stanzaAperta === "intenzioni") {
    return <IntenzioniMesseParroco parrocchiaId={parrocchia?.id}
      tornaCelebrazioni={() => setStanzaAperta(null)} />;
  }

  if (stanzaAperta === "notifiche") {
    return (
      <Notifiche
        parrocchiaId={parrocchia?.id}
        utenteId={utenteId}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
        onAggiornaConteggio={
          setNumeroNotificheNonLette
        }
      />
    );
  }

  if (stanzaAperta === "calendari") {
    return (
      <CalendariParroco
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "comunita") {
    return (
      <ComunitaParrocchia
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "collaboratori") {
    return (
      <CollaboratoriParrocchia
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "bacheca-avvisi") {
    return (
      <BachecaAvvisi
        parrocchia={parrocchia}
        onTorna={() => setStanzaAperta(null)}
      />
    );
  }

  if (stanzaAperta === "archivio-documenti") {
    return (
      <ArchivioDocumenti
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "celebrazioni") {
    return (
      <Celebrazioni
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "progetti-donazioni") {
    return (
      <ProgettiDonazioni
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "attivita-gruppi") {
    return (
      <AttivitaGruppiParroco
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  if (stanzaAperta === "pagamenti") {
    return (
      <PagamentiParrocchia
        parrocchiaId={parrocchia?.id}
        tornaDashboard={() =>
          setStanzaAperta(null)
        }
      />
    );
  }

  return (
    <div className="dashboard-parroco ars-dashboard-sintesi">
      <div className="dashboard-intestazione">
        <div>
          <h2>
            {parrocchia?.nome || "Area di Gestione"}
          </h2>

          <p>
            La giornata e le cose da seguire, a colpo d’occhio.
          </p>
        </div>

        <button
          type="button"
          className="pulsante-notifiche-dashboard"
          onClick={() =>
            setStanzaAperta("notifiche")
          }
          aria-label={
            "Notifiche: " +
            numeroNotificheNonLette +
            " non lette"
          }
        >
          <i className="fa-solid fa-bell"></i>

          {numeroNotificheNonLette > 0 && (
            <span className="badge-notifiche">
              {numeroNotificheNonLette > 99
                ? "99+"
                : numeroNotificheNonLette}
            </span>
          )}
        </button>
      </div>

      <style>{STILE_DASHBOARD}</style>
      <div className="ars-riepilogo-comandi">
        <p>{riepilogo?.data ? dataItaliana(riepilogo.data) : "Riepilogo della parrocchia"}</p>
        <button type="button" disabled={caricamentoRiepilogo || !parrocchia?.id}
          onClick={() => setAggiornamento(n => n + 1)}>Aggiorna</button>
      </div>
      {caricamentoRiepilogo && <p role="status">Caricamento del riepilogo…</p>}
      {erroreRiepilogo && <p role="alert" className="ars-riepilogo-errore">{erroreRiepilogo}</p>}
      {riepilogo && <RiepilogoDashboard dati={riepilogo} apri={setStanzaAperta} />}
      <h3 className="ars-titolo-sezioni">Gestione della parrocchia</h3>
      <div className="griglia-gestione">
        {sezioniGestione.map((sezione) => (
          <button
            type="button"
            className="card-gestione"
            key={sezione.titolo}
            disabled={!sezione.stanza}
            onClick={() =>
              sezione.stanza &&
              setStanzaAperta(sezione.stanza)
            }
          >
            <span className="icona-gestione">
              {sezione.icona}
            </span>

            <h3>{sezione.titolo}</h3>
            <p>{sezione.descrizione}</p>
            {!sezione.stanza && <span className="ars-dato-card">In preparazione</span>}
            {riepilogo && sezione.stanza === "celebrazioni" && <span className="ars-dato-card">{riepilogo.intenzioni_oggi} intenzioni oggi</span>}
            {riepilogo && sezione.stanza === "attivita-gruppi" && <span className="ars-dato-card">{riepilogo.attivita_pubblicate} attività pubblicate</span>}
            {riepilogo && sezione.stanza === "pagamenti" && <span className="ars-dato-card">{riepilogo.pagamenti_in_attesa} versamenti in attesa</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function dataItaliana(data) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome"
  }).format(new Date(data + "T12:00:00Z"));
}

function denaro(importo, valuta) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: valuta }).format(Number(importo));
}

function RiepilogoDashboard({ dati, apri }) {
  const mese = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric", timeZone: "Europe/Rome" })
    .format(new Date(dati.mese + "T12:00:00Z"));
  const daSeguire = [
    { numero: dati.iscrizioni_da_esaminare, testo: "Iscrizioni da esaminare", stanza: "attivita-gruppi" },
    { numero: dati.pagamenti_in_attesa, testo: "Versamenti in attesa di conferma", stanza: "pagamenti" },
    { numero: dati.intenzioni_da_regolarizzare, testo: "Intenzioni da regolarizzare", stanza: "intenzioni" },
  ];
  return <div className="ars-riepilogo-griglia">
    <section className="ars-riepilogo-pannello">
      <h3>Oggi in parrocchia</h3>
      <p className="ars-numeri-oggi">{dati.eventi_oggi} appuntamenti · {dati.intenzioni_oggi} intenzioni di Messa</p>
      <button type="button" className="ars-azione-principale" onClick={() => apri("intenzioni")}>Apri le intenzioni di Messa</button>
      {dati.appuntamenti.length === 0 ? <p>Nessun appuntamento nel calendario del parroco per oggi.</p> :
        <ul className="ars-appuntamenti">{dati.appuntamenti.map(evento => <li key={evento.id}>
          <span className="ars-orario">{evento.tutto_il_giorno ? "Tutto il giorno" :
            new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }).format(new Date(evento.data_ora_inizio))}</span>
          <div><strong>{evento.titolo}</strong>{evento.luogo && <span>{evento.luogo}</span>}</div>
        </li>)}</ul>}
      {dati.eventi_oggi > dati.appuntamenti.length && <p>Mostrati i primi {dati.appuntamenti.length} appuntamenti.</p>}
      <button type="button" className="ars-azione-secondaria" onClick={() => apri("calendari")}>Apri il calendario</button>
    </section>
    <section className="ars-riepilogo-pannello">
      <h3>Da seguire</h3>
      <div className="ars-elenco-attenzioni">{daSeguire.map(voce => <button key={voce.stanza} type="button" onClick={() => apri(voce.stanza)}>
        <span className={voce.numero > 0 ? "ars-conteggio ars-conteggio-attivo" : "ars-conteggio"}>{voce.numero}</span>
        <span>{voce.testo}</span><span aria-hidden="true">→</span>
      </button>)}</div>
      <p className="ars-nota">I versamenti in attesa sono registrazioni da confermare; le quote ancora da versare si consultano nelle attività.</p>
    </section>
    <section className="ars-riepilogo-pannello ars-pannello-economia">
      <h3>Gestione economica</h3>
      <p>Movimenti di {mese}</p>
      {dati.economia.length === 0 ? <p>Nessun incasso confermato o spesa di attività registrata nel mese.</p> :
        dati.economia.map(conto => <div className="ars-conti" key={conto.valuta}>
          <div><span>Incassi confermati · tutte le causali</span><strong>{denaro(conto.entrate, conto.valuta)}</strong></div>
          <div><span>Spese registrate delle attività</span><strong>{denaro(conto.spese_attivita, conto.valuta)}</strong></div>
        </div>)}
      <p className="ars-nota">Le spese generali e quelle per altre causali saranno incluse quando ne aggiungeremo la registrazione.</p>
      <button type="button" className="ars-azione-principale" onClick={() => apri("pagamenti")}>Apri la gestione economica</button>
    </section>
  </div>;
}

const STILE_DASHBOARD = `
.ars-dashboard-sintesi .ars-riepilogo-comandi{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 18px;flex-wrap:wrap}
.ars-dashboard-sintesi .ars-riepilogo-comandi p{margin:0;font-weight:600;text-transform:capitalize}
.ars-dashboard-sintesi .ars-riepilogo-comandi button,.ars-dashboard-sintesi .ars-azione-secondaria{border:1px solid #b9c8cb;background:white;color:#244b50;border-radius:8px;padding:9px 14px;cursor:pointer}
.ars-dashboard-sintesi button:focus-visible{outline:3px solid #c58928;outline-offset:3px}
.ars-dashboard-sintesi .ars-riepilogo-griglia{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:28px}
.ars-dashboard-sintesi .ars-riepilogo-pannello{padding:20px;border:1px solid #d8e2e2;border-radius:14px;background:#fff;color:#243c40;text-align:left;min-width:0}
.ars-dashboard-sintesi .ars-riepilogo-pannello h3{margin:0 0 12px;font-size:1.2rem;color:#244b50}
.ars-dashboard-sintesi .ars-pannello-economia{grid-column:1/-1;background:#f4f8f7}
.ars-dashboard-sintesi .ars-azione-principale{background:#285b60;color:#fff;border:0;border-radius:8px;padding:11px 15px;font:inherit;cursor:pointer;white-space:normal}
.ars-dashboard-sintesi .ars-appuntamenti{list-style:none;padding:0;margin:16px 0}
.ars-dashboard-sintesi .ars-appuntamenti li{display:flex;gap:14px;padding:11px 0;border-bottom:1px solid #edf0f0}
.ars-dashboard-sintesi .ars-appuntamenti li div{min-width:0;overflow-wrap:anywhere}
.ars-dashboard-sintesi .ars-appuntamenti li div span{display:block;font-size:.9rem;margin-top:4px;color:#526b6f}
.ars-dashboard-sintesi .ars-orario{flex-shrink:0;font-weight:600;color:#285b60}
.ars-dashboard-sintesi .ars-elenco-attenzioni{display:grid;gap:10px}
.ars-dashboard-sintesi .ars-elenco-attenzioni button{display:flex;align-items:center;gap:12px;text-align:left;padding:12px;background:#f7f9f9;border:1px solid #dee6e6;border-radius:9px;color:#243c40;font:inherit;cursor:pointer}
.ars-dashboard-sintesi .ars-elenco-attenzioni button>span:last-child{margin-left:auto}
.ars-dashboard-sintesi .ars-conteggio{min-width:32px;padding:5px;text-align:center;border-radius:7px;background:#e8efef;font-weight:700}
.ars-dashboard-sintesi .ars-conteggio-attivo{background:#fff0d8;color:#714b11}
.ars-dashboard-sintesi .ars-nota{font-size:.88rem;line-height:1.5;color:#52656a;margin:16px 0}
.ars-dashboard-sintesi .ars-conti{display:flex;flex-wrap:wrap;gap:24px;padding:12px 0}
.ars-dashboard-sintesi .ars-conti div{display:flex;flex-direction:column;gap:7px;flex:1;min-width:180px}
.ars-dashboard-sintesi .ars-conti strong{font-size:1.6rem;color:#244b50}
.ars-dashboard-sintesi .ars-titolo-sezioni{color:#244b50}
.ars-dashboard-sintesi .griglia-gestione{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
.ars-dashboard-sintesi .card-gestione{min-height:0;padding:18px;text-align:left;display:block;height:auto}
.ars-dashboard-sintesi .card-gestione h3{font-size:1.05rem;margin:10px 0 6px}
.ars-dashboard-sintesi .card-gestione p{font-size:.88rem;line-height:1.4;margin:0}
.ars-dashboard-sintesi .card-gestione .icona-dashboard{font-size:1.5rem}
.ars-dashboard-sintesi .card-gestione:disabled{opacity:.65;cursor:default}
.ars-dashboard-sintesi .ars-dato-card{display:block;margin-top:12px;color:#244b50;font-size:.85rem;font-weight:600}
.ars-dashboard-sintesi .ars-riepilogo-errore{padding:12px;background:#fff0e7;color:#793d20;border-radius:8px}
@media(max-width:700px){.ars-dashboard-sintesi .ars-riepilogo-griglia{grid-template-columns:1fr}.ars-dashboard-sintesi .ars-riepilogo-pannello{padding:16px}.ars-dashboard-sintesi .griglia-gestione{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.ars-dashboard-sintesi .card-gestione{padding:14px}}
`;
