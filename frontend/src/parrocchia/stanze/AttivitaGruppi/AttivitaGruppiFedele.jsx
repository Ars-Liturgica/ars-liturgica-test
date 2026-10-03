import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";
import IscrizioneGrestFedele from "./IscrizioneGrestFedele";

const stile = {
  sfondo: { minHeight: "100vh", background: "#f7f3ed" },
  pagina: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "#173955" },
  intestazione: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 28 },
  griglia: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 },
  card: { background: "#fffdf9", border: "1px solid #e5d9ca", borderRadius: 18, padding: 24, minWidth: 0 },
  pulsante: { border: "1px solid #c99536", borderRadius: 10, background: "#fffaf0", color: "#173955", padding: "10px 16px", cursor: "pointer", font: "inherit" },
};
const NOMI_METODI = {
  bonifico: "Bonifico", paypal: "PayPal", link_pagamento: "Carta di credito/debito",
  consegna_diretta: "Consegna in parrocchia",
};

function SimboloPagamento({ tipo }) {
  if (tipo === "paypal") return <span aria-hidden="true" style={{ fontFamily: "Arial, sans-serif", fontWeight: 800, fontStyle: "italic", color: "#003087", fontSize: 18 }}>Pay<span style={{ color: "#0070ba" }}>Pal</span></span>;
  return <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {tipo === "bonifico" ? <><path d="M3 9h18L12 3 3 9Z" /><path d="M5 10v8m5-8v8m4-8v8m5-8v8M3 21h18M4 18h16" /></> : tipo === "link_pagamento" ? <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20M6 15h4" /></> : <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></>}
  </svg>;
}
function dataItaliana(valore) {
  if (!valore) return null;
  const data = new Date(`${String(valore).slice(0, 10)}T12:00:00`);
  return Number.isNaN(data.getTime()) ? null : new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(data);
}
function elencoDaRisposta(valore) {
  if (Array.isArray(valore)) return valore;
  for (const chiave of ["attivita", "data", "risultati"]) {
    if (Array.isArray(valore?.[chiave])) return valore[chiave];
  }
  return null;
}
function indirizzoPdf(valore) {
  if (typeof valore !== "string" || !valore.trim()) return null;
  try {
    const url = new URL(valore.trim(), window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function linkSicuro(valore) {
  if (typeof valore !== "string" || !valore.trim()) return null;
  try {
    const url = new URL(valore.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch { return null; }
}
function moduliCartacei(voce) {
  const config = voce.configurazione_modulo || {};
  const urlParrocchia = indirizzoPdf(config.modulo_cartaceo_url);
  const modalita = config.modulo_cartaceo_modalita || (urlParrocchia ? "parrocchia" : "ars");
  const moduli = [];
  if (modalita !== "parrocchia" || !urlParrocchia) {
    moduli.push({ etichetta: modalita === "entrambi" ? "Scarica il modulo Ars Liturgica" : "Scarica il modulo cartaceo", url: "/modulo-grest-cartaceo.pdf" });
  }
  if (urlParrocchia && modalita !== "ars") {
    moduli.push({ etichetta: modalita === "entrambi" ? "Scarica il modulo della parrocchia" : "Scarica il modulo cartaceo", url: urlParrocchia });
  }
  return moduli;
}
function MetodiPagamento({ metodi, errore }) {
  return <section style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #e5d9ca" }}>
    <h3 style={{ marginTop: 0 }}>Come pagare</h3>
    {errore ? <p role="alert">{errore}</p> : metodi.length === 0 ? <p>Per le modalità di pagamento contatta la segreteria della parrocchia.</p> : <>
      <p>Scegli una delle modalità disponibili.</p>
      {metodi.map((metodo) => {
        const link = linkSicuro(metodo.link_pagamento);
        const nome = NOMI_METODI[metodo.tipo] || metodo.titolo;
        return <details key={metodo.id} style={{ border: "1px solid #e5d9ca", borderRadius: 10, padding: 12, marginTop: 10, overflowWrap: "anywhere" }}>
          <summary style={{ cursor: "pointer" }}>
            <span style={{ display: "inline-flex", gap: 10, alignItems: "center", verticalAlign: "middle" }}><SimboloPagamento tipo={metodo.tipo} /><strong>{nome}</strong></span>
          </summary>
          {metodo.titolo && metodo.titolo !== nome && <p>{metodo.titolo}</p>}
          {metodo.intestatario && <p>Intestatario: {metodo.intestatario}</p>}
          {metodo.tipo === "bonifico" && <>
            <p>IBAN: <strong style={{ userSelect: "all" }}>{metodo.iban}</strong></p>
            {metodo.bic_swift && <p>BIC / SWIFT: {metodo.bic_swift}</p>}
          </>}
          {metodo.tipo === "paypal" && metodo.email_paypal && <p>Email PayPal: <strong style={{ userSelect: "all" }}>{metodo.email_paypal}</strong></p>}
          {metodo.istruzioni && <p style={{ whiteSpace: "pre-wrap" }}>{metodo.istruzioni}</p>}
          {metodo.tipo === "consegna_diretta" && !metodo.istruzioni && <p>Consegna la quota alla segreteria della parrocchia.</p>}
          {["paypal", "link_pagamento"].includes(metodo.tipo) && (link ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ ...stile.pulsante, display: "inline-block", textDecoration: "none" }}>{metodo.tipo === "paypal" ? "Apri PayPal" : "Paga con carta"}</a> : !metodo.email_paypal && <p>Contatta la segreteria per il collegamento di pagamento.</p>)}
        </details>;
      })}
    </>}
  </section>;
}

export default function AttivitaGruppiFedele({ parrocchiaId, tornaDashboard }) {
  const [attivita, setAttivita] = useState([]);
  const [metodi, setMetodi] = useState([]);
  const [erroreMetodi, setErroreMetodi] = useState("");
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [grestSelezionato, setGrestSelezionato] = useState(null);
  const richiesta = useRef(0);

  const caricaAttivita = useCallback(async () => {
    const numero = ++richiesta.current;
    setAttivita([]); setMetodi([]); setErroreMetodi(""); setErrore("");
    if (!parrocchiaId) {
      setCaricamento(false); setErrore("Non è stata selezionata una parrocchia."); return;
    }
    setCaricamento(true);
    try {
      const [rispostaAttivita, rispostaMetodi] = await Promise.allSettled([
        supabase.rpc("ars_elenco_attivita_pubbliche", { p_parrocchia_id: parrocchiaId }),
        supabase.rpc("ars_elenco_metodi_incasso_pubblici", { p_parrocchia_id: parrocchiaId }),
      ]);
      if (numero !== richiesta.current) return;
      if (rispostaAttivita.status === "rejected" || rispostaAttivita.value.error) {
        setErrore("Impossibile caricare le attività della parrocchia.");
      } else {
        const elenco = elencoDaRisposta(rispostaAttivita.value.data);
        if (!elenco) setErrore("Impossibile leggere l'elenco delle attività.");
        else setAttivita(elenco);
      }
      if (rispostaMetodi.status === "rejected" || rispostaMetodi.value.error || !Array.isArray(rispostaMetodi.value.data)) {
        setErroreMetodi("Le modalità di pagamento non sono disponibili al momento. Premi Aggiorna elenco o contatta la segreteria.");
      } else setMetodi(rispostaMetodi.value.data);
    } finally { if (numero === richiesta.current) setCaricamento(false); }
  }, [parrocchiaId]);

  useEffect(() => {
    setGrestSelezionato(null); caricaAttivita();
    return () => { richiesta.current += 1; };
  }, [caricaAttivita]);

  return <div style={stile.sfondo}><main style={stile.pagina}>
    {grestSelezionato ? <IscrizioneGrestFedele attivita={grestSelezionato} onIndietro={() => setGrestSelezionato(null)} /> : <>
      <header style={stile.intestazione}>
        <div>
          <button type="button" style={stile.pulsante} onClick={tornaDashboard}>← Torna alla dashboard</button>
          <h1>Attività e Gruppi</h1><p>Scopri le iniziative della tua parrocchia.</p>
        </div>
        <button type="button" style={stile.pulsante} onClick={caricaAttivita} disabled={caricamento}>Aggiorna elenco</button>
      </header>
      {caricamento && <p role="status">Caricamento delle attività…</p>}
      {errore && <p role="alert">{errore}</p>}
      {!caricamento && !errore && attivita.length === 0 && <section style={stile.card}><h2>Nessuna attività aperta</h2><p>Le prossime attività della parrocchia compariranno qui.</p></section>}
      {!caricamento && !errore && attivita.length > 0 && <div style={stile.griglia}>
        {attivita.map((voce) => <article key={voce.id} style={stile.card}>
          <h2>{voce.titolo}</h2>
          {voce.descrizione && <p>{voce.descrizione}</p>}
          {(voce.data_inizio || voce.data_fine) && <p>{[dataItaliana(voce.data_inizio), dataItaliana(voce.data_fine)].filter(Boolean).join(" – ")}</p>}
          {voce.luogo && <p>Luogo: {voce.luogo}</p>}
          {voce.modello_quota === "quota_fissa" && <p>Quota: {Number(voce.importo_quota).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</p>}
          {voce.modello_quota === "contributo_libero" && <p>Contributo libero</p>}
          {voce.modello_quota === "gratuita" && <p>Partecipazione gratuita</p>}
          {String(voce.tipo).toLowerCase() === "grest" && <>
            {voce.configurazione_modulo?.abilita_iscrizioni_grest === true ? <button type="button" style={stile.pulsante} onClick={() => setGrestSelezionato(voce)}>Iscrivi un ragazzo</button> : <p>Iscrizioni in preparazione.</p>}
            {moduliCartacei(voce).map((modulo) => <p key={modulo.url}><a href={modulo.url} target="_blank" rel="noopener noreferrer" style={{ ...stile.pulsante, display: "inline-block", textDecoration: "none" }}>{modulo.etichetta}</a></p>)}
            <p>Compila il modulo e consegnalo alla segreteria della parrocchia.</p>
          </>}
          {["quota_fissa", "contributo_libero"].includes(voce.modello_quota) && <MetodiPagamento metodi={metodi} errore={erroreMetodi} />}
        </article>)}
      </div>}
    </>}
  </main></div>;
}
