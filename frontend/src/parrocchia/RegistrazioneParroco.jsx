import React, { useState } from "react";
import AttivazioneParrocchia from "./AttivazioneParrocchia";

export default function RegistrazioneParroco({ onAttivazioneCompletata }) {
  const [mostraAttivazione, setMostraAttivazione] = useState(false);
  const [datiParrocchia, setDatiParrocchia] = useState(null);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nomeParrocchia, setNomeParrocchia] = useState("");
  const [diocesi, setDiocesi] = useState("");
  const [citta, setCitta] = useState("");
const [provincia, setProvincia] = useState("");
const [via, setVia] = useState("");
const [numeroCivico, setNumeroCivico] = useState("");
const [cap, setCap] = useState("");
const [telefonoParrocchia, setTelefonoParrocchia] = useState("");
const [emailParrocchia, setEmailParrocchia] = useState("");
const [sitoWeb, setSitoWeb] = useState("");
 function richiediCodiceAttivazione() {
  if (
    !nome.trim() ||
    !cognome.trim() ||
    !email.trim() ||
    !nomeParrocchia.trim() ||
    !diocesi.trim() ||
    !citta.trim() ||
    !provincia.trim() ||
    !via.trim() ||
    !numeroCivico.trim() ||
    !cap.trim()
  ) {
    alert("Compila tutti i campi obbligatori.");
    return;
  }

  setDatiParrocchia({
    nome: nome.trim(),
    cognome: cognome.trim(),
    email: email.trim(),
    telefono: telefono.trim(),

    nomeParrocchia: nomeParrocchia.trim(),
    diocesi: diocesi.trim(),
    citta: citta.trim(),
    provincia: provincia.trim(),
    via: via.trim(),
    numeroCivico: numeroCivico.trim(),
    cap: cap.trim(),

    telefonoParrocchia: telefonoParrocchia.trim(),
    emailParrocchia: emailParrocchia.trim(),
    sitoWeb: sitoWeb.trim(),
  });

  setMostraAttivazione(true);
}
  if (mostraAttivazione && datiParrocchia) {
    return (
      <AttivazioneParrocchia
  datiParrocchia={datiParrocchia}
  onAttivazioneCompletata={onAttivazioneCompletata}
/>
    );
  }

  return (
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
        Dopo l'invio della richiesta, riceverai via email il tuo <strong>codice personale di attivazione</strong>.
      </p>

      <div style={{ marginTop: "30px" }}>
        <input placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} style={campo} />
        <input placeholder="Cognome *" value={cognome} onChange={(e) => setCognome(e.target.value)} style={campo} />
        <input placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} style={campo} />
        <input placeholder="Telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={campo} />
        <input placeholder="Nome della Parrocchia *" value={nomeParrocchia} onChange={(e) => setNomeParrocchia(e.target.value)} style={campo} />
        <input placeholder="Diocesi" value={diocesi} onChange={(e) => setDiocesi(e.target.value)} style={campo} />
        <input placeholder="Città" value={citta} onChange={(e) => setCitta(e.target.value)} style={campo} />
<input placeholder="Provincia *" value={provincia} onChange={(e) => setProvincia(e.target.value)} style={campo} />
<input placeholder="Via / Piazza *" value={via} onChange={(e) => setVia(e.target.value)} style={campo} />
<input placeholder="Numero civico *" value={numeroCivico} onChange={(e) => setNumeroCivico(e.target.value)} style={campo} />
<input placeholder="CAP *" value={cap} onChange={(e) => setCap(e.target.value)} style={campo} />
<input placeholder="Telefono della Parrocchia" value={telefonoParrocchia} onChange={(e) => setTelefonoParrocchia(e.target.value)} style={campo} />
<input placeholder="Email della Parrocchia" value={emailParrocchia} onChange={(e) => setEmailParrocchia(e.target.value)} style={campo} />
<input placeholder="Sito Web" value={sitoWeb} onChange={(e) => setSitoWeb(e.target.value)} style={campo} />
        <button style={bottone} onClick={richiediCodiceAttivazione}>
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
