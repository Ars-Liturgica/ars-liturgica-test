import React, { useState } from "react";
import AttivazioneParrocchia from "./AttivazioneParrocchia";
export default function RegistrazioneParroco({ onAttivazioneCompletata }) {
  const [mostraAttivazione, setMostraAttivazione] = useState(false);
  return mostraAttivazione ? (
  <AttivazioneParrocchia onAttivazioneCompletata={onAttivazioneCompletata} />
) : (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ color: "#0b2f55", textAlign: "center", fontSize: "34px" }}>
  Area Parrocchiale
</h2>

<h3 style={{ color: "#0b2f55", textAlign: "center", fontSize: "28px", marginTop: "10px" }}>
  Attivazione della Parrocchia
</h3>

<p style={{ textAlign: "center", fontSize: "18px", lineHeight: "1.7", maxWidth: "680px", margin: "0 auto 30px auto" }}>
  <strong>Benvenuto in Ars Liturgica.</strong>
  <br /><br />
  Compila il modulo per richiedere l'attivazione dello spazio digitale della tua Parrocchia.
  <br /><br />
 Dopo l'invio della richiesta, riceverai via email il tuo <strong>codice personale di attivazione</strong>, valido esclusivamente per il primo accesso e necessario per completare l'attivazione della Parrocchia.
</p>

      <div style={{ marginTop: "30px" }}>
        <input placeholder="Nome *" style={campo} />
        <input placeholder="Cognome *" style={campo} />
        <input placeholder="Email *" style={campo} />
        <input placeholder="Telefono" style={campo} />
      <input placeholder="Nome della Parrocchia *" style={campo} />
<input placeholder="Diocesi" style={campo} />
<input placeholder="Città" style={campo} />

       <button
  style={bottone}
  onClick={() => setMostraAttivazione(true)}
>
         Richiedi il codice di attivazione
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

