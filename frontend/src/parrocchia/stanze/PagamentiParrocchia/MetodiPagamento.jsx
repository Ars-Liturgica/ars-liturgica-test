import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

// Componente condiviso per tutte le attività e i progetti.
// I dati e i metodi attivi provengono dalla RPC esistente; nessun incasso viene registrato qui.
const ETICHETTE = {
  paypal: "PayPal",
  link_pagamento: "Stripe",
  bonifico: "Bonifico bancario",
  consegna_diretta: "Pagamento in parrocchia",
};
const DESCRIZIONI = {
  paypal: "Pagamento tramite PayPal",
  link_pagamento: "Pagamento con carta",
  bonifico: "Coordinate bancarie della parrocchia",
  consegna_diretta: "Consegna presso la segreteria",
};
const ORDINE = ["paypal", "link_pagamento", "bonifico", "consegna_diretta"];
const bordo = "1px solid #e5d9ca";

function urlSicuro(valore) {
  if (typeof valore !== "string" || !valore.trim()) return null;
  try {
    const url = new URL(valore.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch { return null; }
}

function Logo({ tipo }) {
  if (tipo === "paypal" || tipo === "link_pagamento") {
    const paypal = tipo === "paypal";
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <img src={paypal ? "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/paypal.svg" : "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/stripe.svg"}
        alt="" aria-hidden="true" width="27" height="27" style={{ objectFit: "contain" }} />
      <strong style={{ fontFamily: "Arial, sans-serif", fontSize: 17, color: paypal ? "#003087" : "#635bff" }}>
        {ETICHETTE[tipo]}
      </strong>
    </span>;
  }
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#173955" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {tipo === "bonifico" ? <><path d="M3 9h18L12 3 3 9Z" /><path d="M5 10v8m5-8v8m5-8v8M3 21h18M4 18h16" /></> : <><path d="M3 13l6 6 12-12" /><path d="M3 8h8M16 4h5v5" /></>}
    </svg>
    <strong>{ETICHETTE[tipo]}</strong>
  </span>;
}

export default function MetodiPagamento({ parrocchiaId, metodi, errore = "", importo = null, valuta = "EUR", contesto = "", modelloQuota, residuo = null }) {
  const [metodiCaricati, setMetodiCaricati] = useState([]);
  const [erroreCaricamento, setErroreCaricamento] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [messaggioCopia, setMessaggioCopia] = useState("");
  useEffect(() => {
    if (Array.isArray(metodi)) return;
    if (!parrocchiaId) { setMetodiCaricati([]); setErroreCaricamento("Parrocchia non disponibile."); return; }
    let valido = true;
    setCaricamento(true); setErroreCaricamento(""); setMetodiCaricati([]);
    supabase.rpc("ars_elenco_metodi_incasso_pubblici", { p_parrocchia_id: parrocchiaId })
      .then(({data, error}) => {
        if (!valido) return;
        if (error || !Array.isArray(data)) setErroreCaricamento("Impossibile caricare i metodi di pagamento.");
        else setMetodiCaricati(data);
      }).catch(() => { if (valido) setErroreCaricamento("Impossibile caricare i metodi di pagamento."); })
      .finally(() => { if (valido) setCaricamento(false); });
    return () => { valido = false; };
  }, [parrocchiaId, metodi]);
  if (modelloQuota === "gratuita") return null;
  const metodiEffettivi = Array.isArray(metodi) ? metodi : metodiCaricati;
  const erroreEffettivo = errore || erroreCaricamento;
  const disponibili = Array.isArray(metodiEffettivi)
    ? metodiEffettivi.filter((m) => m && ORDINE.includes(m.tipo) && m.attivo !== false)
      .sort((a, b) => ORDINE.indexOf(a.tipo) - ORDINE.indexOf(b.tipo))
    : [];
  const importoDaMostrare = residuo !== null && residuo !== undefined ? residuo : importo;
  const importoValido = importoDaMostrare !== null && importo !== undefined && Number.isFinite(Number(importoDaMostrare)) && Number(importoDaMostrare) > 0;
  const importoFormattato = importoValido ? Number(importoDaMostrare).toLocaleString("it-IT", { style: "currency", currency: valuta || "EUR" }) : null;
  const pulsante = { display: "inline-block", background: "#fffaf0", color: "#173955", border: "1px solid #b8aa99", borderRadius: 9, padding: "10px 15px", textDecoration: "none", cursor: "pointer", font: "inherit" };
  return <section style={{ marginTop: 24, paddingTop: 18, borderTop: bordo, color: "#173955" }}>
    <h3 style={{ margin: "0 0 10px" }}>Come pagare</h3>
    <p style={{ marginTop: 0 }}>Scegli una delle modalità messe a disposizione dalla parrocchia.</p>
    {importoFormattato && <div style={{ background: "#f7f3ed", border: bordo, borderRadius: 12, padding: 14, margin: "12px 0 16px" }}>
      {contesto && <div style={{ fontSize: 13, color: "#536678" }}>{contesto}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span>{residuo !== null && residuo !== undefined ? "Residuo da versare" : "Quota da versare"}</span><strong style={{ fontSize: 22 }}>{importoFormattato}</strong>
      </div>
      <small>Il pagamento sarà verificato dalla parrocchia.</small>
    </div>}
    {caricamento && <p role="status">Caricamento modalità di pagamento…</p>}
    {erroreEffettivo ? <p role="alert">{erroreEffettivo}</p> : caricamento ? null : disponibili.length === 0 ? <p>Per le modalità di pagamento contatta la segreteria della parrocchia.</p> : <>
      {disponibili.map((metodo) => {
        const link = urlSicuro(metodo.link_pagamento);
        const nome = ETICHETTE[metodo.tipo];
        return <details key={metodo.id || metodo.tipo} style={{ border: bordo, background: "#fffdf9", borderRadius: 12, padding: "13px 15px", marginTop: 10, overflowWrap: "anywhere" }}>
          <summary style={{ cursor: "pointer", display: "list-item" }}>
            <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 12, verticalAlign: "middle", marginLeft: 6 }}>
              <Logo tipo={metodo.tipo} />
              <span style={{ fontSize: 13, color: "#536678" }}>{DESCRIZIONI[metodo.tipo]}</span>
            </span>
          </summary>
          <div style={{ padding: "8px 2px 3px 14px" }}>
            {metodo.titolo && metodo.titolo !== nome && <p>{metodo.titolo}</p>}
            {metodo.intestatario && <p>Intestatario: <strong>{metodo.intestatario}</strong></p>}
            {metodo.tipo === "bonifico" && <>
              {metodo.iban && <p>IBAN: <strong style={{ userSelect: "all" }}>{metodo.iban}</strong> <button type="button" style={pulsante} onClick={async () => { try { await navigator.clipboard.writeText(metodo.iban); setMessaggioCopia("IBAN copiato"); } catch { setMessaggioCopia("Seleziona e copia l’IBAN visualizzato."); } }}>Copia IBAN</button> {messaggioCopia && <small role="status">{messaggioCopia}</small>}</p>}
              {metodo.bic_swift && <p>BIC / SWIFT: {metodo.bic_swift}</p>}
            </>}
            {metodo.tipo === "paypal" && metodo.email_paypal && <p>Email PayPal: <strong style={{ userSelect: "all" }}>{metodo.email_paypal}</strong></p>}
            {metodo.istruzioni && <p style={{ whiteSpace: "pre-wrap" }}>{metodo.istruzioni}</p>}
            {metodo.tipo === "consegna_diretta" && !metodo.istruzioni && <p>Consegna la quota alla segreteria della parrocchia.</p>}
            {(["paypal", "link_pagamento"].includes(metodo.tipo)) && (link
              ? <p><a href={link} target="_blank" rel="noopener noreferrer" style={pulsante}>{metodo.tipo === "paypal" ? "Apri PayPal" : "Paga con carta"}</a></p>
              : !metodo.email_paypal && <p>Contatta la segreteria per il collegamento di pagamento.</p>)}
          </div>
        </details>;
      })}
      <p style={{ fontSize: 13, color: "#536678", marginBottom: 0 }}>La scelta di una modalità non registra automaticamente un incasso né genera una ricevuta.</p>
    </>}
  </section>;
}
