import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AccessoParroco({
  onAccessoCompletato,
}) {
  const [email, setEmail] = useState("");
  const [codiceOtp, setCodiceOtp] = useState("");
  const [otpInviato, setOtpInviato] = useState(false);
  const [operazioneInCorso, setOperazioneInCorso] =
    useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState(false);

  async function inviaCodice() {
    const emailPulita = email.trim().toLowerCase();

    if (!emailPulita) {
      setErrore(true);
      setMessaggio("Inserisci il tuo indirizzo email.");
      return;
    }

    setOperazioneInCorso(true);
    setMessaggio("");
    setErrore(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailPulita,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setOtpInviato(true);
      setMessaggio(
        `Il codice di accesso è stato inviato a ${emailPulita}.`
      );
    } catch (error) {
      console.error("Errore invio codice:", error);

      setErrore(true);
      setMessaggio(
        error?.message ||
          "Non è stato possibile inviare il codice."
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  async function verificaCodice() {
    const emailPulita = email.trim().toLowerCase();
    const codicePulito = codiceOtp
      .trim()
      .replace(/\s+/g, "");

    if (!codicePulito) {
      setErrore(true);
      setMessaggio("Inserisci il codice ricevuto via email.");
      return;
    }

    setOperazioneInCorso(true);
    setMessaggio("");
    setErrore(false);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailPulita,
        token: codicePulito,
        type: "email",
      });

      if (error) {
        throw error;
      }

      if (typeof onAccessoCompletato === "function") {
        await onAccessoCompletato();
      }
    } catch (error) {
      console.error("Errore verifica codice:", error);

      setErrore(true);
      setMessaggio(
        error?.message ||
          "Il codice inserito non è valido."
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "620px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          color: "#0b2f55",
          fontSize: "34px",
          marginBottom: "14px",
        }}
      >
        Accesso all’Area di Gestione
      </h2>

      <p
        style={{
          fontSize: "18px",
          lineHeight: 1.7,
          marginBottom: "28px",
        }}
      >
        Inserisci l’email associata al tuo account. Riceverai
        un codice personale per accedere alla tua parrocchia.
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        disabled={otpInviato || operazioneInCorso}
        onChange={(evento) => setEmail(evento.target.value)}
        style={campo}
      />

      {!otpInviato ? (
        <button
          type="button"
          onClick={inviaCodice}
          disabled={operazioneInCorso}
          style={bottone}
        >
          {operazioneInCorso
            ? "Invio in corso..."
            : "Invia il codice"}
        </button>
      ) : (
        <>
          <input
            inputMode="numeric"
            placeholder="Codice ricevuto via email"
            value={codiceOtp}
            onChange={(evento) =>
              setCodiceOtp(evento.target.value)
            }
            style={campo}
          />

          <button
            type="button"
            onClick={verificaCodice}
            disabled={operazioneInCorso}
            style={bottone}
          >
            {operazioneInCorso
              ? "Verifica in corso..."
              : "Verifica e accedi"}
          </button>
        </>
      )}

      {messaggio && (
        <div
          role={errore ? "alert" : "status"}
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "8px",
            background: errore ? "#fff0ef" : "#edf8f0",
            color: errore ? "#a12622" : "#1f6b3a",
            fontWeight: "bold",
          }}
        >
          {messaggio}
        </div>
      )}
    </div>
  );
}

const campo = {
  boxSizing: "border-box",
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #d6a23a",
  fontSize: "16px",
  background: "#ffffff",
};

const bottone = {
  width: "100%",
  padding: "15px",
  marginTop: "4px",
  background: "#0b2f55",
  color: "#fff8e8",
  border: "1px solid #d6a23a",
  borderRadius: "8px",
  fontSize: "17px",
  fontWeight: "bold",
  cursor: "pointer",
};
