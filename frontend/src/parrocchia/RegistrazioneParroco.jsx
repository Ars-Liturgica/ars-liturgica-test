import React from "react";

export default function RegistrazioneParroco() {
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ color: "#0b2f55", textAlign: "center", fontSize: "34px" }}>
        Registrazione del Parroco
      </h2>

      <p style={{ textAlign: "center", fontSize: "18px", lineHeight: "1.6" }}>
        Inserisci i tuoi dati per creare lo spazio digitale della tua comunità.
      </p>

      <div style={{ marginTop: "30px" }}>
        <input placeholder="Nome *" style={campo} />
        <input placeholder="Cognome *" style={campo} />
        <input placeholder="Email *" style={campo} />
        <input placeholder="Telefono" style={campo} />
        <input placeholder="Nome utente *" style={campo} />
        <input placeholder="Password *" type="password" style={campo} />

        <button style={bottone}>
          Registra il parroco
        </button>
      </div>
    </div>
  );
}

const campo = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #d6a23a",
  fontSize: "16px",
};

const bottone = {
  width: "100%",
  padding: "15px",
  marginTop: "12px",
  background: "#0b2f55",
  color: "#fff8e8",
  border: "1px solid #d6a23a",
  borderRadius: "8px",
  fontSize: "17px",
  fontWeight: "bold",
  cursor: "pointer",
};

