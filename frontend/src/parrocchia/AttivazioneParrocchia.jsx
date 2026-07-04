import React from "react";
export default function AttivazioneParrocchia() {
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
  Abbiamo inviato il tuo codice personale di attivazione
  all'indirizzo email indicato.
  <br /><br />
  Inseriscilo qui sotto per completare
  l'attivazione della tua Parrocchia.
</p>
      <input
  placeholder="Codice di attivazione"
  style={{
    width: "100%",
    padding: "14px",
    marginTop: "24px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #d6a23a",
    fontSize: "16px"
  }}
/>

<button
  style={{
    width: "100%",
    padding: "15px",
    background: "#0b2f55",
    color: "#fff8e8",
    border: "1px solid #d6a23a",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer"
  }}
>
  Attiva la Parrocchia
</button>
    </section>
  );
}
