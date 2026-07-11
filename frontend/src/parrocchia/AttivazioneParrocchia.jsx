import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AttivazioneParrocchia({
  datiParrocchia,
  onAttivazioneCompletata,
}) {
  const [codiceInserito, setCodiceInserito] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [tipoMessaggio, setTipoMessaggio] = useState("info");
  const [invioInCorso, setInvioInCorso] = useState(false);
  const [verificaInCorso, setVerificaInCorso] = useState(false);
  const [codiceInviato, setCodiceInviato] = useState(false);
  const [attivazioneCompletata, setAttivazioneCompletata] =
    useState(false);

  const invioAutomaticoEseguito = useRef(false);

  const emailParroco = datiParrocchia?.email?.trim().toLowerCase() || "";

  function mostraMessaggio(testo, tipo = "info") {
    setMessaggio(testo);
    setTipoMessaggio(tipo);
  }

  function verificaDatiRicevuti() {
    if (!datiParrocchia) {
      mostraMessaggio(
        "I dati necessari per l'attivazione non sono disponibili.",
        "errore"
      );
      return false;
    }

    const campiObbligatori = [
      ["nome", "nome del parroco"],
      ["cognome", "cognome del parroco"],
      ["email", "email del parroco"],
      ["nomeParrocchia", "nome della parrocchia"],
      ["diocesi", "diocesi"],
      ["citta", "comune"],
      ["provincia", "provincia"],
      ["via", "indirizzo"],
      ["numeroCivico", "numero civico"],
      ["cap", "CAP"],
    ];

    const campoMancante = campiObbligatori.find(
      ([chiave]) => !String(datiParrocchia[chiave] || "").trim()
    );

    if (campoMancante) {
      mostraMessaggio(
        `Dato obbligatorio mancante: ${campoMancante[1]}.`,
        "errore"
      );
      return false;
    }

    return true;
  }

  async function inviaCodiceOtp() {
    if (!verificaDatiRicevuti()) {
      return;
    }

    if (!emailParroco) {
      mostraMessaggio(
        "L'indirizzo email del parroco non è disponibile.",
        "errore"
      );
      return;
    }

    setInvioInCorso(true);
    mostraMessaggio(
      "Invio del codice personale di attivazione in corso...",
      "info"
    );

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailParroco,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setCodiceInviato(true);

      mostraMessaggio(
        `Il codice personale di attivazione è stato inviato a ${emailParroco}.`,
        "successo"
      );
    } catch (error) {
      console.error("Errore durante l'invio del codice OTP:", error);

      mostraMessaggio(
        error?.message
          ? `Impossibile inviare il codice: ${error.message}`
          : "Impossibile inviare il codice di attivazione.",
        "errore"
      );
    } finally {
      setInvioInCorso(false);
    }
  }

  useEffect(() => {
    if (invioAutomaticoEseguito.current) {
      return;
    }

    invioAutomaticoEseguito.current = true;
    inviaCodiceOtp();
  }, []);

  async function verificaCodiceEAttivaParrocchia() {
    if (verificaInCorso || attivazioneCompletata) {
      return;
    }

    const codice = codiceInserito.trim().replace(/\s+/g, "");

    if (!codice) {
      mostraMessaggio(
        "Inserisci il codice ricevuto tramite email.",
        "errore"
      );
      return;
    }

    if (!verificaDatiRicevuti()) {
      return;
    }

    setVerificaInCorso(true);

    mostraMessaggio(
      "Verifica del codice e attivazione della parrocchia in corso...",
      "info"
    );

    try {
      const { error: erroreVerifica } = await supabase.auth.verifyOtp({
        email: emailParroco,
        token: codice,
        type: "email",
      });

      if (erroreVerifica) {
        throw erroreVerifica;
      }

      const {
        data: { user },
        error: erroreUtente,
      } = await supabase.auth.getUser();

      if (erroreUtente) {
        throw erroreUtente;
      }

      if (!user) {
        throw new Error(
          "Non è stato possibile ottenere l'utente autenticato."
        );
      }

      if (
        !user.email ||
        user.email.trim().toLowerCase() !== emailParroco
      ) {
        throw new Error(
          "L'email autenticata non coincide con quella indicata nel modulo."
        );
      }

      const {
        data: parrocchiaId,
        error: erroreAttivazione,
      } = await supabase.rpc("attiva_parrocchia", {
        p_nome: datiParrocchia.nome.trim(),
        p_cognome: datiParrocchia.cognome.trim(),
        p_email: emailParroco,
        p_telefono: datiParrocchia.telefono?.trim() || "",
        p_nome_parrocchia: datiParrocchia.nomeParrocchia.trim(),
        p_diocesi: datiParrocchia.diocesi.trim(),
        p_comune: datiParrocchia.citta.trim(),
        p_provincia: datiParrocchia.provincia.trim(),
        p_cap: datiParrocchia.cap.trim(),
        p_via: datiParrocchia.via.trim(),
        p_numero_civico: datiParrocchia.numeroCivico.trim(),
        p_telefono_parrocchia:
          datiParrocchia.telefonoParrocchia?.trim() || "",
        p_email_parrocchia:
          datiParrocchia.emailParrocchia?.trim().toLowerCase() || "",
        p_sito_web: datiParrocchia.sitoWeb?.trim() || "",
      });

      if (erroreAttivazione) {
        throw erroreAttivazione;
      }

      if (!parrocchiaId) {
        throw new Error(
          "La procedura non ha restituito l'identificativo della parrocchia."
        );
      }

      setAttivazioneCompletata(true);

      mostraMessaggio(
        `La Parrocchia ${datiParrocchia.nomeParrocchia} è stata attivata correttamente.`,
        "successo"
      );

      if (typeof onAttivazioneCompletata === "function") {
        onAttivazioneCompletata(parrocchiaId);
      }
    } catch (error) {
      console.error(
        "Errore durante l'attivazione della parrocchia:",
        error
      );

      mostraMessaggio(
        error?.message
          ? `Attivazione non completata: ${error.message}`
          : "Non è stato possibile completare l'attivazione.",
        "errore"
      );
    } finally {
      setVerificaInCorso(false);
    }
  }

  function gestisciInvioDaTastiera(event) {
    if (event.key === "Enter") {
      verificaCodiceEAttivaParrocchia();
    }
  }

  const coloreMessaggio =
    tipoMessaggio === "successo"
      ? "#1f6b3a"
      : tipoMessaggio === "errore"
        ? "#a12622"
        : "#5a0000";

  const sfondoMessaggio =
    tipoMessaggio === "successo"
      ? "#edf8f0"
      : tipoMessaggio === "errore"
        ? "#fff0ef"
        : "#fff8ea";

  return (
    <section
      style={{
        maxWidth: "760px",
        margin: "40px auto",
        padding: "34px",
        textAlign: "center",
        background: "#fff8ea",
        border: "2px solid #d6a23a",
        borderRadius: "18px",
        color: "#5a0000",
        boxShadow: "0 8px 22px rgba(90, 50, 0, 0.25)",
      }}
    >
      <h1 style={{ marginTop: 0 }}>
        Attivazione della Parrocchia
      </h1>

      <p style={{ lineHeight: 1.7 }}>
        Abbiamo inviato il codice personale di attivazione
        all’indirizzo email:
        <br />
        <strong>{emailParroco || "email non disponibile"}</strong>
        <br />
        <br />
        Inseriscilo qui sotto per verificare l’account e completare
        l’attivazione reale della tua Parrocchia.
      </p>

      <div
        style={{
          margin: "22px 0",
          padding: "16px",
          background: "#ffffff",
          border: "1px solid #d6a23a",
          borderRadius: "10px",
          textAlign: "left",
          lineHeight: 1.7,
        }}
      >
        <strong>Dati della Parrocchia</strong>
        <br />
        {datiParrocchia?.nomeParrocchia || "Nome non disponibile"}
        <br />
        {datiParrocchia?.via || ""}
        {datiParrocchia?.numeroCivico
          ? `, ${datiParrocchia.numeroCivico}`
          : ""}
        <br />
        {datiParrocchia?.cap || ""}{" "}
        {datiParrocchia?.citta || ""}{" "}
        {datiParrocchia?.provincia
          ? `(${datiParrocchia.provincia})`
          : ""}
        <br />
        Diocesi di {datiParrocchia?.diocesi || ""}
      </div>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Codice ricevuto via email"
        value={codiceInserito}
        onChange={(event) => setCodiceInserito(event.target.value)}
        onKeyDown={gestisciInvioDaTastiera}
        disabled={verificaInCorso || attivazioneCompletata}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "14px",
          marginTop: "10px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #d6a23a",
          fontSize: "18px",
          textAlign: "center",
          letterSpacing: "3px",
          background: attivazioneCompletata ? "#f2f2f2" : "#ffffff",
        }}
      />

      <button
        type="button"
        onClick={verificaCodiceEAttivaParrocchia}
        disabled={
          verificaInCorso ||
          invioInCorso ||
          attivazioneCompletata ||
          !codiceInviato
        }
        style={{
          width: "100%",
          padding: "15px",
          background:
            verificaInCorso || attivazioneCompletata
              ? "#8a8a8a"
              : "#0b2f55",
          color: "#fff8e8",
          border: "1px solid #d6a23a",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          cursor:
            verificaInCorso || attivazioneCompletata
              ? "not-allowed"
              : "pointer",
        }}
      >
        {attivazioneCompletata
          ? "Parrocchia attivata"
          : verificaInCorso
            ? "Attivazione in corso..."
            : "Verifica e attiva la Parrocchia"}
      </button>

      {!attivazioneCompletata && (
        <button
          type="button"
          onClick={inviaCodiceOtp}
          disabled={invioInCorso || verificaInCorso}
          style={{
            marginTop: "14px",
            padding: "10px 18px",
            background: "transparent",
            color: "#0b2f55",
            border: "none",
            fontSize: "15px",
            fontWeight: "bold",
            textDecoration: "underline",
            cursor:
              invioInCorso || verificaInCorso
                ? "not-allowed"
                : "pointer",
          }}
        >
          {invioInCorso
            ? "Invio in corso..."
            : "Invia nuovamente il codice"}
        </button>
      )}

      {messaggio && (
        <div
          role={tipoMessaggio === "errore" ? "alert" : "status"}
          style={{
            marginTop: "22px",
            padding: "14px",
            borderRadius: "10px",
            background: sfondoMessaggio,
            color: coloreMessaggio,
            border: `1px solid ${coloreMessaggio}`,
            fontWeight: "bold",
            lineHeight: 1.5,
          }}
        >
          {messaggio}
        </div>
      )}
    </section>
  );
}
