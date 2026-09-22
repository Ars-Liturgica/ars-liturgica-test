import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const pulsante = { border: "1px solid #765c3e", borderRadius: 8, padding: "9px 14px", background: "transparent", color: "#503b28", cursor: "pointer" };
const card = { border: "1px solid #ded5c6", borderRadius: 14, padding: 18, background: "#fffdf8", marginBottom: 12 };

export default function ElencoIscrizioniGrestParroco({ attivita, onIndietro }) {
  const [iscrizioni, setIscrizioni] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [operazione, setOperazione] = useState(null);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const carica = useCallback(async () => {
    setCaricamento(true);
    setErrore("");
    const { data, error } = await supabase.rpc("ars_elenco_iscrizioni_grest_parroco", {
      p_attivita_id: attivita.id,
    });
    setCaricamento(false);
    if (error || !Array.isArray(data)) {
      console.error("Elenco iscrizioni GREST:", error || data);
      setErrore("Non è stato possibile caricare le iscrizioni.");
      return;
    }
    setIscrizioni(data);
  }, [attivita.id]);

  useEffect(() => { carica(); }, [carica]);

  async function annulla(voce) {
    if (!window.confirm(`Annullare l'iscrizione di ${voce.nome_partecipante} ${voce.cognome_partecipante}?`)) return;
    setOperazione(voce.id);
    setErrore("");
    setMessaggio("");
    const { data, error } = await supabase.rpc("ars_annulla_iscrizione_grest_parroco", {
      p_iscrizione_id: voce.id,
    });
    setOperazione(null);
    if (error || data?.stato !== "annullata") {
      console.error("Annullamento iscrizione GREST:", error || data);
      setErrore("Non è stato possibile annullare l'iscrizione.");
      return;
    }
    setMessaggio("Iscrizione annullata. I dati restano conservati nella scheda riservata.");
    await carica();
  }

  return <section style={{ maxWidth: 950, margin: "0 auto", padding: "24px 16px" }}>
    <button type="button" style={pulsante} onClick={onIndietro}>← Torna alle attività</button>
    <h1>Iscrizioni a {attivita.titolo}</h1>
    <p>Le domande ricevute sono visibili alla parrocchia. Lo stato economico e gli incassi saranno gestiti separatamente.</p>
    <button type="button" style={pulsante} disabled={caricamento} onClick={carica}>Aggiorna elenco</button>
    {caricamento && <p role="status">Caricamento iscrizioni…</p>}
    {errore && <p role="alert">{errore}</p>}
    {messaggio && <p role="status">{messaggio}</p>}
    {!caricamento && !errore && iscrizioni.length === 0 && <p>Non ci sono ancora iscrizioni.</p>}
    {!caricamento && iscrizioni.map((voce) => <article key={voce.id} style={card}>
      <h2 style={{ marginTop: 0 }}>{voce.nome_partecipante} {voce.cognome_partecipante}</h2>
      <p>Domanda: <strong>{voce.stato}</strong> · Quota prevista: {Number(voce.importo_dovuto).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</p>
      <p>Genitore o tutore: {voce.genitore_nome} {voce.genitore_cognome}<br />
        Telefono: {voce.telefono_contatto || "Non disponibile"}
        {voce.email_contatto && <> · Email: {voce.email_contatto}</>}
      </p>
      {!["annullata", "ritirata"].includes(voce.stato) && <button type="button" style={pulsante}
        disabled={Boolean(operazione)} onClick={() => annulla(voce)}>
        {operazione === voce.id ? "Annullamento…" : "Annulla iscrizione"}
      </button>}
    </article>)}
  </section>;
}
