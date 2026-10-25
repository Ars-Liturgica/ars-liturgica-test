import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const TIPI = {
  bonifico: "Bonifico",
  paypal: "PayPal",
  link_pagamento: "Carta di credito/debito tramite Stripe",
  consegna_diretta: "Consegna diretta in parrocchia",
};
const nuovoMetodo = (tipo = "bonifico") => ({
  id: null, tipo, titolo: TIPI[tipo], intestatario: "", iban: "",
  bic_swift: "", email_paypal: "", link_pagamento: "", istruzioni: "",
  attivo: true, ordine: 0,
});
const ORDINE_METODI = ["paypal", "link_pagamento", "bonifico", "consegna_diretta"];
const DESCRIZIONI_METODI = {
  paypal: "Pagamenti tramite PayPal",
  link_pagamento: "Carte di credito e debito tramite Stripe",
  bonifico: "Versamenti sul conto bancario della parrocchia",
  consegna_diretta: "Pagamento direttamente in parrocchia",
};
function LogoMetodo({ tipo }) {
  if (tipo === "paypal" || tipo === "link_pagamento") {
    const nome = tipo === "paypal" ? "PayPal" : "Stripe";
    const src = tipo === "paypal"
      ? "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/paypal.svg"
      : "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/stripe.svg";
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <img src={src} alt="" aria-hidden="true" width="27" height="27" style={{ objectFit: "contain" }} />
      <strong style={{ color: tipo === "paypal" ? "#003087" : "#635bff" }}>{nome}</strong>
    </span>;
  }
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
    <span aria-hidden="true" style={{ fontSize: 25 }}>{tipo === "bonifico" ? "🏦" : "🤝"}</span>
    <strong>{tipo === "bonifico" ? "Bonifico bancario" : "Pagamento in parrocchia"}</strong>
  </span>;
}
const stilePulsante = { background: "#b78b42", color: "#fff", border: "1px solid #a67b35", borderRadius: "10px", padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: "15px" };
const stilePulsanteSecondario = { ...stilePulsante, background: "#fffaf1", color: "#18334a", border: "1px solid #ddc89d" };
const stileCartella = { ...stilePulsanteSecondario, display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", textAlign: "left", padding: "22px", marginBottom: "14px", gap: "12px" };

const stileCampo = { display: "block", width: "100%", boxSizing: "border-box", padding: "10px", marginTop: "5px" };
const stileScheda = { border: "1px solid #ddc89d", borderRadius: "12px", padding: "20px", margin: "16px 0" };

export default function ProgettiDonazioni({ parrocchiaId, tornaDashboard, sezioneIniziale = "indice" }) {
  const [metodiIncasso, setMetodiIncasso] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [modulo, setModulo] = useState(null);
  const [erroreModulo, setErroreModulo] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [sezione, setSezione] = useState(sezioneIniziale);

  const caricaDati = useCallback(async () => {
    if (!parrocchiaId) {
      setMetodiIncasso([]); setProgetti([]); setCaricamento(false);
      setErrore("Seleziona una parrocchia per gestire i metodi di incasso.");
      return;
    }
    setCaricamento(true); setErrore("");
    try {
      const [metodi, raccolte] = await Promise.all([
        supabase.rpc("ars_elenco_metodi_incasso_parroco", { p_parrocchia_id: parrocchiaId }),
        supabase.rpc("ars_elenco_progetti_donazioni_parroco", { p_parrocchia_id: parrocchiaId }),
      ]);
      if (metodi.error) throw metodi.error;
      setMetodiIncasso(Array.isArray(metodi.data) ? metodi.data : []);
      if (raccolte.error) {
        setProgetti([]);
        setErrore("Metodi caricati. Impossibile caricare i progetti: " + raccolte.error.message);
      } else setProgetti(Array.isArray(raccolte.data) ? raccolte.data : []);
    } catch (err) {
      setMetodiIncasso([]); setProgetti([]);
      setErrore(err.message || "Impossibile caricare Donazioni e Progetti.");
    } finally { setCaricamento(false); }
  }, [parrocchiaId]);

  useEffect(() => {
    setModulo(null); setErroreModulo(""); setMessaggio(""); setSezione(sezioneIniziale);
    caricaDati();
  }, [caricaDati, sezioneIniziale]);

  function apriMetodo(metodo) {
    setModulo({ ...nuovoMetodo(metodo.tipo), ...metodo });
    setErroreModulo(""); setMessaggio("");
  }
  function scegliTipo(tipo) {
    const esistente = metodiIncasso.find((m) => m.tipo === tipo);
    apriMetodo(esistente || nuovoMetodo(tipo));
  }
  function aggiorna(campo, valore) {
    setModulo((precedente) => ({ ...precedente, [campo]: valore }));
  }
  async function salvaMetodo(event) {
    event.preventDefault();
    if (salvataggio || !modulo || !parrocchiaId) return;
    setErroreModulo(""); setMessaggio("");
    const link = (modulo.link_pagamento || "").trim();
    if (link) {
      try {
        const indirizzo = new URL(link);
        if (indirizzo.protocol !== "https:") throw new Error();
      } catch {
        setErroreModulo("Inserisci un link completo che inizi con https://.");
        return;
      }
    }
    if (modulo.tipo === "paypal" && !(modulo.email_paypal || "").trim() && !link) {
      setErroreModulo("Per PayPal inserisci un’email oppure un link di pagamento."); return;
    }
    setSalvataggio(true);
    try {
      const { data, error } = await supabase.rpc("ars_salva_metodo_incasso", {
        p_parrocchia_id: parrocchiaId,
        p_id: modulo.id || null,
        p_tipo: modulo.tipo,
        p_titolo: modulo.titolo.trim(),
        p_intestatario: modulo.intestatario || null,
        p_iban: modulo.tipo === "bonifico" ? modulo.iban : null,
        p_bic_swift: modulo.tipo === "bonifico" ? modulo.bic_swift : null,
        p_email_paypal: modulo.tipo === "paypal" ? modulo.email_paypal : null,
        p_link_pagamento: ["paypal", "link_pagamento"].includes(modulo.tipo) ? link || null : null,
        p_istruzioni: modulo.istruzioni || null,
        p_attivo: Boolean(modulo.attivo),
        p_ordine: Number(modulo.ordine) || 0,
      });
      if (error) throw error;
      if (!data?.id) throw new Error("Il server non ha restituito il metodo salvato. Ricarica la pagina per verificarlo.");
      setMetodiIncasso((precedenti) => [...precedenti.filter((m) => m.id !== data.id && m.tipo !== data.tipo), data]
        .sort((a, b) => Number(a.ordine || 0) - Number(b.ordine || 0)));
      setModulo(null); setMessaggio("Metodo di incasso salvato.");
    } catch (err) { setErroreModulo(err.message || "Impossibile salvare il metodo."); }
    finally { setSalvataggio(false); }
  }

  function campo(nome, etichetta, { tipo = "text", obbligatorio = false } = {}) {
    return <label style={{ display: "block", margin: "12px 0" }}>
      {etichetta}{obbligatorio ? " *" : ""}
      <input style={stileCampo} type={tipo} value={modulo[nome] ?? ""}
        required={obbligatorio} onChange={(e) => aggiorna(nome, e.target.value)} />
    </label>;
  }

  return <div className="progetti-donazioni">
    <button type="button" style={stilePulsanteSecondario} onClick={() => {
      if (sezioneIniziale !== "indice" || sezione === "indice") tornaDashboard();
      else { setSezione("indice"); setModulo(null); setErroreModulo(""); }
    }} disabled={salvataggio}>← {sezioneIniziale !== "indice" ? "Torna ad Attività e Progetti" : sezione === "indice" ? "Torna alla dashboard" : "Torna a Progetti e Donazioni"}</button>
    <div className="progetti-donazioni-intestazione">
      <h2>{sezione === "metodi" ? "Metodi di incasso" : sezione === "progetti" ? "Progetti della parrocchia" : "Progetti e Donazioni"}</h2>
      <p>{sezione === "indice" ? "Scegli la sezione da gestire." : sezione === "metodi" ? "Configura i metodi con cui la parrocchia riceve offerte e quote delle attività." : "Raccolte e iniziative che la comunità può sostenere."}</p>
    </div>
    {errore && <div role="alert" className="messaggio-errore">{errore}</div>}
    {messaggio && <p role="status">{messaggio}</p>}
    {sezione === "indice" && <nav aria-label="Sezioni Progetti e Donazioni" style={{ marginTop: 24 }}>
      <button type="button" style={stileCartella} onClick={() => setSezione("metodi")}>
        <span><span aria-hidden="true">💳 </span><strong>Metodi di incasso</strong><br /><small>Bonifico, PayPal, carta e consegna diretta</small></span><span aria-hidden="true">›</span>
      </button>
      <button type="button" style={stileCartella} onClick={() => setSezione("progetti")}>
        <span><span aria-hidden="true">📁 </span><strong>Progetti della parrocchia</strong><br /><small>Raccolte fondi e iniziative della comunità</small></span><span aria-hidden="true">›</span>
      </button>
    </nav>}
    {caricamento ? <p>Caricamento in corso...</p> : <>
      {sezione === "metodi" && <section className="sezione-metodi-incasso">
        <div className="intestazione-sezione-donazioni">
          <p>Configura i metodi di incasso della parrocchia. I fedeli vedranno soltanto quelli attivi.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, margin: "18px 0" }}>
          {ORDINE_METODI.map((tipo) => {
            const esistente = metodiIncasso.find((m) => m.tipo === tipo);
            const attivo = Boolean(esistente?.attivo);
            return <article key={tipo} style={{ ...stileScheda, margin: 0, background: "#fffdf9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <LogoMetodo tipo={tipo} />
                <span style={{ fontSize: 12, fontWeight: 700, color: attivo ? "#24613a" : "#765c37", background: attivo ? "#e6f4e9" : "#f5ecdb", padding: "5px 9px", borderRadius: 16 }}>
                  {attivo ? "Attivo" : "Non attivo"}
                </span>
              </div>
              <p style={{ minHeight: 38, color: "#40566a", margin: "14px 0" }}>{DESCRIZIONI_METODI[tipo]}</p>
              <button type="button" style={stilePulsanteSecondario} disabled={!parrocchiaId || salvataggio}
                onClick={() => scegliTipo(tipo)} aria-label={`${esistente ? "Modifica" : "Configura"} ${TIPI[tipo]}`}>
                {esistente ? "Modifica" : "Configura"}
              </button>
            </article>;
          })}
        </div>
        {modulo && <form onSubmit={salvaMetodo} style={stileScheda}>
          <h4>{modulo.id ? "Modifica metodo" : "Configura metodo"}: {TIPI[modulo.tipo]}</h4>
          {erroreModulo && <p role="alert">{erroreModulo}</p>}
          <fieldset disabled={salvataggio} style={{ border: 0, padding: 0, margin: 0 }}>
            {campo("titolo", "Nome da mostrare", { obbligatorio: true })}
            {modulo.tipo !== "consegna_diretta" && campo("intestatario", "Intestatario")}
            {modulo.tipo === "bonifico" && <>
              {campo("iban", "IBAN", { obbligatorio: true })}
              {campo("bic_swift", "BIC / SWIFT (facoltativo)")}
            </>}
            {modulo.tipo === "paypal" && <>
              <p>Inserisci il link PayPal della parrocchia oppure la sua email PayPal.</p>
              <details style={{ margin: "12px 0", padding: "12px", background: "#fffaf1", borderRadius: 8 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>Come ottenere il link PayPal?</summary>
                <ol style={{ lineHeight: 1.6, paddingLeft: 22 }}>
                  <li>Vai sul <a href="https://www.paypal.com/it" target="_blank" rel="noopener noreferrer">sito ufficiale PayPal</a>.</li>
                  <li>Se non hai già un conto, segui le indicazioni del sito per crearne uno adatto alla parrocchia.</li>
                  <li>Accedi alle funzioni disponibili per ricevere pagamenti e ottieni il relativo link.</li>
                  <li>Copia il link nel campo sottostante, attiva il metodo e salva.</li>
                </ol>
                <small>La scelta del servizio e la verifica delle condizioni e delle eventuali commissioni spettano alla parrocchia.</small>
              </details>
              {campo("email_paypal", "Email PayPal", { tipo: "email" })}
            </>}
            {modulo.tipo === "link_pagamento" && <>
              <p>Inserisci il link di pagamento Stripe della parrocchia. Ars Liturgica non incassa denaro e non verifica automaticamente l’esito del pagamento.</p>
              <details style={{ margin: "12px 0", padding: "12px", background: "#fffaf1", borderRadius: 8 }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>Come ottenere il link Stripe?</summary>
                <ol style={{ lineHeight: 1.6, paddingLeft: 22 }}>
                  <li>Vai sul <a href="https://stripe.com/it" target="_blank" rel="noopener noreferrer">sito ufficiale Stripe</a>.</li>
                  <li>Se non hai già un account, segui le istruzioni per crearne uno per la parrocchia.</li>
                  <li>Completa le verifiche richieste e apri la sezione Payment Links.</li>
                  <li>Crea un link adatto ai versamenti che intendi ricevere, copialo qui, attiva il metodo e salva.</li>
                </ol>
                <small>Verifica che il link consenta gli importi necessari, anche per eventuali acconti, e controlla le condizioni e le commissioni del servizio.</small>
              </details>
            </>}
            {["paypal", "link_pagamento"].includes(modulo.tipo) && campo("link_pagamento", modulo.tipo === "link_pagamento" ? "Link Stripe della parrocchia" : "Link PayPal della parrocchia", { tipo: "url", obbligatorio: modulo.tipo === "link_pagamento" })}
            <label style={{ display: "block", margin: "12px 0" }}>Istruzioni per chi paga
              <textarea style={stileCampo} rows={3} value={modulo.istruzioni || ""} onChange={(e) => aggiorna("istruzioni", e.target.value)} />
            </label>
            <label style={{ display: "block", margin: "12px 0" }}>
              <input type="checkbox" checked={Boolean(modulo.attivo)} onChange={(e) => aggiorna("attivo", e.target.checked)} /> Metodo attivo
            </label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <button type="submit" style={stilePulsante} disabled={salvataggio}>
                {salvataggio ? "Salvataggio..." : "Salva metodo"}
              </button>
              <button type="button" style={stilePulsanteSecondario} disabled={salvataggio}
                onClick={() => { setModulo(null); setErroreModulo(""); }}>
                Annulla
              </button>
            </div>
          </fieldset>
        </form>}
        <article style={{ ...stileScheda, background: "#fffaf1" }}>
          <h4>Vuoi automatizzare la gestione dei pagamenti?</h4>
          <p>Ars Liturgica offre la possibilità di collegare i servizi di pagamento online per ricevere automaticamente le conferme degli incassi, riducendo le verifiche manuali e semplificando la gestione delle ricevute.</p>
          <p>Per maggiori informazioni e una valutazione tecnica, contatta l'assistenza di Ars Liturgica.</p>
        </article>
      </section>}
      {sezione === "progetti" && <section className="sezione-progetti-donazioni">
        <div className="intestazione-sezione-donazioni">
          <h3>Progetti della parrocchia</h3>
          <p>Raccolte e iniziative che la comunità può sostenere.</p>
          <button type="button" style={stilePulsante} disabled title="La funzione sarà attivata nel prossimo passaggio">Nuovo progetto</button>
        </div>
        {progetti.length === 0 ? <p>Nessun progetto è stato ancora creato.</p> :
          progetti.map((progetto) => <article key={progetto.id}>
            <h4>{progetto.titolo}</h4>
            <p>{progetto.stato} · Raccolto {Number(progetto.raccolto || 0).toLocaleString("it-IT", { style: "currency", currency: progetto.valuta || "EUR" })}</p>
          </article>)}
      </section>}
    </>}
  </div>;
}