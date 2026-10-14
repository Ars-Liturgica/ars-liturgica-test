import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const colori = {
  testo: "#51351f", marrone: "#765638", oro: "#d9b77d", bordo: "#e5d6c1",
  fondo: "#fffaf2", bianco: "#ffffff",
};
const stile = {
  titolo: { color: "#182b40", margin: "0 0 18px", fontSize: "1.5rem" },
  griglia: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 215px), 1fr))", gap: 12 },
  card: { appearance: "none", background: colori.fondo, border: `1px solid ${colori.bordo}`, borderRadius: 12, padding: "15px 16px", color: colori.testo, textAlign: "left", cursor: "pointer", width: "100%", font: "inherit", boxShadow: "0 2px 7px rgba(80,50,25,.04)", transition: "background .15s, border-color .15s" },
  cardAttiva: { borderColor: colori.marrone, background: "#f4e9d8" },
  dettaglio: { marginTop: 18, padding: "18px 20px", border: `1px solid ${colori.bordo}`, borderRadius: 12, background: colori.bianco, color: colori.testo },
  etichetta: { display: "inline-block", background: "#efe4d5", color: colori.marrone, borderRadius: 20, padding: "3px 9px", fontSize: ".78rem", marginTop: 9 },
  pulsante: { padding: "9px 13px", background: colori.marrone, color: "white", border: "none", borderRadius: 8, cursor: "pointer", font: "inherit" },
  campo: { width: "100%", padding: 9, border: `1px solid ${colori.bordo}`, borderRadius: 7, boxSizing: "border-box", font: "inherit" },
};
function formattaTipo(tipo) {
  return String(tipo || "altro").replace(/_/g, " ").replace(/\b\w/g, (lettera) => lettera.toUpperCase());
}
function formattaData(data) {
  if (!data) return "—";
  const valore = new Date(data);
  return Number.isNaN(valore.getTime()) ? "—" : valore.toLocaleDateString("it-IT");
}
function statoAttivita(motivo) {
  const valore = String(motivo || "").toLowerCase();
  if (valore.includes("annull")) return "Annullata";
  if (valore.includes("conclus") || valore.includes("scad") || valore.includes("termin")) return "Conclusa";
  return formattaTipo(motivo || "Archiviata");
}
function euro(importo) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(importo) || 0);
}
function numeroImporto(testo) {
  const valore = String(testo || "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(valore)) return null;
  const numero = Number(valore);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}
function creaUuid() {
  // Identificativo stabile per il singolo tentativo, riutilizzato se il salvataggio viene ripetuto.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  throw new Error("Il browser non supporta la generazione sicura degli identificativi delle operazioni.");
}

function FascicoloEconomico({ fascicolo }) {
  const annullata = fascicolo.stato === "annullata";
  const [righe, setRighe] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [operazione, setOperazione] = useState(null);
  const [importo, setImporto] = useState("");
  const [metodo, setMetodo] = useState("");
  const [riferimento, setRiferimento] = useState("");
  const [dichiarazione, setDichiarazione] = useState("");
  const [inSalvataggio, setInSalvataggio] = useState(false);
  const [aggiornamento, setAggiornamento] = useState(0);
  const [operazioneId, setOperazioneId] = useState(null);
  const [dataOperazione, setDataOperazione] = useState(null);

  useEffect(() => {
    let attivo = true;
    async function carica() {
      setCaricamento(true);
      setErrore("");
      try {
        const funzione = annullata ? "ars_elenco_rimborsi_attivita_parroco" : "ars_quote_attivita_conclusa_parroco";
        const { data, error } = await supabase.rpc(funzione, { p_attivita_id: fascicolo.id });
        if (!attivo) return;
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Il servizio non ha restituito un elenco valido.");
        setRighe(data);
      } catch (e) {
        if (attivo) setErrore(e.message || "Impossibile leggere il fascicolo economico.");
      } finally {
        if (attivo) setCaricamento(false);
      }
    }
    carica();
    return () => { attivo = false; };
  }, [fascicolo.id, annullata, aggiornamento]);

  function apriOperazione(pagamento, tipo) {
    setOperazione({ pagamento, tipo });
    setImporto(""); setMetodo(""); setRiferimento(""); setDichiarazione("");
    setOperazioneId(null); setDataOperazione(null); setErrore(""); setMessaggio("");
  }
  async function registra(e) {
    e.preventDefault();
    if (!operazione || inSalvataggio) return;
    const cifra = numeroImporto(importo);
    const residuo = Number(operazione.pagamento.residuo) || 0;
    if (cifra === null || Math.round(cifra * 100) > Math.round(residuo * 100)) {
      setErrore("Indica un importo positivo, non superiore al residuo disponibile."); return;
    }
    if (operazione.tipo === "rimborso" && !metodo) {
      setErrore("Seleziona il metodo di rimborso."); return;
    }
    if (operazione.tipo === "donazione" && !dichiarazione.trim()) {
      setErrore("Riporta la dichiarazione volontaria della famiglia."); return;
    }
    if (!window.confirm(`Confermi la registrazione di ${euro(cifra)} come ${operazione.tipo}?`)) return;
    setInSalvataggio(true); setErrore("");
    try {
      const id = operazioneId || creaUuid();
      const data = dataOperazione || new Date().toISOString();
      // Conserva UUID e data anche se la risposta del server si perde: ritentare non duplica l'operazione.
      setOperazioneId(id); setDataOperazione(data);
      const { error } = await supabase.rpc("ars_registra_regolazione_quota_cancellata", {
        p_pagamento_id: operazione.pagamento.pagamento_id,
        p_operazione_id: id,
        p_tipo: operazione.tipo,
        p_importo: cifra,
        p_data: data,
        p_metodo: operazione.tipo === "rimborso" ? metodo : null,
        p_riferimento: riferimento.trim() || null,
        p_dichiarazione: operazione.tipo === "donazione" ? dichiarazione.trim() : null,
      });
      if (error) throw error;
      setOperazione(null); setOperazioneId(null); setDataOperazione(null);
      setMessaggio("Operazione registrata correttamente.");
      setAggiornamento((n) => n + 1);
    } catch (e) {
      setErrore(`${e.message || "Registrazione non riuscita."} Se la connessione si è interrotta, riprova senza cambiare i dati.`);
    } finally { setInSalvataggio(false); }
  }

  const totaleResiduo = righe.reduce((somma, r) => somma + Number(r.residuo || 0), 0);
  return (
    <div style={{ marginTop: 18 }}>
      <h4 style={{ color: colori.testo, marginBottom: 10 }}>Situazione economica</h4>
      {caricamento ? <p>Caricamento movimenti...</p> : null}
      {errore && <p role="alert" style={{ color: "#9b2929" }}>{errore}</p>}
      {messaggio && <p role="status" style={{ color: "#28633c" }}>{messaggio}</p>}
      {!caricamento && !errore && (
        <>
          <p><strong>{annullata ? "Somme ancora da regolare" : "Quote ancora da riscuotere"}: {euro(totaleResiduo)}</strong></p>
          {righe.length === 0 && <p>Nessuna posizione economica disponibile.</p>}
          {righe.map((r) => {
            const chiave = annullata ? r.pagamento_id : r.iscrizione_id;
            return (
              <div key={chiave} style={{ padding: "13px 0", borderTop: `1px solid ${colori.bordo}` }}>
                <strong>{r.partecipante || "Partecipante"}</strong>
                {annullata ? (
                  <>
                    <p style={{ margin: "7px 0" }}>Versante: {r.versante || "Da identificare"}</p>
                    <p style={{ margin: "7px 0" }}>Versato: {euro(r.versato)} · Rimborsato: {euro(r.rimborsato)} · Donato: {euro(r.donato)} · <strong>Da regolare: {euro(r.residuo)}</strong></p>
                    {Number(r.residuo) > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <button type="button" style={stile.pulsante} onClick={() => apriOperazione(r, "rimborso")}>Registra rimborso</button>
                        <button type="button" style={stile.pulsante} onClick={() => apriOperazione(r, "donazione")}>Registra donazione</button>
                      </div>
                    )}
                    {Array.isArray(r.storico) && r.storico.length > 0 && (
                      <details style={{ marginTop: 8 }}><summary>Storico regolazioni ({r.storico.length})</summary>
                        <ul>{r.storico.map((s) => <li key={s.id}>{formattaData(s.data)} · {formattaTipo(s.tipo)} {euro(s.importo)}{s.metodo ? ` · ${formattaTipo(s.metodo)}` : ""}</li>)}</ul>
                      </details>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ margin: "7px 0" }}>Quota: {euro(r.quota_dovuta)} · Incassato: {euro(r.versato)} · <strong>Residuo calcolato: {euro(r.residuo)}</strong>{r.esente ? " · Esente" : ""}</p>
                    <p style={{ margin: "5px 0", fontSize: ".88rem" }}>Stato iscrizione: {r.stato_iscrizione || "—"}</p>
                    {Array.isArray(r.pagamenti) && r.pagamenti.length > 0 && (
                      <details><summary>Pagamenti registrati ({r.pagamenti.length})</summary>
                        <ul>{r.pagamenti.map((p) => <li key={p.pagamento_id}>{formattaData(p.data)} · {euro(p.importo)} · {formattaTipo(p.metodo)}</li>)}</ul>
                      </details>
                    )}
                  </>
                )}
              </div>
            );
          })}
          {!annullata && <p style={{ fontSize: ".88rem", opacity: .85 }}>Riepilogo informativo: prima di riscuotere quote residue, verificare eventuali iscrizioni ritirate o annullate. La registrazione degli incassi rimane nella contabilità dell'attività.</p>}
          {annullata && totaleResiduo === 0 && <p><strong>Regolazioni economiche completate.</strong> La chiusura complessiva richiede anche le altre verifiche previste dalla parrocchia.</p>}
        </>
      )}
      {operazione && (
        <form onSubmit={registra} style={{ marginTop: 16, padding: 15, background: colori.fondo, border: `1px solid ${colori.bordo}`, borderRadius: 10 }}>
          <h4 style={{ marginTop: 0 }}>{operazione.tipo === "rimborso" ? "Registra rimborso" : "Registra donazione volontaria"}</h4>
          <p>Disponibile: <strong>{euro(operazione.pagamento.residuo)}</strong></p>
          <label>Importo (€)<input required inputMode="decimal" value={importo} onChange={(e) => { setImporto(e.target.value); setOperazioneId(null); setDataOperazione(null); }} style={stile.campo} placeholder="Es. 100,00" /></label>
          {operazione.tipo === "rimborso" && (
            <label style={{ display: "block", marginTop: 12 }}>Metodo di rimborso
              <select required value={metodo} onChange={(e) => { setMetodo(e.target.value); setOperazioneId(null); setDataOperazione(null); }} style={stile.campo}>
                <option value="">Seleziona...</option><option value="consegna_diretta">Consegna diretta</option>
                <option value="bonifico">Bonifico</option><option value="paypal">PayPal</option><option value="link_pagamento">Link di pagamento</option>
              </select>
            </label>
          )}
          <label style={{ display: "block", marginTop: 12 }}>Riferimento (facoltativo)
            <input value={riferimento} maxLength={500} onChange={(e) => { setRiferimento(e.target.value); setOperazioneId(null); setDataOperazione(null); }} style={stile.campo} />
          </label>
          {operazione.tipo === "donazione" && (
            <label style={{ display: "block", marginTop: 12 }}>Dichiarazione volontaria della famiglia
              <textarea required maxLength={2000} rows={3} value={dichiarazione} onChange={(e) => { setDichiarazione(e.target.value); setOperazioneId(null); setDataOperazione(null); }} style={stile.campo} />
            </label>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="submit" disabled={inSalvataggio} style={stile.pulsante}>{inSalvataggio ? "Registrazione..." : "Conferma operazione"}</button>
            <button type="button" disabled={inSalvataggio} onClick={() => { setOperazione(null); setOperazioneId(null); setDataOperazione(null); }} style={{ ...stile.pulsante, background: "#eee", color: colori.testo }}>Annulla</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ArchivioAttivita({ parrocchiaId }) {
  const [attivita, setAttivita] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [tipoAperto, setTipoAperto] = useState(null);
  const [fascicoloAperto, setFascicoloAperto] = useState(null);
  useEffect(() => {
    let attivo = true;
    async function caricaArchivio() {
      setCaricamento(true); setErrore(""); setAttivita([]);
      if (!parrocchiaId) { setErrore("Parrocchia non disponibile."); setCaricamento(false); return; }
      try {
        const { data, error } = await supabase.from("ars_archivio_attivita").select("*").eq("parrocchia_id", parrocchiaId).order("titolo", { ascending: true });
        if (!attivo) return;
        if (error) setErrore(error.message); else setAttivita(data || []);
      } catch (error) { if (attivo) setErrore(error?.message || "Impossibile caricare l'archivio."); }
      finally { if (attivo) setCaricamento(false); }
    }
    caricaArchivio();
    return () => { attivo = false; };
  }, [parrocchiaId]);
  const cartelle = useMemo(() => {
    const risultato = {};
    for (const elemento of attivita) {
      const tipo = elemento.tipo || "altro";
      if (!risultato[tipo]) risultato[tipo] = [];
      risultato[tipo].push(elemento);
    }
    return risultato;
  }, [attivita]);
  const elencoAperto = tipoAperto ? cartelle[tipoAperto] || [] : [];
  const fascicolo = elencoAperto.find((elemento) => elemento.id === fascicoloAperto);
  if (caricamento) return <p>Caricamento archivio attività...</p>;
  if (errore) return <p role="alert">{errore}</p>;
  return (
    <section aria-label="Archivio attività">
      <h2 style={stile.titolo}>Archivio attività</h2>
      {Object.keys(cartelle).length === 0 && <p>Nessuna attività archiviata.</p>}
      <div style={stile.griglia}>
        {Object.entries(cartelle).map(([tipo, elenco]) => {
          const aperta = tipoAperto === tipo;
          return (
            <button key={tipo} type="button" aria-expanded={aperta}
              onClick={() => { setTipoAperto(aperta ? null : tipo); setFascicoloAperto(null); }}
              style={{ ...stile.card, ...(aperta ? stile.cardAttiva : {}) }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ fontSize: 25, color: colori.marrone }}>▣</span>
                <strong style={{ fontSize: "1.08rem" }}>{formattaTipo(tipo)}</strong>
              </span>
              <span style={{ display: "block", marginTop: 7, fontSize: ".85rem", opacity: .8 }}>
                {elenco.length} {elenco.length === 1 ? "fascicolo" : "fascicoli"} · {aperta ? "Chiudi" : "Apri"} →
              </span>
            </button>
          );
        })}
      </div>
      {tipoAperto && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: colori.testo, fontSize: "1.15rem", margin: "0 0 12px" }}>Fascicoli · {formattaTipo(tipoAperto)}</h3>
          <div style={stile.griglia}>
            {elencoAperto.map((elemento) => {
              const aperto = fascicoloAperto === elemento.id;
              return (
                <button key={elemento.id} type="button" aria-expanded={aperto}
                  onClick={() => setFascicoloAperto(aperto ? null : elemento.id)}
                  style={{ ...stile.card, background: colori.bianco, ...(aperto ? stile.cardAttiva : {}) }}>
                  <span style={{ display: "block", color: colori.marrone, fontSize: 22, marginBottom: 5 }} aria-hidden="true">▤</span>
                  <strong style={{ display: "block", lineHeight: 1.35, overflowWrap: "anywhere" }}>{elemento.titolo || "Attività senza titolo"}</strong>
                  <span style={stile.etichetta}>{statoAttivita(elemento.motivo_archiviazione)}</span>
                  <span style={{ display: "block", marginTop: 9, fontSize: ".82rem", opacity: .8 }}>Fine: {formattaData(elemento.data_fine)}</span>
                  <span style={{ display: "block", marginTop: 7, fontSize: ".82rem" }}>{aperto ? "Chiudi dettagli ↑" : "Apri fascicolo →"}</span>
                </button>
              );
            })}
          </div>
          {fascicolo && (
            <article style={stile.dettaglio}>
              <h3 style={{ margin: "0 0 12px", color: colori.testo }}>{fascicolo.titolo}</h3>
              <p><strong>Stato:</strong> {statoAttivita(fascicolo.motivo_archiviazione)}</p>
              <p><strong>Descrizione:</strong> {fascicolo.descrizione || "—"}</p>
              <p><strong>Inizio:</strong> {formattaData(fascicolo.data_inizio)}</p>
              <p><strong>Fine:</strong> {formattaData(fascicolo.data_fine)}</p>
              <FascicoloEconomico key={fascicolo.id} fascicolo={fascicolo} />
            </article>
          )}
        </div>
      )}
    </section>
  );
}
