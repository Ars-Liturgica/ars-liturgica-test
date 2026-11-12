import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import FirmaSemplice from "../../componenti/FirmaSemplice";

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
  { tipo: "domanda_firmata", nome: "Domanda di iscrizione firmata" },
  { tipo: "informativa_firmata", nome: "Informativa privacy firmata" },
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
  const [nominativo, setNominativo] = useState([dati.genitore1Nome,dati.genitore1Cognome].filter(Boolean).join(" "));
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
      modalita="app" nominativo={nominativo} onNominativoChange={setNominativo}
      conferma={conferma} onConfermaChange={setConferma} disabilitato={salvataggio} />
    <button type="button" className="ars-sac-azione" onClick={confermaDomanda}
      disabled={!conferma || !nominativo.trim() || salvataggio}>
      {salvataggio ? "Conferma in corso…" : "Registra la conferma della domanda"}
    </button>
    {messaggio && <p role="status">{messaggio}</p>}
  </div>;
}

function CompletaFotoComunione({ pratica, parrocchiaId, utenteId, onCaricata, modalitaFirme }) {
  const [inCorso, setInCorso] = useState("");
  const [messaggio, setMessaggio] = useState("");
  async function scegliFoto(tipo, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInCorso(tipo); setMessaggio("");
    try {
      await caricaFotoComunione({parrocchiaId,utenteId,iscrizioneId:pratica.id,tipo,file});
      setMessaggio("Foto caricata correttamente. La parrocchia la verificherà.");
      onCaricata?.();
    } catch (err) { setMessaggio(err.message || "Impossibile caricare la foto."); }
    finally { setInCorso(""); e.target.value = ""; }
  }
  return <div className="ars-com-genitore-foto">
    <h6>Completa i documenti</h6>
    {["app","entrambe"].includes(modalitaFirme) &&
      !documentoConfermato(pratica,"domanda_firmata") &&
      <ConfermaFirmaDomandaEsistente pratica={pratica} parrocchiaId={parrocchiaId}
        utenteId={utenteId} onConfermata={onCaricata} />}
    {["app","entrambe"].includes(modalitaFirme) &&
      !documentoConfermato(pratica,"domanda_firmata") && <p>In alternativa puoi scegliere la firma cartacea.</p>}
    <p>Scatta una foto leggibile del documento firmato o scegline una dalla galleria.
      In alternativa, puoi consegnare il documento direttamente in parrocchia.</p>
    {DOCUMENTI_PERSONALI_COMUNIONE.filter(doc => !documentoConfermato(pratica,doc.tipo)).map(doc =>
      <label className="ars-com-genitore-file" key={doc.tipo}>
        <strong>{doc.nome}</strong>
        <span>Fotografa e carica</span>
        <input type="file" accept="image/*"
          disabled={Boolean(inCorso)} onChange={e => scegliFoto(doc.tipo,e)} />
        {inCorso === doc.tipo && <small>Caricamento della fotografia…</small>}
      </label>)}
    {messaggio && <p role="status">{messaggio}</p>}
  </div>;
}

function StatoDomandeComunioneGenitore({ parrocchiaId, utenteId, nuovaIscrizioneId }) {
  const [domande, setDomande] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [apertaId, setApertaId] = useState(null);
  const [completaId, setCompletaId] = useState(null);
  const [revisione, setRevisione] = useState(0);
  const [modalitaFirme, setModalitaFirme] = useState("cartacea");
  useEffect(() => {
    let attivo=true;
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error}=await supabase.rpc("ars_firme_leggi_modalita",{
        p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",
      });
      if(attivo && !error && data?.modalita) setModalitaFirme(data.modalita);
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
    <p>Le domande già inviate restano qui. Puoi consultarle in qualsiasi momento e completare i documenti mancanti.</p>
    {caricamento && <p role="status">Caricamento delle tue domande…</p>}
    {errore && <p className="ars-sac-errore" role="alert">{errore}</p>}
    {!caricamento && !errore && domande.length === 0 && <p>Non hai ancora inviato domande di Prima Comunione.</p>}
    {domande.map(pratica => {
      const d = pratica.dati_modulo || {};
      const documentiMancanti = DOCUMENTI_PERSONALI_COMUNIONE.filter(x => !documentoConfermato(pratica,x.tipo));
      const datiMancanti = CAMPI_OBBLIGATORI_GENITORE.filter(([k]) => !String(d[k] || "").trim()).map(([,nome]) => nome);
      if (!d.genitore1Telefono && !d.genitore1Email) datiMancanti.push("Telefono o email del genitore");
      const completa = datiMancanti.length===0 && documentiMancanti.length===0;
      return <article className="ars-com-genitore-pratica" key={pratica.id}>
        <div className="ars-com-genitore-riepilogo">
          <strong>{d.nome || "Bambino"} {d.cognome || ""}</strong>
          <small>{pratica.anno_percorso}° anno · {pratica.anno_pastorale} · Domanda del {pratica.presentata_il ? new Date(pratica.presentata_il).toLocaleDateString("it-IT") : "—"}</small>
          <small>Genitore: {d.genitore1Nome || ""} {d.genitore1Cognome || ""}</small>
          {completa ? <p className="ars-sac-successo">Documentazione completa — domanda conservata nell'archivio.</p> :
            <div className="ars-com-genitore-mancanti" role="status">
              <strong>Documentazione incompleta</strong>
              {datiMancanti.length>0 && <p>Dati ancora da completare in parrocchia: {datiMancanti.join(", ")}.</p>}
              {documentiMancanti.length > 0 && <><p>Documenti non ancora ricevuti:</p>
                <ul>{documentiMancanti.map(doc => <li key={doc.tipo}>
                  {doc.nome}: <strong>{fotoPresente(pratica,doc.tipo) ? "foto caricata, in attesa di verifica" : "da consegnare"}</strong>
                </li>)}</ul></>}
              <p>Se manca un documento, caricane una fotografia oppure consegnalo direttamente in parrocchia.</p>
            </div>}
        </div>
        <div className="ars-com-genitore-pulsanti">
          <button className="ars-sac-azione ars-sac-azione-chiara" type="button"
            onClick={() => setApertaId(v => v===pratica.id ? null:pratica.id)}>
            {apertaId===pratica.id ? "Chiudi domanda" : "Apri domanda"}
          </button>
          {!completa && <button className="ars-sac-azione" type="button"
            onClick={() => setCompletaId(v => v===pratica.id ? null:pratica.id)}>
            {completaId===pratica.id ? "Chiudi documenti" : "Completa documenti"}
          </button>}
        </div>
        {apertaId===pratica.id && <div className="ars-com-genitore-dettaglio">
          <h5>Domanda inviata alla parrocchia</h5>
          <dl>{DETTAGLI_PRATICA.filter(([k]) => String(d[k] || "").trim()).map(([k,nome]) =>
            <div key={k}><dt>{nome}</dt><dd>{String(d[k])}</dd></div>)}</dl>
          <p>Informativa privacy: versione {pratica.privacy_versione || "—"}.
            Presa visione {pratica.privacy_presa_visione_il ? "registrata" : "non registrata"}.</p>
          <h6>Stato dei documenti</h6>
          {DOCUMENTI_PERSONALI_COMUNIONE.map(doc => <p key={doc.tipo}><strong>{doc.nome}:</strong> {
            documentoConfermato(pratica,doc.tipo) ? "Completato" : fotoPresente(pratica,doc.tipo) ? "Foto caricata, in attesa di verifica" : "Da consegnare"}</p>)}
          {(pratica.solleciti || []).length>0 && <div className="ars-com-genitore-solleciti">
            <h6>Promemoria della parrocchia</h6>
            {pratica.solleciti.map(s => <p key={s.id}>
              {new Date(s.creato_il).toLocaleDateString("it-IT")}: {s.documenti_mancanti.join(", ")}
            </p>)}
          </div>}
        </div>}
        {completaId===pratica.id && !completa && <CompletaFotoComunione
          pratica={pratica} parrocchiaId={parrocchiaId} utenteId={utenteId}
          modalitaFirme={modalitaFirme}
          onCaricata={() => setRevisione(v=>v+1)} />}
      </article>;
    })}
  </section>;
}

function ModuloComunione({ parrocchiaId, utenteId, nomeParrocchia }) {
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
  const [modalitaDisponibili, setModalitaDisponibili] = useState("cartacea");
  const [modalitaFirma, setModalitaFirma] = useState("cartacea");
  const [nominativoFirma, setNominativoFirma] = useState("");
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
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error} = await supabase.rpc("ars_firme_leggi_modalita", {
        p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",
      });
      if (!attivo || error) return;
      const disponibile = ["app","cartacea","entrambe"].includes(data?.modalita) ? data.modalita : "cartacea";
      setModalitaDisponibili(disponibile);
      setModalitaFirma(disponibile === "app" ? "app" : "cartacea");
    })();
    return () => {attivo=false;};
  }, [parrocchiaId]);

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
    if (!privacyPubblicata) return "La parrocchia deve ancora pubblicare l'informativa privacy.";
    if (!aperto) return "Le iscrizioni per l'anno scelto non sono aperte.";
    for (const chiave of ["nome", "cognome", "dataNascita", "genitore1Nome", "genitore1Cognome"]) {
      if (!String(modulo[chiave] || "").trim()) return "Compila i dati obbligatori del bambino e del genitore.";
    }
    if (!modulo.privacyVista) return "Leggi l'informativa e conferma di averne preso visione.";
    if (modalitaFirma === "app" && !confermaFirma) return "Conferma la sottoscrizione della domanda nell'app.";
    if (modalitaFirma === "app" && nominativoFirma.trim().toLocaleLowerCase("it") !==
       `${modulo.genitore1Nome.trim()} ${modulo.genitore1Cognome.trim()}`.toLocaleLowerCase("it"))
      return "Scrivi il nome e cognome del genitore esattamente come nella domanda.";
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
    const foto = Object.entries(fotoPrimaInvio).filter(([,file]) => file);
    const erroriFoto = [];
    for (const [tipo,file] of foto) {
      try { await caricaFotoComunione({parrocchiaId,utenteId,iscrizioneId:data.iscrizione_id,tipo,file}); }
      catch (err) {erroriFoto.push(err.message);}
    }
    setInInvio(false);
    setMessaggio(erroriFoto.length
      ? "Domanda inviata correttamente. Una o più foto non sono state caricate: puoi aggiungerle da «Le mie domande e documenti»."
      : "Domanda inviata alla parrocchia. La trovi in «Le mie domande e documenti». Puoi stamparla, se desideri.");
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
    ["CAP", modulo.cap], ["Parrocchia del battesimo", modulo.parrocchiaBattesimo],
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
        {campo("dataNascita", "Data di nascita", "date", true)}{campo("luogoNascita", "Luogo di nascita")}
        {campo("codiceFiscale", "Codice fiscale (se richiesto)")}
        {campo("indirizzo", "Indirizzo di residenza")}{campo("comune", "Comune")}{campo("cap", "CAP")}
        {campo("parrocchiaBattesimo", "Parrocchia del Battesimo")}{campo("dataBattesimo", "Data del Battesimo", "date")}
      </div></fieldset>

      <fieldset><legend>Genitore o tutore richiedente</legend><div className="ars-sac-form-grid">
        {campo("genitore1Nome", "Nome", "text", true)}{campo("genitore1Cognome", "Cognome", "text", true)}
        {campo("genitore1CF", "Codice fiscale")}{campo("genitore1Telefono", "Telefono", "tel")}
        {campo("genitore1Email", "Email", "email")}{campo("tutore", "Qualità del tutore, se pertinente")}
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
        <p className="ars-sac-avvertenza">La presa visione della privacy viene registrata con la domanda. Se scegli la modalità cartacea, seguirai le istruzioni per consegnare i documenti firmati.</p>
      </fieldset>

      <FirmaSemplice documento="domanda di Prima Comunione"
        modalitaDisponibili={modalitaDisponibili} modalita={modalitaFirma}
        onModalitaChange={setModalitaFirma} conferma={confermaFirma}
        onConfermaChange={setConfermaFirma} nominativo={nominativoFirma}
        onNominativoChange={setNominativoFirma} disabilitato={Boolean(ricevuta)} />
      {!ricevuta && <fieldset className="ars-com-foto-preinvio">
        <legend>Fotografie dei documenti firmati — facoltative</legend>
        <p><strong>Puoi inviare la domanda anche senza queste fotografie.</strong>
          Potrai aggiungerle successivamente, oppure consegnare i documenti in parrocchia.</p>
        {modalitaFirma === "cartacea" ? DOCUMENTI_PERSONALI_COMUNIONE.map(doc =>
          <label className="ars-com-genitore-file" key={doc.tipo}>
            <span>{doc.nome} — scegli o scatta una foto</span>
            <input type="file" accept="image/*"
              onChange={e=>setFotoPrimaInvio(p=>({...p,[doc.tipo]:e.target.files?.[0] || null}))} />
            {fotoPrimaInvio[doc.tipo] && <small>Foto scelta: {fotoPrimaInvio[doc.tipo].name}</small>}
          </label>) : <p>Con la conferma nell’app non occorre allegare fotografie della domanda o dell'informativa.</p>}
      </fieldset>}
      {messaggio && <p className={ricevuta ? "ars-sac-successo" : "ars-sac-errore"} role="status">{messaggio}</p>}
      {ricevuta && <p className="ars-sac-successo">Pratica registrata: {ricevuta.iscrizione_id}.
        {ricevuta.account_stato === "da_verificare" ? " L'eventuale account del ragazzo sarà verificato separatamente." : ""}</p>}
      <div className="ars-sac-azioni">
        <button className="ars-sac-azione" type="button" onClick={stampa} disabled={!privacyPubblicata}>
          Stampa domanda e informativa
        </button>
        <button className="ars-sac-azione" type="submit" disabled={inInvio || Boolean(ricevuta) || !privacyPubblicata || !aperto}>
          {inInvio ? "Invio in corso…" : ricevuta ? "Domanda inviata" : "Invia alla parrocchia"}
        </button>
      </div>
      <p className="ars-sac-avvertenza">L’invio è consentito anche quando mancano le fotografie dei documenti. La domanda rimarrà visibile nella tua area personale.</p>

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
          <p>Modalità di sottoscrizione: {modalitaFirma === "app" ? "Conferma semplice nell’app" : "Firma cartacea"}.</p>
          <p>Autorizzazione account: {modulo.autorizzaAccount ? "Sì" : "No"} — Autorizzazione dialogo del gruppo: {modulo.autorizzaAccount && modulo.autorizzaChat ? "Sì" : "No"}.</p>
          <p>Presa visione dell'informativa privacy versione {versionePrivacy}: {modulo.privacyVista ? "Confermata online" : "Da confermare"}.</p>
          <div className="ars-sac-firme-stampa">
            <p>Luogo e data: ____________________________________________</p>
            <p>Firma genitore/tutore: {modalitaFirma === "app" && ricevuta?.firma_id ? `Confermata nell’app — ${nominativoFirma}` : "_____________________________________"}</p>
            <p>Firma secondo genitore, se richiesta: _________________________</p>
          </div>
        </section>
        <section className="ars-sac-pagina-stampa ars-sac-privacy-stampa">
          <div className="ars-sac-stampa-privacy-testo">{privacy}</div>
          <p>Versione informativa: {versionePrivacy}</p>
          <p>Data e luogo: ____________________________________________</p>
          <p>Firma genitore/tutore: {modalitaFirma === "app" && ricevuta?.firma_id ? "Presa visione confermata online" : "_____________________________________"}</p>
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

function DettaglioSottocard({ sezione, parrocchiaId, utenteId, nomeParrocchia }) {
  switch (sezione) {
    case "iscrizioni":
      return <ModuloComunione parrocchiaId={parrocchiaId} utenteId={utenteId} nomeParrocchia={nomeParrocchia} />;
    case "gruppo":
      return <><p>Qui troverai il gruppo di Catechismo assegnato e lo spazio di dialogo condiviso con i catechisti e il parroco.</p><p>Ai ragazzi sarà consentito scrivere nel gruppo, ma non inviare messaggi privati ad altri ragazzi.</p><p className="ars-sac-prossimamente">Le conversazioni saranno attivate dopo la predisposizione dei gruppi e delle autorizzazioni.</p></>;
    case "calendario":
      return <><p>Un calendario dedicato <strong>esclusivamente al Catechismo</strong>: incontri, scadenze, riunioni con i genitori, ritiri e prove.</p><p>Gli appuntamenti saranno gestiti dal parroco e dai catechisti autorizzati. Genitori e ragazzi vedranno quelli del proprio gruppo.</p><p>Questo calendario è separato dal Calendario generale del fedele, che resta invariato.</p><p className="ars-sac-prossimamente">Gli appuntamenti saranno visualizzati qui non appena disponibili.</p></>;
    case "comunicazioni":
      return <><p>Avvisi e informazioni del Catechismo per le famiglie e i ragazzi del gruppo, pubblicati dai responsabili autorizzati.</p><p className="ars-sac-prossimamente">Le comunicazioni saranno visualizzate qui non appena disponibili.</p></>;
    case "pagamenti":
      return <><p>Qui il genitore potrà consultare le eventuali quote del Catechismo, lo stato dei pagamenti e le relative ricevute.</p><p>I ragazzi non avranno accesso alle funzioni di pagamento.</p><p className="ars-sac-prossimamente">La sezione sarà collegata al sistema dei pagamenti già esistente, senza duplicarlo.</p></>;
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
            utenteId={utenteAttuale} nomeParrocchia={nomeAttuale} />
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