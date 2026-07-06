import React, { useState } from "react";

export default function RegistrazioneParrocchia({ onRichiediAttivazione }) {
  const [nomeParrocchia, setNomeParrocchia] = useState("");
  const [diocesi, setDiocesi] = useState("");
  const [citta, setCitta] = useState("");
  const [via, setVia] = useState("");
const [numeroCivico, setNumeroCivico] = useState("");
const [cap, setCap] = useState("");
  const [emailParroco, setEmailParroco] = useState("");
  const [messaggio, setMessaggio] = useState("");

  function generaIdParrocchia() {
    return `PAR-${Date.now()}`;
  }

  function richiediAttivazione() {
    if (!nomeParrocchia.trim() || !emailParroco.trim()) {
      setMessaggio("Inserisci almeno il nome della parrocchia e l'email del parroco.");
      return;
    }

    const datiParrocchia = {
      idParrocchia: generaIdParrocchia(),
      nomeParrocchia: nomeParrocchia.trim(),
      via: via.trim(),
numeroCivico: numeroCivico.trim(),
cap: cap.trim(),
      diocesi: diocesi.trim(),
      citta: citta.trim(),
      emailParroco: emailParroco.trim(),
      stato: "in_attivazione",
    };

    if (onRichiediAttivazione) {
      onRichiediAttivazione(datiParrocchia);
    }
  }

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
      <h1>Richiesta di Attivazione della Parrocchia</h1>

      <input
        placeholder="Nome della Parrocchia *"
        value={nomeParrocchia}
        onChange={(e) => setNomeParrocchia(e.target.value)}
        style={stileInput}
      />

      <input
        placeholder="Diocesi"
        value={diocesi}
        onChange={(e) => setDiocesi(e.target.value)}
        style={stileInput}
      />

      <input
        placeholder="Città"
        value={citta}
        onChange={(e) => setCitta(e.target.value)}
        style={stileInput}
      />
<input
  placeholder="Via / Piazza *"
  value={via}
  onChange={(e) => setVia(e.target.value)}
  style={stileInput}
/>

<input
  placeholder="Numero civico *"
  value={numeroCivico}
  onChange={(e) => setNumeroCivico(e.target.value)}
  style={stileInput}
/>

<input
  placeholder="CAP *"
  value={cap}
  onChange={(e) => setCap(e.target.value)}
  style={stileInput}
/>
      <input
        placeholder="Email del parroco *"
        value={emailParroco}
        onChange={(e) => setEmailParroco(e.target.value)}
        style={stileInput}
      />

      <button
        onClick={richiediAttivazione}
        style={{
          width: "100%",
          padding: "15px",
          background: "#0b2f55",
          color: "#fff8e8",
          border: "1px solid #d6a23a",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Richiedi il codice di attivazione
      </button>

      {messaggio && (
        <p
          style={{
            marginTop: "18px",
            fontWeight: "bold",
          }}
        >
          {messaggio}
        </p>
      )}
    </section>
  );
}

const stileInput = {
  width: "100%",
  padding: "14px",
  marginTop: "14px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #d6a23a",
  fontSize: "16px",
};

