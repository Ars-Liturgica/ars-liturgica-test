import React, { useState } from "react";
import { supabase } from "../../../supabaseClient";

const campo = { display: "grid", gap: 8, marginBottom: 16 };
const input = { padding: 11, border: "1px solid #b8aa99", borderRadius: 9, font: "inherit" };
const pulsante = { padding: "10px 16px", border: "1px solid #765c3e", borderRadius: 9, background: "#fffaf0", color: "#173955", cursor: "pointer", font: "inherit" };

export default function VerificaGenitoreGrest({ onVerificato, onAnnulla }) {
  const [email, setEmail] = useState("");
  const [emailInviata, setEmailInviata] = useState("");
  const [codice, setCodice] = useState("");
  const [inviato, setInviato] = useState(false);
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState("");

  async function inviaCodice(evento) {
    evento.preventDefault();
    setErrore("");
    const valore = email.trim().toLowerCase();
    setOccupato(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: valore,
      options: { shouldCreateUser: true },
    });
    setOccupato(false);
    if (error) {
      console.error("Invio codice genitore:", error);
      setErrore("Non siamo riusciti a inviare il codice. Controlla l'indirizzo email e riprova.");
      return;
    }
    setEmailInviata(valore);
    setInviato(true);
  }

  async function verificaCodice(evento) {
    evento.preventDefault();
    setErrore("");
    if (!/^\d{6}$/.test(codice.trim())) {
      setErrore("Inserisci il codice di sei cifre che hai ricevuto.");
      return;
    }
    setOccupato(true);
    const { error } = await supabase.auth.verifyOtp({
      email: emailInviata,
      token: codice.trim(),
      type: "email",
    });
    if (error) {
      setOccupato(false);
      setErrore("Il codice non è valido o è scaduto. Controllalo e riprova.");
      return;
    }

    const { data, error: erroreUtente } = await supabase.auth.getUser();
    setOccupato(false);
    const utente = data?.user;
    const corrisponde = utente?.email?.toLowerCase() === emailInviata;
    if (erroreUtente || !utente?.id || !corrisponde) {
      setErrore("Non siamo riusciti a confermare l'indirizzo email. Riprova la verifica.");
      return;
    }
    onVerificato?.({ authUserId: utente.id, canale: "email", recapito: emailInviata });
  }

  return (
    <section style={{ maxWidth: 600, padding: 24, border: "1px solid #e5d9ca", borderRadius: 16, background: "#fffdf9" }}>
      <h2>Verifica l'email del genitore</h2>
      <p>Per iscrivere un minore, riceverai un codice di verifica via email.</p>
      {!inviato ? (
        <form onSubmit={inviaCodice}>
          <label style={campo}>Indirizzo email
            <input style={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" style={pulsante} disabled={occupato}>{occupato ? "Invio…" : "Invia codice"}</button>
        </form>
      ) : (
        <form onSubmit={verificaCodice}>
          <p>Abbiamo inviato il codice a {emailInviata}.</p>
          <label style={campo}>Codice ricevuto
            <input style={input} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={codice} onChange={(e) => setCodice(e.target.value)} />
          </label>
          <button type="submit" style={pulsante} disabled={occupato}>{occupato ? "Verifica…" : "Verifica codice"}</button>{" "}
          <button type="button" style={pulsante} disabled={occupato} onClick={() => { setInviato(false); setCodice(""); setErrore(""); }}>Cambia email</button>
        </form>
      )}
      {errore && <p role="alert">{errore}</p>}
      {onAnnulla && <p><button type="button" style={pulsante} onClick={onAnnulla}>Torna all'attività</button></p>}
    </section>
  );
}
