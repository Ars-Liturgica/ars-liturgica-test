import React, { useState } from "react";

export default function RegistrazioneParrocchia({ onRichiediAttivazione }) {
  const [nomeParrocchia, setNomeParrocchia] = useState("");
  const [emailParroco, setEmailParroco] = useState("");

  function generaIdParrocchia() {
    return `PAR-${Date.now()}`;
  }

  function richiediAttivazione() {
    const datiParrocchia = {
      idParrocchia: generaIdParrocchia(),
      nomeParrocchia,
      emailParroco,
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
        placeholder="Nome della parrocchia"
        value={nomeParrocchia}
        onChange={(e) => setNomeParrocchia(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: "20px",
          marginBottom: "14px",
          borderRadius: "8px",
          border: "1px solid #d6a23a",
          fontSize: "16px",
        }}
      />

      <input
        placeholder="Email del parroco"
        value={emailParroco}
        onChange={(e) => setEmailParroco(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "18px",
          borderRadius: "8px",
          border: "1px solid #d6a23a",
          fontSize: "16px",
        }}
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
    </section>
  );
}
