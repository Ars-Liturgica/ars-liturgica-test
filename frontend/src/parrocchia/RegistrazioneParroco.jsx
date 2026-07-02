import React from "react";

export default function RegistrazioneParroco() {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#fffdf7",
        border: "1px solid #d4af37",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
      }}
    >
      <h2
        style={{
          color: "#1f3a5f",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Registrazione del Parroco
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#555",
          lineHeight: "1.6",
        }}
      >
        Benvenuto nell'Area Parrocchiale di Ars Liturgica.
        <br />
        In questa sezione il parroco potrà registrare sé stesso e creare
        lo spazio digitale della propria comunità.
      </p>
    </div>
  );
}
