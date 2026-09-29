import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const campo = { display: "grid", gap: 6, marginBottom: 16 };
const input = { width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #b8aa99", borderRadius: 8, font: "inherit" };
const pulsante = { padding: "10px 16px", border: "1px solid #765c3e", borderRadius: 9, background: "#fffaf0", color: "#173955", cursor: "pointer", font: "inherit" };

function euro(valore, valuta = "EUR") {
  const importo = Number(valore);
  return Number.isFinite(importo)
    ? importo.toLocaleString("it-IT", { style: "currency", currency: valuta })
    : "Importo da confermare";
}

function linkSicuro(valore) {
  try {
    const url = new URL(valore);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const nomiMetodi = {
  bonifico: "Bonifico bancario", paypal: "PayPal",
  link_pagamento: "Pagamento online", consegna_diretta: "Pagamento in parrocchia",
};

export default function IscrizioneGrestFedele({ attivita, onIndietro }) {
  const informativa = attivita.configurazione_modulo?.informativa_privacy_testo?.trim() || "";
  const [presaVisione, setPresaVisione] = useState(null);
  const [confermaLettura, setConfermaLettura] = useState(false);
  const [genitore, setGenitore] = useState({ nome: "", cognome: "", rapporto: "", telefono: "", email: "" });
  const [ragazzo, setRagazzo] = useState({ nome: "", cognome: "", data_nascita: "" });
  const [delegato, setDelegato] = useState({ nome: "", cognome: "", telefono: "" });
  const [taglia, setTaglia] = useState("");
  const [salute, setSalute] = useState({ assume_farmaci_quotidiani: false, medicinali: "", patologie: "", intolleranze_alimentari: "", altre_indicazioni: "" });
  const [consensi, setConsensi] = useState({ partecipazione: false, responsabilita_genitoriale: false, uscita_autonoma: false });
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState("");
  const [ricevuta, setRicevuta] = useState(null);
  const [metodiIncasso, setMetodiIncasso] = useState([]);
  const [caricamentoMetodi, setCaricamentoMetodi] = useState(false);
  const [erroreMetodi, setErroreMetodi] = useState("");
  const contributoLibero = attivita.modello_quota === "contributo_libero";
  const mostraMetodi = ricevuta && (Number(ricevuta.importo_dovuto) > 0 || contributoLibero);

  useEffect(() => {
    if (!mostraMetodi) return;
    const parrocchiaId = ricevuta.parrocchia_id || attivita.parrocchia_id;
    if (!parrocchiaId) {
      setErroreMetodi("Non riesco a leggere i metodi di pagamento. Contatta la parrocchia per le istruzioni.");
      return;
    }
    let attivo = true;
    setCaricamentoMetodi(true);
    setErroreMetodi("");
    supabase.rpc("ars_elenco_metodi_incasso_pubblici", { p_parrocchia_id: parrocchiaId })
      .then(({ data, error }) => {
        if (!attivo) return;
        if (error || !Array.isArray(data)) {
          console.error("Caricamento metodi incasso:", error || data);
          setErroreMetodi("Non riesco a leggere i metodi di pagamento. Contatta la parrocchia per le istruzioni.");
        } else {
          setMetodiIncasso(data);
        }
      })
      .catch((error) => {
        if (!attivo) return;
        console.error("Caricamento metodi incasso:", error);
        setErroreMetodi("Non riesco a leggere i metodi di pagamento. Contatta la parrocchia per le istruzioni.");
      })
      .finally(() => { if (attivo) setCaricamentoMetodi(false); });
    return () => { attivo = false; };
  }, [ricevuta, attivita.parrocchia_id, mostraMetodi]);

  async function invia(evento) {
    evento.preventDefault();
    setErrore("");
    if (!informativa || !presaVisione) {
      setErrore("Leggi l’informativa della parrocchia prima di proseguire.");
      return;
    }
    if (salute.assume_farmaci_quotidiani && !salute.medicinali.trim()) {
      setErrore("Indica quali medicinali vengono assunti ogni giorno.");
      return;
    }
    if ((delegato.nome.trim() && !delegato.cognome.trim()) || (!delegato.nome.trim() && delegato.cognome.trim())) {
      setErrore("Inserisci nome e cognome della persona delegata al ritiro.");
      return;
    }
    if (!genitore.telefono.trim()) {
      setErrore("Inserisci un telefono al quale la parrocchia possa contattarti.");
      return;
    }
    setOccupato(true);
    const { data, error } = await supabase.rpc("ars_iscrivi_grest", {
      p_attivita_id: attivita.id,
      p_scheda: {
        genitore: { ...genitore, telefono: genitore.telefono.trim(), email: genitore.email.trim() || null },
        ragazzo, taglia_maglietta: taglia,
        delegati_ritiro: delegato.nome.trim() ? [delegato] : [],
        salute,
        consensi: { ...consensi, informativa_privacy_presa_visione: true, informativa_privacy_versione: attivita.versione_modulo },
      },
    });
    setOccupato(false);
    if (error) {
      console.error("Invio iscrizione GREST:", error);
      setErrore(error.message?.toLowerCase().includes("duplicat") || error.code === "23505"
        ? "Per questo ragazzo risulta già una domanda di iscrizione al GREST. Contatta la parrocchia se devi correggerla."
        : error.message?.toLowerCase().includes("informativa")
          ? "L’informativa è stata aggiornata. Torna alle attività e riapri l’iscrizione per leggerla."
          : "Non siamo riusciti a inviare l'iscrizione. Controlla i dati e riprova.");
      return;
    }
    setRicevuta(data);
  }

  function campoTesto(etichetta, valore, onChange, props = {}) {
    return <label style={campo}>{etichetta}<input style={input} value={valore} onChange={(e) => onChange(e.target.value)} {...props} /></label>;
  }
  function campoArea(etichetta, chiave) {
    return <label style={campo}>{etichetta}<textarea style={input} rows={2} maxLength={2000} value={salute[chiave]} onChange={(e) => setSalute({ ...salute, [chiave]: e.target.value })} /></label>;
  }
  function spunta(etichetta, chiave, obbligatoria = false) {
    return <label style={{ display: "flex", gap: 9, marginBottom: 16, alignItems: "flex-start" }}>
      <input type="checkbox" checked={consensi[chiave]} required={obbligatoria} onChange={(e) => setConsensi({ ...consensi, [chiave]: e.target.checked })} />{etichetta}
    </label>;
  }

  if (!ricevuta && !presaVisione) return <section style={{ maxWidth: 760 }}>
    <button type="button" style={pulsante} onClick={onIndietro}>← Torna alle attività</button>
    <h1>Iscrizione a {attivita.titolo}</h1>
    {informativa ? <>
      <h2>Informativa privacy</h2>
      <p>Leggi l’informativa della parrocchia prima di compilare la domanda.</p>
      <div style={{ ...input, whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto", marginBottom: 16 }}>{informativa}</div>
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 16 }}>
        <input type="checkbox" checked={confermaLettura} onChange={(e) => setConfermaLettura(e.target.checked)} /> Ho letto l’informativa per questa attività.
      </label>
      <button type="button" style={pulsante} onClick={() => {
        if (!confermaLettura) {
          setErrore("Conferma di aver letto l’informativa per proseguire.");
          return;
        }
        setErrore("");
        setPresaVisione(new Date().toISOString());
      }}>Continua con l’iscrizione</button>
    </> : <p role="alert">La parrocchia deve aggiungere l’informativa privacy prima di aprire le iscrizioni online.</p>}
    {errore && <p role="alert">{errore}</p>}
  </section>;

  return <section style={{ maxWidth: 760 }}>
    <button type="button" style={pulsante} onClick={onIndietro}>← Torna alle attività</button>
    <h1>Iscrizione a {attivita.titolo}</h1>
    {!ricevuta && <p>{attivita.modello_quota === "quota_fissa" ? `Quota prevista: ${euro(attivita.importo_quota, attivita.valuta || "EUR")}.` : "La quota sarà confermata dalla parrocchia."} L'importo definitivo viene calcolato al momento dell'invio.</p>}
    {ricevuta ? <div role="status">
      <h2>Iscrizione ricevuta</h2>
      <p>La parrocchia ha ricevuto la richiesta per {ragazzo.nome} {ragazzo.cognome}. Potrà confermarla dopo il pagamento o secondo le decisioni del parroco.</p>
      <p>{contributoLibero ? "Contributo libero: scegli tu l'importo." : <>Quota dovuta: <strong>{euro(ricevuta.importo_dovuto, ricevuta.valuta || "EUR")}</strong>.</>}</p>
      {mostraMetodi ? <>
        <h3>{contributoLibero ? "Come lasciare un contributo" : "Come pagare"}</h3>
        {caricamentoMetodi && <p>Caricamento dei metodi di pagamento…</p>}
        {erroreMetodi && <p role="alert">{erroreMetodi}</p>}
        {!caricamentoMetodi && !erroreMetodi && metodiIncasso.length === 0 &&
          <p>La parrocchia non ha ancora indicato un metodo di pagamento. Contattala per le istruzioni.</p>}
        {metodiIncasso.map((metodo) => {
          const url = linkSicuro(metodo.link_pagamento);
          return <div key={metodo.id} style={{ border: "1px solid #ded5c6", borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <h4 style={{ margin: "0 0 8px" }}>{metodo.titolo || nomiMetodi[metodo.tipo] || "Metodo di pagamento"}</h4>
            {metodo.intestatario && <p>Intestatario: {metodo.intestatario}</p>}
            {metodo.iban && <p>IBAN: <strong style={{ overflowWrap: "anywhere" }}>{metodo.iban}</strong></p>}
            {metodo.bic_swift && <p>BIC/SWIFT: {metodo.bic_swift}</p>}
            {metodo.email_paypal && <p>Email PayPal: {metodo.email_paypal}</p>}
            {url && <p><a href={url} target="_blank" rel="noopener noreferrer">Apri il link di pagamento</a></p>}
            {metodo.istruzioni && <p style={{ whiteSpace: "pre-wrap" }}>{metodo.istruzioni}</p>}
          </div>;
        })}
        {metodiIncasso.length > 0 && <p>Per bonifici, PayPal e pagamenti in parrocchia, comunica il nome del ragazzo e l'attività. La parrocchia registrerà il versamento e aggiornerà lo stato della quota.</p>}
      </> : <p>Nessun pagamento richiesto per questa iscrizione.</p>}
    </div> : <form onSubmit={invia}>
      <h2>Genitore o tutore</h2>
      {campoTesto("Nome", genitore.nome, (v) => setGenitore({ ...genitore, nome: v }), { required: true, maxLength: 100 })}
      {campoTesto("Cognome", genitore.cognome, (v) => setGenitore({ ...genitore, cognome: v }), { required: true, maxLength: 100 })}
      {campoTesto("Rapporto con il ragazzo", genitore.rapporto, (v) => setGenitore({ ...genitore, rapporto: v }), { required: true, maxLength: 100, placeholder: "Es. madre, padre, tutore" })}
      {campoTesto("Telefono di contatto", genitore.telefono, (v) => setGenitore({ ...genitore, telefono: v }), { type: "tel", required: true, maxLength: 30, autoComplete: "tel" })}
      {campoTesto("Email (facoltativa)", genitore.email, (v) => setGenitore({ ...genitore, email: v }), { type: "email", maxLength: 254, autoComplete: "email" })}
      <h2>Ragazzo</h2>
      {campoTesto("Nome", ragazzo.nome, (v) => setRagazzo({ ...ragazzo, nome: v }), { required: true, maxLength: 100 })}
      {campoTesto("Cognome", ragazzo.cognome, (v) => setRagazzo({ ...ragazzo, cognome: v }), { required: true, maxLength: 100 })}
      {campoTesto("Data di nascita", ragazzo.data_nascita, (v) => setRagazzo({ ...ragazzo, data_nascita: v }), { type: "date", required: true, max: new Date().toISOString().slice(0, 10) })}
      <label style={campo}>Taglia maglietta<select style={input} required value={taglia} onChange={(e) => setTaglia(e.target.value)}>
        <option value="">Scegli una taglia</option>
        {["4 anni", "6 anni", "8 anni", "10 anni", "12 anni", "14 anni", "XS", "S", "M", "L", "XL"].map((v) => <option key={v}>{v}</option>)}
      </select></label>
      <h2>Ritiro a fine giornata</h2>
      <p>Indica una persona delegata oltre al genitore o tutore, se necessario. La parrocchia verificherà l'identità al ritiro.</p>
      {campoTesto("Nome persona delegata", delegato.nome, (v) => setDelegato({ ...delegato, nome: v }), { maxLength: 100 })}
      {campoTesto("Cognome persona delegata", delegato.cognome, (v) => setDelegato({ ...delegato, cognome: v }), { maxLength: 100 })}
      {campoTesto("Telefono persona delegata", delegato.telefono, (v) => setDelegato({ ...delegato, telefono: v }), { type: "tel", maxLength: 30 })}
      <h2>Informazioni per l'assistenza</h2>
      <p>Queste informazioni saranno accessibili solo ai responsabili autorizzati della parrocchia.</p>
      <label style={campo}><span><input type="checkbox" checked={salute.assume_farmaci_quotidiani} onChange={(e) => setSalute({ ...salute, assume_farmaci_quotidiani: e.target.checked })} /> Il ragazzo assume medicinali ogni giorno</span></label>
      {salute.assume_farmaci_quotidiani && campoArea("Quali medicinali e indicazioni utili", "medicinali")}
      {campoArea("Patologie particolari (se presenti)", "patologie")}
      {campoArea("Intolleranze alimentari (se presenti)", "intolleranze_alimentari")}
      {campoArea("Altre indicazioni utili (se presenti)", "altre_indicazioni")}
      <h2>Autorizzazioni</h2>
      {spunta("Autorizzo la partecipazione del ragazzo alle attività ordinarie del GREST.", "partecipazione", true)}
      {spunta("Dichiaro di avere la responsabilità genitoriale o la tutela necessaria per richiedere l'iscrizione.", "responsabilita_genitoriale", true)}
      {spunta("Autorizzo il ragazzo a tornare a casa autonomamente a fine giornata.", "uscita_autonoma")}
      <p>L'eventuale autorizzazione per foto e video sarà richiesta quando la parrocchia avrà fornito la relativa informativa.</p>
      <p>Per ogni gita, escursione o visita, la parrocchia comunicherà programma e dettagli e richiederà un consenso specifico prima della partecipazione.</p>
      {errore && <p role="alert">{errore}</p>}
      <button type="submit" style={pulsante} disabled={occupato}>{occupato ? "Invio in corso…" : "Invia iscrizione"}</button>
    </form>}
  </section>;
}
