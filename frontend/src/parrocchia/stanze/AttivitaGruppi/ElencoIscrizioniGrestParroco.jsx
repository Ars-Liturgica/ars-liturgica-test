import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const pulsante = { border: "1px solid #765c3e", borderRadius: 8, padding: "8px 12px", background: "transparent", color: "#503b28", cursor: "pointer", font: "inherit" };
const controllo = { padding: 9, borderRadius: 8, border: "1px solid #b8aa99", font: "inherit" };
const perPagina = 25;
const euro = (valore) => Number(valore || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const normalizza = (valore) => String(valore || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function ElencoIscrizioniGrestParroco({ attivita, onIndietro }) {
  const [iscrizioni, setIscrizioni] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [operazione, setOperazione] = useState(null);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [stato, setStato] = useState("tutte");
  const [pagina, setPagina] = useState(1);
  const [selezionata, setSelezionata] = useState(null);
  const [scheda, setScheda] = useState(null);
  const [caricamentoScheda, setCaricamentoScheda] = useState(false);
  const [erroreScheda, setErroreScheda] = useState("");

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

  const filtrate = useMemo(() => {
    const testo = normalizza(ricerca.trim());
    return iscrizioni.filter((voce) => {
      if (stato !== "tutte" && voce.stato !== stato) return false;
      if (!testo) return true;
      return normalizza(`${voce.nome_partecipante} ${voce.cognome_partecipante} ${voce.genitore_nome} ${voce.genitore_cognome}`).includes(testo);
    });
  }, [iscrizioni, ricerca, stato]);
  const pagine = Math.max(1, Math.ceil(filtrate.length / perPagina));
  const corrente = Math.min(pagina, pagine);
  const visibili = filtrate.slice((corrente - 1) * perPagina, corrente * perPagina);
  const dettaglio = iscrizioni.find((voce) => voce.id === selezionata);

  async function apriScheda(voce) {
    if (selezionata === voce.id) {
      setSelezionata(null);
      setScheda(null);
      return;
    }
    setSelezionata(voce.id);
    setScheda(null);
    setErroreScheda("");
    setCaricamentoScheda(true);
    const { data, error } = await supabase.rpc("ars_scheda_iscrizione_grest", {
      p_iscrizione_id: voce.id,
    });
    setCaricamentoScheda(false);
    if (error || !data?.iscrizione_id) {
      console.error("Scheda iscrizione GREST:", error || data);
      setErroreScheda("Non è stato possibile aprire la scheda.");
      return;
    }
    setScheda(data);
  }

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
    setMessaggio("Iscrizione annullata. La scheda rimane consultabile.");
    await carica();
  }

  return <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
    <button type="button" style={pulsante} onClick={onIndietro}>← Torna alle attività</button>
    <h1>Iscrizioni a {attivita.titolo}</h1>
    <p>Domande ricevute: <strong>{iscrizioni.length}</strong>. Apri il nome per consultare la scheda.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end", marginBottom: 16 }}>
      <label style={{ display: "grid", gap: 5, flex: "1 1 280px" }}>Cerca ragazzo o genitore
        <input style={controllo} type="search" value={ricerca} onChange={(e) => { setRicerca(e.target.value); setPagina(1); setSelezionata(null); }} placeholder="Nome o cognome" />
      </label>
      <label style={{ display: "grid", gap: 5 }}>Stato
        <select style={controllo} value={stato} onChange={(e) => { setStato(e.target.value); setPagina(1); setSelezionata(null); }}>
          <option value="tutte">Tutte</option>
          <option value="ricevuta">Ricevute</option>
          <option value="confermata">Confermate</option>
          <option value="lista_attesa">Lista d'attesa</option>
          <option value="annullata">Annullate</option>
          <option value="ritirata">Ritirate</option>
        </select>
      </label>
      <button type="button" style={pulsante} disabled={caricamento} onClick={carica}>Aggiorna elenco</button>
    </div>
    {caricamento && <p role="status">Caricamento iscrizioni…</p>}
    {errore && <p role="alert">{errore}</p>}
    {messaggio && <p role="status">{messaggio}</p>}
    {!caricamento && !errore && filtrate.length === 0 && <p>Nessuna iscrizione corrisponde alla ricerca.</p>}
    {!caricamento && filtrate.length > 0 && <>
      <p>Mostrate {((corrente - 1) * perPagina) + 1}–{Math.min(corrente * perPagina, filtrate.length)} di {filtrate.length}</p>
      <div role="table" aria-label="Iscrizioni GREST" style={{ color: "#173955" }}>
        <div role="row" style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) minmax(160px, 1fr)", gap: 12, borderBottom: "2px solid #b8aa99", padding: "10px 12px", fontWeight: 700 }}>
          <span role="columnheader">Ragazzo</span><span role="columnheader">Pagamenti</span>
        </div>
        {visibili.map((voce) => <div role="row" key={voce.id} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) minmax(160px, 1fr)", gap: 12, borderBottom: "1px solid #ded5c6", padding: "10px 12px", alignItems: "center" }}>
          <span role="cell"><button type="button" style={{ color: "#173955", background: "transparent", border: "none", boxShadow: "none", borderRadius: 0, padding: 0, textDecoration: "underline", textAlign: "left", cursor: "pointer", font: "inherit" }} onClick={() => apriScheda(voce)} aria-expanded={selezionata === voce.id}>{voce.nome_partecipante} {voce.cognome_partecipante}</button></span>
          <span role="cell" style={{ color: "#173955" }}>{Number(voce.importo_dovuto) === 0 ? "Gratuita" : "Pagamento non registrato"}</span>
        </div>)}
      </div>
      {pagine > 1 && <nav aria-label="Pagine delle iscrizioni" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <button type="button" style={pulsante} disabled={corrente === 1} onClick={() => { setPagina(corrente - 1); setSelezionata(null); }}>Precedente</button>
        <span>Pagina {corrente} di {pagine}</span>
        <button type="button" style={pulsante} disabled={corrente === pagine} onClick={() => { setPagina(corrente + 1); setSelezionata(null); }}>Successiva</button>
      </nav>}
    </>}
    {dettaglio && <section style={{ border: "1px solid #ded5c6", borderRadius: 12, background: "#fffdf8", padding: 20, marginTop: 20 }}>
      <h2>Scheda di {dettaglio.nome_partecipante} {dettaglio.cognome_partecipante}</h2>
      <p>Domanda: <strong>{dettaglio.stato}</strong> · Quota prevista: {euro(dettaglio.importo_dovuto)} · Pagamento: {Number(dettaglio.importo_dovuto) === 0 ? "Gratuita" : "non registrato"}</p>
      {dettaglio.data_nascita && <p>Data di nascita: {new Date(`${dettaglio.data_nascita}T12:00:00`).toLocaleDateString("it-IT")}</p>}
      <p>Genitore o tutore: {dettaglio.genitore_nome} {dettaglio.genitore_cognome}<br />
        Telefono: {dettaglio.telefono_contatto || "Non disponibile"}
        {dettaglio.email_contatto && <> · Email: {dettaglio.email_contatto}</>}
      </p>
      {caricamentoScheda && <p>Caricamento scheda…</p>}
      {erroreScheda && <p role="alert">{erroreScheda}</p>}
      {scheda && <>
        <p>Rapporto con il ragazzo: {scheda.rapporto_con_minore}<br />Taglia maglietta: {scheda.taglia_maglietta}</p>
        <p>Partecipazione autorizzata: {scheda.consensi?.partecipazione ? "Sì" : "No"} ·
          Uscita autonoma: {scheda.consensi?.uscita_autonoma ? "Sì" : "No"}</p>
        {Array.isArray(scheda.delegati_ritiro) && scheda.delegati_ritiro.length > 0 && <div>
          <strong>Persone delegate al ritiro</strong>
          <ul>{scheda.delegati_ritiro.map((persona, indice) => <li key={indice}>{persona.nome} {persona.cognome}{persona.telefono ? ` · ${persona.telefono}` : ""}</li>)}</ul>
        </div>}
      </>}
      {!["annullata", "ritirata"].includes(dettaglio.stato) && <button type="button" style={pulsante}
        disabled={Boolean(operazione)} onClick={() => annulla(dettaglio)}>
        {operazione === dettaglio.id ? "Annullamento…" : "Annulla iscrizione"}
      </button>}
    </section>}
  </section>;
}
