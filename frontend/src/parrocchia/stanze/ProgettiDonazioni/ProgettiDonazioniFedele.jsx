import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const card = { background: "#fffdf9", border: "1px solid #e5d9ca", borderRadius: 16, padding: "clamp(14px, 3vw, 24px)", boxShadow: "0 4px 16px rgba(60,42,27,.05)", minWidth: 0 };
const button = { border: "1px solid #cbb59c", borderRadius: 10, background: "#fffdf9", padding: "11px 16px", color: "#62452e", cursor: "pointer", fontSize: 16, minHeight: 44, maxWidth: "100%" };
const field = { display: "block", width: "100%", boxSizing: "border-box", border: "1px solid #cbb59c", borderRadius: 9, padding: 11, marginTop: 6, fontSize: 16, background: "white" };
const tipoMetodo = (m) => String(m?.tipo || "").toLowerCase();
const nomeMetodo = (m) => m.titolo || ({ paypal: "PayPal", link_pagamento: "Carta (Stripe)", bonifico: "Bonifico", consegna_diretta: "Consegna in parrocchia" }[tipoMetodo(m)] || "Pagamento");
const metodoRpc = (m) => (["paypal", "link_pagamento"].includes(tipoMetodo(m)) ? "online" : tipoMetodo(m));
const urlSicuro = (valore) => { try { const u = new URL(valore); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; } };

function ContatoreOfferte({ iniziativa }) {
  if (!iniziativa?.mostra_contatore) return null;
  const incassato = Number(iniziativa.raccolto) || 0;
  const dichiaratoRaw = iniziativa.offerte_dichiarate ?? iniziativa.totale_dichiarato;
  const dichiarato = dichiaratoRaw == null ? null : Number(dichiaratoRaw);
  const obiettivo = Number(iniziativa.obiettivo) || 0;
  const percentuale = obiettivo > 0 ? Math.max(0, Math.min(100, incassato / obiettivo * 100)) : 0;
  const cifra = { fontSize: "clamp(1rem, 4vw, 1.35rem)", color: "#f2d28d", fontWeight: 700, overflowWrap: "anywhere" };
  return <section aria-label="Contatore delle offerte" style={{ background: "#101d35", color: "#fff", padding: "14px", borderRadius: 14, margin: "16px auto", width: "100%", maxWidth: 430, boxSizing: "border-box" }}>
    <div style={{ color: "#e7c57c", textAlign: "center", fontSize: 12, letterSpacing: ".04em", marginBottom: 10 }}>INSIEME PER IL NOSTRO PROGETTO</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      <div style={{ background: "#233653", padding: "10px 5px", borderRadius: 10, textAlign: "center", minWidth: 0 }}><div style={{ fontSize: 12 }}>Offerte dichiarate</div><div style={cifra}>{dichiarato != null && Number.isFinite(dichiarato) ? euro(dichiarato) : "Da collegare"}</div></div>
      <div style={{ background: "#233653", padding: "10px 5px", borderRadius: 10, textAlign: "center", minWidth: 0 }}><div style={{ fontSize: 12 }}>Somme incassate</div><div style={cifra}>{euro(incassato)}</div></div>
    </div>
    {obiettivo > 0 && <><div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12, color: "#e7c57c", fontSize: 12 }}><span>Avanzamento effettivo</span><strong>{percentuale.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%</strong></div><div role="progressbar" aria-valuenow={percentuale} aria-valuemin={0} aria-valuemax={100} aria-label="Avanzamento incassi" style={{ background: "#33445e", borderRadius: 12, height: 8, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${percentuale}%`, height: "100%", background: "#d6ac57" }} /></div><div style={{ marginTop: 7, fontSize: 12, color: "#c5d3ea" }}>Obiettivo: {euro(obiettivo)}</div></>}
    <p style={{ textAlign: "center", color: "#f2d28d", fontSize: 12, margin: "12px 0 0" }}>Anche il tuo contributo può fare la differenza</p>
  </section>;
}

function IstruzioniMetodo({ metodo }) {
  const tipo = tipoMetodo(metodo);
  const url = urlSicuro(metodo.link_pagamento);
  return <div style={{ marginTop: 14, padding: 14, background: "#fffdf9", borderRadius: 10, overflowWrap: "anywhere" }}>
    <strong>{nomeMetodo(metodo)}</strong>
    {tipo === "bonifico" && <><p>Intestatario: {metodo.intestatario || "Chiedere alla parrocchia"}</p><p>IBAN: <strong>{metodo.iban || "Non indicato"}</strong></p>{metodo.bic_swift && <p>BIC/SWIFT: {metodo.bic_swift}</p>}</>}
    {tipo === "paypal" && metodo.email_paypal && <p>PayPal: {metodo.email_paypal}</p>}
    {metodo.istruzioni && <p style={{ whiteSpace: "pre-wrap" }}>{metodo.istruzioni}</p>}
    {["paypal", "link_pagamento"].includes(tipo) && (url ? <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#79512d", fontWeight: 700 }}>Apri il collegamento di pagamento ↗</a></p> : <p>Collegamento non disponibile: contatta la parrocchia per completare il versamento.</p>)}
    <p style={{ fontSize: 13, color: "#655748" }}>La registrazione dell’offerta non equivale alla conferma del versamento tramite il gestore esterno.</p>
  </div>;
}

function RiepilogoPagamento({ iniziativa, parrocchiaId, onRegistrata }) {
  const donazione = iniziativa.tipo_iniziativa === "donazione";
  const [metodi, setMetodi] = useState([]);
  const [caricaMetodi, setCaricaMetodi] = useState(true);
  const [erroreMetodi, setErroreMetodi] = useState("");
  const [importo, setImporto] = useState("");
  const [nominativo, setNominativo] = useState("");
  const [scelto, setScelto] = useState("");
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");
  const [registrato, setRegistrato] = useState(null);
  useEffect(() => {
    let vivo = true;
    setCaricaMetodi(true); setErroreMetodi(""); setMetodi([]); setScelto("");
    supabase.rpc("ars_elenco_metodi_incasso_pubblici", { p_parrocchia_id: parrocchiaId }).then(({ data, error }) => {
      if (!vivo) return;
      if (error) setErroreMetodi("Impossibile leggere i metodi di pagamento della parrocchia.");
      else {
        const disponibili = (Array.isArray(data) ? data : []).filter(m => ["paypal", "link_pagamento", "bonifico", "consegna_diretta"].includes(tipoMetodo(m)));
        setMetodi(disponibili);
        if (disponibili.length) setScelto(String(disponibili[0].id));
      }
      setCaricaMetodi(false);
    });
    return () => { vivo = false; };
  }, [parrocchiaId, iniziativa.id]);
  const metodo = metodi.find(m => String(m.id) === scelto);
  async function dichiara(e) {
    e.preventDefault();
    if (invio || registrato || !metodo) return;
    const testo = importo.trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(testo) || Number(testo) <= 0) { setErrore("Inserisci un importo valido, con massimo due decimali."); return; }
    setInvio(true); setErrore("");
    try {
      const { data, error } = donazione
        ? await supabase.rpc("ars_dichiara_donazione_libera", {
            p_parrocchia_id: parrocchiaId,
            p_proposta_id: iniziativa.donazioneSpontanea ? null : iniziativa.id,
            p_importo: Number(testo),
            p_metodo: metodoRpc(metodo),
            p_pagante_nominativo: nominativo.trim() || null
          })
        : await supabase.rpc("ars_dichiara_offerta_progetto", {
            p_parrocchia_id: parrocchiaId, p_progetto_id: iniziativa.id, p_importo: Number(testo),
            p_metodo: metodoRpc(metodo), p_pagante_nominativo: nominativo.trim() || null
          });
      if (error) throw error;
      if (!data?.successo || !data?.pagamento_id) throw new Error("La dichiarazione non è stata confermata.");
      setRegistrato({ id: data.pagamento_id, importo: Number(testo), metodo });
      onRegistrata();
    } catch (e) { setErrore(e?.message || "Non è stato possibile registrare la dichiarazione."); }
    finally { setInvio(false); }
  }
  return <section style={{ ...card, marginTop: 20, background: "#f9f4e9" }} aria-label="Riepilogo e pagamento">
    <h3 style={{ marginTop: 0, fontSize: "1.4rem" }}>{donazione ? "❤️ La tua donazione" : "❤️ Sostieni questo progetto"}</h3>
    <h4 style={{ margin: "0 0 14px", fontWeight: 400 }}>Riepilogo e pagamento</h4>
    {registrato ? <div role="status"><p><strong>Offerta dichiarata correttamente.</strong></p><p>Importo: <strong>{euro(registrato.importo)}</strong></p><p>Stato: <strong>{donazione ? "Registrata" : "In attesa"}</strong></p><p>Riferimento: <code style={{ overflowWrap: "anywhere" }}>{registrato.id}</code></p><IstruzioniMetodo metodo={registrato.metodo} /><p style={{ fontSize: 13 }}>Per un'altra offerta, torna all'elenco e riapri la scheda.</p></div> : <form onSubmit={dichiara}>
      <label style={{ display: "block", marginBottom: 12 }}>Importo dell'offerta (€)<input style={field} value={importo} onChange={e => setImporto(e.target.value)} inputMode="decimal" placeholder="Es. 25,00" required /></label>
      <label style={{ display: "block", marginBottom: 12 }}>Pagante (facoltativo)<input style={field} value={nominativo} onChange={e => setNominativo(e.target.value)} placeholder="Lascia vuoto per offerta anonima" /></label>
      {caricaMetodi ? <p>Caricamento metodi di pagamento…</p> : erroreMetodi ? <p role="alert">{erroreMetodi}</p> : metodi.length === 0 ? <p>Nessun metodo di pagamento attivo. Contatta la parrocchia.</p> : <label style={{ display: "block", marginBottom: 12 }}>Metodo di pagamento<select style={field} value={scelto} onChange={e => setScelto(e.target.value)}>{metodi.map(m => <option key={m.id} value={String(m.id)}>{nomeMetodo(m)}</option>)}</select></label>}
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>Confermando registri l’offerta. Le istruzioni per il versamento appariranno subito dopo. L’eventuale pagamento esterno si completa separatamente.</p>
      {errore && <p role="alert" style={{ color: "#9d2828" }}>{errore}</p>}
      <button type="submit" disabled={invio || caricaMetodi || !metodo} style={{ ...button, background: "#79512d", color: "#fff", opacity: invio || !metodo ? .6 : 1 }}>{invio ? "Registrazione in corso…" : "Conferma l'offerta e prosegui"}</button>
    </form>}
  </section>;
}

export default function ProgettiDonazioniFedele({ parrocchiaId, tornaDashboard }) {
  const [sezione, setSezione] = useState("progetto");
  const [progetti, setProgetti] = useState([]);
  const [attivo, setAttivo] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const carica = useCallback(async () => {
    if (!parrocchiaId) { setErrore("Parrocchia non selezionata."); setCaricamento(false); return; }
    const { data, error } = await supabase.rpc("ars_elenco_progetti_donazioni_pubblici", { p_parrocchia_id: parrocchiaId });
    if (error) setErrore("Impossibile caricare le iniziative pubblicate.");
    else { setErrore(""); const elenco = Array.isArray(data) ? data : []; setProgetti(elenco); setAttivo(prev => prev ? elenco.find(p => p.id === prev.id) || prev : null); }
    setCaricamento(false);
  }, [parrocchiaId]);
  useEffect(() => { setCaricamento(true); carica(); }, [carica]);
  const visibili = progetti.filter(p => p.tipo_iniziativa === sezione);
  const donazioneSpontanea = { id: "donazione-spontanea", tipo_iniziativa: "donazione", donazioneSpontanea: true, titolo: "La tua donazione", descrizione: "Un gesto libero per sostenere la vita e le attività della nostra parrocchia. Grazie di cuore per il tuo contributo." };
  return <main style={{ minHeight: "100vh", background: "#f7f3ed", padding: "clamp(14px, 3vw, 28px) 12px", fontFamily: 'Georgia, "Times New Roman", serif', color: "#3e3328", boxSizing: "border-box" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
      <button type="button" style={button} onClick={attivo ? () => setAttivo(null) : tornaDashboard}>← {attivo ? "Torna alle iniziative" : "Torna alla Dashboard"}</button>
      <h1 style={{ fontWeight: 500, fontSize: "clamp(1.65rem, 5vw, 2.6rem)", margin: "22px 0", overflowWrap: "anywhere" }}>Progetti, raccolte fondi e donazioni</h1>
      {!attivo && <nav aria-label="Sezioni iniziative" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {[["progetto", "Progetti"], ["raccolta", "Raccolte fondi"], ["donazione", "Donazioni"]].map(([valore, titolo]) => <button key={valore} type="button" onClick={() => setSezione(valore)} style={{ ...button, background: sezione === valore ? "#79512d" : "#fffdf9", color: sezione === valore ? "white" : "#62452e" }}>{titolo}</button>)}
      </nav>}
      {errore && <p role="alert">{errore}</p>}
      {caricamento && <p>Caricamento iniziative…</p>}
       {!caricamento && !attivo && sezione === "donazione" && <section aria-label="Donazioni alla parrocchia">
         <h2 style={{ fontSize: "clamp(1.35rem, 4vw, 1.9rem)", fontWeight: 500 }}>Donazioni</h2>
         <p style={{ lineHeight: 1.6 }}>Ogni gesto di generosità è prezioso. Grazie per essere vicino alla nostra comunità.</p>
         <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
           {visibili.map(p => <article key={p.id} style={card}>
             <p style={{ color: "#79512d", fontSize: 12, letterSpacing: 1 }}>PROPOSTA DELLA PARROCCHIA</p>
             <h3 style={{ fontSize: "1.4rem", overflowWrap: "anywhere" }}>{p.titolo}</h3>
             <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{p.descrizione}</p>
             <button type="button" style={{ ...button, background: "#79512d", color: "#fff" }} onClick={() => setAttivo(p)}>❤️ Sostieni questa proposta</button>
           </article>)}
           <article style={{ ...card, border: "1px solid #c9a76c", background: "#fffaf0" }}>
             <p style={{ color: "#79512d", fontSize: 12, letterSpacing: 1 }}>UN GESTO LIBERO</p>
             <h3 style={{ fontSize: "1.4rem" }}>La tua donazione</h3>
             <p style={{ lineHeight: 1.6 }}>{donazioneSpontanea.descrizione}</p>
             <button type="button" style={{ ...button, background: "#79512d", color: "#fff" }} onClick={() => setAttivo(donazioneSpontanea)}>❤️ Fai una donazione</button>
           </article>
         </div>
       </section>}
      {!caricamento && !attivo && sezione !== "donazione" && (visibili.length === 0 ? <section style={card}><p>Nessuna iniziativa pubblicata in questa sezione.</p></section> : <div style={{ display: "grid", gap: 16 }}>
        {visibili.map(p => <article key={p.id} style={card}>
          <p style={{ color: "#79512d", letterSpacing: 1, fontSize: 12 }}>INIZIATIVA DELLA PARROCCHIA</p>
          <h2 style={{ fontSize: "clamp(1.3rem, 4vw, 2rem)", margin: "12px 0", overflowWrap: "anywhere" }}>{p.titolo}</h2>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{p.descrizione}</p>
          <ContatoreOfferte iniziativa={p} />
          <button type="button" style={button} onClick={() => setAttivo(p)}>{sezione === "raccolta" ? "Scopri la raccolta" : "Scopri il progetto"}</button>
        </article>)}
      </div>)}
      {attivo && <article style={card}>
        <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", overflowWrap: "anywhere" }}>{attivo.titolo}</h2>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>{attivo.descrizione}</p>
        {attivo.tipo_iniziativa !== "donazione" && <ContatoreOfferte iniziativa={attivo} />}
        <RiepilogoPagamento key={attivo.id} iniziativa={attivo} parrocchiaId={parrocchiaId} onRegistrata={carica} />
      </article>}
    </div>
  </main>;
}