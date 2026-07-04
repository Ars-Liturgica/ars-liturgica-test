import React, { useState } from "react";

function generaCodiceAttivazione() {
  const caratteri = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const generaBlocco = () =>
    Array.from({ length: 4 }, () =>
      caratteri[Math.floor(Math.random() * caratteri.length)]
    ).join("");

  return `ARS-${generaBlocco()}-${generaBlocco()}`;
}

export default function AttivazioneParrocchia({
  idParrocchia = "PAR-000001",
  nomeParrocchia = "Parrocchia di prova",
  emailParroco = "parroco@esempio.it",
}) {
  const [codiceGenerato] = useState(generaCodiceAttivazione());
  const [codiceInserito, setCodiceInserito] = useState("");
  const [messaggio, setMessaggio] = useState("");

  

  function attivaParrocchia() {
    if (codiceInserito.trim().toUpperCase() === codiceGenerato) {
      setMessaggio(
        `Parrocchia attivata correttamente: ${nomeParrocchia}`
      );
    } else {
      setMessaggio("Codice non valido. Controlla l'email e riprova.");
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
      <h1>Attivazione della Parrocchia</h1>

      <p>
        Abbiamo inviato il codice personale di attivazione
        all'indirizzo email del parroco.
        <br /><br />
        Inseriscilo qui sotto per completare
        l'attivazione della tua Parrocchia.
      </p>

      <div
        style={{
          margin: "22px 0",
          padding: "14px",
          background: "#fff",
          border: "1px dashed #d6a23a",
          borderRadius: "10px",
          fontSize: "14px",
          color: "#5a0000",
        }}
      >
       <strong>Simulazione email:</strong>
<br />
Email parroco: {emailParroco}
<br />
ID Parrocchia: {idParrocchia}
<br />
Codice inviato: <strong>{codiceGenerato}</strong>
      </div>

      <input
        placeholder="Codice di attivazione"
        value={codiceInserito}
        onChange={(e) => setCodiceInserito(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: "10px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #d6a23a",
          fontSize: "16px",
          textAlign: "center",
        }}
      />

      <button
        onClick={attivaParrocchia}
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
        Attiva la Parrocchia
      </button>

      {messaggio && (
        <p
          style={{
            marginTop: "22px",
            fontWeight: "bold",
          }}
        >
          {messaggio}
        </p>
      )}
    </section>
  );
}

