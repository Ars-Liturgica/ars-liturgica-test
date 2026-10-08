import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "../../../supabaseClient";

const ETICHETTE_QUOTA = { da_pagare: "Non pagato", parziale: "Parziale", saldata: "Saldato", esente: "Esente", gratuita: "Gratuita", contributo_libero: "Contributo libero" };
const numero = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const nomeRagazzo = (r) => [r.cognome_partecipante, r.nome_partecipante].filter(Boolean).join(" ");
const nomeGenitore = (r) => [r.genitore_cognome, r.genitore_nome].filter(Boolean).join(" ") || "Referente non indicato";
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const PROMEMORIA = "Gentile famiglia, vi ricordiamo che per l’attività indicata risulta ancora una quota da completare. Se avete già effettuato il versamento, vi chiediamo cortesemente di comunicarlo alla segreteria, così da aggiornare il riepilogo. Grazie per la collaborazione.";

function totaliQuote(righe) {
  return righe.reduce((t, r) => ({ dovuto: t.dovuto + numero(r.dovuto), pagato: t.pagato + numero(r.pagato), residuo: t.residuo + numero(r.residuo), in_attesa: t.in_attesa + numero(r.in_attesa) }), { dovuto: 0, pagato: 0, residuo: 0, in_attesa: 0 });
}

function raggruppaFamiglie(righe) {
  const mappa = new Map();
  righe.forEach((r) => {
    const chiave = r.famiglia_id || `iscrizione:${r.id}`;
    if (!mappa.has(chiave)) mappa.set(chiave, { id: chiave, righe: [] });
    mappa.get(chiave).righe.push(r);
  });
  return [...mappa.values()].map((f) => ({ ...f, ...totaliQuote(f.righe), nomi: [...new Map(f.righe.map((r) => { const nome = nomeGenitore(r); return [nome.trim().replace(/\s+/g, " ").toLocaleLowerCase("it-IT"), nome]; })).values()].join(" / "), telefoni: [...new Set(f.righe.map((r) => r.telefono_contatto).filter(Boolean))].join(" / ") }));
}

// Anteprima separata: contiene soltanto i dati scelti, pronti anche per Salva PDF.
function apriStampa(titolo, corpo) {
  const finestra = window.open("", "_blank");
  if (!finestra) throw new Error("Consenti l’apertura dell’anteprima di stampa nel browser.");
  finestra.opener = null;
  finestra.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${escapeHtml(titolo)}</title><style>
    body{font:14px Georgia,serif;color:#213b4c;margin:32px}h1{font-size:25px}h2{font-size:19px}p{line-height:1.6}table{width:100%;border-collapse:collapse;font:12px Arial,sans-serif}th,td{padding:9px 7px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{background:#f4f1eb}td.numero{text-align:right;white-space:nowrap}thead{display:table-header-group}tr{break-inside:avoid}.meta{color:#555}.firma{margin-top:32px}.testo{white-space:pre-line}.totale{background:#f4f1eb;padding:18px;margin-top:22px}.azioni{margin-bottom:25px}button{padding:10px 18px;cursor:pointer}@page{size:A4;margin:16mm}@media print{body{margin:0}.azioni{display:none}}
    </style></head><body><div class="azioni"><button type="button" onclick="window.print()">Stampa / Salva PDF</button></div>${corpo}</body></html>`);
  finestra.document.close();
}

function righeStampa(righe, valuta) {
  return righe.map((r) => `<tr><td>${escapeHtml(nomeGenitore(r))}<br>${escapeHtml(r.telefono_contatto || "")}</td><td>${escapeHtml(nomeRagazzo(r))}</td><td>${escapeHtml((r.gruppi || []).map((g) => g.nome).join(", ") || "Non assegnato")}</td><td class="numero">${escapeHtml(formattaImporto(r.dovuto, valuta))}</td><td class="numero">${escapeHtml(formattaImporto(r.pagato, valuta))}</td><td class="numero">${escapeHtml(formattaImporto(r.residuo, valuta))}</td><td>${escapeHtml(ETICHETTE_QUOTA[r.stato_quota] || r.stato_quota)}</td></tr>`).join("");
}

export default function PagamentiParrocchia({ parrocchiaId, tornaDashboard, nomeParrocchia = "" }) {
  const [pagina, setPagina] = useState("quote");
  return <div className="ars-pagina-economica">
    <style>{STILI_ECONOMIA}</style>
    <nav className="ars-scelta-economica azioni-non-stampabili" aria-label="Gestione economica">
      <button type="button" aria-pressed={pagina === "quote"} onClick={() => setPagina("quote")}>Quote delle attività</button>
      <button type="button" aria-pressed={pagina === "registro"} onClick={() => setPagina("registro")}>Bilancio delle attività</button>
    </nav>
    {pagina === "quote" ? <QuoteAttivita key={parrocchiaId || "nessuna"} parrocchiaId={parrocchiaId} tornaDashboard={tornaDashboard} nomeParrocchia={nomeParrocchia} /> : <RegistroMovimenti key={parrocchiaId || "nessuna"} parrocchiaId={parrocchiaId} tornaDashboard={tornaDashboard} nomeParrocchia={nomeParrocchia} />}
  </div>;
}

function QuoteAttivita({ parrocchiaId, tornaDashboard, nomeParrocchia }) {
  const [attivita, setAttivita] = useState([]);
  const [attivitaId, setAttivitaId] = useState("");
  const [dati, setDati] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [gruppoId, setGruppoId] = useState("");
  const [soloSospesi, setSoloSospesi] = useState(false);
  const [revisione, setRevisione] = useState(0);
  const [pagamento, setPagamento] = useState(null);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errorePagamento, setErrorePagamento] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [famigliaPromemoria, setFamigliaPromemoria] = useState("");
  const [testoPromemoria, setTestoPromemoria] = useState(PROMEMORIA);
  const [intestazioneStampa, setIntestazioneStampa] = useState(nomeParrocchia || "Segreteria parrocchiale");
  const [metodi, setMetodi] = useState([]);
  const [erroreMetodi, setErroreMetodi] = useState("");
  const salvaInCorso = useRef(false);
  const richiestaQuote = useRef(0);
  const vivo = useRef(true);
  const pannelloPagamento = useRef(null);
  const pannelloPromemoria = useRef(null);

  useEffect(() => { vivo.current = true; return () => { vivo.current = false; }; }, []);
  useEffect(() => { if (pagamento) pannelloPagamento.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [pagamento?.riga.id]);
  useEffect(() => { if (famigliaPromemoria) pannelloPromemoria.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [famigliaPromemoria]);

  useEffect(() => {
    let attuale = true;
    if (!parrocchiaId) { setErrore("Seleziona una parrocchia."); setCaricamento(false); return; }
    async function carica() {
      try {
        const { data, error } = await supabase.rpc("ars_elenco_attivita_parroco", { p_parrocchia_id: parrocchiaId });
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Impossibile leggere l’elenco delle attività.");
        if (!attuale) return;
        setAttivita(data);
        setAttivitaId(data[0]?.id || "");
        if (!data.length) setCaricamento(false);
      } catch (e) { if (attuale) { setErrore(e.message || "Impossibile caricare le attività."); setCaricamento(false); } }
    }
    carica();
    return () => { attuale = false; };
  }, [parrocchiaId]);

  useEffect(() => {
    let attuale = true;
    if (!parrocchiaId) return;
    async function carica() {
      try {
        const { data, error } = await supabase.rpc("ars_elenco_metodi_incasso_pubblici", { p_parrocchia_id: parrocchiaId });
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Risposta dei metodi di pagamento inattesa.");
        if (attuale) setMetodi(data);
      } catch (e) { if (attuale) setErroreMetodi("Metodi di pagamento non disponibili: il promemoria inviterà a contattare la segreteria."); }
    }
    carica();
    return () => { attuale = false; };
  }, [parrocchiaId]);

  useEffect(() => {
    if (!attivitaId) return;
    let attuale = true;
    const richiesta = ++richiestaQuote.current;
    setCaricamento(true); setErrore(""); setDati(null);
    async function carica() {
      try {
        const { data, error } = await supabase.rpc("ars_riepilogo_quote_attivita_parroco", { p_parrocchia_id: parrocchiaId, p_attivita_id: attivitaId });
        if (error) throw error;
        if (!data || !Array.isArray(data.iscrizioni)) throw new Error("Impossibile leggere il riepilogo delle quote.");
        if (attuale && richiesta === richiestaQuote.current) setDati(data);
      } catch (e) { if (attuale) setErrore(e.message || "Impossibile caricare le quote."); }
      finally { if (attuale) setCaricamento(false); }
    }
    carica();
    return () => { attuale = false; };
  }, [parrocchiaId, attivitaId, revisione]);

  const iscrizioni = dati?.iscrizioni || [];
  const valuta = dati?.attivita?.valuta || "EUR";
  const gruppi = useMemo(() => {
    const mappa = new Map();
    (dati?.iscrizioni || []).forEach((r) => (r.gruppi || []).forEach((g) => mappa.set(g.id, g)));
    return [...mappa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
  }, [dati]);
  const righeVisibili = iscrizioni.filter((r) => (!gruppoId || (gruppoId === "non_assegnati" ? !(r.gruppi || []).length : (r.gruppi || []).some((g) => g.id === gruppoId))) && (!soloSospesi || numero(r.residuo) > 0));
  const famiglieVisibili = raggruppaFamiglie(righeVisibili);
  const famiglieComplete = raggruppaFamiglie(iscrizioni);
  const totali = totaliQuote(righeVisibili);
  const titolo = dati?.attivita?.titolo || "Attività";
  const gruppoNome = gruppoId === "non_assegnati" ? "Non assegnati" : gruppi.find((g) => g.id === gruppoId)?.nome || "Tutti i gruppi";

  function cambiaAttivita(e) {
    richiestaQuote.current += 1;
    setDati(null); setCaricamento(true); setAttivitaId(e.target.value); setGruppoId(""); setPagamento(null); setFamigliaPromemoria(""); setMessaggio("");
  }

  function nuovoPagamento(r) {
    setErrorePagamento(""); setMessaggio("");
    setPagamento({ riga: r, importo: numero(r.residuo) > 0 ? numero(r.residuo).toFixed(2) : "", metodo: "consegna_diretta", data: new Date().toLocaleDateString("sv-SE"), note: "" });
  }

  async function salvaPagamento(e) {
    e.preventDefault();
    if (!pagamento || salvaInCorso.current) return;
    const importo = numero(String(pagamento.importo).replace(",", "."));
    if (importo <= 0) { setErrorePagamento("Indica un importo maggiore di zero."); return; }
    if (pagamento.riga.stato_quota !== "contributo_libero" && importo > numero(pagamento.riga.residuo)) { setErrorePagamento("L’importo supera il residuo dell’iscrizione."); return; }
    const data = new Date(`${pagamento.data}T12:00:00`);
    if (Number.isNaN(data.getTime())) { setErrorePagamento("Indica una data valida."); return; }
    salvaInCorso.current = true; setSalvataggio(true); setErrorePagamento("");
    try {
      const { error } = await supabase.rpc("ars_registra_pagamento_attivita", {
        p_parrocchia_id: parrocchiaId, p_iscrizione_attivita_id: pagamento.riga.id,
        p_importo: importo, p_metodo: pagamento.metodo, p_stato: "completata",
        p_data_pagamento: data.toISOString(), p_pagante_utente_id: null, p_note_private: pagamento.note.trim() || null,
      });
      if (error) throw error;
      if (vivo.current) { setPagamento(null); setMessaggio("Pagamento registrato. Il riepilogo viene aggiornato."); setRevisione((v) => v + 1); }
    } catch (err) { if (vivo.current) setErrorePagamento(err.message || "Impossibile registrare il pagamento."); }
    finally { salvaInCorso.current = false; if (vivo.current) setSalvataggio(false); }
  }

  function stampaElenco(soloResidui = false) {
    const righe = righeVisibili.filter((r) => !soloResidui || numero(r.residuo) > 0);
    const t = totaliQuote(righe);
    try {
      apriStampa(titolo, `<p class="meta">${escapeHtml(intestazioneStampa)}</p><h1>${escapeHtml(titolo)}</h1><p>${escapeHtml(gruppoNome)} · ${soloResidui || soloSospesi ? "Quote da completare" : "Riepilogo quote"} · ${escapeHtml(new Date().toLocaleDateString("it-IT"))}</p><table><thead><tr><th>Genitore / telefono</th><th>Partecipante</th><th>Gruppo</th><th>Dovuto</th><th>Pagato</th><th>Residuo</th><th>Stato</th></tr></thead><tbody>${righeStampa(righe, valuta)}</tbody></table><p class="totale">Iscritti: ${righe.length} · Dovuto: ${escapeHtml(formattaImporto(t.dovuto, valuta))} · Pagato: ${escapeHtml(formattaImporto(t.pagato, valuta))} · Residuo: ${escapeHtml(formattaImporto(t.residuo, valuta))}</p>`);
    } catch (e) { setErrore(e.message); }
  }

  function stampaPromemoria() {
    const famiglia = famiglieComplete.find((f) => f.id === famigliaPromemoria);
    if (!famiglia) return;
    const istruzioni = metodi.map((m) => {
      const dettagli = [m.intestatario && `Intestatario: ${m.intestatario}`, m.iban && `IBAN: ${m.iban}`, m.bic_swift && `BIC/SWIFT: ${m.bic_swift}`, m.email_paypal && `PayPal: ${m.email_paypal}`, m.link_pagamento, m.istruzioni].filter(Boolean).map(escapeHtml).join("<br>");
      return `<p><strong>${escapeHtml(m.titolo)}</strong><br>${dettagli}</p>`;
    }).join("") || "<p>Per completare il versamento, contattate la segreteria parrocchiale.</p>";
    try {
      apriStampa(`Promemoria quota - ${famiglia.nomi}`, `<p class="meta">${escapeHtml(intestazioneStampa)} · ${escapeHtml(new Date().toLocaleDateString("it-IT"))}</p><h1>Promemoria quota di partecipazione</h1><h2>${escapeHtml(titolo)}</h2><p>Alla cortese attenzione di ${escapeHtml(famiglia.nomi)}</p><p class="testo">${escapeHtml(testoPromemoria)}</p><table><thead><tr><th>Partecipante</th><th>Dovuto</th><th>Pagato</th><th>Da completare</th></tr></thead><tbody>${famiglia.righe.map((r) => `<tr><td>${escapeHtml(nomeRagazzo(r))}</td><td class="numero">${escapeHtml(formattaImporto(r.dovuto, valuta))}</td><td class="numero">${escapeHtml(formattaImporto(r.pagato, valuta))}</td><td class="numero">${escapeHtml(formattaImporto(r.residuo, valuta))}</td></tr>`).join("")}</tbody></table><p class="totale">Quota complessiva: ${escapeHtml(formattaImporto(famiglia.dovuto, valuta))}<br>Versamenti registrati: ${escapeHtml(formattaImporto(famiglia.pagato, valuta))}<br><strong>Importo da completare: ${escapeHtml(formattaImporto(famiglia.residuo, valuta))}</strong></p>${famiglia.in_attesa > 0 ? `<p>Versamenti in attesa di registrazione definitiva: ${escapeHtml(formattaImporto(famiglia.in_attesa, valuta))}.</p>` : ""}<h2>Modalità di versamento</h2>${istruzioni}<p class="firma">Un cordiale saluto,<br>${escapeHtml(intestazioneStampa)}</p>`);
    } catch (e) { setErrore(e.message); }
  }

  return <main className="quote-attivita">
    <style>{STILI_QUOTE}</style>
    <button type="button" className="pulsante-torna-dashboard" onClick={tornaDashboard}>← Torna alla dashboard</button>
    <h2>Quote delle attività</h2><p>Seleziona l’attività per vedere tutti gli iscritti, compresi quelli che non hanno ancora pagato.</p>
    <div className="qa-filtri">
      <label>Attività<select value={attivitaId} onChange={cambiaAttivita} disabled={salvataggio || !attivita.length}>{!attivita.length && <option value="">Nessuna attività</option>}{attivita.map((a) => <option key={a.id} value={a.id}>{a.titolo}</option>)}</select></label>
      <label>Gruppo<select value={gruppoId} onChange={(e) => setGruppoId(e.target.value)} disabled={caricamento}><option value="">Tutti i gruppi</option>{gruppi.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}<option value="non_assegnati">Non assegnati</option></select></label>
      <label className="qa-check"><input type="checkbox" checked={soloSospesi} onChange={(e) => setSoloSospesi(e.target.checked)} /> Solo quote da completare</label>
      <button type="button" onClick={() => setRevisione((v) => v + 1)} disabled={caricamento || !attivitaId || salvataggio}>Aggiorna</button>
    </div>
    {messaggio && <p role="status">{messaggio}</p>}{errore && <p role="alert" className="messaggio-errore">{errore}</p>}
    {caricamento && <p role="status">Caricamento delle quote…</p>}
    {!caricamento && !errore && !attivita.length && <p>Nessuna attività disponibile.</p>}
    {!caricamento && !errore && dati && <>
      <h3>{titolo} · {gruppoNome}</h3>
      <div className="qa-totali">{[["Iscritti", righeVisibili.length], ["Dovuto", formattaImporto(totali.dovuto, valuta)], ["Pagato", formattaImporto(totali.pagato, valuta)], ["Da completare", formattaImporto(totali.residuo, valuta)]].map(([etichetta, valore]) => <article key={etichetta}><span>{etichetta}</span><strong>{valore}</strong></article>)}</div>
      {totali.in_attesa > 0 && <p>Versamenti in attesa: {formattaImporto(totali.in_attesa, valuta)}. Saranno conteggiati come pagati quando completati.</p>}
      <p>I totali rispettano il gruppo e il filtro selezionati. Le quote esenti hanno importo dovuto zero.</p>
      <div className="qa-filtri"><label>Intestazione delle stampe<input value={intestazioneStampa} onChange={(e) => setIntestazioneStampa(e.target.value)} placeholder="Nome della parrocchia" /></label><button type="button" disabled={!righeVisibili.length} onClick={() => stampaElenco()}>Stampa elenco</button><button type="button" disabled={!righeVisibili.some((r) => numero(r.residuo) > 0)} onClick={() => stampaElenco(true)}>Stampa quote da completare</button></div>
      {!righeVisibili.length ? <p>Nessuna iscrizione corrisponde alla selezione.</p> : <div className="qa-tabella"><table><thead><tr><th>Genitore</th><th>Figlio / partecipante</th><th>Gruppo</th><th>Dovuto</th><th>Pagato</th><th>Residuo</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>{famiglieVisibili.map((f) => <React.Fragment key={f.id}>
        {f.righe.map((r) => <tr key={r.id}><td>{nomeGenitore(r)}<small>{r.telefono_contatto || ""}</small></td><td>{nomeRagazzo(r)}</td><td>{(r.gruppi || []).map((g) => g.nome).join(", ") || "Non assegnato"}</td><td>{formattaImporto(r.dovuto, valuta)}</td><td>{formattaImporto(r.pagato, valuta)}{numero(r.in_attesa) > 0 && <small>In attesa: {formattaImporto(r.in_attesa, valuta)}</small>}</td><td><strong>{formattaImporto(r.residuo, valuta)}</strong></td><td>{ETICHETTE_QUOTA[r.stato_quota] || r.stato_quota}</td><td>{(numero(r.residuo) > 0 || r.stato_quota === "contributo_libero") && <button type="button" onClick={() => nuovoPagamento(r)} disabled={salvataggio}>Registra pagamento</button>}</td></tr>)}
        <tr className="qa-famiglia"><td colSpan={3}>Totale famiglia nella selezione · {f.nomi}</td><td>{formattaImporto(f.dovuto, valuta)}</td><td>{formattaImporto(f.pagato, valuta)}</td><td>{formattaImporto(f.residuo, valuta)}</td><td colSpan={2}>{famiglieComplete.find((c) => c.id === f.id)?.residuo > 0 && <button type="button" onClick={() => setFamigliaPromemoria(f.id)}>Promemoria famiglia</button>}</td></tr>
      </React.Fragment>)}</tbody></table></div>}
    </>}
    {pagamento && <section ref={pannelloPagamento} className="qa-pannello"><h3>Registra pagamento · {nomeRagazzo(pagamento.riga)}</h3><p>{nomeGenitore(pagamento.riga)} · Residuo: {formattaImporto(pagamento.riga.residuo, valuta)}</p><p>Registra un versamento già ricevuto. Per più figli, registra la quota attribuita a ciascuno.</p>
      <form onSubmit={salvaPagamento}><fieldset disabled={salvataggio}><div className="qa-filtri">
        <label>Importo ({valuta})<input type="number" min="0.01" step="0.01" required value={pagamento.importo} onChange={(e) => setPagamento({ ...pagamento, importo: e.target.value })} /></label>
        <label>Metodo<select value={pagamento.metodo} onChange={(e) => setPagamento({ ...pagamento, metodo: e.target.value })}><option value="consegna_diretta">Versamento in parrocchia</option><option value="bonifico">Bonifico ricevuto</option></select></label>
        <label>Data<input type="date" required value={pagamento.data} onChange={(e) => setPagamento({ ...pagamento, data: e.target.value })} /></label>
        <label>Note private<input value={pagamento.note} onChange={(e) => setPagamento({ ...pagamento, note: e.target.value })} /></label>
      </div>{errorePagamento && <p role="alert">{errorePagamento}</p>}<div className="qa-filtri"><button type="submit">{salvataggio ? "Registrazione…" : "Registra versamento"}</button><button type="button" onClick={() => setPagamento(null)}>Annulla</button></div></fieldset></form>
    </section>}
    {famigliaPromemoria && !caricamento && !errore && <section ref={pannelloPromemoria} className="qa-pannello"><h3>Promemoria riservato · {famiglieComplete.find((f) => f.id === famigliaPromemoria)?.nomi}</h3><p>Comprende tutti i figli della famiglia in questa attività, anche se sono in gruppi diversi. Puoi stampare oppure salvare in PDF e inviarlo personalmente.</p><label>Testo del promemoria<textarea rows={5} value={testoPromemoria} onChange={(e) => setTestoPromemoria(e.target.value)} /></label>{erroreMetodi && <p role="status">{erroreMetodi}</p>}<div className="qa-filtri"><button type="button" onClick={stampaPromemoria}>Anteprima / Salva PDF</button><button type="button" onClick={() => setFamigliaPromemoria("")}>Chiudi</button></div></section>}
  </main>;
}

const STILI_QUOTE = `
  .quote-attivita{color:#173955}.quote-attivita .qa-tabella table,.quote-attivita .qa-tabella th,.quote-attivita .qa-tabella td,.quote-attivita .qa-tabella td strong,.quote-attivita .qa-tabella td small{color:#173955!important}.qa-filtri{display:flex;flex-wrap:wrap;gap:14px;align-items:end;margin:20px 0}.quote-attivita label{display:flex;flex-direction:column;gap:6px}.quote-attivita input,.quote-attivita select,.quote-attivita textarea{padding:10px;border:1px solid #d6c8b4;border-radius:8px;font:inherit;background:#fff;max-width:100%;box-sizing:border-box}.quote-attivita button{padding:10px 14px;border:1px solid #c99536;border-radius:8px;background:#fffaf0;color:#173955;font:inherit;cursor:pointer}.quote-attivita button:disabled{opacity:.55;cursor:default}.quote-attivita .qa-check{flex-direction:row;align-items:center;padding-bottom:10px}.qa-totali{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:20px 0}.qa-totali article{background:#fffdf9;border:1px solid #e5d9ca;border-radius:12px;padding:18px}.qa-totali span,.qa-totali strong{display:block}.qa-totali strong{font-size:24px;margin-top:8px}.qa-tabella{overflow:auto}.qa-tabella table{width:100%;border-collapse:collapse}.qa-tabella th,.qa-tabella td{text-align:left;vertical-align:top;padding:12px 10px;border-bottom:1px solid #e5d9ca}.qa-tabella th{background:#f6f0e5}.qa-tabella small{display:block;margin-top:5px}.qa-famiglia{background:#faf5eb;font-weight:600}.qa-pannello{background:#fffdf9;border:1px solid #c99536;border-radius:14px;padding:22px;margin-top:24px}.qa-pannello fieldset{border:0;margin:0;padding:0}.qa-pannello textarea{width:100%}@media print{.azioni-non-stampabili{display:none!important}}
`;

const FILTRI_INIZIALI = {
  attivitaId: "",
  dataDa: "",
  dataA: "",
  metodo: "",
  stato: "",
  ricerca: "",
};

const RIEPILOGO_VUOTO = {
  numero_movimenti: 0,
  totale_completato: 0,
  totale_in_attesa: 0,
  numero_rimborsi: 0,
};

function formattaImporto(importo, valuta = "EUR") {
  return Number(importo || 0).toLocaleString("it-IT", {
    style: "currency",
    currency: valuta || "EUR",
  });
}

function formattaData(data) {
  if (!data) {
    return "—";
  }

  return new Date(data).toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function etichettaMetodo(metodo) {
  const etichette = {
    consegna_diretta: "Pagamento in parrocchia",
    bonifico: "Bonifico",
    online: "Pagamento online",
  };

  return etichette[metodo] || metodo || "—";
}

function etichettaStato(stato) {
  const etichette = {
    in_attesa: "In attesa",
    completata: "Completato",
    fallita: "Fallito",
    annullata: "Annullato",
    rimborsata: "Rimborsato",
  };

  return etichette[stato] || stato || "—";
}

function RegistroMovimenti({ parrocchiaId, tornaDashboard, nomeParrocchia }) {
  const [attivita, setAttivita] = useState([]);
  const [movimenti, setMovimenti] = useState([]);
  const [spese, setSpese] = useState([]);
  const [filtri, setFiltri] = useState({ attivitaId: "", dataDa: "", dataA: "" });
  const [applicati, setApplicati] = useState({ attivitaId: "", dataDa: "", dataA: "" });
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [revisione, setRevisione] = useState(0);
  const [spesa, setSpesa] = useState(null);
  const [salvataggio, setSalvataggio] = useState(false);
  const [erroreSpesa, setErroreSpesa] = useState("");
  const salvataggioRef = useRef(false);
  const richiestaRef = useRef(0);
  const vivo = useRef(true);
  const pannello = useRef(null);
  useEffect(() => { vivo.current = true; return () => { vivo.current = false; }; }, []);
  useEffect(() => { if (spesa) pannello.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [spesa?.id]);

  useEffect(() => {
    let attuale = true;
    const richiesta = ++richiestaRef.current;
    setCaricamento(true); setErrore("");
    async function carica() {
      try {
        if (!parrocchiaId) throw new Error("Seleziona una parrocchia.");
        const parametri = { p_parrocchia_id: parrocchiaId, p_attivita_id: applicati.attivitaId || null, p_data_da: applicati.dataDa || null, p_data_a: applicati.dataA || null };
        const risultati = await Promise.all([
          supabase.rpc("ars_registro_pagamenti_parrocchia", { ...parametri, p_metodo: null, p_stato: null, p_ricerca: null }),
          supabase.rpc("ars_elenco_spese_attivita_parroco", parametri),
          supabase.rpc("ars_elenco_attivita_parroco", { p_parrocchia_id: parrocchiaId }),
        ]);
        for (const r of risultati) if (r.error) throw r.error;
        if (!Array.isArray(risultati[0].data?.movimenti) || !Array.isArray(risultati[1].data) || !Array.isArray(risultati[2].data)) throw new Error("Risposta del bilancio inattesa.");
        if (attuale && richiesta === richiestaRef.current) {
          setMovimenti(risultati[0].data.movimenti);
          setSpese(risultati[1].data);
          setAttivita(risultati[2].data);
        }
      } catch (e) { if (attuale) setErrore(e.message || "Impossibile caricare il bilancio."); }
      finally { if (attuale) setCaricamento(false); }
    }
    carica();
    return () => { attuale = false; };
  }, [parrocchiaId, applicati, revisione]);

  const bilanci = useMemo(() => {
    const m = new Map();
    const gruppo = (id, titolo, valuta) => {
      const key = `${id || "senza-attivita"}:${valuta || "EUR"}`;
      if (!m.has(key)) m.set(key, { key, titolo: titolo || "Incassi senza attività associata", valuta: valuta || "EUR", incassi: 0, spese: 0, inAttesa: 0, rimborsi: 0 });
      return m.get(key);
    };
    attivita.filter(a => !applicati.attivitaId || a.id === applicati.attivitaId).forEach(a => gruppo(a.id, a.titolo, a.valuta));
    movimenti.forEach(p => {
      const g = gruppo(p.attivita?.id, p.attivita?.titolo, p.valuta);
      if (p.stato === "completata") g.incassi += Math.round(numero(p.importo) * 100);
      if (p.stato === "in_attesa") g.inAttesa += Math.round(numero(p.importo) * 100);
      if (p.stato === "rimborsata") g.rimborsi += 1;
    });
    spese.forEach(s => { gruppo(s.attivita_id, s.titolo_attivita, s.valuta).spese += Math.round(numero(s.importo) * 100); });
    return [...m.values()].sort((a,b) => a.titolo.localeCompare(b.titolo, "it"));
  }, [attivita, movimenti, spese, applicati.attivitaId]);
  const totali = useMemo(() => {
    const m = new Map();
    bilanci.forEach(b => {
      if (!m.has(b.valuta)) m.set(b.valuta, { valuta: b.valuta, incassi: 0, spese: 0, inAttesa: 0, rimborsi: 0 });
      const t = m.get(b.valuta);
      t.incassi += b.incassi; t.spese += b.spese; t.inAttesa += b.inAttesa; t.rimborsi += b.rimborsi;
    });
    return [...m.values()];
  }, [bilanci]);
  const euro = (centesimi, valuta) => formattaImporto(centesimi / 100, valuta);
  const dataBreve = d => d ? new Date(`${d.slice(0,10)}T12:00:00`).toLocaleDateString("it-IT") : "—";
  const titoloSelezione = attivita.find(a => a.id === applicati.attivitaId)?.titolo || "Tutte le attività";

  function applica(e) {
    e.preventDefault();
    if (filtri.dataDa && filtri.dataA && filtri.dataDa > filtri.dataA) { setErrore("La data iniziale deve precedere quella finale."); return; }
    setApplicati({ ...filtri });
  }
  function nuovaSpesa() {
    setErroreSpesa(""); setMessaggio("");
    setSpesa({ id: crypto.randomUUID(), attivitaId: applicati.attivitaId || "", data: new Date().toLocaleDateString("sv-SE"), descrizione: "", importo: "", note: "" });
  }
  async function salvaSpesa(e) {
    e.preventDefault();
    if (!spesa || salvataggioRef.current) return;
    const importo = Number(String(spesa.importo).replace(",", "."));
    if (!spesa.attivitaId || !spesa.data || !spesa.descrizione.trim() || !Number.isFinite(importo) || importo <= 0 || Math.abs(importo * 100 - Math.round(importo * 100)) > 0.000001) {
      setErroreSpesa("Indica attività, data, descrizione e importo positivo con massimo due decimali."); return;
    }
    salvataggioRef.current = true; setSalvataggio(true); setErroreSpesa("");
    try {
      const { error } = await supabase.rpc("ars_registra_spesa_attivita", {
        p_parrocchia_id: parrocchiaId, p_attivita_id: spesa.attivitaId, p_data_spesa: spesa.data,
        p_descrizione: spesa.descrizione.trim(), p_importo: importo, p_note_private: spesa.note.trim() || null, p_spesa_id: spesa.id,
      });
      if (error) throw error;
      if (vivo.current) {
        setSpesa(null); setMessaggio("Spesa registrata. Il bilancio viene aggiornato.");
        // Mostra la spesa salvata anche se i precedenti filtri di data la escludevano.
        const nuoviFiltri = { attivitaId: spesa.attivitaId, dataDa: "", dataA: "" };
        setFiltri(nuoviFiltri); setApplicati(nuoviFiltri); setRevisione(v => v + 1);
      }
    } catch (e) { if (vivo.current) setErroreSpesa(e.message || "Impossibile registrare la spesa. Puoi riprovare."); }
    finally { salvataggioRef.current = false; if (vivo.current) setSalvataggio(false); }
  }
  function stampaBilancio() {
    try {
      const celle = bilanci.map(b => `<tr><td>${escapeHtml(b.titolo)}</td><td>${escapeHtml(euro(b.incassi,b.valuta))}</td><td>${escapeHtml(euro(b.spese,b.valuta))}</td><td>${escapeHtml(b.rimborsi ? "Da verificare: presenti rimborsi" : euro(b.incassi-b.spese,b.valuta))}</td></tr>`).join("");
      const dettagliSpese = spese.map(s => `<tr><td>${escapeHtml(dataBreve(s.data))}</td><td>${escapeHtml(s.titolo_attivita)}</td><td>${escapeHtml(s.descrizione)}</td><td>${escapeHtml(formattaImporto(s.importo,s.valuta))}</td></tr>`).join("");
      const dettagliIncassi = movimenti.map(p => `<tr><td>${escapeHtml(formattaData(p.data))}</td><td>${escapeHtml(p.attivita?.titolo || "Senza attività")}</td><td>${escapeHtml(p.pagante || "—")}</td><td>${escapeHtml(p.causale || "—")}</td><td>${escapeHtml(etichettaStato(p.stato))}</td><td>${escapeHtml(formattaImporto(p.importo,p.valuta))}</td></tr>`).join("");
      apriStampa("Bilancio delle attività", `<p class="meta">${escapeHtml(nomeParrocchia || "Segreteria parrocchiale")}</p><h1>Bilancio delle attività</h1><p>${escapeHtml(titoloSelezione)} · Dal ${escapeHtml(applicati.dataDa ? dataBreve(applicati.dataDa) : "inizio")} al ${escapeHtml(applicati.dataA ? dataBreve(applicati.dataA) : "oggi")} · Stampa del ${escapeHtml(new Date().toLocaleDateString("it-IT"))}</p><p>Il saldo usa gli incassi completati e le spese registrate. Quote ancora dovute e versamenti in attesa sono esclusi. La gestione dei rimborsi resta da completare.</p><table><thead><tr><th>Attività</th><th>Incassato</th><th>Spese</th><th>Saldo</th></tr></thead><tbody>${celle}</tbody></table><h2>Spese registrate</h2><table><thead><tr><th>Data</th><th>Attività</th><th>Descrizione</th><th>Importo</th></tr></thead><tbody>${dettagliSpese}</tbody></table><h2>Registro degli incassi</h2><table><thead><tr><th>Data</th><th>Attività</th><th>Pagante</th><th>Causale</th><th>Stato</th><th>Importo</th></tr></thead><tbody>${dettagliIncassi}</tbody></table>`);
    } catch (e) { setErrore(e.message); }
  }

  return <main className="ars-bilancio">
    <button type="button" className="azioni-non-stampabili" onClick={tornaDashboard} disabled={salvataggio}>← Torna alla dashboard</button>
    <h2>Bilancio delle attività</h2><p>Entrate, spese e saldo di ogni attività.</p>
    <div className="ars-economia-azioni azioni-non-stampabili">
      <button type="button" onClick={nuovaSpesa} disabled={caricamento || !!errore || !attivita.length || !!spesa}>Registra una spesa</button>
      <button type="button" onClick={stampaBilancio} disabled={caricamento || !!errore}>Stampa / Salva PDF</button>
    </div>
    <form className="ars-economia-azioni azioni-non-stampabili" onSubmit={applica}>
      <label>Attività<select value={filtri.attivitaId} onChange={e => setFiltri({ ...filtri, attivitaId: e.target.value })}><option value="">Tutte le attività</option>{attivita.map(a => <option key={a.id} value={a.id}>{a.titolo}</option>)}</select></label>
      <label>Dal<input type="date" value={filtri.dataDa} onChange={e => setFiltri({ ...filtri, dataDa: e.target.value })} /></label>
      <label>Al<input type="date" value={filtri.dataA} onChange={e => setFiltri({ ...filtri, dataA: e.target.value })} /></label>
      <button type="submit" disabled={caricamento || salvataggio}>Applica filtri</button>
      <button type="button" disabled={salvataggio} onClick={() => { const f = { attivitaId: "", dataDa: "", dataA: "" }; setFiltri(f); setApplicati(f); }}>Azzera</button>
      <button type="button" disabled={caricamento || salvataggio} onClick={() => setRevisione(v => v+1)}>Aggiorna</button>
    </form>
    {messaggio && <p role="status">{messaggio}</p>}
    {errore && <p role="alert">{errore}</p>}
    {spesa && <section ref={pannello} className="ars-spesa-pannello azioni-non-stampabili"><h3>Registra una spesa</h3><p>Inserisci una spesa già sostenuta per l’attività. I rimborsi agli iscritti richiedono la gestione dedicata.</p>
      <form onSubmit={salvaSpesa}><fieldset disabled={salvataggio}><div className="ars-economia-azioni">
        <label>Attività<select required value={spesa.attivitaId} onChange={e => setSpesa({ ...spesa, attivitaId: e.target.value })}><option value="">Seleziona un’attività</option>{attivita.map(a => <option key={a.id} value={a.id}>{a.titolo}</option>)}</select></label>
        <label>Data della spesa<input type="date" required value={spesa.data} onChange={e => setSpesa({ ...spesa, data: e.target.value })} /></label>
        <label>Descrizione<input required maxLength={500} value={spesa.descrizione} onChange={e => setSpesa({ ...spesa, descrizione: e.target.value })} placeholder="Es. materiali per il GREST" /></label>
        <label>Importo ({attivita.find(a => a.id===spesa.attivitaId)?.valuta || "EUR"})<input type="number" min="0.01" step="0.01" required value={spesa.importo} onChange={e => setSpesa({ ...spesa, importo: e.target.value })} /></label>
        <label>Note private<input maxLength={2000} value={spesa.note} onChange={e => setSpesa({ ...spesa, note: e.target.value })} /></label>
      </div>{erroreSpesa && <p role="alert">{erroreSpesa}</p>}<div className="ars-economia-azioni"><button type="submit">{salvataggio ? "Registrazione…" : "Registra spesa"}</button><button type="button" onClick={() => setSpesa(null)}>Annulla</button></div></fieldset></form>
    </section>}
    {caricamento ? <p role="status">Caricamento del bilancio…</p> : !errore && <>
      <h3>{titoloSelezione}</h3>
      {totali.map(t => <section className="qa-totali" key={t.valuta}>{[["Incassato",euro(t.incassi,t.valuta)],["Spese",euro(t.spese,t.valuta)],["Saldo",t.rimborsi ? "Da verificare" : euro(t.incassi-t.spese,t.valuta)],["Versamenti in attesa",euro(t.inAttesa,t.valuta)]].map(([nome,valore]) => <article key={nome}><span>{nome}</span><strong>{valore}</strong></article>)}</section>)}
      <p>Il saldo considera gli incassi completati meno le spese. Quote ancora da incassare e versamenti in attesa sono esclusi.</p>
      <p>La registrazione dei rimborsi resta da completare.{bilanci.some(b => b.rimborsi) && " Sono presenti pagamenti segnati come rimborsati: il relativo saldo richiede verifica."}</p>
      <div className="ars-economia-tabella"><table><thead><tr><th>Attività</th><th>Incassato</th><th>Spese</th><th>Saldo</th></tr></thead><tbody>{bilanci.map(b => <tr key={b.key}><td>{b.titolo}</td><td>{euro(b.incassi,b.valuta)}</td><td>{euro(b.spese,b.valuta)}</td><td><strong>{b.rimborsi ? "Da verificare" : euro(b.incassi-b.spese,b.valuta)}</strong></td></tr>)}</tbody></table></div>
      <h3>Spese registrate</h3>
      {!spese.length ? <p>Nessuna spesa registrata per la selezione.</p> : <div className="ars-economia-tabella"><table><thead><tr><th>Data</th><th>Attività</th><th>Descrizione</th><th>Importo</th><th>Note private</th></tr></thead><tbody>{spese.map(s => <tr key={s.id}><td>{dataBreve(s.data)}</td><td>{s.titolo_attivita}</td><td>{s.descrizione}</td><td>{formattaImporto(s.importo,s.valuta)}</td><td>{s.note_private || "—"}</td></tr>)}</tbody></table></div>}
      <h3>Registro degli incassi</h3>
      {!movimenti.length ? <p>Nessun pagamento registrato per la selezione.</p> : <div className="ars-economia-tabella"><table><thead><tr><th>Data</th><th>Pagante</th><th>Partecipante</th><th>Causale</th><th>Attività</th><th>Metodo</th><th>Stato</th><th>Importo</th></tr></thead><tbody>{movimenti.map(p => <tr key={p.id}><td>{formattaData(p.data)}</td><td>{p.pagante || "—"}</td><td>{p.partecipante || "—"}</td><td>{p.causale || "—"}</td><td>{p.attivita?.titolo || "—"}</td><td>{etichettaMetodo(p.metodo)}</td><td>{etichettaStato(p.stato)}</td><td>{formattaImporto(p.importo,p.valuta)}</td></tr>)}</tbody></table></div>}
    </>}
  </main>;
}

const STILI_ECONOMIA = `
.ars-pagina-economica{color:#173955}
.ars-scelta-economica{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:28px}
.ars-scelta-economica button{font:inherit;font-size:20px;font-weight:600;min-height:58px;padding:14px 24px;border:1px solid #c99536;border-radius:12px;background:#fffaf0;color:#173955;cursor:pointer}
.ars-scelta-economica button[aria-pressed="true"]{background:#173955;color:#fff;border-color:#173955;box-shadow:0 3px 9px #17395522}
.ars-scelta-economica button:focus-visible,.ars-bilancio button:focus-visible{outline:3px solid #c99536;outline-offset:3px}
.ars-bilancio,.ars-bilancio p,.ars-bilancio h2,.ars-bilancio h3,.ars-bilancio label{color:#173955}
.ars-bilancio button{font:inherit;padding:10px 16px;border:1px solid #c99536;border-radius:8px;background:#fffaf0;color:#173955;cursor:pointer}
.ars-bilancio button:disabled{opacity:.55;cursor:default}
.ars-economia-azioni{display:flex;flex-wrap:wrap;gap:14px;align-items:end;margin:20px 0}
.ars-bilancio label{display:flex;flex-direction:column;gap:6px}
.ars-bilancio input,.ars-bilancio select{font:inherit;padding:10px;border:1px solid #d6c8b4;border-radius:8px;background:#fff;color:#173955;max-width:100%;box-sizing:border-box}
.ars-economia-tabella{overflow:auto;margin:20px 0}
.ars-economia-tabella table{width:100%;border-collapse:collapse}
.ars-economia-tabella td,.ars-economia-tabella td strong{color:#173955!important}
.ars-economia-tabella th{background:#173955!important;color:#fff!important}
.ars-economia-tabella th,.ars-economia-tabella td{padding:12px 10px;text-align:left;vertical-align:top;border-bottom:1px solid #e5d9ca}
.ars-economia-tabella tbody tr:nth-child(even){background:#faf5eb}
.ars-spesa-pannello{padding:22px;border:1px solid #c99536;border-radius:14px;background:#fffdf9;margin:24px 0}
.ars-spesa-pannello fieldset{border:0;padding:0;margin:0;min-width:0}
@media(max-width:600px){.ars-scelta-economica button{width:100%;font-size:18px}.ars-bilancio input,.ars-bilancio select{width:100%}.ars-economia-azioni label{width:100%}}
@media print{.azioni-non-stampabili{display:none!important}}
`;
