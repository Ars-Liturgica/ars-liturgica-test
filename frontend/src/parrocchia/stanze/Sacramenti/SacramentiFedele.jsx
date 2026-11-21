import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";
import FirmaSemplice from "../../componenti/FirmaSemplice";
import AnteprimaDocumentoEconomico from "../PagamentiParrocchia/AnteprimaDocumentoEconomico";

// Ars Liturgica — Sacramenti lato fedele.
// Struttura delle sottocard della Prima Comunione approvata il 6 novembre 2026.
// Modulo Prima Comunione: legge le impostazioni pubblicate e prepara le RPC.
// Invio effettivo soltanto quando le funzioni sono autorizzate su Supabase.

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

const sottocardComunione = [
  { id: "iscrizioni", nome: "Iscrizioni e rinnovi", descrizione: "Domande, rinnovi e documenti", simbolo: "✎" },
  { id: "gruppo", nome: "Il mio gruppo", descrizione: "Dialogo con catechisti e parroco", simbolo: "☏" },
  { id: "calendario", nome: "Calendario del Catechismo", descrizione: "Incontri e scadenze del percorso", simbolo: "▦" },
  { id: "comunicazioni", nome: "Comunicazioni", descrizione: "Avvisi e informazioni", simbolo: "✉" },
  { id: "pagamenti", nome: "Quote e pagamenti", descrizione: "Situazione e ricevute", simbolo: "€" },
  { id: "celebrazioni", nome: "Celebrazioni", descrizione: "Preparazione e Prima Comunione", simbolo: "✝" },
];

function Simbolo({ tipo }) {
  const comuni = { fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true" {...comuni}>
      {tipo === "battesimo" && <>
        <path d="M21 38Q48 8 75 38Q48 51 21 38Z" />
        <path d="M48 18v24M35 24l13 18 13-18M29 32l19 10 19-10" strokeWidth="1.7" />
        <path d="M48 45C42 55 37 62 37 69a11 11 0 0 0 22 0c0-7-5-14-11-24Z" fill="#d8eef0" />
        <path d="M21 81q13-7 27 0t27 0" />
      </>}
      {tipo === "comunione" && <>
        <circle cx="48" cy="21" r="15" fill="#fffaf0" />
        <path d="M48 11v20M40 19h16" strokeWidth="2.5" />
        <path d="M22 40h52c0 19-11 28-26 28S22 59 22 40Z" fill="#f5e3b6" />
        <path d="M48 68v12M33 82h30M42 80h12" strokeWidth="4" />
      </>}
      {tipo === "cresima" && <>
        <path d="M48 34 C44 28 38 26 34 29 C31 31 31 36 34 39 L28 40 C18 35 12 27 9 17 C22 19 33 23 43 32 L48 37 L53 32 C63 23 74 19 87 17 C84 27 78 35 68 40 L62 39 C65 36 65 31 62 29 C58 26 52 28 48 34Z" fill="#fffdf8" />
        <path d="M48 37 C42 44 39 52 42 60 L48 55 L54 60 C57 52 54 44 48 37Z" fill="#fffdf8" />
        <path d="M42 59 L34 72 L43 69 L48 79 L53 69 L62 72 L54 59" fill="#fffdf8" />
        <circle cx="45" cy="34" r="1.5" fill="#b98a31" stroke="none" />
        <path d="M42 36 L35 38 L42 40" fill="#dba94b" strokeWidth="1.5" />
        <path d="M48 6 C40 15 41 22 48 27 C55 22 56 15 48 6Z" fill="#f2c86a" />
      </>}
      {tipo === "matrimonio" && <>
        <circle cx="36" cy="55" r="20" fill="none" strokeWidth="6" />
        <circle cx="60" cy="55" r="20" fill="none" strokeWidth="6" />
        <path d="M48 13v19M38.5 22.5h19" />
        <path d="M28 32l-5-7M68 32l5-7" strokeWidth="1.5" />
      </>}
    </svg>
  );
}


const MODULO_VUOTO = {
  annoPercorso: "1", nome: "", cognome: "", dataNascita: "", codiceFiscale: "",
  luogoNascita: "", indirizzo: "", comune: "", cap: "", parrocchiaBattesimo: "", dataBattesimo: "",
  battesimoInQuestaParrocchia: null,
  genitore1Nome: "", genitore1Cognome: "", genitore1CF: "", genitore1Telefono: "", genitore1Email: "",
  genitore2Nome: "", genitore2Cognome: "", genitore2Telefono: "", genitore2Email: "",
  tutore: "", delegati: "", telefonoRagazzo: "", privacyVista: false,
  autorizzaAccount: false, autorizzaChat: false,
};

function formattaData(data) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return data || "—";
  const [anno, mese, giorno] = data.split("-");
  return `${giorno}/${mese}/${anno}`;
}

// Le domande già inviate sono associate al profilo del genitore nel database.
// Nessun codice ricevuta, nessun collegamento manuale, nessun refresh richiesto.
const DOCUMENTI_PERSONALI_COMUNIONE = [
  { tipo: "certificato_battesimo", nome: "Certificato di Battesimo" },
];
const CAMPI_OBBLIGATORI_GENITORE = [
  ["nome", "Nome del bambino"], ["cognome", "Cognome del bambino"],
  ["dataNascita", "Data di nascita"], ["luogoNascita", "Luogo di nascita"],
  ["indirizzo", "Indirizzo di residenza"], ["comune", "Comune di residenza"],
  ["genitore1Nome", "Nome del genitore"], ["genitore1Cognome", "Cognome del genitore"],
];
const DETTAGLI_PRATICA = [
  ["nome", "Nome del bambino"], ["cognome", "Cognome del bambino"],
  ["dataNascita", "Data di nascita"], ["luogoNascita", "Luogo di nascita"],
  ["indirizzo", "Indirizzo"], ["comune", "Comune"], ["cap", "CAP"],
  ["codiceFiscale", "Codice fiscale (facoltativo)"],
  ["battesimoInQuestaParrocchia", "Battesimo in questa parrocchia"],
  ["parrocchiaBattesimo", "Parrocchia del Battesimo"], ["dataBattesimo", "Data del Battesimo"],
  ["genitore1Nome", "Nome del genitore"], ["genitore1Cognome", "Cognome del genitore"],
  ["genitore1Telefono", "Telefono"], ["genitore1Email", "Email"],
  ["genitore2Nome", "Secondo genitore: nome"], ["genitore2Cognome", "Secondo genitore: cognome"],
  ["delegati", "Persone delegate"],
];
function documentoConfermato(pratica, tipo) {
  return (pratica.documenti || []).some(d => d.tipo === tipo && ["ricevuto", "non_necessario"].includes(d.stato));
}
function fotoPresente(pratica, tipo) {
  return (pratica.foto || []).some(f => f.tipo === tipo);
}
function richiestaCertificatoComunione(pratica, internoObbligatorio) {
  const valore = pratica?.dati_modulo?.battesimoInQuestaParrocchia;
  if (valore === false) return true;
  if (valore === true) return internoObbligatorio === true;
  return false; // Mai indovinare la scelta per le vecchie domande.
}
function documentiDaInviareComunione(pratica, internoObbligatorio) {
  return richiestaCertificatoComunione(pratica, internoObbligatorio)
    ? DOCUMENTI_PERSONALI_COMUNIONE.filter(doc => !documentoConfermato(pratica,doc.tipo)) : [];
}

async function fotoInJpeg(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Seleziona una fotografia, non un documento PDF.");
  if (file.size > 20 * 1024 * 1024) throw new Error("La foto supera 20 MB: scegline una più piccola.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const x = new Image();
      x.onload = () => resolve(x);
      x.onerror = () => reject(new Error("Impossibile aprire questa foto. Usa JPG, PNG o WebP."));
      x.src = url;
    });
    const scala = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scala));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scala));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Non è possibile preparare la fotografia.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .84));
    if (!blob || blob.size > 5 * 1024 * 1024) throw new Error("La fotografia è troppo grande: prova con una foto più leggera.");
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
async function caricaFotoComunione({ parrocchiaId, utenteId, iscrizioneId, tipo, file }) {
  const jpeg = await fotoInJpeg(file);
  const { data: ticket, error: pre } = await supabase.rpc("ars_comunione_prepara_foto", {
    p_parrocchia_id: parrocchiaId, p_iscrizione_id: iscrizioneId,
    p_utente_id: utenteId, p_tipo: tipo,
  });
  if (pre || !ticket?.token || !ticket?.percorso) throw new Error(pre?.message || "Impossibile preparare il caricamento.");
  const { error: upload } = await supabase.storage.from("ars-comunione-documenti")
    .upload(ticket.percorso, jpeg, {contentType:"image/jpeg",upsert:false,cacheControl:"0"});
  if (upload) throw new Error("La foto non è stata caricata: " + upload.message);
  const { data: conferma, error } = await supabase.rpc("ars_comunione_conferma_foto", {
    p_parrocchia_id: parrocchiaId, p_iscrizione_id: iscrizioneId,
    p_utente_id: utenteId, p_token: ticket.token,
  });
  if (error || !conferma?.ok) throw new Error(error?.message || "Foto caricata, ma non ancora associata alla domanda.");
  return conferma;
}

function ConfermaFirmaDomandaEsistente({pratica,parrocchiaId,utenteId,onConfermata}) {
  const dati=pratica.dati_modulo || {};
  const nominativo = [dati.genitore1Nome,dati.genitore1Cognome].filter(Boolean).join(" ").trim();
  const [conferma, setConferma] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  async function confermaDomanda() {
    if (!conferma || !nominativo.trim() || salvataggio) return;
    setSalvataggio(true); setMessaggio("");
    const {data,error} = await supabase.rpc("ars_comunione_conferma_domanda_esistente",{
      p_parrocchia_id:parrocchiaId,p_iscrizione_id:pratica.id,
      p_utente_id:utenteId,p_nominativo_firma:nominativo,p_conferma:true,
    });
    setSalvataggio(false);
    if (error || !data?.ok) {setMessaggio(error?.message || "Non è stato possibile confermare la domanda.");return;}
    setMessaggio("Conferma della domanda registrata.");
    onConfermata?.();
  }
  return <div className="ars-com-firma-esistente">
    <h6>Conferma la domanda nell'app</h6>
    <FirmaSemplice documento="domanda di Prima Comunione" modalitaDisponibili="app"
      modalita="app" nominativo={nominativo}
      conferma={conferma} onConfermaChange={setConferma} disabilitato={salvataggio} />
    <button type="button" className="ars-sac-azione" onClick={confermaDomanda}
      disabled={!conferma || !nominativo.trim() || salvataggio}>
      {salvataggio ? "Conferma in corso…" : "Registra la conferma della domanda"}
    </button>
    {messaggio && <p role="status">{messaggio}</p>}
  </div>;
}

function CompletaFotoComunione({ pratica, parrocchiaId, utenteId, onCaricata, documentiMancanti }) {
  const [inCorso, setInCorso] = useState("");
  const [messaggio, setMessaggio] = useState("");
  async function scegliFoto(tipo, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInCorso(tipo); setMessaggio("");
    try {
      await caricaFotoComunione({parrocchiaId,utenteId,iscrizioneId:pratica.id,tipo,file});
      setMessaggio("Certificato ricevuto. Non devi fare altro per questo documento.");
      onCaricata?.();
    } catch (err) { setMessaggio(err.message || "Impossibile caricare il certificato."); }
    finally { setInCorso(""); e.target.value = ""; }
  }
  return <div className="ars-com-genitore-foto">
    <h6>Invia il certificato mancante</h6>
    <p>Fotografa il certificato di Battesimo con il cellulare, assicurandoti che tutte le scritte siano leggibili.
      In alternativa puoi consegnarlo in segreteria. <strong>Non occorre fotografare la domanda né l'informativa privacy.</strong></p>
    {documentiMancanti.map(doc =>
      <label className="ars-com-genitore-file" key={doc.tipo}>
        <strong>{doc.nome}</strong>
        <span>Scatta una foto o sceglila dalla galleria</span>
        <input type="file" accept="image/*"
          disabled={Boolean(inCorso)} onChange={e => scegliFoto(doc.tipo,e)} />
        {inCorso === doc.tipo && <small>Invio del certificato in corso…</small>}
      </label>)}
    {messaggio && <p role="status" className="ars-sac-successo">{messaggio}</p>}
  </div>;
}

// Modifica una domanda ESISTENTE: stessa pratica, stessi pagamenti e gruppi.
// La lettura dei consensi avviene dal server, non dal JSON della vecchia domanda.
const CAMPI_MODIFICA_ISCRIZIONE = [
  ["Dati del bambino", [
    ["nome", "Nome del bambino", "text"], ["cognome", "Cognome del bambino", "text"],
    ["dataNascita", "Data di nascita", "date"], ["luogoNascita", "Luogo di nascita", "text"],
    ["codiceFiscale", "Codice fiscale (facoltativo)", "text"],
    ["indirizzo", "Indirizzo", "text"], ["comune", "Comune", "text"],
    ["cap", "CAP", "text"], ["dataBattesimo", "Data del Battesimo", "date"],
    ["parrocchiaBattesimo", "Parrocchia del Battesimo", "text"],
  ]],
  ["Genitori e recapiti", [
    ["genitore1Nome", "Nome del genitore richiedente", "text"],
    ["genitore1Cognome", "Cognome del genitore richiedente", "text"],
    ["genitore1CF", "Codice fiscale del genitore", "text"],
    ["genitore1Telefono", "Telefono del genitore", "tel"],
    ["genitore1Email", "Email del genitore", "email"],
    ["genitore2Nome", "Secondo genitore: nome", "text"],
    ["genitore2Cognome", "Secondo genitore: cognome", "text"],
    ["genitore2Telefono", "Secondo genitore: telefono", "tel"],
    ["genitore2Email", "Secondo genitore: email", "email"],
    ["tutore", "Qualità del tutore (se presente)", "text"],
    ["delegati", "Delegati al ritiro", "text"],
  ]],
];

function ModificaIscrizioneComunione({ parrocchiaId, iscrizioneId, utenteId, operatoreParrocchia = false, onAnnulla, onSalvata }) {
  const [originale, setOriginale] = useState(null);
  const [bozza, setBozza] = useState({});
  const [account, setAccount] = useState(false);
  const [chat, setChat] = useState(false);
  const [consensiRaccolti, setConsensiRaccolti] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    let attivo = true;
    setCaricamento(true); setErrore(""); setMessaggio("");
    (async () => {
      const {data,error} = await supabase.rpc("ars_comunione_fedele_leggi_modifica", {
        p_parrocchia_id:parrocchiaId, p_iscrizione_id:iscrizioneId, p_utente_id:utenteId,
      });
      if (!attivo) return;
      setCaricamento(false);
      if (error || !data?.id) { setErrore(error?.message || "Impossibile aprire la domanda."); return; }
      setOriginale(data);
      setBozza(data.dati_modulo || {});
      setAccount(data.consenso_account === true);
      setChat(data.consenso_chat === true);
    })();
    return () => { attivo = false; };
  }, [parrocchiaId,iscrizioneId]);

  function cambia(campo, valore) {
    setBozza(precedente => ({ ...precedente, [campo]: valore }));
    setMessaggio("");
  }
  async function salva(e) {
    e.preventDefault();
    if (!originale || occupato) return;
    const confronto = originale.dati_modulo || {};
    const campi = CAMPI_MODIFICA_ISCRIZIONE.flatMap(([, items]) => items.map(([key]) => key))
      .concat(["battesimoInQuestaParrocchia", "telefonoRagazzo"]);
    const patch = {};
    for (const chiave of campi) {
      const nuovo = chiave === "battesimoInQuestaParrocchia" ? bozza[chiave] : String(bozza[chiave] ?? "").trim();
      if (chiave === "battesimoInQuestaParrocchia" && typeof nuovo !== "boolean") continue;
      if (JSON.stringify(nuovo) !== JSON.stringify(confronto[chiave] ?? (chiave === "battesimoInQuestaParrocchia" ? null : "")))
        patch[chiave] = nuovo;
    }
    const modificaAccount = account !== (originale.consenso_account === true);
    const modificaChat = chat !== (originale.consenso_chat === true);
    if (!Object.keys(patch).length && !modificaAccount && !modificaChat) {
      setMessaggio("Nessuna modifica da salvare."); return;
    }
    if (operatoreParrocchia && (modificaAccount || modificaChat) && !consensiRaccolti) {
      setErrore("Conferma di aver raccolto i consensi del genitore prima di registrarli.");return;
    }
    setOccupato(true);setErrore("");setMessaggio("");
    const {data,error} = await supabase.rpc("ars_comunione_fedele_modifica", {
      p_parrocchia_id:parrocchiaId,
      p_iscrizione_id:iscrizioneId,
      p_utente_id:utenteId,
      p_dati_patch:patch,
      p_consenso_account:modificaAccount ? account : null,
      p_consenso_chat:modificaChat ? chat : null,
      p_aggiornata_il_attesa:originale.aggiornata_il,
    });
    setOccupato(false);
    if (error || !data?.ok) {setErrore(error?.message || "Non è stato possibile salvare le modifiche.");return;}
    const statoAccount = data.account_ragazzo?.account_stato;
    setMessaggio(statoAccount === "creato" ? "Modifiche salvate. L'account del ragazzo è stato creato." :
      "Modifiche salvate nella domanda esistente.");
    onSalvata?.(data);
  }
  return <section className="ars-com-modifica-esistente" aria-label="Modifica iscrizione"
    style={{border:"1px solid #c8d8d5",borderRadius:12,padding:18,marginTop:16,background:"#fcfefd"}}>
    <h4>Modifica iscrizione</h4>
    <p>Correggi i dati o aggiorna i consensi. L'iscrizione, i documenti, il gruppo assegnato e i pagamenti restano gli stessi.</p>
    {caricamento && <p role="status">Apertura della domanda…</p>}
    {errore && <p role="alert" style={{color:"#ad2929",fontWeight:600}}>{errore}</p>}
    {messaggio && <p role="status" style={{color:"#136145",fontWeight:600}}>{messaggio}</p>}
    {originale && <form onSubmit={salva}>
      {CAMPI_MODIFICA_ISCRIZIONE.map(([titolo, campi]) => <fieldset key={titolo}
        style={{border:"1px solid #e0e7e5",borderRadius:9,margin:"14px 0",padding:12}}>
        <legend style={{fontWeight:700}}>{titolo}</legend>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          {campi.map(([key,etichetta,tipo]) => <label key={key} style={{display:"flex",flexDirection:"column",gap:5}}>
            <span>{etichetta}</span>
            <input type={tipo} value={String(bozza[key] ?? "")}
              onChange={e => cambia(key,e.target.value)} disabled={occupato}
              style={{width:"100%",minHeight:38,padding:7,border:"1px solid #b6c7c3",borderRadius:6}} />
          </label>)}
        </div>
      </fieldset>)}
      <fieldset style={{border:"1px solid #e0e7e5",borderRadius:9,margin:"14px 0",padding:12}}>
        <legend style={{fontWeight:700}}>Battesimo</legend>
        <label style={{display:"flex",flexDirection:"column",gap:6}}>
          <span>Il bambino è stato battezzato in questa parrocchia?</span>
          <select value={typeof bozza.battesimoInQuestaParrocchia === "boolean" ? String(bozza.battesimoInQuestaParrocchia) : ""}
            disabled={occupato} onChange={e => cambia("battesimoInQuestaParrocchia",e.target.value === "" ? null : e.target.value === "true")}
            style={{minHeight:40,border:"1px solid #b6c7c3",borderRadius:6}}>
            <option value="">Da chiarire</option><option value="true">Sì</option><option value="false">No</option>
          </select>
        </label>
        {bozza.battesimoInQuestaParrocchia === false &&
          <p>Se battezzato in un'altra parrocchia, il certificato rimane obbligatorio.</p>}
      </fieldset>
      <fieldset style={{border:"1px solid #e0e7e5",borderRadius:9,margin:"14px 0",padding:12}}>
        <legend style={{fontWeight:700}}>Account del ragazzo e chat</legend>
        <label style={{display:"flex",alignItems:"flex-start",gap:9,margin:"9px 0"}}>
          <input type="checkbox" checked={account} disabled={occupato}
            onChange={e => {setAccount(e.target.checked);if (!e.target.checked) setChat(false);}} />
          <span>Autorizzo l'utilizzo o la creazione dell'account Ars Liturgica per il ragazzo.</span>
        </label>
        <label style={{display:"flex",alignItems:"flex-start",gap:9,margin:"9px 0"}}>
          <input type="checkbox" checked={chat} disabled={occupato || !account}
            onChange={e => setChat(e.target.checked)} />
          <span>Autorizzo separatamente il ragazzo a partecipare alla chat del gruppo di catechismo.</span>
        </label>
        {account && <label style={{display:"flex",flexDirection:"column",gap:5,marginTop:12}}>
          <span>Cellulare del ragazzo (facoltativo)</span>
          <input type="tel" value={String(bozza.telefonoRagazzo ?? "")}
            onChange={e => cambia("telefonoRagazzo",e.target.value)} disabled={occupato}
            style={{minHeight:38,padding:7,border:"1px solid #b6c7c3",borderRadius:6}} />
        </label>}
        <p>Stato account: <strong>{originale.account_ragazzo_stato === "attivo" ? "già attivo" :
          originale.account_ragazzo_stato === "da_verificare" ? "da verificare" : "non autorizzato"}</strong>.</p>
        {operatoreParrocchia &&
          <label style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:12}}>
            <input type="checkbox" checked={consensiRaccolti} disabled={occupato}
              onChange={e => setConsensiRaccolti(e.target.checked)} />
            <span>Confermo di aver raccolto dal genitore i consensi che sto modificando.</span>
          </label>}
      </fieldset>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>
        <button type="button" disabled={occupato} onClick={onAnnulla} className="ars-sac-azione ars-sac-azione-chiara">Annulla</button>
        <button type="submit" disabled={occupato} className="ars-sac-conferma">
          {occupato ? "Salvataggio…" : "Salva modifiche"}
        </button>
      </div>
    </form>}
  </section>;
}


function StatoDomandeComunioneGenitore({ parrocchiaId, utenteId, nuovaIscrizioneId }) {
  const [domande, setDomande] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [apertaId, setApertaId] = useState(null);
  const [completaId, setCompletaId] = useState(null);
  const [modificaDomandaId, setModificaDomandaId] = useState(null);
  const [esitoModifica, setEsitoModifica] = useState("");
  const [revisione, setRevisione] = useState(0);
  const [firmateOra, setFirmateOra] = useState([]);
  const [firmaConsentita, setFirmaConsentita] = useState(null);
  const [firmaModalitaErrore, setFirmaModalitaErrore] = useState(false);
  const [firmaControllo, setFirmaControllo] = useState(0);
  const [internoObbligatorio, setInternoObbligatorio] = useState(null);
  useEffect(() => {
    let attivo=true;
    setFirmaConsentita(null);
    setFirmaModalitaErrore(false);
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error}=await supabase.rpc("ars_firme_leggi_modalita", {
        p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",
      });
      if (!attivo) return;
      if (error || !["app","cartacea","entrambe"].includes(data?.modalita)) {
        setFirmaModalitaErrore(true);
        return;
      }
      setFirmaConsentita(["app","entrambe"].includes(data.modalita));
    })();
    return () => {attivo=false;};
  },[parrocchiaId,firmaControllo]);
  // Aggiornamento automatico quando si ritorna alla pagina, oltre che dopo ogni modifica.
  useEffect(() => {
    const aggiornaSeVisibile = () => {if (document.visibilityState === "visible") setRevisione(v=>v+1);};
    window.addEventListener("focus", aggiornaSeVisibile);
    return () => window.removeEventListener("focus", aggiornaSeVisibile);
  }, []);
  useEffect(() => {
    let attivo = true;
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error}=await supabase.rpc("ars_comunione_configurazione_fedele",{
        p_parrocchia_id:parrocchiaId,
      });
      if (attivo) setInternoObbligatorio(!error && data ? data.certificato_battesimo_interno_obbligatorio === true : null);
    })();
    return () => {attivo=false;};
  },[parrocchiaId]);
  useEffect(() => {
    let attivo = true;
    if (!parrocchiaId || !utenteId) {setDomande([]);setCaricamento(false);return undefined;}
    setCaricamento(true); setErrore("");
    (async () => {
      const {data,error} = await supabase.rpc("ars_comunione_mie_domande", {
        p_parrocchia_id:parrocchiaId,p_utente_id:utenteId,
      });
      if (!attivo) return;
      setCaricamento(false);
      if (error || !Array.isArray(data)) {
        setErrore(error?.message || "Non è stato possibile leggere le domande.");
      } else setDomande(data);
    })();
    return () => { attivo=false; };
  }, [parrocchiaId,utenteId,nuovaIscrizioneId,revisione]);
  return <section className="ars-com-genitore-stato" aria-label="Le mie domande di Prima Comunione">
    <h4>Le mie domande e documenti</h4>
    <p>Qui trovi le domande inviate alla parrocchia e le eventuali informazioni o certificati ancora da fornire.</p>
    {esitoModifica && <p role="status" className="ars-sac-successo">{esitoModifica}</p>}
    {caricamento && <p role="status">Caricamento delle tue domande…</p>}
    {errore && <p className="ars-sac-errore" role="alert">{errore}</p>}
    {!caricamento && !errore && domande.length === 0 && <p>Non hai ancora inviato domande di Prima Comunione.</p>}
    {domande.map(pratica => {
      const d = pratica.dati_modulo || {};
      const documentiMancanti = documentiDaInviareComunione(pratica, internoObbligatorio);
      const datiMancanti = CAMPI_OBBLIGATORI_GENITORE.filter(([k]) => !String(d[k] || "").trim()).map(([,nome]) => nome);
      if (!d.genitore1Telefono && !d.genitore1Email) datiMancanti.push("Telefono o email del genitore");
      if (!pratica.privacy_presa_visione_il) datiMancanti.push("Presa visione privacy");
      const firmaRegistrata = documentoConfermato(pratica,"domanda_firmata") || Boolean(pratica.firma_id || pratica.firma_registrata_il) || firmateOra.includes(pratica.id);
      const firmaDaConfermare = d.modalitaPresentazione === "segreteria_con_account" && !firmaRegistrata;
      if (firmaDaConfermare) datiMancanti.push(firmaConsentita === true
        ? "Conferma la domanda nell'app qui sotto"
        : firmaConsentita === false ? "Firma da consegnare alla parrocchia"
        : "Modalità di conferma da verificare");
      if (typeof d.battesimoInQuestaParrocchia !== "boolean" && !documentoConfermato(pratica,"certificato_battesimo"))
        datiMancanti.push("Indicare se il Battesimo è avvenuto in questa parrocchia (per le vecchie domande, chiedi alla segreteria)");
      const completa = internoObbligatorio !== null && datiMancanti.length===0 && documentiMancanti.length===0;
      return <article className="ars-com-genitore-pratica" key={pratica.id}>
        <div className="ars-com-genitore-riepilogo">
          <h5>{d.nome || "Bambino"} {d.cognome || ""}</h5>
          <p><strong>Anno:</strong> {pratica.anno_percorso}° · {pratica.anno_pastorale}</p>
          <p><strong>Domanda presentata:</strong> {pratica.presentata_il ? new Date(pratica.presentata_il).toLocaleDateString("it-IT") : "—"}</p>
          <p><strong>Genitore:</strong> {d.genitore1Nome || ""} {d.genitore1Cognome || ""}</p>
          {completa ? <p className="ars-sac-successo">Domanda completa: non devi fare altro.</p> :
            <div className="ars-com-genitore-mancanti" role="status">
              <strong>Per completare la domanda</strong>
              {datiMancanti.length > 0 && <><p>Informazioni da completare:</p>
                <ol>{datiMancanti.map(voce => <li key={voce}>{voce}</li>)}</ol></>}
              {documentiMancanti.length > 0 && <><p>Certificati da consegnare:</p>
                <ol>{documentiMancanti.map(doc => <li key={doc.tipo}>{doc.nome}</li>)}</ol>
                <p>Puoi inviare una foto del certificato oppure consegnarlo in segreteria.</p></>}
              {internoObbligatorio === null && <p>Stiamo verificando le indicazioni della parrocchia.</p>}
            </div>}
        </div>
        <div className="ars-com-genitore-pulsanti">
          <button className="ars-sac-azione ars-sac-azione-chiara" type="button"
            onClick={() => setApertaId(v => v===pratica.id ? null:pratica.id)}>
            {apertaId===pratica.id ? "Chiudi domanda" : "Apri domanda"}
          </button>
          <button className="ars-sac-azione" type="button"
            onClick={() => {setModificaDomandaId(v => v === pratica.id ? null : pratica.id);setEsitoModifica("");}}>
            {modificaDomandaId === pratica.id ? "Chiudi modifica" : "Modifica iscrizione"}
          </button>
          {documentiMancanti.length > 0 && <button className="ars-sac-azione" type="button"
            onClick={() => setCompletaId(v => v===pratica.id ? null:pratica.id)}>
            {completaId===pratica.id ? "Chiudi documenti" : "Completa documenti"}
          </button>}
        </div>
        {modificaDomandaId===pratica.id && <ModificaIscrizioneComunione
          parrocchiaId={parrocchiaId} iscrizioneId={pratica.id} utenteId={utenteId}
          onAnnulla={() => setModificaDomandaId(null)}
          onSalvata={(esito) => {setModificaDomandaId(null);setRevisione(v=>v+1);setEsitoModifica(
            esito?.account_ragazzo?.account_stato === "creato" ? "Modifiche salvate. Account del ragazzo creato." :
            "Iscrizione aggiornata correttamente.");}} />}
        {apertaId===pratica.id && <div className="ars-com-genitore-dettaglio">
          <h5>Domanda inviata alla parrocchia</h5>
          <p>Questa è la copia della domanda presentata alla parrocchia.</p>
          {[
            ["Dati del bambino", DETTAGLI_PRATICA.slice(0,11)],
            ["Genitori e recapiti", DETTAGLI_PRATICA.slice(11)],
          ].map(([titolo, campi]) => <section key={titolo}>
            <h6>{titolo}</h6>
            <dl>{campi.filter(([k]) => typeof d[k] === "boolean" || String(d[k] ?? "").trim()).map(([k,nome]) =>
              <div key={k}><dt>{nome}</dt><dd>{typeof d[k] === "boolean" ? (d[k] ? "Sì" : "No") :
                (k.startsWith("data") ? formattaData(d[k]) : String(d[k]))}</dd></div>)}</dl>
          </section>)}
          <h6>Privacy</h6>
          <p>Informativa versione {pratica.privacy_versione || "—"}: presa visione {pratica.privacy_presa_visione_il ? "registrata" : "non registrata"}.</p>
          {firmaRegistrata && <p><strong>Conferma della domanda:</strong> registrata.</p>}
          <h6>Certificato di Battesimo</h6>
          {DOCUMENTI_PERSONALI_COMUNIONE.map(doc => <p key={doc.tipo}><strong>{doc.nome}:</strong> {
            documentoConfermato(pratica,doc.tipo) ? "Ricevuto" : documentiMancanti.some(x=>x.tipo===doc.tipo) ? "Da inviare" : "Non richiesto o da chiarire"}</p>)}
          {(pratica.solleciti || []).length>0 && <div className="ars-com-genitore-solleciti">
            <h6>Promemoria della parrocchia</h6>
            {pratica.solleciti.map(s => <p key={s.id}>
              {new Date(s.creato_il).toLocaleDateString("it-IT")}: {s.documenti_mancanti.join(", ")}
            </p>)}
          </div>}
        </div>}
        {firmaDaConfermare && firmaModalitaErrore && <div className="ars-sac-errore" role="alert">
          <p>Non riusciamo a leggere le modalità di conferma della parrocchia.</p>
          <button type="button" className="ars-sac-azione ars-sac-azione-chiara"
            onClick={() => setFirmaControllo(v => v+1)}>Riprova</button>
        </div>}
        {firmaDaConfermare && firmaConsentita === true && <ConfermaFirmaDomandaEsistente
            pratica={pratica} parrocchiaId={parrocchiaId} utenteId={utenteId}
            onConfermata={() => {setFirmateOra(v => v.includes(pratica.id) ? v : [...v,pratica.id]);setRevisione(v=>v+1);}} />}
        {completaId===pratica.id && !completa && <CompletaFotoComunione
          pratica={pratica} parrocchiaId={parrocchiaId} utenteId={utenteId}
          documentiMancanti={documentiMancanti}
          onCaricata={() => { setCompletaId(null); setRevisione(v=>v+1); }} />}
      </article>;
    })}
  </section>;
}

function ModuloComunione({ parrocchiaId, utenteId, nomeParrocchia, onApriQuote }) {
  const [config, setConfig] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [erroreConfig, setErroreConfig] = useState("");
  const [mostraModulo, setMostraModulo] = useState(false);
  const [mostraPrivacy, setMostraPrivacy] = useState(false);
  const [modulo, setModulo] = useState({ ...MODULO_VUOTO });
  const [ricerca, setRicerca] = useState("idle");
  const [candidati, setCandidati] = useState([]);
  const [sceltaAccount, setSceltaAccount] = useState("");
  const [messaggioRicerca, setMessaggioRicerca] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [inInvio, setInInvio] = useState(false);
  const [ricevuta, setRicevuta] = useState(null);
  const [modalitaDisponibili, setModalitaDisponibili] = useState(null);
  const [modalitaFirma, setModalitaFirma] = useState(null);
  const [modalitaErrore, setModalitaErrore] = useState("");
  const [modalitaRevisione, setModalitaRevisione] = useState(0);
  const nominativoFirma = [modulo.genitore1Nome.trim(), modulo.genitore1Cognome.trim()].filter(Boolean).join(" ");
  const [confermaFirma, setConfermaFirma] = useState(false);
  const [fotoPrimaInvio, setFotoPrimaInvio] = useState({});

  useEffect(() => {
    let attivo = true;
    setConfig(null);
    setErroreConfig("");
    setCaricamento(true);
    if (!parrocchiaId) {
      setErroreConfig("Non è disponibile la parrocchia. Torna alla dashboard e riprova.");
      setCaricamento(false);
      return undefined;
    }
    (async () => {
      // Lettura tramite RPC dedicata: la tabella di configurazione resta
      // riservata al parroco, mentre il fedele legge i soli campi pubblici.
      const { data, error } = await supabase.rpc("ars_comunione_configurazione_fedele", {
        p_parrocchia_id: parrocchiaId,
      });
      if (!attivo) return;
      setCaricamento(false);
      if (error) setErroreConfig("Non è possibile leggere le impostazioni della parrocchia: " + error.message);
      else if (!data) setErroreConfig("La parrocchia non ha ancora configurato il catechismo.");
      else setConfig(data);
    })();
    return () => { attivo = false; };
  }, [parrocchiaId]);

  useEffect(() => {
    let attivo = true;
    setModalitaDisponibili(null); setModalitaFirma(null); setModalitaErrore("");setConfermaFirma(false);
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error} = await supabase.rpc("ars_firme_leggi_modalita", {
        p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",
      });
      if (!attivo) return;
      if (error || !["app","cartacea","entrambe"].includes(data?.modalita)) {
        setModalitaErrore("Non riusciamo a leggere la modalità di conferma della parrocchia. Riprova.");
        return;
      }
      setModalitaDisponibili(data.modalita);
      setModalitaFirma(data.modalita === "cartacea" ? "cartacea" : "app");
    })();
    return () => {attivo=false;};
  }, [parrocchiaId,mostraModulo,modalitaRevisione]);

  const aggiorna = (chiave, valore) => {
    setModulo(prev => ({ ...prev, [chiave]: valore }));
    setMessaggio("");
    // La ricevuta di una domanda inviata non viene invalidata da modifiche al modulo.
    // Una nuova domanda richiede una nuova sessione di compilazione.
    if (["nome", "cognome", "telefonoRagazzo"].includes(chiave)) {
      setRicerca("idle");
      setCandidati([]);
      setSceltaAccount("");
      setMessaggioRicerca("");
    }
  };
  const campo = (chiave, nome, tipo = "text", obbligatorio = false) => (
    <label className="ars-sac-campo" key={chiave}>
      <span>{nome}{obbligatorio ? " *" : ""}</span>
      <input type={tipo} value={modulo[chiave]} required={obbligatorio}
        onChange={e => aggiorna(chiave, e.target.value)} maxLength={tipo === "tel" ? 60 : 254} />
    </label>
  );
  const spunta = (chiave, testo) => (
    <label className="ars-sac-spunta" key={chiave}>
      <input type="checkbox" checked={modulo[chiave]} onChange={e => {
        const valore = e.target.checked;
        aggiorna(chiave, valore);
        if (chiave === "autorizzaAccount" && !valore) aggiorna("autorizzaChat", false);
      }} />
      <span>{testo}</span>
    </label>
  );

  const privacy = String(config?.informativa_privacy_testo || "").trim();
  const versionePrivacy = String(config?.informativa_privacy_versione || "").trim();
  const privacyPubblicata = Boolean(privacy && versionePrivacy);
  const durata = Number(config?.durata || 2);
  const date = config?.date_iscrizioni || {};
  const fascia = date[modulo.annoPercorso] || {};
  const oggi = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
  const aperto = Boolean(fascia.apertura && fascia.chiusura && oggi >= fascia.apertura && oggi <= fascia.chiusura);

  async function cercaAccount() {
    setMessaggioRicerca("");
    setCandidati([]);
    setSceltaAccount("");
    if (!modulo.nome.trim() || !modulo.cognome.trim()) {
      setMessaggioRicerca("Inserisci nome e cognome del ragazzo prima di cercare un account.");
      return;
    }
    setRicerca("loading");
    const { data, error } = await supabase.rpc("ars_comunione_cerca_account_ragazzo", {
      p_nome: modulo.nome.trim(), p_cognome: modulo.cognome.trim(),
    });
    if (error) {
      setRicerca("failed");
      setMessaggioRicerca("La ricerca degli account non è ancora disponibile. Nessun collegamento sarà effettuato.");
      return;
    }
    setRicerca("ready");
    setCandidati(Array.isArray(data) ? data : []);
    setMessaggioRicerca(Array.isArray(data) && data.length
      ? "Se riconosci l'account di tuo figlio, selezionalo. Il cellulare è mostrato solo in parte."
      : "Nessun account con questo nome e cognome: potrai autorizzarne la creazione.");
    setSceltaAccount(Array.isArray(data) && data.length ? "" : "nessuno");
  }

  function validaDomanda() {
    if (!parrocchiaId || !utenteId) return "Accedi alla parrocchia come fedele per inviare la domanda.";
    if (modalitaErrore) return modalitaErrore;
    if (!modalitaFirma || !modalitaDisponibili) return "Attendi la lettura della modalità di conferma della parrocchia.";
    if (!["app", "cartacea"].includes(modalitaFirma) ||
      (modalitaDisponibili !== "entrambe" && modalitaFirma !== modalitaDisponibili))
      return "La modalità di conferma è cambiata. Riapri la domanda per aggiornarla.";
    if (!privacyPubblicata) return "La parrocchia deve ancora pubblicare l'informativa privacy.";
    if (!aperto) return "Le iscrizioni per l'anno scelto non sono aperte.";
    for (const chiave of ["nome", "cognome", "dataNascita", "luogoNascita", "indirizzo", "comune", "genitore1Nome", "genitore1Cognome"]) {
      if (!String(modulo[chiave] || "").trim()) return "Compila i dati obbligatori del bambino e del genitore.";
    }
    if (!modulo.genitore1Telefono.trim() && !modulo.genitore1Email.trim())
      return "Indica almeno un recapito del genitore: telefono oppure email.";
    if (typeof modulo.battesimoInQuestaParrocchia !== "boolean")
      return "Indica se il bambino è stato battezzato in questa parrocchia.";
    if (modulo.battesimoInQuestaParrocchia === false && !modulo.parrocchiaBattesimo.trim())
      return "Indica il nome della parrocchia dove è avvenuto il Battesimo.";
    if (!modulo.privacyVista) return "Leggi l'informativa e conferma di averne preso visione.";
    if (modalitaFirma === "app" && !confermaFirma)
      return "Dichiara di aver preso visione della domanda e confermane il contenuto.";
    if (modulo.autorizzaAccount && ricerca !== "ready") return "Prima di autorizzare l'account, completa la ricerca dei possibili account esistenti.";
    if (modulo.autorizzaAccount && !sceltaAccount) return "Seleziona l'account di tuo figlio o scegli 'Nessuno di questi'.";
    return "";
  }

  async function inviaDomanda(e) {
    e.preventDefault();
    const errore = validaDomanda();
    if (errore) { setMessaggio(errore); return; }
    if (inInvio || ricevuta) return;
    setInInvio(true);
    setMessaggio("");
    const dati = { ...modulo };
    delete dati.privacyVista;
    delete dati.autorizzaAccount;
    delete dati.autorizzaChat;
    // I dati sanitari non vengono inviati con questa domanda.
    const { data, error } = await supabase.rpc("ars_comunione_presenta_domanda_firmata", {
      p_parrocchia_id: parrocchiaId,
      p_utente_id: utenteId,
      p_anno_percorso: Number(modulo.annoPercorso),
      p_dati: dati,
      p_privacy_presa_visione: true,
      p_consenso_account: modulo.autorizzaAccount,
      p_consenso_chat: modulo.autorizzaAccount && modulo.autorizzaChat,
      p_account_esistente_id: modulo.autorizzaAccount && !["nessuno", "nonso"].includes(sceltaAccount)
        ? (sceltaAccount || null) : null,
      p_modalita_firma: modalitaFirma,
      p_nominativo_firma: nominativoFirma,
      p_conferma_firma: modalitaFirma === "app" && confermaFirma,
    });
    if (error) {
      setInInvio(false);
      setMessaggio("Domanda non inviata: " + error.message);
      return;
    }
    if (!data?.ok || !data?.iscrizione_id) {
      setInInvio(false);
      setMessaggio("Non abbiamo ricevuto la conferma. Non ripetere l'invio prima di verificare.");
      return;
    }
    setRicevuta(data);
    const certificatoRichiesto = modulo.battesimoInQuestaParrocchia === false ||
      (modulo.battesimoInQuestaParrocchia === true && config.certificato_battesimo_interno_obbligatorio);
    const foto = certificatoRichiesto
      ? Object.entries(fotoPrimaInvio).filter(([,file]) => file) : [];
    const erroriFoto = [];
    for (const [tipo,file] of foto) {
      try { await caricaFotoComunione({parrocchiaId,utenteId,iscrizioneId:data.iscrizione_id,tipo,file}); }
      catch (err) {erroriFoto.push(err.message);}
    }
    setInInvio(false);
    setMessaggio(erroriFoto.length
      ? "Domanda inviata correttamente. Una o più foto non sono state caricate: puoi aggiungerle da «Le mie domande e documenti»."
      : "Domanda inviata. Trovi la situazione aggiornata in «Le mie domande e documenti». Se serve il certificato e non lo hai ancora caricato, puoi inviarlo in seguito.");
  }

  // Stampa autonoma della scheda sanitaria. Il foglio non viene mai
  // inviato a Supabase e non fa parte della domanda online.
  function stampaSchedaSanitaria() {
    const classeStampa = "ars-sac-stampa-sanitaria";
    const ripristina = () => {
      document.body.classList.remove(classeStampa);
      window.removeEventListener("afterprint", ripristina);
    };
    document.body.classList.add(classeStampa);
    window.addEventListener("afterprint", ripristina);
    try {
      window.print();
    } catch (errore) {
      ripristina();
      setMessaggio("Non è stato possibile avviare la stampa della scheda sanitaria.");
    }
  }

  function stampa() {
    // Ripristina la stampa ordinaria, distinta dalla scheda sanitaria.
    document.body.classList.remove("ars-sac-stampa-sanitaria");
    if (!privacyPubblicata) { setMessaggio("La parrocchia non ha ancora pubblicato l'informativa da stampare."); return; }
    if (!modulo.nome.trim() || !modulo.cognome.trim() || !modulo.genitore1Nome.trim() || !modulo.genitore1Cognome.trim()) {
      setMessaggio("Compila almeno nome e cognome del bambino e del genitore prima di stampare."); return;
    }
    setMessaggio("");
    window.print();
  }

  const campiStampa = [
    ["Anno del percorso", modulo.annoPercorso + "°"],
    ["Nome del bambino", modulo.nome], ["Cognome", modulo.cognome],
    ["Data di nascita", formattaData(modulo.dataNascita)], ["Luogo di nascita", modulo.luogoNascita],
    ["Codice fiscale", modulo.codiceFiscale], ["Residenza", modulo.indirizzo], ["Comune", modulo.comune],
    ["CAP", modulo.cap], ["Battesimo in questa parrocchia", modulo.battesimoInQuestaParrocchia === null ? "Da indicare" : modulo.battesimoInQuestaParrocchia ? "Sì" : "No"],
    ["Parrocchia del battesimo", modulo.parrocchiaBattesimo],
    ["Data del battesimo", formattaData(modulo.dataBattesimo)],
    ["Nome del genitore", modulo.genitore1Nome], ["Cognome del genitore", modulo.genitore1Cognome],
    ["Telefono del genitore", modulo.genitore1Telefono], ["Email del genitore", modulo.genitore1Email],
    ["Secondo genitore", [modulo.genitore2Nome, modulo.genitore2Cognome].filter(Boolean).join(" ")],
    ["Telefono secondo genitore", modulo.genitore2Telefono], ["Email secondo genitore", modulo.genitore2Email],
    ["Tutore/qualità", modulo.tutore], ["Persone delegate", modulo.delegati],
  ];

  return <div className="ars-sac-iscrizioni">
    {caricamento && <p role="status">Caricamento delle informazioni della parrocchia…</p>}
    {erroreConfig && <p role="alert" className="ars-sac-errore">{erroreConfig}</p>}
    {config && <>
      <div className="ars-sac-nota">
        <h4>Anno catechistico {config.anno_pastorale}</h4>
        <p>{config.informazioni || "Informazioni sulle iscrizioni e il percorso di Prima Comunione."}</p>
        {!privacyPubblicata && <p className="ars-sac-errore">L'informativa privacy non è ancora pubblicata: la domanda non può essere inviata.</p>}
      </div>
      <p>Il genitore presenta la domanda per il primo anno oppure ricompila il modulo per ogni rinnovo annuale.</p>
      <div className="ars-sac-azioni">
        <button className="ars-sac-azione" type="button" onClick={() => setMostraModulo(v => !v)}>
          {mostraModulo ? "Chiudi il modulo" : "Compila iscrizione o rinnovo"}
        </button>
        {!mostraModulo && <button className="ars-sac-azione ars-sac-azione-chiara" type="button"
          onClick={onApriQuote}>
          Vai a Quote e pagamenti
        </button>}
      </div>
    </>}

    {parrocchiaId && utenteId && <StatoDomandeComunioneGenitore
      parrocchiaId={parrocchiaId} utenteId={utenteId} nuovaIscrizioneId={ricevuta?.iscrizione_id} />}

    {config && mostraModulo && <form className="ars-sac-modulo" onSubmit={inviaDomanda}>
      <fieldset><legend>Anno di catechismo</legend>
        <label className="ars-sac-campo"><span>Anno del percorso</span>
          <select value={modulo.annoPercorso} onChange={e => aggiorna("annoPercorso", e.target.value)}>
            {[1, 2, 3].filter(n => n <= durata).map(n => <option value={String(n)} key={n}>{n}° anno — {n === 1 ? "nuova iscrizione" : "rinnovo"}</option>)}
          </select>
        </label>
        <p className="ars-sac-info-date">Iscrizioni dal {formattaData(fascia.apertura)} al {formattaData(fascia.chiusura)}.
          {!aperto && <strong> Attualmente chiuse per questo anno.</strong>}</p>
      </fieldset>

      <fieldset><legend>Dati del bambino</legend><div className="ars-sac-form-grid">
        {campo("nome", "Nome", "text", true)}{campo("cognome", "Cognome", "text", true)}
        {campo("dataNascita", "Data di nascita", "date", true)}{campo("luogoNascita", "Luogo di nascita", "text", true)}
        {campo("codiceFiscale", "Codice fiscale (se richiesto)")}
        {campo("indirizzo", "Indirizzo di residenza", "text", true)}{campo("comune", "Comune", "text", true)}{campo("cap", "CAP")}
        {campo("dataBattesimo", "Data del Battesimo (se conosciuta)", "date")}
      </div>
      <div className="ars-com-battesimo-domanda">
        <label className="ars-sac-campo"><span>Il bambino è stato battezzato in questa parrocchia? *</span>
          <select required value={modulo.battesimoInQuestaParrocchia === null ? "" : String(modulo.battesimoInQuestaParrocchia)}
            onChange={e => aggiorna("battesimoInQuestaParrocchia", e.target.value === "" ? null : e.target.value === "true")}>
            <option value="">Seleziona una risposta</option>
            <option value="true">Sì</option>
            <option value="false">No, in un'altra parrocchia</option>
          </select>
        </label>
        {modulo.battesimoInQuestaParrocchia === false && <>
          {campo("parrocchiaBattesimo", "Nome della parrocchia del Battesimo", "text", true)}
          <p>In questo caso il certificato di Battesimo è obbligatorio. Puoi fotografarlo qui oppure inviarlo dopo la domanda.</p>
        </>}
        {modulo.battesimoInQuestaParrocchia === true && <p>{config?.certificato_battesimo_interno_obbligatorio
          ? "La parrocchia richiede anche in questo caso il certificato di Battesimo."
          : "Non devi consegnare il certificato di Battesimo: la parrocchia ha già i dati."}</p>}
      </div></fieldset>

      <fieldset><legend>Genitore o tutore richiedente</legend><div className="ars-sac-form-grid">
        {campo("genitore1Nome", "Nome", "text", true)}{campo("genitore1Cognome", "Cognome", "text", true)}
        {campo("genitore1CF", "Codice fiscale")}{campo("genitore1Telefono", "Telefono", "tel")}
        {campo("genitore1Email", "Email", "email")}{campo("tutore", "Qualità del tutore, se pertinente")}
        <p>Indica almeno un recapito: telefono oppure email.</p>
      </div></fieldset>
      <fieldset><legend>Secondo genitore (se presente)</legend><div className="ars-sac-form-grid">
        {campo("genitore2Nome", "Nome")}{campo("genitore2Cognome", "Cognome")}
        {campo("genitore2Telefono", "Telefono", "tel")}{campo("genitore2Email", "Email", "email")}
      </div></fieldset>
      <fieldset><legend>Deleghe (se previste)</legend>
        <label className="ars-sac-campo">Persone delegate al ritiro
          <textarea value={modulo.delegati} onChange={e => aggiorna("delegati", e.target.value)} rows={2} />
        </label>
        <div className="ars-sac-sanitaria-avviso">
          <p><strong>Informazioni sanitarie riservate — facoltative</strong></p>
          <p>Se hai informazioni importanti per la partecipazione di tuo figlio, puoi utilizzare una scheda separata. Non devi scriverle in questa domanda online.</p>
          <button className="ars-sac-azione ars-sac-azione-chiara" type="button" onClick={stampaSchedaSanitaria}>
            Stampa scheda sanitaria (facoltativa)
          </button>
          <p className="ars-sac-sanitaria-nota">Compila il foglio a mano, firmalo e consegnalo in busta chiusa alla parrocchia. Se non hai informazioni da segnalare, non occorre consegnarlo. Prima della consegna, chiedi alla parrocchia l’informativa specifica sul trattamento dei dati sanitari.</p>
        </div>
      </fieldset>

      <fieldset><legend>Account personale del ragazzo — facoltativo</legend>
        <p>Se tuo figlio ha già un account Ars Liturgica puoi riutilizzarlo. L'iscrizione al Catechismo è possibile anche senza autorizzare un account.</p>
        {spunta("autorizzaAccount", "Autorizzo l'utilizzo o la creazione di un account Ars Liturgica per mio figlio.")}
        {modulo.autorizzaAccount && <div className="ars-sac-scelta-account">
          <p>Per riconoscere un account già esistente, confrontiamo nome e cognome. Il cellulare serve a distinguerlo dagli omonimi.</p>
          {campo("telefonoRagazzo", "Cellulare del ragazzo (se noto)", "tel")}
          <button className="ars-sac-azione ars-sac-azione-chiara" type="button" onClick={cercaAccount} disabled={ricerca === "loading"}>
            {ricerca === "loading" ? "Ricerca in corso…" : "Cerca account esistenti"}
          </button>
          {messaggioRicerca && <p role="status" className="ars-sac-avvertenza">{messaggioRicerca}</p>}
          {ricerca === "ready" && candidati.length > 0 && <div className="ars-sac-risultati" role="group" aria-label="Account trovati">
            {candidati.map(c => <label className="ars-sac-spunta" key={c.account_id}>
              <input type="radio" name="accountFiglio" value={c.account_id} checked={sceltaAccount === c.account_id}
                onChange={() => setSceltaAccount(c.account_id)} />
              <span><strong>{c.nome} {c.cognome}</strong> — Cell. {c.cellulare}</span>
            </label>)}
            <label className="ars-sac-spunta"><input type="radio" name="accountFiglio" value="nessuno"
              checked={sceltaAccount === "nessuno"} onChange={() => setSceltaAccount("nessuno")} />
              <span>Nessuno di questi account è di mio figlio</span></label>
            <label className="ars-sac-spunta"><input type="radio" name="accountFiglio" value="nonso"
              checked={sceltaAccount === "nonso"} onChange={() => setSceltaAccount("nonso")} />
              <span>Non so riconoscere l'account: prosegui con la domanda</span></label>
          </div>}
          {spunta("autorizzaChat", "Autorizzo separatamente mio figlio a partecipare allo spazio di dialogo del proprio gruppo di catechismo, seguito dalla parrocchia.")}
          <p className="ars-sac-avvertenza">Il ragazzo non avrà accesso ai dati riservati del genitore né ai pagamenti. Nessuna conversazione privata fra ragazzi.</p>
        </div>}
      </fieldset>

      <fieldset><legend>Informativa privacy della parrocchia</legend>
        {privacyPubblicata ? <>
          <p>Informativa pubblicata dalla parrocchia — versione {versionePrivacy}.</p>
          <button className="ars-sac-azione ars-sac-azione-chiara" type="button" onClick={() => setMostraPrivacy(v => !v)}>
            {mostraPrivacy ? "Chiudi informativa" : "Leggi l'informativa privacy"}
          </button>
          {mostraPrivacy && <div className="ars-sac-testo-informativa" tabIndex={0}>{privacy}</div>}
          {spunta("privacyVista", "Dichiaro di aver preso visione dell’informativa privacy della parrocchia.")}
        </> : <p role="alert" className="ars-sac-errore">L'informativa non è ancora disponibile. La parrocchia deve pubblicarla prima dell'invio.</p>}
        <p className="ars-sac-avvertenza">La presa visione viene registrata direttamente nell'app. Non occorre fotografare l'informativa privacy.</p>
      </fieldset>

      {modalitaErrore && <div role="alert" className="ars-sac-errore">
        <p>{modalitaErrore}</p>
        <button type="button" className="ars-sac-azione ars-sac-azione-chiara"
          onClick={() => setModalitaRevisione(v=>v+1)}>Riprova</button>
      </div>}
      {!modalitaErrore && !modalitaDisponibili && <p role="status">Caricamento della modalità di conferma…</p>}
      {modalitaDisponibili && modalitaFirma && !modalitaErrore && <FirmaSemplice
        documento="domanda di Prima Comunione"
        modalitaDisponibili={modalitaDisponibili} modalita={modalitaFirma}
        onModalitaChange={setModalitaFirma} conferma={confermaFirma}
        onConfermaChange={setConfermaFirma} nominativo={nominativoFirma}
        disabilitato={Boolean(ricevuta)} />}
      {!ricevuta && <fieldset className="ars-com-foto-preinvio">
        <legend>Certificato di Battesimo</legend>
        {modulo.battesimoInQuestaParrocchia === false ||
         (modulo.battesimoInQuestaParrocchia === true && config.certificato_battesimo_interno_obbligatorio)
          ? <>
          <p><strong>Puoi fotografare il certificato adesso oppure inviarlo dopo.</strong>
            La domanda resta salvata anche se il certificato non è pronto.</p>
          <label className="ars-com-genitore-file">
            <span>Scegli o scatta una foto leggibile del certificato</span>
            <input type="file" accept="image/*"
              onChange={e => setFotoPrimaInvio(p => ({...p,certificato_battesimo:e.target.files?.[0] || null}))} />
            {fotoPrimaInvio.certificato_battesimo && <small>Foto scelta: {fotoPrimaInvio.certificato_battesimo.name}</small>}
          </label>
          </> : <p>{modulo.battesimoInQuestaParrocchia === null ? "Rispondi prima alla domanda sul Battesimo." :
            "In questo caso non serve caricare un certificato."}</p>}
      </fieldset>}
      {messaggio && <p className={ricevuta ? "ars-sac-successo" : "ars-sac-errore"} role="status">{messaggio}</p>}
      {ricevuta && <p className="ars-sac-successo">Pratica registrata: {ricevuta.iscrizione_id}.
        {ricevuta.account_stato === "da_verificare" ? " L'eventuale account del ragazzo sarà verificato separatamente." : ""}</p>}
      <div className="ars-sac-azioni">
        <button className="ars-sac-azione" type="button" onClick={stampa} disabled={!privacyPubblicata}>
          Stampa domanda e informativa
        </button>
        <button className="ars-sac-azione" type="submit"
          disabled={inInvio || Boolean(ricevuta) || !privacyPubblicata || !aperto || !modalitaFirma || Boolean(modalitaErrore) || (modalitaFirma === "app" && !confermaFirma)}>
          {inInvio ? "Invio in corso…" : ricevuta ? "Domanda inviata" : "Invia alla parrocchia"}
        </button>
      </div>
      <p className="ars-sac-avvertenza">Se non hai ancora il certificato richiesto, puoi inviarlo più tardi da «Le mie domande e documenti». Ogni elemento già ricevuto scompare da quelli da inviare.</p>

      <div className="ars-sac-documenti-stampa" aria-hidden="true">
        <section className="ars-sac-pagina-stampa">
          <h2>{nomeParrocchia || "Parrocchia"}</h2>
          <h3>Domanda di iscrizione o rinnovo — Prima Comunione</h3>
          <p>Anno catechistico {config.anno_pastorale}</p>
          {ricevuta?.iscrizione_id && <p>Pratica: {ricevuta.iscrizione_id}</p>}
          <div className="ars-sac-righe-stampa">
            {campiStampa.map(([etichetta, valore]) => <div key={etichetta}><strong>{etichetta}:</strong> {valore || "_________________"}</div>)}
          </div>
          <p>Chiedo l’iscrizione del minore sopra indicato al percorso di preparazione alla Prima Comunione.</p>
          <p>Modalità di conferma: {modalitaFirma === "app" ? "Presa visione e conferma nell’app" : "Firma su carta"}.</p>
          <p>Autorizzazione account: {modulo.autorizzaAccount ? "Sì" : "No"} — Autorizzazione dialogo del gruppo: {modulo.autorizzaAccount && modulo.autorizzaChat ? "Sì" : "No"}.</p>
          <p>Presa visione dell'informativa privacy versione {versionePrivacy}: {modulo.privacyVista ? "Confermata online" : "Da confermare"}.</p>
          <div className="ars-sac-firme-stampa">
            <p>Luogo e data: ____________________________________________</p>
            <p>{modalitaFirma === "app" && ricevuta?.firma_id
              ? `Presa visione e conferma nell’app: ${nominativoFirma}`
              : "Firma del genitore/tutore: _____________________________________"}</p>
            {modalitaFirma === "cartacea" && <p>Firma del secondo genitore, se richiesta: _________________________</p>}
          </div>
        </section>
        <section className="ars-sac-pagina-stampa ars-sac-privacy-stampa">
          <div className="ars-sac-stampa-privacy-testo">{privacy}</div>
          <p>Versione informativa: {versionePrivacy}</p>
          <p>Data e luogo: ____________________________________________</p>
          <p>Presa visione privacy: {modulo.privacyVista ? "Registrata nell’app" : "Da confermare"}.</p>
          <p>Firma secondo genitore, se richiesta: _________________________</p>
        </section>
      </div>

      {/* Documento cartaceo autonomo, mai inviato né salvato online. */}
      <section className="ars-sac-scheda-sanitaria-stampa" aria-hidden="true">
        <div className="ars-sac-sanitaria-intestazione">
          <p className="ars-sac-sanitaria-parrocchia">{nomeParrocchia || "Parrocchia"}</p>
          <h2>Scheda riservata facoltativa del minore</h2>
          <p>Prima Comunione — Anno catechistico {config.anno_pastorale}</p>
        </div>
        <p className="ars-sac-sanitaria-istruzioni">Da compilare soltanto se vi sono informazioni particolari da comunicare alla parrocchia. Consegnare in <strong>busta chiusa</strong> al responsabile indicato dalla parrocchia.</p>
        <div className="ars-sac-sanitaria-dati">
          <p><strong>Nome e cognome del minore:</strong> {[modulo.nome.trim(), modulo.cognome.trim()].filter(Boolean).join(" ") || "____________________________________"}</p>
          <p><strong>Anno del percorso:</strong> {modulo.annoPercorso}°</p>
        </div>
        {[
          "Patologie ed eventuali terapie in corso rilevanti per la partecipazione",
          "Allergie e intolleranze (anche alimentari)",
          "Indicazioni utili in caso di necessità o emergenza",
          "Altre informazioni strettamente necessarie",
        ].map(titolo => <div className="ars-sac-sanitaria-righe" key={titolo}>
          <h3>{titolo}</h3>
          <div className="ars-sac-sanitaria-riga" />
          <div className="ars-sac-sanitaria-riga" />
          <div className="ars-sac-sanitaria-riga" />
        </div>)}
        <div className="ars-sac-sanitaria-firma">
          <p>Le informazioni indicate sono facoltative e sono consegnate separatamente. Per la loro gestione è necessaria l’informativa specifica fornita dalla parrocchia.</p>
          <p>☐ Ho letto l’informativa specifica e acconsento al trattamento delle informazioni sanitarie che consegno, per le finalità indicate.</p>
          <p>Luogo e data: __________________________________________</p>
          <p>Firma del genitore/tutore: _________________________________</p>
          <p>Firma dell'altro genitore, se richiesta: _________________________</p>
        </div>
        <p className="ars-sac-sanitaria-piede">Documento riservato — non allegare alla domanda online e non inserire nell'archivio ordinario delle iscrizioni.</p>
      </section>
    </form>}
  </div>;
}

// Card 05 fedele: quote, offerte libere, metodi disponibili e ricevute.
// Il sistema contabile è quello comune a tutte le attività della parrocchia.
const euroPagamentiComunione = (importo, valuta = "EUR") => {
  try {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: valuta || "EUR" }).format(Number(importo || 0));
  } catch { return `${Number(importo || 0).toFixed(2)} ${valuta || "EUR"}`; }
};

// I metodi di pagamento sono comuni a tutte le attività della parrocchia.
// I link manuali PayPal/Stripe NON consentono di associare in sicurezza
// la conferma del gestore a un'iscrizione, né di emettere ricevute automatiche.
// Fino all'attivazione del collegamento ufficiale verificato sul server,
// non presentarli alle famiglie come pagamenti disponibili.
// In futuro i metodi online saranno mostrati solo se il server confermerà:
// 1) conto della parrocchia collegato, 2) pagamento integrato e attivo.
function metodoVersamentoComunioneDisponibile(metodo) {
  if (!metodo || typeof metodo.tipo !== "string") return false;
  if (metodo.tipo === "consegna_diretta") return true;
  if (metodo.tipo === "bonifico") return typeof metodo.iban === "string" && metodo.iban.trim().length > 0;
  return false;
}

function RiepilogoVersamentoComunione({ posizione, metodi, erroreMetodi, metodiInCaricamento, onAggiorna, onNuovaRicevuta, parrocchiaId, utenteId, identificativo }) {
  const libera = posizione.modalita_contribuzione === "offerta_libera";
  const residuo = Number(posizione.residuo || 0);
  const annullata = posizione.stato_iscrizione === "annullata";
  const puoVersare = !annullata && (libera || (posizione.quota_dovuta != null && residuo > 0));
  const [aperto, setAperto] = useState(false);
  const [importo, setImporto] = useState("");
  const [erroreImporto, setErroreImporto] = useState("");
  const [metodoScelto, setMetodoScelto] = useState(null);
  const [riferimentoBonifico, setRiferimentoBonifico] = useState("");
  const [bonificoInCorso, setBonificoInCorso] = useState(false);
  const [erroreBonifico, setErroreBonifico] = useState("");
  const [esitoBonifico, setEsitoBonifico] = useState("");
  const idTentativoBonifico = useRef(null);

  async function dichiaraBonifico() {
    if (bonificoInCorso || esitoBonifico) return;
    if (!importoValido) {
      setErroreBonifico("Indica un importo valido prima di confermare il bonifico.");
      return;
    }
    if (!identificativo || !utenteId || !parrocchiaId || !posizione.iscrizione_id) {
      setErroreBonifico("Accesso non riconosciuto: rientra nell'area personale.");
      return;
    }
    // Un tentativo conserva sempre lo stesso UUID anche dopo un errore di rete.
    // Il server non potra' registrare due volte lo stesso versamento.
    if (!idTentativoBonifico.current) idTentativoBonifico.current = crypto.randomUUID();
    setBonificoInCorso(true);
    setErroreBonifico("");
    try {
      const { data, error } = await supabase.rpc("ars_comunione_dichiara_bonifico", {
        p_parrocchia_id: parrocchiaId,
        p_utente_id: utenteId,
        p_identificativo: identificativo,
        p_iscrizione_attivita_id: posizione.iscrizione_id,
        p_importo: importoNumero,
        p_incasso_id: idTentativoBonifico.current,
        p_riferimento: riferimentoBonifico.trim() || null,
      });
      if (error) throw error;
      if (!data?.ok || !data?.ricevuta?.id) throw new Error("La registrazione non ha restituito la ricevuta. Contatta la segreteria prima di riprovare.");
      setEsitoBonifico("Grazie! Il tuo bonifico è stato registrato. La ricevuta è disponibile.");
      onAggiorna?.();
      onNuovaRicevuta?.(posizione, {
        documento_id: data.ricevuta.id,
        numero: data.ricevuta.numero,
        anno: data.ricevuta.anno,
        data: data.ricevuta.data_documento,
        importo: data.ricevuta.importo,
        causale: data.ricevuta.causale,
        nominativo: data.ricevuta.nominativo,
        dati_documento: data.ricevuta.dati_documento,
        metodo: "bonifico",
      });
    } catch (err) {
      setErroreBonifico(err?.message || "Non e' stato possibile registrare il bonifico. Verifica la situazione prima di riprovare.");
    } finally { setBonificoInCorso(false); }
  }

  const nome = posizione.partecipante || "partecipante";
  const causale = `${libera ? "Offerta libera" : "Quota Catechismo"} – ${posizione.attivita || "Prima Comunione"} – ${nome}`;
  const importoNumero = Number(String(importo).replace(",", "."));
  const importoValido = Number.isFinite(importoNumero) && importoNumero > 0 &&
    Math.abs(Math.round(importoNumero * 100) - importoNumero * 100) < 0.0000001 &&
    (libera || importoNumero <= residuo);

  function apri() {
    setAperto(!aperto);
    if (!aperto) {
      setImporto(!libera && residuo > 0 ? residuo.toFixed(2) : "");
      setErroreImporto("");
      setMetodoScelto(null);
      setErroreBonifico("");
      setEsitoBonifico("");
      idTentativoBonifico.current = null;
    }
  }
  function selezionaMetodo(metodo) {
    if (!importoValido) {
      setErroreImporto(!libera && importoNumero > residuo
        ? "L'importo non può superare il residuo." : "Indica prima un importo positivo con massimo due decimali.");
      return;
    }
    setErroreImporto("");
    setMetodoScelto(metodo.id || metodo.tipo);
  }
  function metodoAttivo(metodo) {
    return metodoScelto === (metodo.id || metodo.tipo);
  }
  if (!puoVersare) return null;
  return <section className="ars-com-versamento">
    <button type="button" className="ars-sac-azione ars-com-versamento-azione" aria-expanded={aperto}
      onClick={apri}>{aperto ? "Chiudi modalità di pagamento" : libera ? "Fai un'offerta" : "Effettua un versamento"}</button>
    {aperto && <div className="ars-com-versamento-contenuto">
      <h5>Riepilogo e pagamento</h5>
      <p>{libera ? "Scegli liberamente l'importo che desideri offrire. Non esiste una quota minima obbligatoria."
        : `Puoi versare il saldo di ${euroPagamentiComunione(residuo, posizione.valuta)}, oppure un acconto inferiore.`}</p>
      <label className="ars-com-versamento-importo">Importo da versare (€)
        <input type="number" min="0.01" step="0.01" inputMode="decimal" value={importo}
          onChange={e => { setImporto(e.target.value); setErroreImporto(""); setMetodoScelto(null); setErroreBonifico(""); idTentativoBonifico.current = null; }}
          placeholder={libera ? "Scegli l'importo" : "Importo in euro"} />
      </label>
      {erroreImporto && <p role="alert" className="ars-sac-errore">{erroreImporto}</p>}
      <p className="ars-com-versamento-causale"><strong>Causale da indicare:</strong> {causale}</p>
      <h5>Come desideri pagare?</h5>
      {metodiInCaricamento ? <p role="status">Caricamento delle modalità di pagamento…</p>
        : erroreMetodi ? <p role="alert" className="ars-sac-errore">{erroreMetodi}</p>
        : metodi.length === 0 ? <p>La parrocchia non ha ancora indicato modalità di versamento disponibili. Per informazioni rivolgiti alla segreteria.</p>
        : <div className="ars-com-versamento-metodi">
          {metodi.map((m, idx) => {
            const tipo = m.tipo;
            const titolo = tipo === "bonifico" ? "Bonifico bancario" : "Consegna in parrocchia";
            const attivo = metodoAttivo(m);
            return <div className="ars-com-versamento-metodo" key={m.id || `${tipo}-${idx}`}>
              <button type="button" aria-expanded={attivo} className="ars-com-versamento-scelta"
                onClick={() => selezionaMetodo(m)}>{titolo}</button>
              {attivo && <div className="ars-com-versamento-dettagli">
                <p><strong>Importo:</strong> {euroPagamentiComunione(importoNumero, posizione.valuta)}</p>
                {m.intestatario && <p><strong>Intestatario:</strong> {m.intestatario}</p>}
                {tipo === "bonifico" && <>
                  {m.iban ? <p><strong>IBAN:</strong> <span className="ars-com-versamento-copiabile">{m.iban}</span></p>
                    : <p>Per l'IBAN contatta la segreteria.</p>}
                  {m.bic_swift && <p><strong>BIC/SWIFT:</strong> {m.bic_swift}</p>}
                  <p>Effettua il bonifico tramite la tua banca, indicando la causale riportata sopra. Quando hai terminato, premi il pulsante qui sotto per ricevere subito la ricevuta.</p>
                  <label className="ars-com-versamento-importo">Riferimento bancario (se disponibile)
                    <input type="text" maxLength={500} value={riferimentoBonifico}
                      onChange={e => setRiferimentoBonifico(e.target.value)}
                      placeholder="CRO / TRN (facoltativo)" />
                  </label>
                  <button type="button" className="ars-sac-azione ars-com-versamento-azione"
                    disabled={bonificoInCorso || !!esitoBonifico}
                    onClick={dichiaraBonifico}>
                    {bonificoInCorso ? "Registrazione in corso…" : "Ho effettuato il bonifico — Ricevi la ricevuta"}
                  </button>
                  {erroreBonifico && <p role="alert" className="ars-sac-errore">{erroreBonifico}</p>}
                  {esitoBonifico && <p role="status" className="ars-com-versamento-esito">{esitoBonifico}</p>}
                </>}
                {tipo === "consegna_diretta" && <p>Consegna l'importo alla segreteria, indicando il nome del partecipante. La parrocchia registrerà il versamento.</p>}
                {m.istruzioni && <p className="ars-com-versamento-istruzioni">{m.istruzioni}</p>}
              </div>}
            </div>;
          })}
        </div>}
      <button type="button" className="ars-sac-azione ars-sac-azione-chiara" onClick={onAggiorna}>Aggiorna il riepilogo</button>
    </div>}
  </section>;
}

function QuotePagamentiComunioneFedele({ parrocchiaId, utenteId, nomeParrocchia }) {
  const [posizioni, setPosizioni] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricarica, setRicarica] = useState(0);
  const [anteprima, setAnteprima] = useState(null);
  const [metodi, setMetodi] = useState([]);
  const [erroreMetodi, setErroreMetodi] = useState("");
  const [metodiInCaricamento, setMetodiInCaricamento] = useState(true);

  useEffect(() => {
    let attivo = true;
    setMetodiInCaricamento(true);
    setMetodi([]);
    setErroreMetodi("");
    (async () => {
      try {
        if (!parrocchiaId) throw new Error("Parrocchia non identificata.");
        const { data, error } = await supabase.rpc("ars_elenco_metodi_incasso_pubblici", {
          p_parrocchia_id: parrocchiaId,
        });
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Modalità di pagamento non disponibili.");
        // Non esporre link online precedenti senza conferma automatica dell'incasso.
        if (attivo) setMetodi(data.filter(metodoVersamentoComunioneDisponibile));
      } catch (err) {
        if (attivo) setErroreMetodi("Non è possibile caricare i metodi di pagamento. Contatta la segreteria.");
      } finally { if (attivo) setMetodiInCaricamento(false); }
    })();
    return () => { attivo = false; };
  }, [parrocchiaId]);


  useEffect(() => {
    let attivo = true;
    setCaricamento(true); setErrore(""); setPosizioni([]);
    (async () => {
      try {
        if (!parrocchiaId || !utenteId) throw new Error("Non è possibile identificare la parrocchia o l'utente. Rientra dall'area personale.");
        const { data, error } = await supabase.rpc("ars_mie_iscrizioni_pagamenti", {
          p_parrocchia_id: parrocchiaId,
          p_utente_id: utenteId,
        });
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Riepilogo dei pagamenti non disponibile.");
        // La modalità è valorizzata dalla RPC esclusivamente per le iscrizioni alla Comunione.
        // Evitiamo di visualizzare qui i pagamenti di GREST o di altre attività.
        const comunioni = data.filter(r =>
          r.modalita_contribuzione === "quota_stabilita" || r.modalita_contribuzione === "offerta_libera"
        );
        if (attivo) setPosizioni(comunioni);
      } catch (err) {
        if (attivo) setErrore(err?.message || "Impossibile leggere quote e pagamenti.");
      } finally { if (attivo) setCaricamento(false); }
    })();
    return () => { attivo = false; };
  }, [parrocchiaId, utenteId, ricarica]);

  function apriRicevuta(r, documento) {
    if (!documento?.documento_id) return;
    setAnteprima({
      id: documento.documento_id,
      tipo_documento: "ricevuta",
      numero: documento.numero,
      anno: documento.anno,
      data_documento: documento.data,
      importo: documento.importo,
      causale: documento.causale,
      nominativo: documento.nominativo,
      valuta: r.valuta || "EUR",
      dati_documento: documento.dati_documento && typeof documento.dati_documento === "object"
        ? documento.dati_documento : {},
    });
  }

  return <section className="ars-com-fedele-pagamenti" aria-label="Quote e pagamenti Prima Comunione">
    <details className="ars-com-fedele-pagamenti-guida">
      <summary>? Come utilizzare questa pagina</summary>
      <p>Qui trovi le quote del Catechismo, gli importi versati e le ricevute già emesse dalla parrocchia.</p>
      <p>Se è prevista l’«Offerta libera», puoi scegliere in autonomia l’importo del tuo contributo.</p>
      <p>Per contribuire, premi «Effettua un versamento» (oppure «Fai un’offerta»), indica l'importo e scegli una delle modalità disponibili.</p>
      <p>Se paghi con bonifico, inserisci la causale indicata e registra qui il versamento dopo averlo disposto. Puoi consultare le ricevute con «Apri ricevuta».</p>
    </details>
    {caricamento ? <p role="status">Caricamento dei tuoi pagamenti…</p> : errore ? <>
      <p role="alert" className="ars-sac-errore">{errore}</p>
      <button type="button" className="ars-sac-azione ars-sac-azione-chiara" onClick={() => setRicarica(n => n + 1)}>Riprova</button>
    </> : posizioni.length === 0 ?
      <p>Non risultano ancora posizioni economiche di Prima Comunione associate alla tua area personale.</p>
      : <div className="ars-com-fedele-pagamenti-elenco">{posizioni.map(r => {
        const libera = r.modalita_contribuzione === "offerta_libera";
        const annullata = r.stato_iscrizione === "annullata";
        const ricevute = Array.isArray(r.ricevute) ? r.ricevute : [];
        const quotaIndefinita = !libera && r.quota_dovuta == null;
        return <article className="ars-com-fedele-posizione" key={r.iscrizione_id}>
          <h4>{r.attivita || "Prima Comunione"}</h4>
          <p className="ars-com-fedele-partecipante">Partecipante: <strong>{r.partecipante || "—"}</strong>{annullata ? " · Iscrizione annullata" : ""}</p>
          <p className="ars-com-fedele-modalita">{libera ? "Offerta libera — nessuna quota obbligatoria" : "Quota stabilita dalla parrocchia"}</p>
          <div className="ars-com-fedele-totali">
            <div><span>{libera ? "Contributo richiesto" : "Quota dovuta"}</span><strong>{libera ? "Nessuno" : quotaIndefinita ? "Da definire" : euroPagamentiComunione(r.quota_dovuta,r.valuta)}</strong></div>
            <div><span>{libera ? "Offerte versate" : "Totale versato"}</span><strong>{euroPagamentiComunione(r.totale_versato,r.valuta)}</strong></div>
            <div><span>Residuo</span><strong>{libera ? "Non previsto" : quotaIndefinita ? "—" : euroPagamentiComunione(r.residuo,r.valuta)}</strong></div>
          </div>
          <RiepilogoVersamentoComunione posizione={r} metodi={metodi} erroreMetodi={erroreMetodi}
            metodiInCaricamento={metodiInCaricamento}
            parrocchiaId={parrocchiaId} utenteId={utenteId}
            identificativo={typeof window !== "undefined" ? window.localStorage.getItem("ars_identificativo") : ""}
            onAggiorna={() => setRicarica(n => n + 1)} onNuovaRicevuta={apriRicevuta} />
          <h5>Ricevute</h5>
          {ricevute.length ? <ul className="ars-com-fedele-ricevute">{ricevute.map(d =>
            <li key={d.documento_id || `${d.anno}-${d.numero}`}>
              <span>Ricevuta n. {d.numero}/{d.anno} · {d.data ? new Date(d.data).toLocaleDateString("it-IT") : "data non disponibile"} · {euroPagamentiComunione(d.importo,r.valuta)}</span>
              <button type="button" className="ars-sac-azione ars-sac-azione-chiara" onClick={() => apriRicevuta(r,d)}>Apri ricevuta</button>
            </li>
          )}</ul> : <p>Nessuna ricevuta ancora registrata.</p>}
        </article>;
      })}</div>}
    {anteprima && <AnteprimaDocumentoEconomico documento={anteprima}
      nomeParrocchia={nomeParrocchia} onChiudi={() => setAnteprima(null)} />}
  </section>;
}

// Chat condivisa con il parroco: stessa conversazione e stesse RPC già in uso nella Card 05.
// La ricerca dei gruppi e le autorizzazioni sono determinate da Supabase,
// mai dal browser o dall'identificativo liberamente scelto dal fedele.
function ChatComunioneFedele({ gruppo, onTorna }) {
  const [pagina, setPagina] = useState(null);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const operazione = useRef(false);
  const identificativoInvio = useRef(null);
  const gruppoId = gruppo.gruppo_id;
  const annualeId = gruppo.gruppo_annuale_id;

  async function chiamaChat(nome, parametri = {}) {
    const { data, error } = await supabase.rpc(`ars_comunione_chat_${nome}`, {
      p_gruppo_id: gruppoId, ...parametri,
    });
    if (error) throw error;
    return data;
  }

  async function leggiChat(parametri = {}) {
    const risultato = await chiamaChat("leggi", parametri);
    if (!risultato?.accesso || risultato.accesso.gruppo_annuale_id !== annualeId) {
      throw new Error("Il gruppo di catechismo è cambiato. Torna all'elenco.");
    }
    return risultato;
  }

  useEffect(() => {
    let attivo = true;
    setPagina(null);
    setErrore("");
    leggiChat().then(risultato => { if (attivo) setPagina(risultato); })
      .catch(err => { if (attivo) setErrore(err.message || "Impossibile leggere la chat."); });
    return () => { attivo = false; };
    // Il contenuto è ricaricato passando a un altro gruppo.
  }, [gruppoId, annualeId]);

  async function esegui(azione) {
    if (operazione.current) return;
    operazione.current = true;
    setInCorso(true);
    setErrore("");
    try { await azione(); }
    catch (err) { setErrore(err.message || "Operazione non riuscita. Riprova."); }
    finally { operazione.current = false; setInCorso(false); }
  }

  async function invia() {
    const messaggio = testo.trim();
    if (!messaggio || !pagina?.accesso?.puo_scrivere) return;
    if (!identificativoInvio.current) identificativoInvio.current = crypto.randomUUID();
    await chiamaChat("invia", {
      p_gruppo_annuale_id: annualeId,
      p_invio_id: identificativoInvio.current,
      p_testo: messaggio,
    });
    setTesto("");
    identificativoInvio.current = null;
    setPagina(await leggiChat());
  }

  async function caricaPrecedenti() {
    const primo = pagina?.messaggi?.[0];
    if (!primo) return;
    const precedenti = await leggiChat({ p_prima_del: primo.inviato_il, p_prima_id: primo.id });
    const giaCaricati = new Set((precedenti.messaggi || []).map(m => m.id));
    setPagina({ ...precedenti, messaggi: [
      ...(precedenti.messaggi || []),
      ...(pagina.messaggi || []).filter(m => !giaCaricati.has(m.id)),
    ] });
  }

  return <div className="ars-com-chat-fedele">
    <button type="button" className="ars-sac-azione ars-sac-azione-chiara" onClick={onTorna}>
      ← Torna ai miei gruppi
    </button>
    <h4>Chat · {gruppo.nome}</h4>
    <p>{gruppo.anno_percorso}° anno · {gruppo.anno_pastorale}</p>
    <details className="ars-com-chat-guida">
      <summary>Come utilizzare questa pagina</summary>
      <p>Qui puoi leggere i messaggi condivisi dal parroco, dai catechisti e dagli altri partecipanti autorizzati. Premi «Aggiorna messaggi» per vedere le novità.</p>
      <p>Quando la chat è aperta e il tuo profilo è abilitato, scrivi nel riquadro e premi «Invia». Le risposte saranno visibili nella stessa conversazione.</p>
    </details>
    {errore && <p role="alert" className="ars-sac-errore">{errore}</p>}
    <button type="button" className="ars-sac-azione ars-sac-azione-chiara" disabled={inCorso}
      onClick={() => esegui(async () => setPagina(await leggiChat()))}>
      Aggiorna messaggi
    </button>
    {!pagina && !errore && <p role="status">Caricamento dei messaggi…</p>}
    {pagina && <>
      {pagina.accesso.chat_chiusa && <p className="ars-com-chat-avviso">La chat è temporaneamente chiusa: i messaggi restano leggibili.</p>}
      {pagina.altri_precedenti && <button type="button" className="ars-sac-azione ars-sac-azione-chiara"
        disabled={inCorso} onClick={() => esegui(caricaPrecedenti)}>Carica messaggi precedenti</button>}
      {!(pagina.messaggi || []).length && <p>Nessun messaggio pubblicato in questo gruppo.</p>}
      <div className="ars-com-chat-messaggi" aria-label="Messaggi del gruppo">
        {(pagina.messaggi || []).map(m => <article className="ars-com-chat-messaggio" key={m.id}>
          <small>{m.mio ? "Tu" : "Partecipante"} · {new Date(m.inviato_il).toLocaleString("it-IT")}</small>
          <p>{m.rimosso ? "Messaggio rimosso" : m.testo}</p>
        </article>)}
      </div>
      {pagina.accesso.puo_scrivere && !pagina.accesso.chat_chiusa && <form onSubmit={e => {
        e.preventDefault(); esegui(invia);
      }}>
        <label className="ars-sac-campo" htmlFor="ars-messaggio-chat-fedele">Scrivi un messaggio
          <textarea id="ars-messaggio-chat-fedele" rows={3} disabled={inCorso}
            value={testo} onChange={e => { identificativoInvio.current = null; setTesto(e.target.value); }} />
        </label>
        <button type="submit" className="ars-sac-azione" disabled={inCorso || !testo.trim()}>Invia</button>
      </form>}
      {!pagina.accesso.puo_scrivere && !pagina.accesso.chat_chiusa &&
        <p className="ars-com-chat-avviso">Per questo profilo è disponibile la lettura dei messaggi.</p>}
    </>}
  </div>;
}

function IlMioGruppoComunione({ parrocchiaId }) {
  const [gruppi, setGruppi] = useState([]);
  const [apertoId, setApertoId] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricarica, setRicarica] = useState(0);

  useEffect(() => {
    let attivo = true;
    setGruppi([]);
    setCaricamento(true);
    setErrore("");
    if (!parrocchiaId) {
      setCaricamento(false);
      setErrore("Parrocchia non selezionata.");
      return () => { attivo = false; };
    }
    (async () => {
      try {
        const { data, error } = await supabase.rpc("ars_comunione_chat_miei_gruppi", {
          p_parrocchia_id: parrocchiaId,
        });
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Elenco dei gruppi non disponibile.");
        if (attivo) {
          setGruppi(data);
          setApertoId(corrente => data.some(g => g.gruppo_annuale_id === corrente) ? corrente : null);
        }
      } catch (err) {
        if (attivo) setErrore(err.message || "Impossibile caricare i gruppi.");
      } finally { if (attivo) setCaricamento(false); }
    })();
    return () => { attivo = false; };
  }, [parrocchiaId, ricarica]);

  const aperto = gruppi.find(g => g.gruppo_annuale_id === apertoId);
  if (aperto) return <ChatComunioneFedele key={aperto.gruppo_annuale_id}
    gruppo={aperto} onTorna={() => setApertoId(null)} />;

  return <section className="ars-com-miei-gruppi">
    <p>Qui trovi i gruppi di catechismo collegati al tuo profilo e le relative conversazioni.</p>
    <details className="ars-com-chat-guida">
      <summary>Come utilizzare questa pagina</summary>
      <p>Quando la parrocchia assegna un ragazzo a un gruppo, la chat comparirà qui per i profili autorizzati. Se hai più figli iscritti, puoi trovare più gruppi.</p>
      <p>Premi «Apri chat» per leggere e, dove consentito, inviare messaggi.</p>
    </details>
    <button type="button" className="ars-sac-azione ars-sac-azione-chiara"
      disabled={caricamento} onClick={() => setRicarica(n => n + 1)}>Aggiorna i miei gruppi</button>
    {caricamento && <p role="status">Caricamento gruppi…</p>}
    {errore && <p className="ars-sac-errore" role="alert">{errore}</p>}
    {!caricamento && !errore && !gruppi.length &&
      <p>Non risultano ancora gruppi associati al tuo profilo. Se l'iscrizione è già completa, la parrocchia potrebbe non aver ancora assegnato il gruppo.</p>}
    {gruppi.map(g => <article className="ars-com-chat-gruppo" key={g.gruppo_annuale_id}>
      <h4>{g.nome}</h4>
      <p>{g.anno_percorso}° anno · {g.anno_pastorale}</p>
      <p><strong>Catechisti:</strong> {Array.isArray(g.catechisti) && g.catechisti.length
        ? g.catechisti.join(", ") : "Non ancora assegnati"}</p>
      <button type="button" className="ars-sac-azione" onClick={() => setApertoId(g.gruppo_annuale_id)}>Apri chat</button>
    </article>)}
  </section>;
}

function DettaglioSottocard({ sezione, parrocchiaId, utenteId, nomeParrocchia, onApriQuote }) {
  switch (sezione) {
    case "iscrizioni":
      return <ModuloComunione parrocchiaId={parrocchiaId} utenteId={utenteId} nomeParrocchia={nomeParrocchia} onApriQuote={onApriQuote} />;
    case "gruppo":
      return <IlMioGruppoComunione parrocchiaId={parrocchiaId} />;
    case "calendario":
      return <><p>Un calendario dedicato <strong>esclusivamente al Catechismo</strong>: incontri, scadenze, riunioni con i genitori, ritiri e prove.</p><p>Gli appuntamenti saranno gestiti dal parroco e dai catechisti autorizzati. Genitori e ragazzi vedranno quelli del proprio gruppo.</p><p>Questo calendario è separato dal Calendario generale del fedele, che resta invariato.</p><p className="ars-sac-prossimamente">Gli appuntamenti saranno visualizzati qui non appena disponibili.</p></>;
    case "comunicazioni":
      return <><p>Avvisi e informazioni del Catechismo per le famiglie e i ragazzi del gruppo, pubblicati dai responsabili autorizzati.</p><p className="ars-sac-prossimamente">Le comunicazioni saranno visualizzate qui non appena disponibili.</p></>;
    case "pagamenti":
      return <QuotePagamentiComunioneFedele parrocchiaId={parrocchiaId} utenteId={utenteId} nomeParrocchia={nomeParrocchia} />;
    case "celebrazioni":
      return <><p>Informazioni sulla preparazione alla Prima Comunione, le celebrazioni e gli appuntamenti collegati.</p><p className="ars-sac-prossimamente">Le informazioni saranno pubblicate dalla parrocchia.</p></>;
    default: return null;
  }
}

export default function SacramentiFedele({ tornaDashboard, utenteId = null, parrocchiaId = null, nomeParrocchia = "" }) {
  const [scelto, setScelto] = useState(null);
  const [sottocardScelta, setSottocardScelta] = useState(null);
  const parrocchiaAttuale = parrocchiaId || (typeof window !== "undefined" ? localStorage.getItem("ars_parrocchia_id") : null);
  const utenteAttuale = utenteId || (typeof window !== "undefined" ? localStorage.getItem("ars_utente_id") : null);
  const nomeAttuale = nomeParrocchia || (typeof window !== "undefined" ? localStorage.getItem("ars_nome_parrocchia") : "") || "La tua Parrocchia";
  const sacramento = sacramenti.find(s => s.id === scelto);
  const sottocard = sottocardComunione.find(s => s.id === sottocardScelta);
  const tornaIndietro = () => {
    if (sottocardScelta) { setSottocardScelta(null); return; }
    if (sacramento) { setScelto(null); return; }
    tornaDashboard?.();
  };

  return (
    <main className="ars-sacramenti-fedele" style={{ boxSizing: "border-box", width: "100%", minHeight: "100vh", backgroundColor: "#f7f3ed", color: "#243c40", isolation: "isolate" }}>
      <style>{STILE}</style>
      <button type="button" className="ars-sac-indietro" onClick={tornaIndietro}>
        ← {sottocardScelta ? "Prima Comunione" : sacramento ? "Tutti i Sacramenti" : "Torna alla dashboard"}
      </button>
      <header className="ars-sac-header">
        <h2>{sottocard ? sottocard.nome : sacramento ? sacramento.nome : "Sacramenti"}</h2>
        <p>{sottocard ? sottocard.descrizione : sacramento ? sacramento.descrizione : "Battesimo, Prima Comunione, Cresima e Matrimonio"}</p>
      </header>
      {!sacramento ? (
        <div className="ars-sac-griglia">
          {sacramenti.map(s => <button type="button" className="ars-sac-card" key={s.id}
            onClick={() => { setScelto(s.id); setSottocardScelta(null); }} aria-label={`${s.nome} — ${s.descrizione}`}>
            <span className="ars-sac-simbolo" aria-hidden="true"><Simbolo tipo={s.id} /></span>
            <strong>{s.nome}</strong>
            <span className="ars-sac-descrizione">{s.descrizione}</span>
          </button>)}
        </div>
      ) : sacramento.id === "comunione" && !sottocard ? (
        <section aria-label="Funzioni Prima Comunione">
          <div className="ars-sac-griglia ars-sac-griglia-sottocard">
            {sottocardComunione.map(s => <button type="button" className="ars-sac-card ars-sac-card-sezione" key={s.id}
              onClick={() => setSottocardScelta(s.id)}>
              <span className="ars-sac-mini-simbolo" aria-hidden="true">{s.simbolo}</span>
              <strong>{s.nome}</strong><span className="ars-sac-descrizione">{s.descrizione}</span>
            </button>)}
          </div>
        </section>
      ) : sacramento.id === "comunione" && sottocard ? (
        <section className="ars-sac-pannello" aria-label={sottocard.nome}>
          <h3>{sottocard.nome}</h3>
          <DettaglioSottocard sezione={sottocard.id} parrocchiaId={parrocchiaAttuale}
            utenteId={utenteAttuale} nomeParrocchia={nomeAttuale}
            onApriQuote={() => setSottocardScelta("pagamenti")} />
        </section>
      ) : (
        <section className="ars-sac-dettaglio">
          <span className="ars-sac-simbolo ars-sac-simbolo-grande" aria-hidden="true"><Simbolo tipo={sacramento.id} /></span>
          <h3>{sacramento.nome}</h3>
          <p>Le informazioni su questo Sacramento saranno disponibili prossimamente.</p>
        </section>
      )}
    </main>
  );
}
const STILE = `
/* Gruppi e chat di Prima Comunione: lato fedele */
.ars-com-miei-gruppi,.ars-com-chat-fedele{margin:10px 0;color:#243c40}
.ars-com-chat-guida{margin:15px 0 17px;text-align:left;border:1px solid #decda9;border-radius:10px;padding:12px 15px;background:#fbf7ee}
.ars-com-chat-guida summary{font-weight:700;cursor:pointer;color:#173955}
.ars-com-chat-guida p{margin-top:12px!important}
.ars-com-chat-gruppo,.ars-com-chat-messaggio{margin:14px 0;padding:16px;border:1px solid #dfcba6;border-radius:12px;background:#fffaf1}
.ars-com-chat-gruppo h4,.ars-com-chat-fedele h4{font:700 1.18rem Georgia,serif;color:#173955;margin:8px 0}
.ars-com-chat-fedele .ars-sac-azione,.ars-com-miei-gruppi .ars-sac-azione{margin:5px 5px 10px 0}
.ars-com-chat-messaggi{margin:15px 0}
.ars-com-chat-messaggio small{display:block;font-size:.88rem;color:#536568}
.ars-com-chat-messaggio p{white-space:pre-wrap;overflow-wrap:anywhere;margin:7px 0 0!important}
.ars-com-chat-fedele textarea{min-height:100px}
.ars-com-chat-avviso{padding:12px 14px;background:#fbf3de;border:1px solid #e5d3aa;border-radius:9px;color:#694e1f!important}

.ars-com-fedele-pagamenti{margin:12px 0;color:#243c40}
.ars-com-versamento{border-top:1px solid #e5ddd1;margin:18px 0 15px;padding-top:15px}
.ars-com-versamento-azione{background:#ae812c!important;color:#fff!important;border:1px solid #ae812c!important;border-radius:9px;padding:11px 17px;font-weight:700;cursor:pointer}
.ars-com-versamento-contenuto{margin-top:14px;padding:16px;background:#faf6ed;border:1px solid #dfcfac;border-radius:12px}
.ars-com-versamento-contenuto h5{margin:6px 0 10px}
.ars-com-versamento-contenuto p{line-height:1.5}
.ars-com-versamento-importo{display:flex;flex-direction:column;gap:7px;font-weight:700;max-width:350px;margin:12px 0}
.ars-com-versamento-importo input{padding:11px;border-radius:7px;border:1px solid #cdbda9;background:#fff;color:#173955;font:inherit}
.ars-com-versamento-causale{padding:11px;border-radius:8px;background:#fff;border:1px solid #e1d7c7;overflow-wrap:anywhere}
.ars-com-versamento-metodi{display:grid;gap:9px;margin:13px 0}
.ars-com-versamento-metodo{background:#fff;border:1px solid #e0d5c3;border-radius:9px;overflow:hidden}
.ars-com-versamento-scelta{display:block;width:100%;text-align:left;padding:13px 15px;border:0;background:transparent;cursor:pointer;font:700 1rem Georgia,serif;color:#173955}
.ars-com-versamento-scelta[aria-expanded=true]{background:#f6ead4}
.ars-com-versamento-dettagli{padding:5px 15px 14px;overflow-wrap:anywhere}
.ars-com-versamento-dettagli p{margin:9px 0}
.ars-com-versamento-copiabile{user-select:all;font-weight:700}
.ars-com-versamento-nota{font-size:.88rem;color:#526269;line-height:1.45}
.ars-com-versamento-esito{padding:12px 14px;background:#e7f4eb;border:1px solid #88b79a;border-radius:8px;color:#244d34;font-weight:700}
.ars-com-versamento-azione:disabled{opacity:.7;cursor:wait}
.ars-com-versamento-istruzioni{white-space:pre-wrap}

.ars-com-fedele-pagamenti-guida{margin:10px 0 18px;padding:12px 14px;background:#f7f5ec;border:1px solid #dfcfac;border-radius:10px}
.ars-com-fedele-pagamenti-guida summary{font-weight:700;color:#173955;cursor:pointer}
.ars-com-fedele-pagamenti-guida p{margin:9px 0 0;font-size:.93rem;line-height:1.48}
.ars-com-fedele-pagamenti-elenco{display:grid;gap:15px}
.ars-com-fedele-posizione{padding:18px;background:#fffdfa;border:1px solid #decdae;border-radius:12px}
.ars-com-fedele-posizione h4{font:700 1.17rem Georgia,serif;margin:0 0 10px;color:#173955}
.ars-com-fedele-posizione h5{font:700 1rem Georgia,serif;color:#173955;margin:17px 0 8px}
.ars-com-fedele-partecipante,.ars-com-fedele-modalita{margin:0 0 9px!important}
.ars-com-fedele-modalita{font-weight:600;color:#173955!important}
.ars-com-fedele-totali{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}
.ars-com-fedele-totali>div{padding:11px 10px;border:1px solid #dcd6c8;background:#f5f6f7;border-radius:8px;min-width:0}
.ars-com-fedele-totali span{display:block;font-size:.84rem;color:#485e66;margin-bottom:7px}
.ars-com-fedele-totali strong{font-size:1.05rem;color:#173955;overflow-wrap:anywhere}
.ars-com-fedele-ricevute{list-style:none;margin:6px 0;padding:0}
.ars-com-fedele-ricevute li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid #e5ddd1;flex-wrap:wrap}
.ars-com-fedele-ricevute li span{overflow-wrap:anywhere;font-size:.94rem}
@media(max-width:650px){.ars-com-fedele-totali{grid-template-columns:1fr}.ars-com-fedele-posizione{padding:13px}}
.ars-sacramenti-fedele{box-sizing:border-box;width:100%;min-height:100vh;max-width:none;margin:0;padding:32px max(18px,calc((100% - 960px)/2));background:#f7f3ed;color:#243c40}
.ars-sacramenti-fedele *{box-sizing:border-box}
.ars-sac-header{text-align:center;margin:14px 0 25px}
.ars-sac-header h2{font-family:Georgia,serif;font-size:2rem;color:#243c40;margin:0 0 8px}
.ars-sac-header p{color:#5f6d70;margin:0}
.ars-sac-indietro{border:1px solid #d8c9a8;background:#fffdf8;color:#594c36;border-radius:9px;padding:10px 15px;cursor:pointer}
.ars-sac-griglia{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:680px;margin:0 auto}
.ars-sac-card{min-width:0;min-height:205px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:19px 12px;border:1px solid #ddc99f;border-top:3px solid #c69a45;border-radius:15px;background:linear-gradient(155deg,#fffefa 0%,#fff8ea 100%);color:#243c40;cursor:pointer;box-shadow:0 4px 13px #4b39151c;transition:transform .15s ease,box-shadow .15s ease}
.ars-sac-card:hover{transform:translateY(-2px);box-shadow:0 7px 20px #4b39152b}
.ars-sac-card strong{font:700 1.28rem Georgia,serif;text-align:center}
.ars-sac-descrizione{font-size:.9rem;color:#687477;text-align:center;line-height:1.4}
.ars-sac-simbolo{display:flex;align-items:center;justify-content:center;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,#fffdf7 35%,#f7ecd5 100%);border:1px solid #ead7ad;color:#b98a31}
.ars-sac-simbolo svg{width:72px;height:72px}
.ars-sac-dettaglio{max-width:560px;margin:0 auto;text-align:center;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px;padding:30px 20px}
.ars-sac-simbolo-grande{width:110px;height:110px;margin:0 auto 16px}
.ars-sac-simbolo-grande svg{width:90px;height:90px}
.ars-sac-dettaglio h3{font:700 1.5rem Georgia,serif;margin:0 0 12px}
.ars-sac-dettaglio p{color:#5f6d70;margin:0}
.ars-sac-griglia-sottocard{max-width:760px;grid-template-columns:repeat(2,minmax(0,1fr))}
.ars-sac-card-sezione{min-height:170px;padding:20px 12px}
.ars-sac-mini-simbolo{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;font:700 1.7rem Georgia,serif;color:#b98a31;border:1px solid #ead7ad;background:#fff8e8}
.ars-sac-card-sezione strong{font-size:1.16rem}
.ars-sac-pannello{max-width:760px;margin:0 auto;padding:27px;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px;box-shadow:0 4px 13px #4b39110d}
.ars-sac-pannello h3{font:700 1.45rem Georgia,serif;color:#243c40;margin:0 0 15px}
.ars-sac-pannello p{color:#43585b;line-height:1.65;margin:0 0 14px}
.ars-sac-nota{padding:18px;background:#fbf5e9;border:1px solid #ead7ad;border-radius:12px;margin:18px 0}
.ars-sac-nota h4{font:700 1.14rem Georgia,serif;color:#72561e;margin:0 0 11px}
.ars-sac-nota h4:not(:first-child){margin-top:18px}
.ars-sac-consenso-preview{margin:18px 0;padding:16px;border:1px solid #dfcfac;border-radius:11px;background:#fffefa}
.ars-sac-consenso-preview label{display:flex;align-items:flex-start;gap:11px;line-height:1.55;color:#243c40}
.ars-sac-consenso-preview input{margin-top:5px;accent-color:#b98a31;flex:0 0 auto}
.ars-sac-consenso-preview small{display:block;color:#687477;margin:12px 0 0;line-height:1.5}
.ars-sac-pannello .ars-sac-prossimamente{padding:13px 15px;background:#f4f0e8;border-radius:9px;color:#647072;font-size:.94rem;margin-top:18px}
.ars-sac-card:focus-visible,.ars-sac-indietro:focus-visible{outline:3px solid #c58928;outline-offset:3px}
@media(max-width:650px){.ars-sacramenti-fedele{padding:12px}.ars-sac-griglia{gap:12px}.ars-sac-card{min-height:185px;padding:15px 8px}.ars-sac-card strong{font-size:1.08rem}.ars-sac-descrizione{font-size:.83rem}.ars-sac-header h2{font-size:1.65rem}.ars-sac-simbolo{width:78px;height:78px}.ars-sac-simbolo svg{width:65px;height:65px}.ars-sac-card-sezione{min-height:160px}.ars-sac-card-sezione strong{font-size:1rem}.ars-sac-pannello{padding:18px}}
@media(max-width:380px){.ars-sac-griglia{grid-template-columns:1fr}.ars-sac-card{min-height:165px}.ars-sac-card-sezione{min-height:145px}}

.ars-sac-azioni{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0}
.ars-sac-azione{padding:11px 17px;border-radius:9px;background:#a67a29;color:white;border:1px solid #a67a29;font:700 .95rem Georgia,serif;cursor:pointer}
.ars-sac-azione:disabled{opacity:.55;cursor:not-allowed}
.ars-sac-azione-chiara{background:#fffdf8;color:#75541e}
.ars-sac-azione-chiara:hover{background:#f8efd9}
.ars-sac-iscrizioni fieldset{min-width:0;margin:20px 0;border:1px solid #e2d2b3;border-radius:12px;padding:17px}
.ars-sac-iscrizioni legend{font:700 1.1rem Georgia,serif;color:#79551f;padding:0 7px}
.ars-sac-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}
.ars-sac-campo{display:flex;flex-direction:column;gap:7px;margin:10px 0;font-size:.95rem;font-weight:600}
.ars-sac-campo input,.ars-sac-campo select,.ars-sac-campo textarea{font:inherit;background:white;color:#243c40;border:1px solid #d8c9a8;border-radius:8px;padding:11px;min-height:43px;width:100%;box-sizing:border-box}
.ars-sac-spunta{display:flex;align-items:flex-start;gap:11px;line-height:1.5;margin:14px 0;color:#243c40}
.ars-sac-spunta input{accent-color:#b98a31;flex:0 0 auto;margin-top:5px}
.ars-sac-scelta-account,.ars-sac-risultati{background:#fffaf0;border:1px solid #e2d2b3;border-radius:12px;padding:14px;margin:12px 0}
.ars-sac-risultati{background:#fff}
.ars-sac-avvertenza,.ars-sac-info-date{background:#fbf5e9;padding:12px;border-radius:8px;color:#755c34;font-size:.92rem}
.ars-sac-testo-informativa{white-space:pre-wrap;overflow-wrap:anywhere;max-height:370px;overflow:auto;border:1px solid #dec9a2;background:white;padding:20px;border-radius:10px;line-height:1.65;margin:15px 0}
.ars-sac-errore{color:#9b2929!important;font-weight:600;overflow-wrap:anywhere}
.ars-sac-successo{color:#225a45!important;background:#f0f7f0;padding:13px;border-radius:9px;overflow-wrap:anywhere}
.ars-sac-documenti-stampa{display:none}
.ars-sac-scheda-sanitaria-stampa{display:none}
.ars-sac-sanitaria-avviso{border:1px solid #e2d2b3;background:#fbf5e9;border-radius:10px;padding:16px;margin:12px 0;color:#243c40}
.ars-sac-sanitaria-avviso p{margin:0 0 12px}
.ars-sac-sanitaria-avviso .ars-sac-sanitaria-nota{font-size:.9rem;color:#6b5d43;margin:12px 0 0}
@media(max-width:650px){.ars-sac-form-grid{grid-template-columns:1fr}.ars-sac-iscrizioni fieldset{padding:12px}}
@media print {
  @page{size:A4;margin:14mm}
  body *{visibility:hidden!important}
  .ars-sac-documenti-stampa,.ars-sac-documenti-stampa *{visibility:visible!important}
  .ars-sac-documenti-stampa{display:block!important;position:absolute!important;left:0;top:0;width:100%!important;margin:0!important;padding:0!important;background:white!important;color:#111!important;font:12pt/1.5 Georgia,serif!important}
  .ars-sac-pagina-stampa{display:block;break-after:page;page-break-after:always;white-space:normal;overflow-wrap:anywhere}
  .ars-sac-pagina-stampa:last-child{break-after:auto;page-break-after:auto}
  .ars-sac-pagina-stampa h2{text-align:center;font-size:18pt;margin:0 0 10px}
  .ars-sac-pagina-stampa h3{text-align:center;font-size:15pt}
  .ars-sac-righe-stampa{display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;font:10pt/1.4 Arial,sans-serif;margin:20px 0}
  .ars-sac-righe-stampa div{border-bottom:1px solid #ccc;padding:3px;break-inside:avoid}
  .ars-sac-firme-stampa{margin-top:20px;font-size:11pt}
  .ars-sac-stampa-privacy-testo{white-space:pre-wrap!important;overflow-wrap:anywhere;font:10.5pt/1.55 Georgia,serif!important}
  .ars-sac-privacy-stampa{font-size:11pt}
  /* Nella stampa ordinaria la scheda sanitaria non compare. */
  body:not(.ars-sac-stampa-sanitaria) .ars-sac-scheda-sanitaria-stampa{display:none!important}
  /* La scheda sanitaria si stampa da sola, senza domanda e informativa. */
  body.ars-sac-stampa-sanitaria .ars-sac-documenti-stampa,
  body.ars-sac-stampa-sanitaria .ars-sac-documenti-stampa *{display:none!important;visibility:hidden!important}
  body.ars-sac-stampa-sanitaria .ars-sac-scheda-sanitaria-stampa,
  body.ars-sac-stampa-sanitaria .ars-sac-scheda-sanitaria-stampa *{visibility:visible!important}
  body.ars-sac-stampa-sanitaria .ars-sac-scheda-sanitaria-stampa{display:block!important;position:absolute!important;left:0!important;top:0!important;width:100%!important;box-sizing:border-box!important;padding:0!important;background:#fff!important;color:#111!important;font:10pt/1.35 Arial,sans-serif!important}
  .ars-sac-sanitaria-intestazione{text-align:center;border-bottom:1px solid #888;padding-bottom:9px;margin-bottom:10px}
  .ars-sac-sanitaria-intestazione .ars-sac-sanitaria-parrocchia{font:700 14pt Georgia,serif!important;margin:0 0 7px!important;color:#111!important}
  .ars-sac-sanitaria-intestazione h2{font:700 17pt Georgia,serif!important;margin:0 0 5px!important;color:#111!important}
  .ars-sac-sanitaria-intestazione p{margin:0!important;color:#111!important}
  .ars-sac-sanitaria-istruzioni{font:10pt/1.35 Arial,sans-serif!important;margin:10px 0!important;color:#111!important}
  .ars-sac-sanitaria-dati{margin:12px 0!important;border:1px solid #bbb;padding:8px 10px}
  .ars-sac-sanitaria-dati p{margin:3px 0!important;color:#111!important}
  .ars-sac-sanitaria-dati span{margin-left:25px}
  .ars-sac-sanitaria-righe{margin:10px 0 13px!important;break-inside:avoid}
  .ars-sac-sanitaria-righe h3{font:700 10pt Arial,sans-serif!important;text-align:left!important;margin:0 0 4px!important;color:#111!important}
  .ars-sac-sanitaria-riga{border-bottom:1px solid #aaa;height:18px}
  .ars-sac-sanitaria-firma{border-top:1px solid #aaa;margin-top:15px;padding-top:10px;break-inside:avoid}
  .ars-sac-sanitaria-firma p{margin:5px 0!important;font:9pt/1.3 Arial,sans-serif!important;color:#111!important}
  .ars-sac-sanitaria-piede{margin-top:10px!important;font:italic 8pt Arial,sans-serif!important;color:#555!important;text-align:center}
}

.ars-com-genitore-stato{margin:22px 0;padding:20px;border:1px solid #cbb88b;border-radius:14px;background:#fffefa;max-width:900px}
.ars-com-genitore-stato h4{font:700 1.24rem Georgia,serif;margin:0 0 10px;color:#243c40}
.ars-com-genitore-pratica{margin:14px 0;padding:17px;border:1px solid #e4d3af;border-radius:10px;background:#fff}
.ars-com-genitore-pratica h5{font:700 1.02rem Georgia,serif;margin:0 0 8px}
.ars-com-genitore-mancanti{padding:12px;background:#fff4f2;border-left:4px solid #b73535;color:#812b2b}
.ars-com-genitore-mancanti ul{margin:7px 0 0;padding-left:22px}
.ars-com-genitore-pratica{font-size:1rem;line-height:1.5}
.ars-com-genitore-dettaglio dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 14px;margin:12px 0}
.ars-com-genitore-dettaglio dl>div{min-width:0;padding:11px 12px;border:1px solid #e9ddc7;border-radius:9px;background:#fffdf7}
.ars-com-genitore-dettaglio dt{font-size:.78rem!important;line-height:1.4;font-weight:600;color:#66756d;margin:0 0 4px}
.ars-com-genitore-dettaglio dd{font-size:.97rem!important;line-height:1.45;color:#253c42;font-weight:500;margin:0;overflow-wrap:anywhere}
.ars-com-battesimo-domanda{margin-top:15px;padding:15px;background:#fffaf0;border:1px solid #e7d8b5;border-radius:10px}
.ars-com-battesimo-domanda p{margin:9px 0 0;color:#314d48;font-size:.93rem;line-height:1.5}
.ars-com-genitore-solleciti{padding:12px;margin-top:13px;background:#fff5e3;border:1px solid #e7d0a0}
.ars-com-genitore-solleciti div{margin-top:8px;border-top:1px solid #e0d0bb;padding-top:8px}
.ars-com-genitore-solleciti p{margin:4px 0}
.ars-com-genitore-collega{display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin-top:14px}
.ars-com-genitore-collega label{display:flex;flex:1 1 280px;flex-direction:column;gap:7px}
.ars-com-genitore-collega input{padding:10px;border:1px solid #d5c8ac;border-radius:8px;width:100%;max-width:430px}

.ars-com-genitore-codici{margin-top:12px;font-size:.85rem}
.ars-com-genitore-codici div{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:5px 0}
.ars-com-genitore-codici code{word-break:break-all}
.ars-com-genitore-codici button{cursor:pointer;border:1px solid #cdb984;border-radius:7px;padding:5px 8px;background:#fff}
`;