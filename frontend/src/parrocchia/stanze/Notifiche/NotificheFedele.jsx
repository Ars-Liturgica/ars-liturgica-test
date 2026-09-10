import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function NotificheFedele({
  parrocchiaId,
  utenteId,
  tornaDashboard,
  onAggiornaConteggio,
}) {
  const [notifiche, setNotifiche] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  const caricaNotifiche = useCallback(async () => {
    if (!parrocchiaId || !utenteId) {
      setNotifiche([]);
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const { data, error } = await supabase.rpc(
      "ars_elenco_notifiche_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
      }
    );

    if (error) {
      console.error("Errore caricamento notifiche del fedele:", error);
      setErrore("Non è stato possibile caricare le notifiche.");
      setNotifiche([]);
      setCaricamento(false);
      return;
    }

    const elenco = data || [];

    setNotifiche(elenco);

    if (typeof onAggiornaConteggio === "function") {
      onAggiornaConteggio(
        elenco.filter((notifica) => !notifica.letta).length
      );
    }

    setCaricamento(false);
  }, [parrocchiaId, utenteId, onAggiornaConteggio]);

  useEffect(() => {
    caricaNotifiche();
  }, [caricaNotifiche]);

  async function segnaComeLetta(notificaId) {
    const notifica = notifiche.find((item) => item.id === notificaId);

    if (!notifica || notifica.letta || !utenteId) return;

    setErrore("");

    const { error } = await supabase.rpc(
      "ars_segna_notifica_letta_fedele",
      {
        p_utente_id: utenteId,
        p_notifica_id: notificaId,
      }
    );

    if (error) {
      console.error(
        "Errore aggiornamento notifica del fedele:",
        error
      );
      setErrore("Non è stato possibile segnare la notifica come letta.");
      return;
    }

    setNotifiche((elencoAttuale) => {
      const elencoAggiornato = elencoAttuale.map((item) =>
        item.id === notificaId ? { ...item, letta: true } : item
      );

      if (typeof onAggiornaConteggio === "function") {
        onAggiornaConteggio(
          elencoAggiornato.filter((item) => !item.letta).length
        );
      }

      return elencoAggiornato;
    });
  }

  async function segnaTutteComeLette() {
    const numeroNonLette = notifiche.filter(
      (notifica) => !notifica.letta
    ).length;

    if (
      numeroNonLette === 0 ||
      !utenteId ||
      !parrocchiaId
    ) {
      return;
    }

    setErrore("");

    const { error } = await supabase.rpc(
      "ars_segna_tutte_notifiche_lette_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
      }
    );

    if (error) {
      console.error(
        "Errore aggiornamento notifiche del fedele:",
        error
      );
      setErrore(
        "Non è stato possibile segnare tutte le notifiche come lette."
      );
      return;
    }

    setNotifiche((elencoAttuale) =>
      elencoAttuale.map((notifica) => ({
        ...notifica,
        letta: true,
      }))
    );

    if (typeof onAggiornaConteggio === "function") {
      onAggiornaConteggio(0);
    }
  }

  function formattaData(data) {
    return new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(data));
  }

  function etichettaTipo(tipo) {
    const etichette = {
      standard: "Informazione",
      pubblicazione: "Nuova pubblicazione",
      modifica: "Modifica",
      annullamento: "Annullamento",
      promemoria: "Promemoria",
    };

    return etichette[tipo] || "Informazione";
  }

  const numeroNonLette = notifiche.filter(
    (notifica) => !notifica.letta
  ).length;

  return (
    <div className="notifiche-pagina">
      <button
        type="button"
        className="pulsante-torna-dashboard"
        onClick={tornaDashboard}
      >
        ← Torna a La mia Parrocchia
      </button>

      <div className="notifiche-header">
        <div>
          <h1>Notifiche</h1>
          <p>
            Aggiornamenti, modifiche e comunicazioni della parrocchia.
          </p>
        </div>

        {numeroNonLette > 0 && (
          <button
            type="button"
            className="pulsante-segna-tutte"
            onClick={segnaTutteComeLette}
          >
            Segna tutte come lette
          </button>
        )}
      </div>

      {errore && <p className="notifiche-errore">{errore}</p>}

      {caricamento ? (
        <p>Caricamento notifiche...</p>
      ) : notifiche.length === 0 ? (
        <div className="notifiche-vuote">
          <i className="fa-regular fa-bell"></i>
          <h2>Nessuna notifica</h2>
          <p>Al momento non ci sono nuove comunicazioni.</p>
        </div>
      ) : (
        <div className="notifiche-elenco">
          {notifiche.map((notifica) => (
            <button
              type="button"
              key={notifica.id}
              className={`notifica-elemento ${
                notifica.letta
                  ? "notifica-letta"
                  : "notifica-non-letta"
              }`}
              onClick={() => segnaComeLetta(notifica.id)}
            >
              <span className="notifica-icona">
                <i
                  className={
                    notifica.letta
                      ? "fa-regular fa-bell"
                      : "fa-solid fa-bell"
                  }
                ></i>
              </span>

              <span className="notifica-contenuto">
                <span className="notifica-riga-superiore">
                  <strong>{notifica.titolo}</strong>

                  {!notifica.letta && (
                    <span className="notifica-indicatore">
                      Non letta
                    </span>
                  )}
                </span>

                <span className="notifica-tipo">
                  {etichettaTipo(notifica.tipo)}
                </span>

                <span className="notifica-messaggio">
                  {notifica.messaggio}
                </span>

                <span className="notifica-data">
                  {formattaData(notifica.created_at)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
