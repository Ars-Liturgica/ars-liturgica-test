import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  const [donazioniLibere, setDonazioniLibere] = useState([]);
  const [erroreDonazioni, setErroreDonazioni] = useState("");
  const [caricamentoDonazioni, setCaricamentoDonazioni] = useState(false);
  const [iniziativa, setIniziativa] = useState(null);
  const [incasso, setIncasso] = useState(null);
  const [operazione, setOperazione] = useState(false);
  const [filtro, setFiltro] = useState("tutti");
  const [erroreOperazione, setErroreOperazione] = useState("");
  const [allegati, setAllegati] = useState({});
  const [fileInAttesa, setFileInAttesa] = useState([]);
  const selettoreAllegati = useRef(null);
  const [caricamentoFile, setCaricamentoFile] = useState(false);
  const [stampa, setStampa] = useState(null);
  const [nomeParrocchia, setNomeParrocchia] = useState("");
  // Anteprime locali: nessun caricamento su Storage prima di "Salva iniziativa".
  const anteprimeFile = useMemo(() => fileInAttesa.map(file => ({
    file, url: URL.createObjectURL(file)
  })), [fileInAttesa]);
  useEffect(() => () => anteprimeFile.forEach(a => URL.revokeObjectURL(a.url)), [anteprimeFile]);
  useEffect(() => {
    let attivo = true;
    setNomeParrocchia("");
    if (!parrocchiaId) return () => { attivo = false; };
    supabase.from("parrocchie").select("nome").eq("id", parrocchiaId).single()
      .then(({ data, error }) => {
        if (!attivo) return;
        if (error) { console.error("Nome parrocchia non disponibile:", error); return; }
        setNomeParrocchia(data?.nome || "");
      });
    return () => { attivo = false; };
  }, [parrocchiaId]);
  const urlPubblica = (p) => `${window.location.origin}/?ars_iniziativa=${encodeURIComponent(p.id)}&ars_parrocchia=${encodeURIComponent(parrocchiaId)}`;
  async function leggiAllegati(id) {
    if (!id) return;
    const { data, error } = await supabase.from("ars_allegati_iniziative")
      .select("id, nome_file, percorso, tipo_mime, principale")
      .eq("parrocchia_id", parrocchiaId).eq("iniziativa_id", id).order("creato_at");
    if (error) throw error;
    setAllegati(v => ({ ...v, [id]: data || [] }));
  }
  async function caricaAllegati(id) {
    if (!fileInAttesa.length) return;
    setCaricamentoFile(true);
    try {
      for (const file of fileInAttesa) {
        if (!(file.type === "application/pdf" || ["image/jpeg", "image/png", "image/webp"].includes(file.type))) throw new Error("Sono ammessi soltanto immagini e PDF.");
        if (file.size > 10 * 1024 * 1024) throw new Error("Dimensione massima per file: 10 MB.");
        const percorso = `${parrocchiaId}/${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("ars-progetti").upload(percorso, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(`Caricamento di "${file.name}" non riuscito: ${uploadError.message}`);
        const { error: dbError } = await supabase.from("ars_allegati_iniziative").insert({
          parrocchia_id: parrocchiaId, iniziativa_id: id, nome_file: file.name,
          percorso, tipo_mime: file.type, principale: file.type.startsWith("image/") && !(allegati[id] || []).some(a => a.principale)
        });
        if (dbError) {
          await supabase.storage.from("ars-progetti").remove([percorso]);
          throw new Error(`File "${file.name}" caricato ma non registrato: ${dbError.message}`);
        }
      }
      setFileInAttesa([]);
      await leggiAllegati(id);
    } finally { setCaricamentoFile(false); }
  }
  async function eliminaAllegato(a, id) {
    if (!window.confirm(`Eliminare ${a.nome_file}?`)) return;
    setErroreOperazione("");
    const { error } = await supabase.from("ars_allegati_iniziative").delete().eq("id", a.id).eq("parrocchia_id", parrocchiaId);
    if (error) { setErroreOperazione(error.message); return; }
    const { error: storageError } = await supabase.storage.from("ars-progetti").remove([a.percorso]);
    if (storageError) setErroreOperazione("Allegato scollegato, ma eliminazione fisica non riuscita: " + storageError.message);
    await leggiAllegati(id);
  }
  const urlAllegato = a => supabase.storage.from("ars-progetti").getPublicUrl(a.percorso).data.publicUrl;
  function apriStampa(p, daModulo = false) {
    setStampa({ ...p, _anteprimaLocale: daModulo });
    if (p.id && !allegati[p.id]) leggiAllegati(p.id).catch(e => setErroreOperazione(e.message));
  }

  const euro = (n, valuta = "EUR") => Number(n || 0).toLocaleString("it-IT", { style: "currency", currency: valuta });
  const dataIt = (s) => s ? new Date(s).toLocaleDateString("it-IT") : "Senza scadenza";
  const nuovoProgetto = (tipo) => ({ id: null, tipo_iniziativa: tipo, titolo: "", descrizione: "", obiettivo: "", valuta: "EUR", data_inizio: new Date().toISOString().slice(0, 10), data_fine: "", stato: "bozza", immagine_url: "", mostra_contatore: false });
  const nuovoIncasso = (progetto = null) => ({ progetto, causale_descrizione: progetto ? `Offerta per ${progetto.titolo}` : "Donazione libera alla parrocchia", importo: "", metodo: "consegna_diretta", data: new Date().toISOString().slice(0, 10), riferimento_esterno: "", note_private: "", pagante_nominativo: "" });
  function apriIncasso(progetto = null) { setIncasso(nuovoIncasso(progetto)); setErroreOperazione(""); setMessaggio(""); }
  function apriIniziativa(tipo, progetto = null) {
    setIniziativa(progetto ? { ...progetto, tipo_iniziativa: progetto.tipo_iniziativa || "progetto" } : nuovoProgetto(tipo));
    setFileInAttesa([]); setErroreOperazione(""); setMessaggio("");
    if (progetto?.id) leggiAllegati(progetto.id).catch(e => setErroreOperazione(e.message));
  }
  async function salvaIniziativa(e, pubblica = false) {
    e?.preventDefault?.(); if (operazione || !iniziativa) return;
    if (pubblica && !window.confirm(`Pubblicare ${iniziativa.tipo_iniziativa === "raccolta" ? "la raccolta" : "il progetto"} e renderlo visibile ai fedeli?`)) return;
    const statoDaSalvare = pubblica ? "pubblicato" : iniziativa.stato;
    setOperazione(true); setErroreOperazione("");
    try {
      const args = {
        p_parrocchia_id: parrocchiaId, p_id: iniziativa.id || null,
        p_titolo: iniziativa.titolo.trim(), p_descrizione: iniziativa.descrizione.trim() || null,
        p_obiettivo: iniziativa.obiettivo === "" || iniziativa.obiettivo == null ? null : Number(iniziativa.obiettivo),
        p_valuta: iniziativa.valuta, p_data_inizio: iniziativa.data_inizio,
        p_data_fine: iniziativa.data_fine || null, p_stato: statoDaSalvare,
        p_immagine_url: (iniziativa.immagine_url || "").trim() || null,
        p_tipo_iniziativa: iniziativa.tipo_iniziativa,
        p_mostra_contatore: Boolean(iniziativa.mostra_contatore),
      };
      const { data, error } = await supabase.rpc("ars_salva_iniziativa_completa", args);
      if (error) throw error;
      const risposta = typeof data === "string" && data.startsWith("{") ? JSON.parse(data) : data;
      let id = (typeof risposta === "string" && /^[0-9a-f-]{36}$/i.test(risposta) ? risposta : null)
        || risposta?.id || risposta?.progetto_id || risposta?.progetto?.id
        || risposta?.iniziativa?.id || iniziativa.id;
      // Alcune versioni della RPC restituiscono un risultato senza ID.
      // Recupero solo se esiste una corrispondenza UNIVOCA: mai collegare file al progetto sbagliato.
      if (!id && fileInAttesa.length) {
        const { data: corrispondenze, error: ricercaErrore } = await supabase
          .from("progetti_donazioni")
          .select("id")
          .eq("parrocchia_id", parrocchiaId)
          .eq("titolo", iniziativa.titolo.trim())
          .limit(2);
        if (!ricercaErrore && corrispondenze?.length === 1) id = corrispondenze[0].id;
      }
      if (fileInAttesa.length && !id) throw new Error("Progetto salvato, ma impossibile identificare con certezza il record per gli allegati. Nessun file caricato: riapri il progetto e riprova. Se persiste, controlliamo la risposta della funzione ars_salva_iniziativa_completa.");
      if (id) {
        setIniziativa(v => v ? ({ ...v, id }) : v);
        await caricaAllegati(id);
      }
      setIniziativa(null); setMessaggio(pubblica ? "Iniziativa pubblicata correttamente." : "Iniziativa salvata correttamente."); await caricaDati();
    } catch (e) {
      console.error("Salvataggio iniziativa/allegati:", e);
      setErroreOperazione("Salvataggio non completato: " + (e.message || "Errore sconosciuto") + ". Gli allegati ancora visibili come 'Da salvare' non sono stati confermati.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    finally { setOperazione(false); }
  }
  async function registraIncasso(e) {
    e.preventDefault(); if (operazione || !incasso) return;
    setOperazione(true); setErroreOperazione("");
    try {
      const importo = Number(incasso.importo);
      if (!Number.isFinite(importo) || importo <= 0 || Math.round(importo * 100) !== importo * 100) throw new Error("Inserisci un importo positivo con massimo due decimali.");
      if (["paypal", "link_pagamento"].includes(incasso.metodo) && !incasso.riferimento_esterno.trim()) throw new Error("Per un incasso online già ricevuto serve il riferimento dell'operazione.");
      const { error } = await supabase.rpc("ars_registra_incasso_iniziativa_v2", {
        p_parrocchia_id: parrocchiaId,
        p_progetto_donazione_id: incasso.progetto?.id || null,
        p_causale_descrizione: incasso.causale_descrizione.trim(),
        p_importo: importo, p_metodo: incasso.metodo,
        p_data_incasso: new Date(`${incasso.data}T12:00:00`).toISOString(),
        p_riferimento_esterno: incasso.riferimento_esterno.trim() || null,
        p_note_private: incasso.note_private.trim() || null,
        p_pagante_nominativo: incasso.pagante_nominativo.trim() || null,
        p_incasso_id: crypto.randomUUID(),
      });
      if (error) throw error;
      setIncasso(null); setMessaggio("Incasso registrato. La ricevuta viene emessa dal sistema economico condiviso.");
      await caricaDati(); await caricaDonazioniLibere();
    } catch (e) { setErroreOperazione(e.message || "Errore durante la registrazione."); }
    finally { setOperazione(false); }
  }
  const campoIniziativa = (nome, etichetta, tipo = "text") => <label style={{ display: "block", margin: "12px 0" }}>{etichetta}<input style={stileCampo} type={tipo} step={tipo === "number" ? "0.01" : undefined} value={iniziativa[nome] ?? ""} onChange={e => setIniziativa(v => ({ ...v, [nome]: e.target.value }))} /></label>;
  const campoIncasso = (nome, etichetta, tipo = "text") => <label style={{ display: "block", margin: "12px 0" }}>{etichetta}<input style={stileCampo} type={tipo} step={tipo === "number" ? "0.01" : undefined} value={incasso[nome] ?? ""} onChange={e => setIncasso(v => ({ ...v, [nome]: e.target.value }))} /></label>;
  const elencoFiltrato = (tipo) => progetti.filter(p => (p.tipo_iniziativa || "progetto") === tipo && (filtro === "tutti" || p.stato === filtro));


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

  const caricaDonazioniLibere = useCallback(async () => {
    if (!parrocchiaId) return;
    setCaricamentoDonazioni(true);
    setErroreDonazioni("");
    const { data, error } = await supabase
      .from("pagamenti_parrocchia")
      .select("id, data_offerta, importo, valuta, stato, causale_descrizione")
      .eq("parrocchia_id", parrocchiaId)
      .eq("causale_tipo", "donazione_libera")
      .eq("stato", "completata")
      .order("data_offerta", { ascending: false })
      .limit(100);
    if (error) {
      setErroreDonazioni("Impossibile leggere le donazioni: " + error.message);
      setDonazioniLibere([]);
    } else {
      setDonazioniLibere(data || []);
    }
    setCaricamentoDonazioni(false);
  }, [parrocchiaId]);

  useEffect(() => {
    if (sezione === "donazioni") caricaDonazioniLibere();
  }, [sezione, caricaDonazioniLibere]);

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
    }} disabled={salvataggio}>← {sezioneIniziale !== "indice" ? "Torna ad Attività e Progetti" : sezione === "indice" ? "Torna alla dashboard" : "Torna a Progetti, raccolte fondi e donazioni"}</button>
    <div className="progetti-donazioni-intestazione">
      <h2>{sezione === "metodi" ? "Metodi di incasso" : sezione === "progetti" ? "Progetti" : sezione === "raccolte" ? "Raccolte fondi" : sezione === "donazioni" ? "Donazioni" : "Progetti, raccolte fondi e donazioni"}</h2>
      <p>{sezione === "indice" ? "Scegli la sezione da gestire." : sezione === "metodi" ? "Configura i metodi con cui la parrocchia riceve offerte e quote delle attività." : sezione === "progetti" ? "Presenta i progetti della parrocchia e i relativi documenti." : sezione === "raccolte" ? "Iniziative e raccolte con una finalità specifica." : "Offerte libere alla parrocchia, senza collegamenti ad attività."}</p>
    </div>
    {errore && <div role="alert" className="messaggio-errore">{errore}</div>}
    {messaggio && <p role="status">{messaggio}</p>}
    {sezione === "indice" && <nav aria-label="Progetti, raccolte fondi e donazioni" style={{ marginTop: 24 }}>
      <button type="button" style={stileCartella} onClick={() => { setSezione("progetti"); setIncasso(null); setIniziativa(null); setFiltro("tutti"); }}>
        <span><span aria-hidden="true">📁 </span><strong>Progetti</strong><br /><small>Presentazione di opere, fotografie, disegni e documenti</small></span><span aria-hidden="true">›</span>
      </button>
      <button type="button" style={stileCartella} onClick={() => { setSezione("raccolte"); setIncasso(null); setIniziativa(null); setFiltro("tutti"); }}>
        <span><span aria-hidden="true">🤲 </span><strong>Raccolte fondi</strong><br /><small>Iniziative autonome con finalità specifiche</small></span><span aria-hidden="true">›</span>
      </button>
      <button type="button" style={stileCartella} onClick={() => { setSezione("donazioni"); setIncasso(null); setIniziativa(null); }}>
        <span><span aria-hidden="true">❤️ </span><strong>Donazioni</strong><br /><small>Offerte libere e ringraziamenti alla comunità</small></span><span aria-hidden="true">›</span>
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
      {(["progetti", "raccolte"].includes(sezione)) && <section>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <p>{sezione === "progetti" ? "Opere e iniziative della parrocchia." : "Raccolte temporanee o continuative per una finalità specifica."}</p>
          <button type="button" style={stilePulsante} onClick={() => apriIniziativa(sezione === "progetti" ? "progetto" : "raccolta")}>+ {sezione === "progetti" ? "Nuovo progetto" : "Nuova raccolta"}</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0" }}>
          {[['tutti','Tutti'],['bozza','Bozze'],['pubblicato','Pubblicati'],['chiuso','Chiusi'],['annullato','Annullati']].map(([v,l]) => <button key={v} type="button" style={filtro === v ? stilePulsante : stilePulsanteSecondario} onClick={() => setFiltro(v)}>{l}</button>)}
        </div>
        {elencoFiltrato(sezione === "progetti" ? "progetto" : "raccolta").length === 0 && <p>Nessuna iniziativa in questa categoria.</p>}
        {elencoFiltrato(sezione === "progetti" ? "progetto" : "raccolta").map(p => <article key={p.id} style={{ ...stileScheda, background: "#fffdf9" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            {p.immagine_url && <img src={p.immagine_url} alt="" style={{ width: 120, height: 95, objectFit: "cover", borderRadius: 8 }} />}
            <div style={{ flex: "1 1 250px" }}>
              <strong style={{ fontSize: 19, color: "#24394a" }}>{p.titolo}</strong>
              <p style={{ margin: "5px 0" }}>{p.descrizione}</p>
              <p><strong>Stato:</strong> {p.stato} · <strong>Offerte:</strong> {p.numero_offerte || 0}</p>
              <p><strong>Raccolto:</strong> {euro(p.raccolto, p.valuta)} {p.obiettivo ? `su ${euro(p.obiettivo, p.valuta)}` : ""}</p>
              {p.obiettivo > 0 && <p><strong>Residuo:</strong> {euro(p.residuo, p.valuta)} · <strong>Avanzamento:</strong> {Number(p.percentuale || 0).toLocaleString("it-IT")}%</p>}
              {p.obiettivo > 0 && <progress value={Math.min(100, Number(p.raccolto || 0) / Number(p.obiettivo) * 100)} max="100" style={{ width: "100%", accentColor: "#b78b42" }} />}
              <small>{dataIt(p.data_inizio)} — {dataIt(p.data_fine)} · Contatore pubblico: {p.mostra_contatore ? "sì" : "no"}</small>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={stilePulsanteSecondario} onClick={() => apriIniziativa(p.tipo_iniziativa || "progetto", p)}>Modifica</button>
               <button type="button" style={stilePulsanteSecondario} onClick={() => apriStampa(p)} title="Anteprima e stampa del volantino, anche in bozza">Stampa volantino / QR</button>
              <button type="button" style={stilePulsante} onClick={() => apriIncasso(p)} disabled={operazione}>Registra offerta</button>
            </div>
          </div>
        </article>)}
      </section>}
      {sezione === "donazioni" && <section style={stileScheda}>
        <h3>Donazioni libere</h3>
        <p>Grazie a chi sostiene la vita della comunità. Le offerte non sono collegate a progetti o attività.</p>
        <button type="button" style={stilePulsante} onClick={() => apriIncasso(null)} disabled={operazione}>+ Registra donazione</button>
        <h4>Ultime donazioni incassate</h4>
        <button type="button" style={stilePulsanteSecondario} onClick={caricaDonazioniLibere} disabled={caricamentoDonazioni}>Aggiorna elenco</button>
        {caricamentoDonazioni && <p>Caricamento...</p>}
        {erroreDonazioni && <p role="alert">{erroreDonazioni}</p>}
        {!caricamentoDonazioni && !erroreDonazioni && donazioniLibere.length === 0 && <p>Nessuna donazione registrata.</p>}
        {donazioniLibere.map(d => <article key={d.id} style={{ borderTop: "1px solid #e5d9ca", padding: "12px 0" }}>
          <strong>{euro(d.importo, d.valuta)}</strong> · {dataIt(d.data_offerta)}<div>{d.causale_descrizione || "Donazione libera"}</div>
        </article>)}
      </section>}
      {iniziativa && <form onSubmit={salvaIniziativa} style={{ ...stileScheda, background: "#fffaf1" }}>
        <h3>{iniziativa.id ? "Modifica" : "Nuova"} {iniziativa.tipo_iniziativa === "raccolta" ? "raccolta fondi" : "progetto"}</h3>
        {erroreOperazione && <p role="alert" style={{ color: "#a32232" }}>{erroreOperazione}</p>}
        {campoIniziativa("titolo", "Titolo", "text")}
        <label>Descrizione<textarea style={stileCampo} rows={4} value={iniziativa.descrizione || ""} onChange={e => setIniziativa(v => ({ ...v, descrizione: e.target.value }))} /></label>
        {campoIniziativa("obiettivo", "Obiettivo economico in euro (facoltativo)", "number")}
        {campoIniziativa("data_inizio", "Data di inizio", "date")}
        {campoIniziativa("data_fine", "Data di fine (vuota = continuativa)", "date")}
        <div style={{ background: "#fff", border: "1px solid #ddc89d", borderRadius: 12, padding: 18, margin: "14px 0", minHeight: 135 }}>
          <h4 style={{ marginTop: 0 }}>Fotografie e documenti del progetto</h4>
          <p style={{ fontSize: 13, color: "#52616c" }}>Fotografie JPG, PNG, WEBP e PDF (massimo 10 MB ciascuno).</p>
          <input ref={selettoreAllegati} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple
            style={{ display: "none" }} aria-label="Seleziona fotografie o documenti"
            onChange={e => {
              const nuovi = Array.from(e.target.files || []);
              e.target.value = "";
              const nonValidi = nuovi.filter(f => !(f.type === "application/pdf" || ["image/jpeg", "image/png", "image/webp"].includes(f.type)) || f.size > 10 * 1024 * 1024);
              if (nonValidi.length) setErroreOperazione("Alcuni file non sono stati aggiunti: sono ammessi JPG, PNG, WEBP e PDF fino a 10 MB ciascuno.");
              else setErroreOperazione("");
              const validi = nuovi.filter(f => (f.type === "application/pdf" || ["image/jpeg", "image/png", "image/webp"].includes(f.type)) && f.size <= 10 * 1024 * 1024);
              setFileInAttesa(prev => [...prev, ...validi.filter(f => !prev.some(p => p.name === f.name && p.size === f.size && p.lastModified === f.lastModified))]);
            }} />
          <button type="button" style={stilePulsanteSecondario} onClick={() => selettoreAllegati.current?.click()} disabled={operazione}>
            + Aggiungi fotografie o documenti
          </button>
          {anteprimeFile.length === 0 && (!iniziativa.id || !(allegati[iniziativa.id] || []).length) &&
            <p style={{ color: "#6a6a6a" }}>Qui compariranno le fotografie e i PDF selezionati.</p>}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {anteprimeFile.map(({ file, url }, i) => <div key={`${file.name}-${i}`} style={{ border: "1px solid #eee", borderRadius: 8, padding: 9, width: 160, overflowWrap: "anywhere" }}>
              {file.type.startsWith("image/") ? <img src={url} alt={file.name} style={{ width: "100%", height: 105, objectFit: "contain" }} /> : <div style={{ fontSize: 35 }}>📄</div>}
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, overflowWrap: "anywhere" }}>{file.name} · Apri</a>
              <div style={{ fontSize: 12, color: "#98691f" }}>Da salvare</div>
              <button type="button" style={{ ...stilePulsanteSecondario, display: "block", marginTop: 8, padding: "6px 9px" }}
                onClick={() => setFileInAttesa(prev => prev.filter((_, indice) => indice !== i))} disabled={operazione}>Rimuovi</button>
            </div>)}
            {iniziativa.id && (allegati[iniziativa.id] || []).map(a => <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 9, width: 160, overflowWrap: "anywhere" }}>
              {a.tipo_mime.startsWith("image/") ? <img src={urlAllegato(a)} alt={a.nome_file} style={{ width: "100%", height: 105, objectFit: "contain" }} /> : <div style={{ fontSize: 35 }}>📄</div>}
              <a href={urlAllegato(a)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{a.nome_file}</a>
              <button type="button" style={{ ...stilePulsanteSecondario, display: "block", marginTop: 8, padding: "6px 9px" }} onClick={() => eliminaAllegato(a, iniziativa.id)}>Elimina</button>
            </div>)}
          </div>
        </div>
        <p><strong>Stato attuale:</strong> {iniziativa.stato === "pubblicato" ? "Pubblicato" : iniziativa.stato === "chiuso" ? "Chiuso" : iniziativa.stato === "annullato" ? "Annullato" : "Bozza"}</p>
        {iniziativa.id && <label style={{ display: "block", margin: "12px 0" }}>Gestione stato (facoltativa)
          <select style={stileCampo} value={iniziativa.stato} onChange={e => setIniziativa(v => ({ ...v, stato: e.target.value }))}>
            {[["bozza","Bozza"],["pubblicato","Pubblicato"],["chiuso","Chiuso"],["annullato","Annullato"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>}
        <label><input type="checkbox" checked={Boolean(iniziativa.mostra_contatore)} onChange={e => setIniziativa(v => ({ ...v, mostra_contatore: e.target.checked }))} /> Mostra il contatore delle offerte ai fedeli</label>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button type="button" style={stilePulsanteSecondario} onClick={() => apriStampa(iniziativa, true)}>Anteprima volantino</button>
          <button type="submit" style={stilePulsanteSecondario} disabled={operazione || caricamentoFile}>{operazione || caricamentoFile ? "Salvataggio..." : iniziativa.stato === "pubblicato" ? "Salva modifiche" : "Salva bozza"}</button>
          {iniziativa.stato !== "pubblicato" && <button type="button" style={stilePulsante} disabled={operazione || caricamentoFile} onClick={e => salvaIniziativa(e, true)}>{iniziativa.tipo_iniziativa === "raccolta" ? "Pubblica raccolta" : "Pubblica progetto"}</button>}
          <button type="button" style={stilePulsanteSecondario} onClick={() => { setIniziativa(null); setStampa(null); }}>Annulla</button>
        </div>
      </form>}
      {stampa && <section style={{ ...stileScheda, background: "#fff" }}>
        <div id="ars-volantino-stampa" style={{ maxWidth: 760, margin: "auto", padding: 30, fontFamily: "Georgia, serif", color: "#24394a", boxSizing: "border-box", width: "100%", overflowWrap: "anywhere" }}>
          <div style={{ textAlign: "center", overflowWrap: "anywhere" }}>
            <div style={{ fontWeight: 700, fontSize: 23, lineHeight: 1.3 }}>{nomeParrocchia ? `PARROCCHIA ${nomeParrocchia}` : "Nome della parrocchia non disponibile"}</div>
            <div style={{ marginTop: 12, letterSpacing: 2, fontSize: 16 }}>{stampa.tipo_iniziativa === "raccolta" ? "RACCOLTA FONDI" : "PROGETTO"}</div>
            <h1 style={{ fontSize: 32, margin: "18px 0 8px", overflowWrap: "anywhere" }}>{stampa.titolo || "Titolo del progetto"}</h1>
            <div style={{ fontSize: 14, color: "#765c37" }}>{new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</div>
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", maxWidth: "100%" }}>{stampa.descrizione}</p>
          {(() => {
            const locali = stampa._anteprimaLocale ? anteprimeFile.map(({ file, url }) => ({
              id: url, nome: file.name, url, immagine: file.type.startsWith("image/"), locale: true
            })) : [];
            const salvati = (allegati[stampa.id] || []).map(a => ({
              id: a.id, nome: a.nome_file, url: urlAllegato(a), immagine: (a.tipo_mime || "").startsWith("image/"), locale: false
            }));
            const documenti = [...salvati, ...locali];
            if (!documenti.length) return null;
            return <section style={{ border: "1px solid #ddc89d", borderRadius: 12, padding: 18, marginTop: 26, breakInside: "auto" }}>
              <h2 style={{ fontSize: 23, margin: "0 0 14px", color: "#24394a" }}>Allegati</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 9, alignItems: "start" }}>
                {documenti.map(d => <div key={d.id} style={{ minWidth: 0, boxSizing: "border-box", border: "1px solid #eee5d8", borderRadius: 8, padding: 7, breakInside: "avoid", pageBreakInside: "avoid", overflowWrap: "anywhere" }}>
                  {d.immagine
                    ? <img src={d.url} alt={d.nome} style={{ display: "block", width: "100%", height: 86, objectFit: "contain", marginBottom: 5 }} />
                    : <div style={{ height: 86, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }} aria-hidden="true">📄</div>}
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: "#24394a", fontSize: 12 }}>{d.nome}</a>
                  {d.locale && <div style={{ color: "#98691f", fontSize: 11 }}>Da salvare — collegamento provvisorio</div>}
                </div>)}
              </div>
            </section>;
          })()}
          {stampa.mostra_contatore && (() => {
            const obiettivo = Number(stampa.obiettivo || 0);
            const raccolto = Number(stampa.raccolto || 0);
            const percentuale = obiettivo > 0 ? Math.max(0, Math.min(100, (raccolto / obiettivo) * 100)) : 0;
            return <div style={{ maxWidth: 490, margin: "20px auto", padding: "14px 18px", border: "1px solid #ddc89d", borderRadius: 12, background: "#fffaf1", breakInside: "avoid", pageBreakInside: "avoid", boxSizing: "border-box" }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Sosteniamo insieme questo progetto</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                {obiettivo > 0 && <div><div style={{ fontSize: 12, color: "#765c37" }}>OBIETTIVO</div><strong style={{ fontSize: 19 }}>{euro(obiettivo, stampa.valuta)}</strong></div>}
                <div><div style={{ fontSize: 12, color: "#765c37" }}>GIÀ RACCOLTI</div><strong style={{ fontSize: 19 }}>{euro(raccolto, stampa.valuta)}</strong></div>
              </div>
              {obiettivo > 0 && <>
                <div style={{ height: 10, borderRadius: 10, background: "#e8dfd0", overflow: "hidden", marginTop: 12 }}><div style={{ height: "100%", width: `${percentuale}%`, background: "#b78b42", borderRadius: 10 }} /></div>
                <div style={{ fontSize: 13, textAlign: "center", marginTop: 7 }}>{percentuale.toLocaleString("it-IT", { maximumFractionDigits: 1 })}% raggiunto · {raccolto >= obiettivo ? "Obiettivo raggiunto" : `Mancano ${euro(obiettivo - raccolto, stampa.valuta)}`}</div>
              </>}
            </div>;
          })()}
          {stampa.stato === "pubblicato" && stampa.id
            ? <div style={{ textAlign: "center", marginTop: 30 }}><QRCodeSVG value={urlPubblica(stampa)} size={150} /><p>Inquadra il codice per consultare l'iniziativa</p></div>
            : <p style={{ textAlign: "center", fontStyle: "italic", color: "#765c37" }}>Il QR code sarà disponibile quando l'iniziativa sarà salvata e pubblicata.</p>}
        </div>
        <button type="button" style={stilePulsante} onClick={() => {
          const el = document.getElementById("ars-volantino-stampa");
          const win = window.open("", "_blank");
          if (!win || !el) { setErroreOperazione("Consenti le finestre popup per stampare."); return; }
          win.document.write(`<html><head><title>Volantino</title><style>body{font-family:Georgia,serif;margin:0;padding:12mm;color:#24394a;overflow-wrap:anywhere}#ars-volantino-stampa{max-width:100%;box-sizing:border-box}p,h1,h2,a{overflow-wrap:anywhere;word-break:break-word}img{max-width:100%}section{break-inside:auto}section>div>div{break-inside:avoid;page-break-inside:avoid}@page{size:A4;margin:12mm}</style></head><body>${el.innerHTML}</body></html>`);
          win.document.close();
          win.addEventListener("load", () => {
            const images = Array.from(win.document.images);
            Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })))
              .then(() => { win.focus(); win.print(); });
          }, { once: true });
        }}>Stampa / Salva PDF</button>
        <button type="button" style={stilePulsanteSecondario} onClick={() => setStampa(null)}>Chiudi</button>
        
      </section>}
      {incasso && <form onSubmit={registraIncasso} style={{ ...stileScheda, background: "#fffaf1" }}>
        <h3>Registra {incasso.progetto ? `offerta per ${incasso.progetto.titolo}` : "donazione libera"}</h3>
        <p>Registra solo denaro effettivamente ricevuto. La ricevuta è generata automaticamente.</p>
        {erroreOperazione && <p role="alert" style={{ color: "#a32232" }}>{erroreOperazione}</p>}
        {campoIncasso("pagante_nominativo", "Pagante (facoltativo: lascia vuoto se non comunicato)")}
        {campoIncasso("causale_descrizione", "Causale")}
        {campoIncasso("importo", "Importo in euro", "number")}
        {campoIncasso("data", "Data dell'incasso", "date")}
        <label>Metodo<select style={stileCampo} value={incasso.metodo} onChange={e => setIncasso(v => ({ ...v, metodo: e.target.value }))}>
          <option value="consegna_diretta">Pagamento in parrocchia</option><option value="bonifico">Bonifico</option><option value="paypal">PayPal</option><option value="link_pagamento">Stripe</option>
        </select></label>
        {campoIncasso("riferimento_esterno", "Riferimento operazione (obbligatorio per PayPal/Stripe)")}
        {campoIncasso("note_private", "Note interne (facoltative)")}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}><button type="submit" style={stilePulsante} disabled={operazione}>{operazione ? "Registrazione..." : "Conferma incasso"}</button><button type="button" style={stilePulsanteSecondario} onClick={() => setIncasso(null)}>Annulla</button></div>
      </form>}
    </>}
  </div>;
}