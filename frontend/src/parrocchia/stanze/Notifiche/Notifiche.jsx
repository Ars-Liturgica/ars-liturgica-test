import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function Notifiche({
  parrocchiaId,
  utenteId,
  tornaDashboard,
  onAggiornaConteggio,
  testoRitorno = "← Torna a Gestione Parrocchia",
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

    const { data, error } = await supabase
      .from("notifiche")
      .select(`
        id,
        titolo,
        messaggio,
        tipo,
        origine,
        origine_id,
        created_at,
        notifiche_letture (
          utente_id,
          letta_at
        )
      `)
      .eq("parrocchia_id", parrocchiaId)
      .eq("pubblica_comunita", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore caricamento notifiche:", error);
      setErrore("Non è stato possibile caricare le notifiche.");
      setNotifiche([]);
    } else {
      const elenco = (data || []).map((notifica) => {
        const letture = Array.isArray(notifica.notifiche_letture)
          ? notifica.notifiche_letture
          : [];

        return {
          ...notifica,
          letta: letture.some(
            (lettura) => lettura.utente_id === utenteId
          ),
        };
      });

      setNotifiche(elenco);

      if (typeof onAggiornaConteggio === "function") {
        onAggiornaConteggio(
          elenco.filter((notifica) => !notifica.letta).length
        );
      }
    }

    setCaricamento(false);
  }, [parrocchiaId, utenteId, onAggiornaConteggio]);

  useEffect(() => {
    caricaNotifiche();
  }, [caricaNotifiche]);

  async function segnaComeLetta(notificaId) {
    const notifica = notifiche.find((item) => item.id === notificaId);

    if (!notifica || notifica.letta || !utenteId) return;

    const { error } = await supabase
      .from("notifiche_letture")
      .upsert(
        {
          notifica_id: notificaId,
          utente_id: utenteId,
          letta_at: new Date().toISOString(),
        },
        {
          onConflict: "notifica_id,utente_id",
        }
      );

    if (error) {
      console.error("Errore aggiornamento notifica:", error);
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
    const nonLette = notifiche.filter((notifica) => !notifica.letta);

    if (nonLette.length === 0 || !utenteId) return;

    const lettureDaSalvare = nonLette.map((notifica) => ({
      notifica_id: notifica.id,
      utente_id: utenteId,
      letta_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("notifiche_letture")
      .upsert(lettureDaSalvare, {
        onConflict: "notifica_id,utente_id",
      });

    if (error) {
      console.error("Errore aggiornamento notifiche:", error);
      setErrore("Non è stato possibile segnare tutte le notifiche come lette.");
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
       {testoRitorno}
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
                notifica.letta ? "notifica-letta" : "notifica-non-letta"
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
