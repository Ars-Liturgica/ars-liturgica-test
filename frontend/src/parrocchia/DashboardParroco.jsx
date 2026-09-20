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
import Notifiche from "./stanze/Notifiche/Notifiche";
import CollaboratoriParrocchia from "./stanze/Collaboratori/CollaboratoriParrocchia";
import ProgettiDonazioni from "./stanze/ProgettiDonazioni/ProgettiDonazioni";
import PagamentiParrocchia from "./stanze/PagamentiParrocchia/PagamentiParrocchia";

export default function DashboardParroco({
  onCambioVista,
}) {
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
      titolo: "Pagamenti",
      descrizione:
        "Registro generale degli incassi, quote delle attività e posizioni da saldare.",
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
    <div className="dashboard-parroco">
      <div className="dashboard-intestazione">
        <div>
          <h2>
            {parrocchia?.nome || "Area di Gestione"}
          </h2>

          <p>
            Strumenti riservati alla gestione della
            parrocchia.
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

      <div className="griglia-gestione">
        {sezioniGestione.map((sezione) => (
          <button
            type="button"
            className="card-gestione"
            key={sezione.titolo}
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
          </button>
        ))}
      </div>
    </div>
  );
}
