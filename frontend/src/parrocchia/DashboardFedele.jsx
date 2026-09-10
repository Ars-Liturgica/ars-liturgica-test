import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import BachecaAvvisi from "./stanze/BachecaAvvisi/BachecaAvvisi";
import CalendarioFedele from "./stanze/Calendari/CalendarioFedele";
import NotificheFedele from "./stanze/Notifiche/NotificheFedele";

export default function DashboardFedele() {
  const [stanzaAperta, setStanzaAperta] = useState(null);
  const [numeroNotificheNonLette, setNumeroNotificheNonLette] =
    useState(0);

  const utenteId = localStorage.getItem("ars_utente_id");

  const parrocchia = {
    id: localStorage.getItem("ars_parrocchia_id"),
    nome:
      localStorage.getItem("ars_nome_parrocchia") ||
      "La tua Parrocchia",
  };

  const messaggioBenvenuto =
    localStorage.getItem("ars_messaggio_benvenuto") ||
    "Siamo lieti di accoglierti in questo spazio dedicato alla nostra comunità. Qui potrai trovare avvisi, informazioni e partecipare alla vita della Parrocchia attraverso gli spazi a tua disposizione.";

  const caricaConteggioNotifiche = useCallback(async () => {
    if (!utenteId || !parrocchia.id) {
      setNumeroNotificheNonLette(0);
      return;
    }

    const { data, error } = await supabase.rpc(
      "ars_elenco_notifiche_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchia.id,
      }
    );

    if (error) {
      console.error(
        "Errore conteggio notifiche del fedele:",
        error
      );
      setNumeroNotificheNonLette(0);
      return;
    }

    const numeroNonLette = (data || []).filter(
      (notifica) => !notifica.letta
    ).length;

    setNumeroNotificheNonLette(numeroNonLette);
  }, [utenteId, parrocchia.id]);

  useEffect(() => {
    caricaConteggioNotifiche();
  }, [caricaConteggioNotifiche, stanzaAperta]);

  if (stanzaAperta === "notifiche") {
    return (
      <NotificheFedele
        parrocchiaId={parrocchia.id}
        utenteId={utenteId}
        tornaDashboard={() => setStanzaAperta(null)}
        onAggiornaConteggio={setNumeroNotificheNonLette}
      />
    );
  }

  if (stanzaAperta === "bacheca-avvisi") {
    return (
      <BachecaAvvisi
        parrocchia={parrocchia}
        solaLettura={true}
        onTorna={() => setStanzaAperta(null)}
      />
    );
  }

  if (stanzaAperta === "calendario-parrocchia") {
    return (
      <CalendarioFedele
        parrocchia={parrocchia}
        onTorna={() => setStanzaAperta(null)}
      />
    );
  }

  const stileCard = {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e2d7ca",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 8px 24px rgba(68, 52, 35, 0.08)",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3ed",
        padding: "40px 20px",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          <button
            type="button"
            className="pulsante-notifiche-dashboard"
            onClick={() => setStanzaAperta("notifiche")}
            aria-label={`Notifiche: ${numeroNotificheNonLette} non lette`}
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

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "13px 22px",
              border: "1px solid #c99536",
              borderRadius: "12px",
              background: "#fffaf0",
              color: "#173955",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Torna alla Home
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#8a7258",
              marginBottom: "8px",
            }}
          >
            La mia Parrocchia
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: "500",
              color: "#3e3328",
            }}
          >
            {parrocchia.nome}
          </h1>
        </div>

        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#fffdf9",
            border: "1px solid #e5d9ca",
            borderRadius: "22px",
            padding: "42px 55px",
            margin: "0 auto 42px",
            textAlign: "center",
            boxShadow: "0 8px 28px rgba(68, 52, 35, 0.07)",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "1px",
              background: "#c99536",
              margin: "0 auto 22px",
            }}
          />

          <h2
            style={{
              margin: "0 0 20px",
              fontSize: "28px",
              fontWeight: "500",
              color: "#49392c",
            }}
          >
            Benvenuto nella tua Parrocchia
          </h2>

          <p
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "#66584c",
            }}
          >
            {messaggioBenvenuto}
          </p>

          <div
            style={{
              width: "46px",
              height: "1px",
              background: "#c99536",
              margin: "26px auto 20px",
            }}
          />

          <div
            style={{
              fontSize: "13px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#8a7258",
              marginBottom: "7px",
            }}
          >
            Il tuo parroco
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: "500",
              color: "#49392c",
            }}
          >
            {localStorage.getItem("ars_nome_parroco") || "Il Parroco"}
          </div>
        </div>

        <div
          style={{
            marginBottom: "18px",
            color: "#6e5d4d",
            fontSize: "15px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Gli spazi della tua comunità
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 360px))",
            gap: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => setStanzaAperta("bacheca-avvisi")}
            style={stileCard}
          >
            
            <div style={{ fontSize: "34px", marginBottom: "16px" }}>
              📌
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                fontWeight: "500",
                color: "#49392c",
              }}
            >
              Bacheca Avvisi
            </h2>

            <p
              style={{
                margin: 0,
                fontFamily: "Arial, sans-serif",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#75695e",
              }}
            >
              Consulta gli avvisi e le informazioni della tua comunità
              parrocchiale.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setStanzaAperta("calendario-parrocchia")
            }
            style={stileCard}
          >
            <div style={{ fontSize: "34px", marginBottom: "16px" }}>
              📅
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                fontWeight: "500",
                color: "#49392c",
              }}
            >
              Calendario della Parrocchia
            </h2>

            <p
              style={{
                margin: 0,
                fontFamily: "Arial, sans-serif",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#75695e",
              }}
            >
              Consulta gli orari delle Messe e gli eventi pubblici della
              tua comunità.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
