import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";

const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n || 0));
const dataIt = (v) => v ? new Date(`${v}T12:00:00`).toLocaleDateString("it-IT") : "Data non indicata";
const modalita = { consegna_diretta: "Contanti / consegna in parrocchia", bonifico: "Bonifico", paypal: "PayPal", link: "Link di pagamento / carte" };
const stati = { prenotata: "Prenotata", registrata: "Registrata", da_regolarizzare: "Da regolarizzare", annullata: "Annullata" };
const tipi = { defunto: "Per un defunto", persona_vivente: "Per una persona vivente", ringraziamento: "In ringraziamento", altra: "Altra intenzione" };
const btn = { padding: "11px 16px", border: "1px solid #173955", borderRadius: 10, background: "#173955", color: "white", fontWeight: 700, cursor: "pointer" };
const campo = { width: "100%", boxSizing: "border-box", padding: "11px", border: "1px solid #cbbda9", borderRadius: 8, background: "white", color: "#173955", fontSize: 16 };
const scheda = { padding: 22, marginTop: 18, border: "1px solid #ddd0bf", borderRadius: 14, background: "#fffdf9" };
function adessoLocale() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function IntenzioniMesseParroco({ parrocchiaId, tornaCelebrazioni }) {
  const [intenzioni, setIntenzioni] = useState([]);
  const [offerte, setOfferte] = useState([]);
  const [puoPagamenti, setPuoPagamenti] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [erroreOfferte, setErroreOfferte] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [dal, setDal] = useState("");
  const [al, setAl] = useState("");
  const [selezionata, setSelezionata] = useState(null);
  const [modulo, setModulo] = useState(null);
  const invio = useRef(null);
  const occupato = useRef(false);

  const carica = useCallback(async () => {
    setCaricamento(true); setErrore(""); setErroreOfferte("");
    setPuoPagamenti(false); setOfferte([]); setIntenzioni([]);
    try {
      if (!parrocchiaId) throw new Error("Parrocchia non riconosciuta.");
      const [elenco, permesso] = await Promise.all([
        supabase.rpc("ars_elenco_intenzioni_parroco", { p_parrocchia_id: parrocchiaId, p_data_dal: null, p_data_al: null }),
        supabase.rpc("ars_puo_gestire_pagamenti", { p_parrocchia_id: parrocchiaId }),
      ]);
      if (elenco.error) throw elenco.error;
      setIntenzioni(elenco.data || []);
      if (permesso.error) { setErroreOfferte(permesso.error.message); return; }
      setPuoPagamenti(permesso.data === true);
      if (permesso.data === true) {
        const r = await supabase.rpc("ars_elenco_offerte_intenzioni_parroco", { p_parrocchia_id: parrocchiaId, p_intenzione_id: null });
        if (r.error) setErroreOfferte(r.error.message);
        else setOfferte(r.data || []);
      }
    } catch (e) { setErrore(e.message || "Errore durante il caricamento."); }
    finally { setCaricamento(false); }
  }, [parrocchiaId]);
  useEffect(() => { setSelezionata(null); setModulo(null); invio.current = null; carica(); }, [carica]);

  const visibili = useMemo(() => intenzioni.filter((i) => {
    const testo = `${i.testo_intenzione || ""} ${i.nome_richiedente || ""} ${i.luogo || ""}`.toLocaleLowerCase("it-IT");
    return testo.includes(ricerca.trim().toLocaleLowerCase("it-IT")) && (!dal || i.data_celebrazione >= dal) && (!al || i.data_celebrazione <= al);
  }), [intenzioni, ricerca, dal, al]);
  const incassi = selezionata ? offerte.filter((p) => p.intenzione_messa_id === selezionata.intenzione_id) : [];
  const totale = (id) => offerte.filter((p) => p.intenzione_messa_id === id && p.stato === "completata").reduce((n, p) => n + Number(p.importo), 0);

  function apriOfferta() {
    invio.current = null; setErrore(""); setMessaggio("");
    setModulo({ importo: "", modalita: "consegna_diretta", data: adessoLocale(), riferimento: "", note: "", verificato: false });
  }
  function cambia(k, v) { setModulo((m) => ({ ...m, [k]: v })); }
  async function registra(e) {
    e.preventDefault();
    if (occupato.current || !modulo || !selezionata) return;
    setErrore(""); setMessaggio("");
    const importo = Number(modulo.importo.replace(",", "."));
    if (!Number.isFinite(importo) || importo <= 0) { setErrore("Indica un importo positivo."); return; }
    if (!modulo.verificato) { setErrore("Conferma che l’offerta è stata effettivamente ricevuta."); return; }
    const data = new Date(modulo.data);
    if (!Number.isFinite(data.getTime())) { setErrore("Indica la data di incasso."); return; }
    const online = ["paypal", "link"].includes(modulo.modalita);
    if (online && !modulo.riferimento.trim()) { setErrore("Indica il riferimento dell’operazione online."); return; }
    const payload = {
      p_parrocchia_id: parrocchiaId, p_intenzione_id: selezionata.intenzione_id,
      p_importo: importo, p_modalita: modulo.modalita, p_data_pagamento: data.toISOString(),
      p_riferimento_esterno: modulo.riferimento.trim() || null, p_note_private: modulo.note.trim() || null,
    };
    const firma = JSON.stringify(payload);
    if (invio.current && invio.current.firma !== firma) {
      setErrore("Il precedente invio non è stato confermato. Riprova con gli stessi dati oppure annulla e controlla gli incassi prima di modificarli."); return;
    }
    if (!invio.current) invio.current = { firma, id: crypto.randomUUID() };
    occupato.current = true; setSalvataggio(true);
    try {
      const r = await supabase.rpc("ars_registra_offerta_intenzione_parroco", { ...payload, p_registrazione_id: invio.current.id });
      if (r.error) throw r.error;
      // Conferma l'incasso subito: un successivo errore di lettura non invita a registrarlo di nuovo.
      setModulo(null); invio.current = null;
      setMessaggio("Offerta registrata correttamente.");
      await carica();
    } catch (err) { setErrore(err.message || "Invio non confermato. Riprova con gli stessi dati o controlla gli incassi."); }
    finally { occupato.current = false; setSalvataggio(false); }
  }

  return <div style={{ minHeight: "100vh", background: "#f7f3ed", padding: "28px 20px", color: "#173955", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 1050, margin: "auto" }}>
      <button type="button" disabled={salvataggio} style={btn} onClick={tornaCelebrazioni}>← Torna a Celebrazioni</button>
      <h1>Intenzioni per le Messe</h1>
      <p>Intenzioni prenotate e da regolarizzare, con le offerte ricevute. L’offerta resta facoltativa.</p>
      {messaggio && <p role="status" style={{ padding: 14, background: "#e8f4e5" }}>{messaggio}</p>}
      {errore && <p role="alert" style={{ padding: 14, background: "#ffe9e5", color: "#812e22" }}>{errore}</p>}
      {erroreOfferte && <p role="alert" style={{ padding: 14, background: "#fff1d4" }}>Offerte non disponibili: {erroreOfferte}</p>}
      {caricamento ? <p>Caricamento…</p> : selezionata ? <>
        <button type="button" disabled={salvataggio} style={btn} onClick={() => { setSelezionata(null); setModulo(null); invio.current = null; setErrore(""); }}>← Torna all’elenco</button>
        <section style={scheda}>
          <h2 style={{ whiteSpace: "pre-wrap" }}>{selezionata.testo_intenzione}</h2>
          <p>{dataIt(selezionata.data_celebrazione)} · ore {selezionata.ora_celebrazione?.slice(0, 5)} · {selezionata.luogo || "Parrocchia"}</p>
          <p>Richiedente: <strong>{selezionata.nome_richiedente}</strong></p>
          {selezionata.contatto_richiedente && <p>Contatto: {selezionata.contatto_richiedente}</p>}
          <p>{tipi[selezionata.tipo_intenzione] || "Intenzione"} · {stati[selezionata.stato] || selezionata.stato} · {selezionata.pubblicabile ? "Visibile alla comunità" : "Riservata"}</p>
          {puoPagamenti && !erroreOfferte && <>
            <h3>Offerte ricevute: {euro(totale(selezionata.intenzione_id))}</h3>
            {incassi.length === 0 ? <p>Nessuna offerta registrata.</p> : incassi.map((p) => <div key={p.id} style={{ borderTop: "1px solid #ddd0bf", padding: "12px 0", overflowWrap: "anywhere" }}>
              <strong>{euro(p.importo)}</strong> · {modalita[p.gestore_pagamento || p.metodo] || "Pagamento online"} · {p.stato === "completata" ? "Ricevuta" : p.stato}
              {p.data_offerta && <div>{new Date(p.data_offerta).toLocaleString("it-IT")}</div>}
              {p.riferimento_esterno && <div>Riferimento: {p.riferimento_esterno}</div>}
              {p.note_private && <div style={{ whiteSpace: "pre-wrap" }}>Nota riservata: {p.note_private}</div>}
            </div>)}
            {!modulo && <button type="button" style={btn} onClick={apriOfferta}>Registra offerta ricevuta</button>}
          </>}
          {!puoPagamenti && !erroreOfferte && <p>La gestione delle offerte richiede il permesso di gestione dei pagamenti.</p>}
        </section>
        {modulo && <form onSubmit={registra} style={scheda}>
          <h2>Registra offerta ricevuta</h2>
          <fieldset disabled={salvataggio} style={{ border: 0, padding: 0, margin: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              <label>Importo (€)<input autoFocus type="text" inputMode="decimal" style={campo} value={modulo.importo} onChange={(e) => cambia("importo", e.target.value)} required /></label>
              <label>Modalità<select style={campo} value={modulo.modalita} onChange={(e) => cambia("modalita", e.target.value)}>{Object.entries(modalita).map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
              <label>Data e ora di incasso<input type="datetime-local" style={campo} value={modulo.data} onChange={(e) => cambia("data", e.target.value)} required /></label>
              <label>Riferimento operazione { ["paypal", "link"].includes(modulo.modalita) ? "(obbligatorio)" : "(facoltativo)" }<input style={campo} value={modulo.riferimento} onChange={(e) => cambia("riferimento", e.target.value)} required={["paypal", "link"].includes(modulo.modalita)} /></label>
            </div>
            <label style={{ display: "block", marginTop: 18 }}>Nota riservata<textarea rows={3} style={campo} value={modulo.note} onChange={(e) => cambia("note", e.target.value)} /></label>
            <label style={{ display: "block", margin: "20px 0" }}><input type="checkbox" checked={modulo.verificato} onChange={(e) => cambia("verificato", e.target.checked)} required /> Confermo che l’offerta è stata ricevuta e verificata.</label>
            <p>Per PayPal e link controlla l’incasso sul servizio prima di registrarlo. L’apertura del link non conferma il pagamento.</p>
            <button type="submit" style={btn}>{salvataggio ? "Registrazione…" : "Conferma incasso"}</button>{" "}
            <button type="button" style={{ ...btn, background: "white", color: "#173955" }} onClick={() => { setModulo(null); invio.current = null; setErrore(""); carica(); }}>Annulla e aggiorna incassi</button>
          </fieldset>
        </form>}
      </> : <>
        <div style={{ ...scheda, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <label>Cerca intenzione o richiedente<input style={campo} value={ricerca} onChange={(e) => setRicerca(e.target.value)} /></label>
          <label>Messe dal<input type="date" style={campo} value={dal} onChange={(e) => setDal(e.target.value)} /></label>
          <label>Al<input type="date" style={campo} value={al} onChange={(e) => setAl(e.target.value)} /></label>
        </div>
        <p>{visibili.length} intenzioni</p>
        <button type="button" style={btn} onClick={carica}>Aggiorna elenco</button>
        {visibili.length === 0 && <p>Nessuna intenzione corrisponde alla ricerca.</p>}
        {visibili.map((i) => <section key={i.intenzione_id} style={scheda}>
          <p>{dataIt(i.data_celebrazione)} · ore {i.ora_celebrazione?.slice(0, 5)} · {i.luogo || "Parrocchia"}</p>
          <h2 style={{ whiteSpace: "pre-wrap" }}>{i.testo_intenzione}</h2>
          <p>{i.nome_richiedente} · {stati[i.stato] || i.stato}</p>
          {puoPagamenti && !erroreOfferte && <p>Offerte ricevute: <strong>{euro(totale(i.intenzione_id))}</strong></p>}
          <button type="button" style={btn} onClick={() => { setSelezionata(i); setModulo(null); invio.current = null; setErrore(""); setMessaggio(""); }}>Apri dettaglio{puoPagamenti ? " e offerte" : ""}</button>
        </section>)}
      </>}
    </div>
  </div>;
}
