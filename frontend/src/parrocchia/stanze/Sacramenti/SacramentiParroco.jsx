import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { GestioneEconomicaComunione, intestazioneStampaArs, STILI_INTESTAZIONE_STAMPA_ARS } from "../PagamentiParrocchia/PagamentiParrocchia";

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

const sezioniComunione = [
  { id: "impostazioni", nome: "Impostazioni anno catechistico", descrizione: "Anno pastorale, durata e iscrizioni" },
  { id: "quote", nome: "Quote e iscrizioni", descrizione: "Quote annuali, iscritti e rimborsi" },
  { id: "iscrizioni", nome: "Iscrizioni e rinnovi", descrizione: "Nuove iscrizioni e rinnovi annuali" },
  { id: "catechisti", nome: "Catechisti", descrizione: "Responsabili e assegnazioni" },
  { id: "gruppi", nome: "Gruppi di catechismo", descrizione: "Classi e organizzazione" },
  { id: "incontri", nome: "Calendario incontri", descrizione: "Date e appuntamenti" },
  { id: "presenze", nome: "Presenze", descrizione: "Registro degli incontri" },
  { id: "comunicazioni", nome: "Comunicazioni", descrizione: "Avvisi alle famiglie" },
  { id: "celebrazioni", nome: "Celebrazioni", descrizione: "Preparazione alla Prima Comunione" },
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


// Il modello è una bozza da completare: non viene pubblicato automaticamente.
function modelloPrivacyComunione(parrocchia, nomeParrocchia, anno) {
  const valore = (x, segnaposto) => String(x || "").trim() || `[${segnaposto}]`;
  const nome = valore(parrocchia?.nome || nomeParrocchia, "Denominazione completa della parrocchia");
  const indirizzo = valore(parrocchia?.indirizzo, "Indirizzo completo e sede della parrocchia");
  const email = valore(parrocchia?.email, "Email della parrocchia");
  const telefono = valore(parrocchia?.telefono, "Telefono della parrocchia");
  return `${nome}
${indirizzo} • ${telefono} • ${email}

INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI
Iscrizioni al percorso di preparazione alla Prima Comunione
Anno catechistico ${anno}

1. TITOLARE DEL TRATTAMENTO
Il titolare del trattamento è ${nome}, con sede in ${indirizzo}, contattabile tramite ${email} e ${telefono}.
Responsabile della protezione dei dati, se nominato: [Indicare il contatto o specificare se non nominato].

2. DATI TRATTATI E FINALITÀ
La parrocchia utilizza i dati anagrafici e i recapiti della famiglia e del minore per gestire la domanda, i rinnovi, i gruppi di catechismo, gli incontri e le comunicazioni relative al percorso. Eventuali ulteriori trattamenti: [Descrivere eventuali finalità ulteriori, oppure scrivere “Nessuna”].
I dati sanitari, se necessari, sono raccolti con una procedura separata e riservata.

3. BASE GIURIDICA E CONFERIMENTO
[Indicare la base giuridica e, ove pertinente, la condizione applicabile al trattamento di categorie particolari di dati].
I dati necessari all'iscrizione sono: [Specificare].
Il mancato conferimento dei dati necessari comporta: [Specificare].
I dati facoltativi sono: [Specificare].

4. DESTINATARI E MODALITÀ DEL TRATTAMENTO
I dati sono trattati dal personale e dai collaboratori autorizzati della parrocchia e dagli eventuali fornitori incaricati.
[Indicare categorie di destinatari, fornitori pertinenti e trasferimenti fuori dallo Spazio economico europeo, oppure specificare che non sono previsti].

5. CONSERVAZIONE
[Indicare i tempi di conservazione o i criteri utilizzati, distinguendo ove necessario i registri sacramentali dalla documentazione delle iscrizioni].

6. DIRITTI DEGLI INTERESSATI
Nei casi previsti dalla normativa applicabile è possibile richiedere accesso, rettifica, cancellazione, limitazione, opposizione e, ove applicabile, portabilità. Il consenso, quando costituisce la base giuridica del trattamento, può essere revocato. È possibile proporre reclamo al Garante per la protezione dei dati personali.
Per esercitare i diritti: ${email}.

7. DECISIONI AUTOMATIZZATE
[Specificare se sono previste decisioni automatizzate o profilazione].

PRESA VISIONE E FIRMA
Dichiaro di avere ricevuto e letto questa informativa. Gli eventuali consensi facoltativi per l'account personale del minore e per la chat del gruppo catechistico sono richiesti separatamente.

Luogo e data: __________________________________
Firma del genitore o tutore: ________________________________
Firma dell'altro genitore, se richiesta: ________________________________`;
}

function prossimaVersionePrivacy(versione) {
  const v = String(versione || "").trim();
  if (!v) return "1";
  const m = v.match(/^(.*?)(\d+)$/);
  return m ? `${m[1]}${Number(m[2]) + 1}` : `${v}-2`;
}

const annoCorrente = new Date().getFullYear();
const impostazioniIniziali = {
  anno: `${annoCorrente}/${annoCorrente + 1}`,
  durata: "2",
  informazioni: "",
  certificatoBattesimoInternoObbligatorio: false,
  date: { 1: { apertura: "", chiusura: "" }, 2: { apertura: "", chiusura: "" }, 3: { apertura: "", chiusura: "" } },
};

// CARD 03 - Iscrizioni e rinnovi: consulta le domande gia' registrate.
// I gruppi vengono formati esclusivamente nella card 05.
const SEZIONI_DOMANDA = [
  ["Dati del bambino", [
    ["Nome", "nome"], ["Cognome", "cognome"], ["Data di nascita", "dataNascita"],
    ["Luogo di nascita", "luogoNascita"], ["Codice fiscale", "codiceFiscale"],
    ["Indirizzo di residenza", "indirizzo"], ["Comune", "comune"], ["CAP", "cap"],
    ["Battesimo in questa parrocchia", "battesimoInQuestaParrocchia"],
    ["Parrocchia del Battesimo", "parrocchiaBattesimo"], ["Data del Battesimo", "dataBattesimo"],
  ]],
  ["Genitore o tutore richiedente", [
    ["Nome", "genitore1Nome"], ["Cognome", "genitore1Cognome"],
    ["Codice fiscale", "genitore1CF"], ["Telefono", "genitore1Telefono"],
    ["Email", "genitore1Email"], ["Rapporto con il bambino", "tutore"],
  ]],
  ["Secondo genitore", [
    ["Nome", "genitore2Nome"], ["Cognome", "genitore2Cognome"],
    ["Telefono", "genitore2Telefono"], ["Email", "genitore2Email"],
  ]],
  ["Deleghe", [["Persone delegate al ritiro", "delegati"]]],
];

const DOCUMENTI_COMUNIONE = [
  { tipo: "certificato_battesimo", nome: "Certificato di Battesimo" },
];

function mostraDataComunione(valore, dataOra = false) {
  if (!valore) return "—";
  const s = String(valore);
  if (!dataOra && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [a, m, g] = s.split("-"); return `${g}/${m}/${a}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return dataOra ? d.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : d.toLocaleDateString("it-IT");
}

function documentoRicevuto(riga, tipo) {
  return (riga?.documenti || []).some(d => d.tipo === tipo && (d.stato === "ricevuto" || d.stato === "non_necessario"));
}

// Determinazione unica delle incomplete: non considera mai obbligatorio il CF del bambino.
const DATI_OBBLIGATORI_COMUNIONE = [
  ["nome", "Nome del bambino"], ["cognome", "Cognome del bambino"],
  ["dataNascita", "Data di nascita"], ["luogoNascita", "Luogo di nascita"],
  ["indirizzo", "Indirizzo di residenza"], ["comune", "Comune di residenza"],
  ["genitore1Nome", "Nome del genitore"], ["genitore1Cognome", "Cognome del genitore"],
];
const CAMPI_INTEGRAZIONE = [
  ["luogoNascita", "Luogo di nascita", "text"],
  ["indirizzo", "Indirizzo di residenza", "text"], ["comune", "Comune", "text"],
  ["cap", "CAP", "text"], ["codiceFiscale", "Codice fiscale (facoltativo)", "text"],
  ["parrocchiaBattesimo", "Parrocchia del Battesimo", "text"],
  ["dataBattesimo", "Data del Battesimo", "date"],
  ["genitore1Telefono", "Telefono del genitore", "tel"],
  ["genitore1Email", "Email del genitore", "email"],
  ["genitore2Nome", "Secondo genitore - nome", "text"],
  ["genitore2Cognome", "Secondo genitore - cognome", "text"],
  ["genitore2Telefono", "Secondo genitore - telefono", "tel"],
  ["genitore2Email", "Secondo genitore - email", "email"],
  ["tutore", "Qualità del tutore", "text"], ["delegati", "Persone delegate", "text"],
];
function necessitaCertificatoComunione(riga, internoObbligatorio) {
  const scelta = riga?.dati_modulo?.battesimoInQuestaParrocchia;
  if (scelta === false) return true;
  if (scelta === true) return internoObbligatorio === true;
  // Domande antecedenti la nuova domanda Sì/No: non indovinare dal nome scritto.
  return false;
}
function mancanzeDomanda(riga, internoObbligatorio = false) {
  const d = riga.dati_modulo || {};
  const dati = DATI_OBBLIGATORI_COMUNIONE
    .filter(([chiave]) => !String(d[chiave] ?? "").trim())
    .map(([, etichetta]) => etichetta);
  if (!String(d.genitore1Telefono || "").trim() && !String(d.genitore1Email || "").trim())
    dati.push("Telefono o email del genitore");
  if (!riga.privacy_presa_visione_il) dati.push("Presa visione dell'informativa privacy");
  if (d.modalitaPresentazione === "segreteria_con_account" && !documentoRicevuto(riga,"domanda_firmata"))
    dati.push("Conferma semplice del genitore nell'app");
  const certGiaRicevuto = documentoRicevuto(riga, "certificato_battesimo");
  if (typeof d.battesimoInQuestaParrocchia !== "boolean" && !certGiaRicevuto)
    dati.push("Domanda precedente: chiarire dove è avvenuto il Battesimo (oppure segnare il certificato come non necessario)");
  const documenti = DOCUMENTI_COMUNIONE.filter(doc =>
    necessitaCertificatoComunione(riga, internoObbligatorio) && !documentoRicevuto(riga, doc.tipo));
  return { dati, documenti, tutto: [...dati, ...documenti.map(doc => doc.nome)] };
}

const DICHIARAZIONE_PRESA_VISIONE_DOMANDA = "Dichiaro di aver preso visione della domanda di iscrizione e di confermarne il contenuto.";

function DomandaComunioneDettaglio({ riga, nomeParrocchia, perStampa = false, attestazioneDomanda = null }) {
  const d = riga.dati_modulo || {};
  const confermaApp = attestazioneDomanda?.stato === "pronta" && attestazioneDomanda?.presente === true;
  const nomeFirmatario = String(attestazioneDomanda?.firmatario || "").trim();
  const righeUtili = (campi) => campi.filter(([, chiave]) => String(d[chiave] ?? "").trim().length);
  return <div className={perStampa ? "ars-com-domanda-foglio" : "ars-com-domanda-dettaglio"}>
    <header className="ars-com-intestazione-domanda">
      <h3>{nomeParrocchia || "Parrocchia"}</h3>
      <h4>Domanda di iscrizione o rinnovo — Prima Comunione</h4>
      <p>Anno catechistico {riga.anno_pastorale} · {riga.anno_percorso}° anno del percorso</p>
      <p>Domanda presentata il {mostraDataComunione(riga.presentata_il, true)}</p>
    </header>
    {SEZIONI_DOMANDA.map(([titolo, campi]) => {
      const presenti = righeUtili(campi);
      if (!presenti.length) return null;
      return <section className="ars-com-sezione-domanda" key={titolo}>
        <h5>{titolo}</h5>
        <dl>{presenti.map(([etichetta, chiave]) =>
          <div key={chiave}><dt>{etichetta}</dt><dd>{chiave === "battesimoInQuestaParrocchia"
            ? (d[chiave] === true ? "Sì" : d[chiave] === false ? "No" : "Da chiarire")
            : (chiave.startsWith("data") || chiave === "dataBattesimo"
              ? mostraDataComunione(d[chiave]) : String(d[chiave]))}</dd></div>
        )}</dl>
      </section>;
    })}
    <section className="ars-com-sezione-domanda ars-com-prese-visione">
      <h5>Privacy e prese visione</h5>
      <div className="ars-com-prese-blocco">
        <h6>1. Presa visione dell'informativa privacy</h6>
        <dl>
          <div><dt>Informativa</dt><dd>Versione {riga.privacy_versione || "—"}</dd></div>
          <div><dt>Presa visione</dt><dd>{riga.privacy_presa_visione_il ? "Confermata" : "Non registrata"}</dd></div>
          {riga.privacy_presa_visione_il && <div><dt>Data e ora</dt><dd>{mostraDataComunione(riga.privacy_presa_visione_il, true)}</dd></div>}
        </dl>
      </div>
      <div className="ars-com-prese-blocco">
        <h6>2. Presa visione e conferma della domanda di iscrizione</h6>
        <p className="ars-com-prese-dichiarazione">«{DICHIARAZIONE_PRESA_VISIONE_DOMANDA}»</p>
        {confermaApp ? <dl>
          <div><dt>Stato</dt><dd className="ars-com-stato-ok">Confermata nell'app</dd></div>
          {nomeFirmatario && <div><dt>Genitore o tutore</dt><dd>{nomeFirmatario}</dd></div>}
          {attestazioneDomanda?.confermata_il && <div><dt>Data e ora</dt><dd>{mostraDataComunione(attestazioneDomanda.confermata_il, true)}</dd></div>}
        </dl> : <p className="ars-com-prese-stato" role="status">
          {attestazioneDomanda?.stato === "errore"
            ? "Non è stato possibile verificare la conferma nell'app. Riapri la domanda per riprovare."
            : attestazioneDomanda?.stato === "pronta"
              ? "Nessuna conferma nell'app registrata per questa domanda. Verifica l'eventuale firma cartacea."
              : "Verifica della conferma nell'app in corso…"}
        </p>}
      </div>
      <div className="ars-com-prese-blocco">
        <h6>3. Autorizzazioni</h6>
        <dl>
          <div><dt>Account del ragazzo</dt><dd>{d.autorizzaAccount ? "Autorizzato" : "Non autorizzato"}</dd></div>
          <div><dt>Chat del Catechismo</dt><dd>{d.autorizzaChat ? "Autorizzata" : "Non autorizzata"}</dd></div>
        </dl>
      </div>
    </section>
    <section className="ars-com-sezione-domanda">
      <h5>Documenti</h5>
      <p>Non occorrono fotografie della domanda o dell'informativa privacy.</p>
      <dl>{DOCUMENTI_COMUNIONE.map(doc => <div key={doc.tipo}>
        <dt>{doc.nome}</dt>
        <dd>{documentoRicevuto(riga, doc.tipo) ? "Ricevuto" : "Consulta lo stato nella scheda"}</dd>
      </div>)}</dl>
    </section>
    {perStampa && <>
      {!confermaApp && <div className="ars-com-firme-domanda">
        <p>Luogo e data: _______________________________________</p>
        <p>Firma del genitore/tutore: _____________________________</p>
        <p>Firma del secondo genitore, se richiesta: ________________</p>
      </div>}
      {!riga.privacy_presa_visione_il && riga.privacy_testo && <section className="ars-com-informativa-stampa">
        <h4>Informativa privacy — versione {riga.privacy_versione || "—"}</h4>
        <div>{riga.privacy_testo}</div>
      </section>}
    </>}
  </div>;
}

// Prima iscrizione presentata in segreteria per un genitore senza account.
// La funzione Supabase applica i permessi assegnati dal parroco.
const DATI_SEGRETERIA_INIZIALI = {
  nome: "", cognome: "", dataNascita: "", luogoNascita: "", codiceFiscale: "",
  indirizzo: "", comune: "", cap: "", parrocchiaBattesimo: "", dataBattesimo: "",
  battesimoInQuestaParrocchia: null,
  genitore1Nome: "", genitore1Cognome: "", genitore1CF: "",
  genitore1Telefono: "", genitore1Email: "", tutore: "",
  genitore2Nome: "", genitore2Cognome: "", genitore2Telefono: "", genitore2Email: "",
  delegati: "",
};

const CAMPI_SEGRETERIA = [
  ["Dati del bambino", [
    ["nome", "Nome", "text", true],
    ["cognome", "Cognome", "text", true],
    ["dataNascita", "Data di nascita", "date", true],
    ["luogoNascita", "Luogo di nascita", "text", true],
    ["codiceFiscale", "Codice fiscale (facoltativo)", "text", false],
    ["indirizzo", "Indirizzo di residenza", "text", true],
    ["comune", "Comune di residenza", "text", true],
    ["cap", "CAP", "text", false],
    ["parrocchiaBattesimo", "Parrocchia del Battesimo", "text", false],
    ["dataBattesimo", "Data del Battesimo", "date", false],
  ]],
  ["Genitore o tutore richiedente", [
    ["genitore1Nome", "Nome", "text", true],
    ["genitore1Cognome", "Cognome", "text", true],
    ["genitore1CF", "Codice fiscale (facoltativo)", "text", false],
    ["genitore1Telefono", "Telefono", "tel", false],
    ["genitore1Email", "Email", "email", false],
    ["tutore", "Qualità del richiedente, se tutore", "text", false],
  ]],
  ["Secondo genitore (se presente)", [
    ["genitore2Nome", "Nome", "text", false],
    ["genitore2Cognome", "Cognome", "text", false],
    ["genitore2Telefono", "Telefono", "tel", false],
    ["genitore2Email", "Email", "email", false],
  ]],
];

function NuovaIscrizioneComunioneSegreteria({ parrocchiaId, onSalvata, onAnnulla }) {
  const [valori, setValori] = useState({ ...DATI_SEGRETERIA_INIZIALI });
  const [privacyConfermata, setPrivacyConfermata] = useState(false);
  const [firmaRaccolta, setFirmaRaccolta] = useState(false);
  const [modalita, setModalita] = useState("senza");
  const [candidati, setCandidati] = useState([]);
  const [genitoreSelezionato, setGenitoreSelezionato] = useState("");
  const [ricercaInCorso, setRicercaInCorso] = useState(false);
  const [messaggioRicerca, setMessaggioRicerca] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const cambia = (chiave, valore) => {
    setValori(precedenti => ({ ...precedenti, [chiave]: valore }));
    if (["genitore1Nome", "genitore1Cognome"].includes(chiave)) {
      setGenitoreSelezionato(""); setCandidati([]); setMessaggioRicerca("");
    }
    if (errore) setErrore("");
  };

  async function cercaGenitore() {
    const testo = [valori.genitore1Nome, valori.genitore1Cognome].filter(Boolean).join(" ").trim();
    if (testo.length < 3) { setMessaggioRicerca("Inserisci nome e cognome del genitore."); return; }
    setRicercaInCorso(true); setMessaggioRicerca(""); setGenitoreSelezionato("");
    const { data, error } = await supabase.rpc("ars_comunione_cerca_genitori_segreteria", {
      p_parrocchia_id: parrocchiaId, p_ricerca: testo,
    });
    setRicercaInCorso(false);
    if (error) { setMessaggioRicerca(error.message); setCandidati([]); return; }
    setCandidati(Array.isArray(data) ? data : []);
    setMessaggioRicerca(data?.length ? "Seleziona il profilo corretto; verifica l'identificativo con il genitore." :
      "Nessun profilo trovato. Usa «Genitore senza account» se confermato.");
  }

  async function invia(evento) {
    evento.preventDefault();
    if (salvataggio) return;
    if (!valori.genitore1Telefono.trim() && !valori.genitore1Email.trim()) {
      setErrore("Inserisci almeno un recapito del genitore o tutore: telefono oppure email.");
      return;
    }
    if (modalita === "con" && !genitoreSelezionato) {
      setErrore("Cerca e seleziona l'account esatto del genitore prima di registrare."); return;
    }
    if (modalita === "senza" && !firmaRaccolta) {
      setErrore("Prima di registrare, conferma di aver raccolto la firma del genitore sulla domanda.");
      return;
    }
    if (typeof valori.battesimoInQuestaParrocchia !== "boolean") {
      setErrore("Indica se il Battesimo è avvenuto in questa parrocchia.");
      return;
    }
    if (valori.battesimoInQuestaParrocchia === false && !valori.parrocchiaBattesimo.trim()) {
      setErrore("Indica la parrocchia dove è avvenuto il Battesimo.");
      return;
    }
    if (!privacyConfermata) {
      setErrore("Conferma la consegna e la presa visione dell'informativa privacy.");
      return;
    }
    if (!parrocchiaId) {
      setErrore("Parrocchia non disponibile. Rientra dalla dashboard.");
      return;
    }
    setErrore("");
    setSalvataggio(true);
    try {
      // Primo anno soltanto: il rinnovo senza account richiede un percorso distinto.
      const dati = Object.fromEntries(
        Object.entries(valori).map(([chiave, valore]) =>
          [chiave, typeof valore === "string" ? valore.trim() : valore])
      );
      const { data, error } = await supabase.rpc(
        modalita === "con" ? "ars_comunione_presenta_domanda_segreteria_con_account"
          : "ars_comunione_presenta_domanda_segreteria", {
          p_parrocchia_id: parrocchiaId,
          ...(modalita === "con" ? { p_genitore_utente_id: genitoreSelezionato } : {}),
          p_dati: dati, p_privacy_presa_visione: true,
        });
      if (error) throw error;
      if (!data?.ok || !data.iscrizione_id) {
        throw new Error("Non è arrivata la conferma dell'iscrizione.");
      }
      // La firma cartacea raccolta viene attestata nel registro già esistente.
      // Non è un documento fotografico: è una registrazione amministrativa.
      const {error: firmaErrore} = modalita === "senza"
        ? await supabase.rpc("ars_comunione_segna_documento_parroco", {
        p_parrocchia_id: parrocchiaId,
        p_iscrizione_id: data.iscrizione_id,
        p_tipo: "domanda_firmata",
        p_stato: "ricevuto",
      }) : {error:null};
      if (firmaErrore) {
        setSalvataggio(false);
        setErrore("La domanda è stata registrata, ma non è stato possibile conservare l'attestazione della firma. " +
          "Non ripetere l'iscrizione: annota il nome e chiedi di verificare la pratica.");
        // La pratica è già stata creata; nessun nuovo invio deve duplicarla.
        onSalvata(data);
        return;
      }
      onSalvata(data);
    } catch (err) {
      setErrore(err?.message || "Impossibile registrare la domanda. Riprova.");
    } finally {
      setSalvataggio(false);
    }
  }

  return <form className="ars-com-segreteria" onSubmit={invia} aria-label="Prima iscrizione dalla segreteria">
    <div className="ars-com-segreteria-testa">
      <h4>Nuova iscrizione in segreteria — 1° anno</h4>
      <p>La segreteria autorizzata inserisce una prima iscrizione per conto del genitore, con o senza account.</p>
      <div className="ars-com-modalita" role="group" aria-label="Tipo di iscrizione assistita">
        <button type="button" className={modalita === "con" ? "ars-com-scelta-attiva" : ""}
          disabled={salvataggio} onClick={() => { setModalita("con"); setErrore(""); }}>
          Genitore con account
        </button>
        <button type="button" className={modalita === "senza" ? "ars-com-scelta-attiva" : ""}
          disabled={salvataggio} onClick={() => { setModalita("senza"); setErrore(""); }}>
          Genitore senza account
        </button>
      </div>
      <div className="ars-com-avviso-firma" role="note">
        {modalita === "senza" ? <>
          <strong>Firma e privacy: una sola registrazione</strong>
          <p>Raccogli la firma del genitore sulla domanda cartacea e consegna l'informativa privacy.
            Spunta le due attestazioni in fondo al modulo. Non servono fotografie delle firme.</p>
        </> : <>
          <strong>Conferma nell'app</strong>
          <p>Registra la domanda e consegna l'informativa al genitore. Dopo l'invio,
            il genitore confermerà la domanda con la firma semplice nella propria area personale.</p>
        </>}
      </div>
      {modalita === "con" && <div className="ars-com-ricerca-genitore">
        <p>Compila il nome e cognome del genitore nel modulo, poi cerca e conferma il suo account. Non viene creato un secondo profilo.</p>
        <button className="ars-sac-stampa" type="button" disabled={ricercaInCorso || salvataggio}
          onClick={cercaGenitore}>{ricercaInCorso ? "Ricerca…" : "Cerca account del genitore"}</button>
        {messaggioRicerca && <p role="status">{messaggioRicerca}</p>}
        {candidati.map(c => <label className="ars-com-candidato" key={c.utente_id}>
          <input type="radio" name="genitoreAccountSegreteria" checked={genitoreSelezionato === c.utente_id}
            onChange={() => setGenitoreSelezionato(c.utente_id)} />
          <span><strong>{c.nome} {c.cognome}</strong> · Identificativo: {c.identificativo || "—"}</span>
        </label>)}
      </div>}
      <p>La registrazione è possibile nel periodo di apertura delle iscrizioni al primo anno configurato dalla parrocchia.</p>
      <p>I campi contrassegnati con * sono obbligatori. Il codice fiscale del bambino è facoltativo.</p>
    </div>
    {CAMPI_SEGRETERIA.map(([titolo, campi]) => <fieldset key={titolo}>
      <legend>{titolo}</legend>
      <div className="ars-com-segreteria-campi">
        {campi.map(([chiave, etichetta, tipo, obbligatorio]) => <label key={chiave}>
          <span>{etichetta}{obbligatorio ? " *" : ""}</span>
          <input type={tipo} value={valori[chiave]}
            onChange={e => cambia(chiave, e.target.value)}
            required={obbligatorio} disabled={salvataggio}
            maxLength={tipo === "date" ? undefined : 240}
            autoComplete="off" />
        </label>)}
      </div>
      {titolo === "Genitore o tutore richiedente" &&
        <p className="ars-com-segreteria-nota">Indica almeno un recapito: telefono oppure email.</p>}
    </fieldset>)}
    <fieldset>
      <legend>Battesimo e certificato</legend>
      <label className="ars-com-segreteria-deleghe">Il bambino è stato battezzato in questa parrocchia? *
        <select value={valori.battesimoInQuestaParrocchia === null ? "" : String(valori.battesimoInQuestaParrocchia)}
          disabled={salvataggio}
          onChange={e => cambia("battesimoInQuestaParrocchia", e.target.value === "" ? null : e.target.value === "true")} required>
          <option value="">Seleziona una risposta</option>
          <option value="true">Sì</option>
          <option value="false">No, in un'altra parrocchia</option>
        </select>
      </label>
      <p>Se è stato battezzato altrove, il certificato può essere caricato dal genitore o consegnato qui. La pratica si completa automaticamente quando arriva.</p>
    </fieldset>
    <fieldset>
      <legend>Deleghe</legend>
      <label className="ars-com-segreteria-deleghe">Persone delegate al ritiro (se previste)
        <textarea value={valori.delegati} rows={3} disabled={salvataggio}
          onChange={e => cambia("delegati", e.target.value)} />
      </label>
    </fieldset>
    <fieldset className="ars-com-segreteria-privacy">
      <legend>Informativa privacy</legend>
      <p>Conferma la consegna dell'informativa. Senza account registra anche la firma cartacea; con account il genitore firmerà nell'app.</p>
      {modalita === "senza" && <label className="ars-com-segreteria-spunta">
        <input type="checkbox" checked={firmaRaccolta}
          disabled={salvataggio} required
          onChange={e => setFirmaRaccolta(e.target.checked)} />
        <span>Confermo che il genitore o tutore ha firmato la domanda cartacea.</span>
      </label>}
      <label className="ars-com-segreteria-spunta">
        <input type="checkbox" checked={privacyConfermata}
          disabled={salvataggio} required
          onChange={e => setPrivacyConfermata(e.target.checked)} />
        <span>Confermo che il genitore o tutore ha ricevuto e preso visione dell'informativa privacy.</span>
      </label>
    </fieldset>
    {errore && <p role="alert" className="ars-com-errore-iscrizioni">{errore}</p>}
    <div className="ars-com-segreteria-azioni">
      <button type="button" className="ars-sac-stampa" disabled={salvataggio} onClick={onAnnulla}>Annulla</button>
      <button type="submit" className="ars-sac-conferma" disabled={salvataggio || !privacyConfermata || (modalita === "senza" && !firmaRaccolta)}>
        {salvataggio ? "Registrazione in corso…" : "Registra la prima iscrizione"}
      </button>
    </div>
  </form>;
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

function ModificaIscrizioneComunione({ parrocchiaId, iscrizioneId, operatoreParrocchia = false, onAnnulla, onSalvata }) {
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
      const {data,error} = await supabase.rpc("ars_comunione_leggi_modifica_iscrizione", {
        p_parrocchia_id:parrocchiaId, p_iscrizione_id:iscrizioneId,
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
    const {data,error} = await supabase.rpc("ars_comunione_modifica_iscrizione", {
      p_parrocchia_id:parrocchiaId,
      p_iscrizione_id:iscrizioneId,
      p_dati_patch:patch,
      p_consenso_account:modificaAccount ? account : null,
      p_consenso_chat:modificaChat ? chat : null,
      p_consensi_raccolti_in_parrocchia:operatoreParrocchia && consensiRaccolti,
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


function IscrizioniComunioneParroco({ parrocchiaId, nomeParrocchia, annoAttivo }) {
  const [domande, setDomande] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [sezioneCard, setSezioneCard] = useState("incomplete");
  const [ricerca, setRicerca] = useState("");
  const [annoFiltro, setAnnoFiltro] = useState("corrente");
  const [limite, setLimite] = useState(20);
  const [pagina, setPagina] = useState(1);
  const [apertaId, setApertaId] = useState(null);
  const [stampaId, setStampaId] = useState(null);
  const [aggiorna, setAggiorna] = useState(0);
  const [occupato, setOccupato] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [modificaId, setModificaId] = useState(null);
  const [modificaDomandaId, setModificaDomandaId] = useState(null);
  const [correzioni, setCorrezioni] = useState({});
  const [ricevutaSegreteria, setRicevutaSegreteria] = useState(null);
  const [internoObbligatorio, setInternoObbligatorio] = useState(null);
  // La conferma nell'app si legge dalla sottoscrizione effettivamente salvata,
  // non si deduce dallo stato «Pratica completa».
  const [attestazioniDomanda, setAttestazioniDomanda] = useState({});
  const [annullamento, setAnnullamento] = useState(null);
  const [motivoAnnullamento, setMotivoAnnullamento] = useState("");
  const [erroreAnnullamento, setErroreAnnullamento] = useState("");
  const annullaInCorso = useRef(false);
  const dialogoAnnullamento = useRef(null);
  useEffect(() => {
    if (!annullamento || !dialogoAnnullamento.current) return;
    const dialogo = dialogoAnnullamento.current;
    if (!dialogo.open) dialogo.showModal();
    return () => { if (dialogo.open) dialogo.close(); };
  }, [annullamento]);

  function apriAnnullamento(riga) {
    if (occupato || annullaInCorso.current) return;
    setMotivoAnnullamento(""); setErroreAnnullamento("");
    setAnnullamento(riga);
  }
  function chiudiAnnullamento() {
    if (!annullaInCorso.current) setAnnullamento(null);
  }
  async function confermaAnnullamento() {
    if (!annullamento || occupato || annullaInCorso.current) return;
    const id = annullamento.id;
    annullaInCorso.current = true;
    setOccupato(`annulla:${id}`); setErroreAnnullamento("");
    try {
      const { data, error } = await supabase.rpc("ars_comunione_annulla_iscrizione_parroco", {
        p_parrocchia_id: parrocchiaId, p_iscrizione_id: id,
        p_motivo: motivoAnnullamento.trim() || null,
      });
      if (error || !data?.ok) throw error || new Error("Annullamento non confermato dal sistema.");
      setDomande(prev => prev.filter(r => r.id !== id));
      setApertaId(null); setModificaId(null); setAnnullamento(null);
      setMessaggio("Iscrizione annullata. Consulta «Iscrizioni annullate e rimborsi» in Quote e iscrizioni.");
      setAggiorna(n => n + 1);
    } catch (err) {
      setErroreAnnullamento(err?.message || "Non è stato possibile annullare l'iscrizione.");
    } finally {
      annullaInCorso.current = false; setOccupato("");
    }
  }

  useEffect(() => {
    if (!apertaId || !parrocchiaId) return undefined;
    let attivo = true;
    const id = apertaId;
    setAttestazioniDomanda(prev => ({ ...prev, [id]: { stato: "caricamento" } }));
    (async () => {
      const { data, error } = await supabase.rpc("ars_comunione_leggi_conferma_parroco", {
        p_parrocchia_id: parrocchiaId,
        p_iscrizione_id: id,
      });
      if (!attivo) return;
      setAttestazioniDomanda(prev => ({ ...prev, [id]: error
        ? { stato: "errore" }
        : { stato: "pronta", presente: data?.presente === true,
            firmatario: data?.firmatario || "", confermata_il: data?.confermata_il || null } }));
    })();
    return () => { attivo = false; };
  }, [apertaId, parrocchiaId, aggiorna]);

  useEffect(() => {
    let attivo = true;
    setCaricamento(true); setErrore("");
    if (!parrocchiaId) {
      setErrore("Parrocchia non disponibile. Rientra dalla dashboard.");
      setCaricamento(false); return undefined;
    }
    (async () => {
      const [elenco, configurazione] = await Promise.all([
        supabase.rpc("ars_comunione_elenco_domande_parroco_con_foto", { p_parrocchia_id: parrocchiaId }),
        supabase.rpc("ars_comunione_configurazione_fedele", { p_parrocchia_id: parrocchiaId }),
      ]);
      const {data, error} = elenco;
      if (!attivo) return;
      setCaricamento(false);
      if (!configurazione.error && configurazione.data)
        setInternoObbligatorio(configurazione.data.certificato_battesimo_interno_obbligatorio === true);
      else setInternoObbligatorio(null);
      if (error || !Array.isArray(data)) {
        setErrore(error?.message || "Impossibile caricare le domande della Card 03.");
        setDomande([]);
      } else setDomande(data);
    })();
    return () => { attivo = false; };
  }, [parrocchiaId, aggiorna]);
  useEffect(() => {
    const ricaricaAlRitorno = () => setAggiorna(v => v + 1);
    window.addEventListener("focus", ricaricaAlRitorno);
    return () => window.removeEventListener("focus", ricaricaAlRitorno);
  }, []);

  useEffect(() => {
    if (!stampaId) return undefined;
    const classe = "ars-com-stampa-iscrizione";
    const termina = () => { document.body.classList.remove(classe); setStampaId(null); };
    document.body.classList.add(classe);
    window.addEventListener("afterprint", termina);
    const timer = window.setTimeout(() => {
      try { window.print(); } catch (_errore) { termina(); }
    }, 150);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", termina);
      document.body.classList.remove(classe);
    };
  }, [stampaId]);

  const anni = [...new Set(domande.map(d => d.anno_pastorale).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));
  const annoCorrenteParrocchia = annoAttivo || anni[0] || "";
  const incomplete = domande.filter(d => internoObbligatorio === null || mancanzeDomanda(d, internoObbligatorio).tutto.length > 0);
  const complete = domande.filter(d => internoObbligatorio !== null && mancanzeDomanda(d, internoObbligatorio).tutto.length === 0);
  const base = sezioneCard === "incomplete" ? incomplete : complete;
  const filtrate = base.filter(r => {
    const d = r.dati_modulo || {};
    const testo = [d.nome, d.cognome, d.genitore1Nome, d.genitore1Cognome]
      .map(s => String(s || "")).join(" ").toLocaleLowerCase("it");
    return (annoFiltro === "tutti" || r.anno_pastorale === (annoFiltro === "corrente" ? annoCorrenteParrocchia : annoFiltro))
      && testo.includes(ricerca.trim().toLocaleLowerCase("it"));
  });
  const pagine = Math.max(1, Math.ceil(filtrate.length / limite));
  const paginaAttiva = Math.min(pagina, pagine);
  const visualizzate = filtrate.slice((paginaAttiva - 1) * limite, paginaAttiva * limite);
  const daStampare = domande.find(r => r.id === stampaId);
  const cambiaSezione = (nuova) => {
    setSezioneCard(nuova); setPagina(1); setApertaId(null);
    setModificaId(null); setModificaDomandaId(null); setMessaggio("");
  };

  function iscrizioneRegistrata(risultato) {
    setRicevutaSegreteria(risultato?.ricevuta ? String(risultato.ricevuta) : null);
    setSezioneCard("incomplete"); setAnnoFiltro("corrente");
    setRicerca(""); setPagina(1); setApertaId(risultato.iscrizione_id);
    setMessaggio("Iscrizione registrata. La domanda diventa completa quando sono presenti gli elementi richiesti.");
    setAggiorna(n => n + 1);
  }

  async function apriFotoParroco(riga, tipo) {
    const percorso = (riga.foto || []).find(f => f.tipo===tipo)?.percorso_privato;
    if (!percorso) {setMessaggio("Fotografia non presente per questo documento.");return;}
    // La scheda viene aperta con il click, prima di avviare la richiesta asincrona.
    const finestra = window.open("about:blank","_blank");
    if (finestra) { finestra.opener = null; finestra.document.title = "Fotografia documento — Ars Liturgica"; }
    const {data,error} = await supabase.storage.from("ars-comunione-documenti")
      .createSignedUrl(percorso,90);
    if (error || !data?.signedUrl) {
      if (finestra) finestra.close();
      setMessaggio("Non è stato possibile aprire la foto: " + (error?.message || "riprova"));
      return;
    }
    if (finestra) finestra.location.replace(data.signedUrl);
    else setMessaggio("Il browser ha bloccato la nuova scheda. Consenti le finestre per questo sito e riprova.");
  }

  async function cambiaDocumento(riga, tipo, nuovoStato) {
    if (occupato) return;
    setMessaggio(""); setOccupato(`${riga.id}:${tipo}`);
    const { data, error } = await supabase.rpc("ars_comunione_segna_documento_parroco", {
      p_parrocchia_id: parrocchiaId, p_iscrizione_id: riga.id,
      p_tipo: tipo, p_stato: nuovoStato,
    });
    setOccupato("");
    if (error || !data) { setMessaggio("Documento non aggiornato: " + (error?.message || "errore")); return; }
    const aggiornati = { ...riga, documenti: [...(riga.documenti || []).filter(x => x.tipo !== tipo), data] };
    setDomande(precedenti => precedenti.map(d => d.id === riga.id ? aggiornati : d));
    if (!mancanzeDomanda(aggiornati, internoObbligatorio).tutto.length) {
      setApertaId(null);
      setMessaggio("Pratica completa: ora è consultabile nella sottocard «Archivio iscrizioni».");
    } else setMessaggio("Stato del documento aggiornato.");
  }

  function apriIntegrazione(riga) {
    setModificaId(riga.id); setCorrezioni(Object.fromEntries(CAMPI_INTEGRAZIONE.map(
      ([chiave]) => [chiave, String(riga.dati_modulo?.[chiave] || "")])));
    setMessaggio("");
  }

  async function salvaDati(riga) {
    if (occupato) return;
    const datiPatch = Object.fromEntries(Object.entries(correzioni).filter(
      ([chiave, valore]) => String(riga.dati_modulo?.[chiave] || "") !== valore
    ));
    if (!Object.keys(datiPatch).length) { setModificaId(null); return; }
    setOccupato(riga.id); setMessaggio("");
    const { data, error } = await supabase.rpc("ars_comunione_completa_dati_parroco", {
      p_parrocchia_id: parrocchiaId, p_iscrizione_id: riga.id, p_dati_patch: datiPatch,
    });
    setOccupato("");
    if (error || !data?.ok) { setMessaggio("Dati non salvati: " + (error?.message || "errore")); return; }
    const aggiornata = { ...riga, dati_modulo: data.dati_modulo };
    setDomande(prev => prev.map(x => x.id === riga.id ? aggiornata : x));
    setModificaId(null);
    if (!mancanzeDomanda(aggiornata, internoObbligatorio).tutto.length) {
      setApertaId(null);
      setMessaggio("Pratica completata. È ora nell'Archivio iscrizioni.");
    } else setMessaggio("Dati integrati nella domanda originale, senza creare duplicati.");
  }

  // Non esiste più una verifica manuale: ogni documento ricevuto aggiorna subito l'elenco.

  async function inviaSollecito(riga) {
    if (occupato) return;
    setOccupato(riga.id); setMessaggio("");
    const { data, error } = await supabase.rpc("ars_comunione_invia_sollecito_parroco", {
      p_parrocchia_id: parrocchiaId, p_iscrizione_id: riga.id,
    });
    setOccupato("");
    if (error || !data?.ok) { setMessaggio("Sollecito non inviato: " + (error?.message || "errore")); return; }
    setMessaggio("Sollecito registrato nella domanda. Non viene inviata una notifica in dashboard.");
    setAggiorna(n => n + 1);
  }

  return <section className="ars-sac-pannello ars-com-iscrizioni-pannello">
    <h3>Iscrizioni e rinnovi</h3>
    <p>Ogni domanda passa automaticamente da «Incomplete» a «Complete» quando sono presenti tutti i dati e i documenti richiesti. Non occorre approvarla o archiviare manualmente. I gruppi si formano nella card 05.</p>
    {internoObbligatorio === null && !caricamento && <p className="ars-com-errore-iscrizioni" role="alert">Impossibile leggere la regola dei certificati. Aggiorna l'elenco prima di considerare complete le domande.</p>}
    <button type="button" className="ars-sac-stampa" onClick={() => setAggiorna(v => v + 1)} disabled={caricamento}>Aggiorna elenco</button>
    <div className="ars-com-sottocard-grid" role="group" aria-label="Sezioni delle iscrizioni">
      <button type="button" onClick={() => cambiaSezione("incomplete")}
        className={`ars-com-sottocard ${sezioneCard === "incomplete" ? "ars-com-sottocard-attiva" : ""}`}>
        <strong>Domande incomplete</strong><span>{incomplete.length} pratiche da completare</span>
      </button>
      <button type="button" onClick={() => cambiaSezione("archivio")}
        className={`ars-com-sottocard ${sezioneCard === "archivio" ? "ars-com-sottocard-attiva" : ""}`}>
        <strong>Archivio iscrizioni</strong><span>{complete.length} pratiche complete</span>
      </button>
      <button type="button" onClick={() => cambiaSezione("segreteria")}
        className={`ars-com-sottocard ${sezioneCard === "segreteria" ? "ars-com-sottocard-attiva" : ""}`}>
        <strong>Nuova iscrizione in segreteria</strong><span>Con account o senza account</span>
      </button>
    </div>
    {messaggio && <p className="ars-com-messaggio-documenti" role="status">{messaggio}</p>}
    {ricevutaSegreteria && <section className="ars-com-ricevuta-nuova" aria-label="Ricevuta iscrizione da consegnare">
      <h4>Codice ricevuta della nuova domanda</h4>
      <p>Consegnalo al genitore. È necessario per ritrovare questa domanda e consultare gli eventuali solleciti su un altro dispositivo. Non pubblicarlo in bacheca.</p>
      <input aria-label="Codice ricevuta" readOnly value={ricevutaSegreteria}
        onFocus={e => e.target.select()} />
      <button type="button" className="ars-sac-stampa" onClick={() => setRicevutaSegreteria(null)}>
        Ho annotato e consegnato il codice</button>
    </section>}
    {sezioneCard === "segreteria" ?
      <NuovaIscrizioneComunioneSegreteria key={parrocchiaId}
        parrocchiaId={parrocchiaId} onSalvata={iscrizioneRegistrata}
        onAnnulla={() => cambiaSezione("incomplete")} /> : <>
      <h4 className="ars-com-titolo-lista">{sezioneCard === "incomplete" ? "Domande incomplete" : "Archivio delle domande complete"}</h4>
      {sezioneCard === "incomplete" &&
        <p>Le mancanze sono indicate in rosso. Il codice fiscale del bambino è facoltativo e non blocca la domanda.</p>}
      <div className="ars-com-filtri-iscrizioni">
        <label>Anno catechistico
          <select value={annoFiltro} onChange={e => { setAnnoFiltro(e.target.value); setPagina(1); setApertaId(null); }}>
            <option value="corrente">{annoCorrenteParrocchia ? `${annoCorrenteParrocchia} — anno corrente` : "Anno corrente"}</option>
            <option value="tutti">Tutti gli anni</option>
            {anni.filter(a => a !== annoCorrenteParrocchia).map(a => <option value={a} key={a}>{a}</option>)}
          </select>
        </label>
        <label>Cerca ragazzo o genitore
          <input type="search" value={ricerca} onChange={e => { setRicerca(e.target.value); setPagina(1); }} placeholder="Nome o cognome" />
        </label>
      </div>
      <div className="ars-com-riepilogo-iscrizioni">
        <span><strong>{filtrate.length}</strong> {sezioneCard === "incomplete" ? "domande incomplete" : "domande complete"}</span>
        <span><strong>{filtrate.filter(r => Number(r.anno_percorso) === 1).length}</strong> prime iscrizioni</span>
        <span><strong>{filtrate.filter(r => Number(r.anno_percorso) > 1).length}</strong> rinnovi</span>
      </div>
      {caricamento ? <p role="status">Caricamento iscrizioni…</p> : errore ?
        <p className="ars-com-errore-iscrizioni" role="alert">{errore}</p> :
        visualizzate.length ? <div className="ars-com-elenco-iscrizioni">
        {visualizzate.map(r => { const d = r.dati_modulo || {};
          const mancanze = mancanzeDomanda(r, internoObbligatorio);
          return <article className="ars-com-riga-iscrizione" key={r.id}>
            <div className="ars-com-anagrafica-iscrizione">
              <strong>{[d.nome, d.cognome].filter(Boolean).join(" ") || "Ragazzo"}</strong>
              <span>{r.anno_percorso}° anno · {r.anno_pastorale} · {mostraDataComunione(r.presentata_il)}</span>
              {d.modalitaPresentazione?.startsWith("segreteria_") && <small>Registrata in segreteria</small>}
              <small>Genitore: {[d.genitore1Nome, d.genitore1Cognome].filter(Boolean).join(" ") || "—"}</small>
              {mancanze.tutto.length > 0 ?
                <div className="ars-com-mancanze" role="status">
                  <strong>Pratica incompleta</strong>
                  {mancanze.dati.length > 0 && <><p>Dati da completare:</p><ul>{mancanze.dati.map(x => <li key={x}>{x}</li>)}</ul></>}
                  {mancanze.documenti.length > 0 && <><p>Documenti ancora da consegnare:</p>
                    <ul>{mancanze.documenti.map(doc => <li key={doc.tipo}>{doc.nome}</li>)}</ul></>}
                </div> : <small className="ars-com-stato-ok">Pratica completa</small>}
            </div>
            <div className="ars-com-azioni-domanda">
              <button type="button" className="ars-sac-stampa"
                onClick={() => { setApertaId(v => v === r.id ? null : r.id); setModificaId(null); setMessaggio(""); }}>
                {apertaId === r.id ? "Chiudi" : "Apri domanda"}
              </button>
              {r.stato === "presentata" && <button type="button" className="ars-com-annulla-iscrizione"
                onClick={() => apriAnnullamento(r)} disabled={Boolean(occupato)}>
                Annulla iscrizione
              </button>}
            </div>
            {apertaId === r.id && <div className="ars-com-scheda-iscrizione">
              <DomandaComunioneDettaglio riga={r} nomeParrocchia={nomeParrocchia} attestazioneDomanda={attestazioniDomanda[r.id]} />
              <button type="button" className="ars-sac-stampa" disabled={Boolean(occupato)}
                onClick={() => {setModificaDomandaId(v=>v === r.id ? null:r.id);setMessaggio("");}}>
                {modificaDomandaId === r.id ? "Chiudi modifica" : "Modifica iscrizione"}
              </button>
              {modificaDomandaId === r.id && <ModificaIscrizioneComunione
                parrocchiaId={parrocchiaId} iscrizioneId={r.id} operatoreParrocchia
                onAnnulla={() => setModificaDomandaId(null)}
                onSalvata={(esito) => {
                  setModificaDomandaId(null);setAggiorna(v=>v+1);
                  setMessaggio(esito?.account_ragazzo?.account_stato === "creato" ?
                    "Modifiche salvate e account del ragazzo creato." : "Modifiche salvate nella stessa iscrizione.");
                }} />}

              {sezioneCard === "incomplete" && <>
                <div className="ars-com-gestione-documenti">
                  <h4>Certificato di Battesimo</h4>
                  <p>Se consegnato di persona, basta un clic su «Segna ricevuto». Se inviato online, è già acquisito automaticamente.</p>
                  {DOCUMENTI_COMUNIONE.map(doc => { const ricevuto = documentoRicevuto(r, doc.tipo);
                    const richiesto = necessitaCertificatoComunione(r, internoObbligatorio);
                    return <div className="ars-com-riga-documento" key={doc.tipo}>
                      <span>{doc.nome}</span>
                      <strong className={ricevuto ? "ars-com-stato-ok" : "ars-com-stato-attesa"}>
                        {ricevuto ? "Ricevuto" : richiesto ? "Da consegnare" : "Non richiesto / da chiarire"}</strong>
                      {(r.foto || []).some(f => f.tipo===doc.tipo) && <button type="button"
                        className="ars-sac-stampa" disabled={Boolean(occupato)}
                        onClick={() => apriFotoParroco(r,doc.tipo)}>Apri documento</button>}
                      {richiesto && !ricevuto && <button type="button" className="ars-sac-stampa"
                        disabled={Boolean(occupato)} onClick={() => cambiaDocumento(r, doc.tipo, "ricevuto") }>
                        {occupato === `${r.id}:${doc.tipo}` ? "Salvataggio…" : "Segna ricevuto in segreteria"}
                      </button>}
                      {internoObbligatorio === false && typeof r.dati_modulo?.battesimoInQuestaParrocchia !== "boolean" && !ricevuto &&
                        <button type="button" className="ars-sac-stampa" disabled={Boolean(occupato)}
                          onClick={() => cambiaDocumento(r,doc.tipo,"non_necessario")}>
                          Confermo: Battesimo in questa parrocchia, certificato non richiesto
                        </button>}
                    </div>;
                  })}
                </div>
                {mancanze.documenti.length > 0 && <div className="ars-com-solleciti">
                  <h4>Promemoria per il certificato mancante</h4>
                  {r.richiedente_utente_id ? <>
                    <p>Il sollecito resterà dentro la domanda del genitore, non nelle notifiche della dashboard.</p>
                    <button type="button" className="ars-sac-conferma" disabled={Boolean(occupato)}
                      onClick={() => inviaSollecito(r)}>Invia sollecito al genitore</button>
                  </> : <p>Genitore senza account collegato: contattarlo tramite i recapiti indicati nella domanda.</p>}
                  {(r.solleciti || []).length > 0 && <div className="ars-com-storico-solleciti">
                    <strong>Storico solleciti</strong>
                    {r.solleciti.map(s => <p key={s.id}>
                      {mostraDataComunione(s.creato_il, true)} · {(s.documenti_mancanti || []).join(", ")}
                    </p>)}
                  </div>}
                </div>}
              </>}
              {sezioneCard === "archivio" && <div className="ars-com-gestione-documenti">
                <h4>Documentazione disponibile</h4>
                <p>La domanda è completa. I certificati eventualmente ricevuti rimangono consultabili.</p>
                {DOCUMENTI_COMUNIONE.map(doc => <div className="ars-com-riga-documento" key={doc.tipo}>
                  <span>{doc.nome}</span>
                  <strong className="ars-com-stato-ok">{documentoRicevuto(r,doc.tipo) ? "Ricevuto" : "Non richiesto"}</strong>
                  {(r.foto || []).some(f => f.tipo===doc.tipo) && <button type="button"
                    className="ars-sac-stampa" onClick={() => apriFotoParroco(r, doc.tipo)}>Apri documento</button>}
                  {documentoRicevuto(r,doc.tipo) && <button type="button" className="ars-sac-stampa"
                    disabled={Boolean(occupato)} onClick={() => cambiaDocumento(r,doc.tipo,"da_consegnare")}>
                      Segnala documento da sostituire
                    </button>}
                </div>)}
              </div>}
              <button type="button" className="ars-sac-conferma" onClick={async () => {
                if (attestazioniDomanda[r.id]?.stato !== "pronta") {
                  const { data, error } = await supabase.rpc("ars_comunione_leggi_conferma_parroco", {
                    p_parrocchia_id: parrocchiaId, p_iscrizione_id: r.id,
                  });
                  if (error) {
                    setMessaggio("Impossibile verificare la conferma della domanda per la stampa. Riprova.");
                    return;
                  }
                  setAttestazioniDomanda(prev => ({ ...prev, [r.id]: {
                    stato: "pronta", presente: data?.presente === true,
                    firmatario: data?.firmatario || "", confermata_il: data?.confermata_il || null,
                  } }));
                }
                setStampaId(r.id);
              }}>
                {r.privacy_presa_visione_il ? "Stampa domanda" : "Stampa domanda e informativa"}</button>
            </div>}
          </article>;
        })}</div> : <p className="ars-com-vuoto-iscrizioni">Nessuna domanda per l'anno e la ricerca selezionati.</p>}
      <div className="ars-com-piede-iscrizioni ars-com-paginazione">
        <label>Domande per pagina
          <select value={limite} onChange={e => { setLimite(Number(e.target.value)); setPagina(1); }}>
            {[20,50,100].map(n => <option value={n} key={n}>{n}</option>)}
          </select>
        </label>
        <button type="button" className="ars-sac-stampa" disabled={paginaAttiva <= 1}
          onClick={() => setPagina(p => Math.max(1,p-1))}>Precedenti</button>
        <span>Pagina {paginaAttiva} di {pagine}</span>
        <button type="button" className="ars-sac-stampa" disabled={paginaAttiva >= pagine}
          onClick={() => setPagina(p => Math.min(pagine,p+1))}>Successive</button>
        <button type="button" className="ars-sac-stampa" disabled={caricamento}
          onClick={() => {setAggiorna(n=>n+1);setMessaggio("");}}>Aggiorna elenco</button>
      </div>
    </>}
    {annullamento && <dialog ref={dialogoAnnullamento} className="ars-com-dialogo-annulla"
      aria-labelledby="ars-com-annulla-titolo" onCancel={e => { e.preventDefault(); chiudiAnnullamento(); }}>
      <h3 id="ars-com-annulla-titolo">Annullamento iscrizione</h3>
      <p>Sei sicuro di voler annullare l'iscrizione di <strong>{[annullamento.dati_modulo?.nome, annullamento.dati_modulo?.cognome].filter(Boolean).join(" ") || "questo bambino"}</strong> alla Prima Comunione?</p>
      <label className="ars-com-segreteria-deleghe">Motivo dell'annullamento (facoltativo)
        <textarea rows={3} value={motivoAnnullamento} disabled={Boolean(occupato)} onChange={e => setMotivoAnnullamento(e.target.value)} />
      </label>
      <p>Le eventuali somme versate saranno gestite in «Iscrizioni annullate e rimborsi».</p>
      {erroreAnnullamento && <p role="alert" className="ars-com-errore-iscrizioni">{erroreAnnullamento}</p>}
      <div className="ars-sac-conferma-pulsanti">
        <button type="button" autoFocus className="ars-sac-stampa" disabled={Boolean(occupato)} onClick={chiudiAnnullamento}>Torna indietro</button>
        <button type="button" className="ars-com-annulla-iscrizione" disabled={Boolean(occupato)} onClick={confermaAnnullamento}>{occupato ? "Annullamento…" : "Conferma annullamento"}</button>
      </div>
    </dialog>}
    {daStampare && <div className="ars-com-solo-stampa">
      <DomandaComunioneDettaglio riga={daStampare} nomeParrocchia={nomeParrocchia} attestazioneDomanda={attestazioniDomanda[daStampare.id]} perStampa />
    </div>}
  </section>;
}


const METODI_RIMBORSO_COMUNIONE = [
  ["consegna_diretta", "Consegna diretta"], ["bonifico", "Bonifico"],
  ["paypal", "PayPal"], ["link_pagamento", "Link di pagamento"],
];
const euroComunione = (v) => new Intl.NumberFormat("it-IT", {style:"currency",currency:"EUR"}).format(Number(v || 0));
// Consultazione delle posizioni annuali: usa la contabilità esistente, senza scritture.
function SituazioneEconomicaComunione({ parrocchiaId, anno, nomeParrocchia, onGestisciPagamenti, tornaDashboard }) {
  const [riepilogo, setRiepilogo] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [erroreStampa, setErroreStampa] = useState("");
  const [tentativo, setTentativo] = useState(0);
  useEffect(() => {
    let vivo = true;
    setRiepilogo(null); setCaricamento(true); setErrore(""); setErroreStampa("");
    (async () => {
      try {
        if (!parrocchiaId || !anno) throw new Error("Anno catechistico o parrocchia non disponibile.");
        const {data, error} = await supabase.rpc("ars_comunione_situazione_economica", {
          p_parrocchia_id: parrocchiaId, p_anno_pastorale: anno,
        });
        if (error) throw error;
        if (!data || !Array.isArray(data.iscritti) || data.numero_iscritti == null || data.totale_incassato == null)
          throw new Error("Riepilogo economico non disponibile.");
        if (vivo) setRiepilogo(data);
      } catch (err) {
        if (vivo) setErrore(err?.message || "Impossibile caricare la situazione economica.");
      } finally { if (vivo) setCaricamento(false); }
    })();
    return () => {vivo = false;};
  }, [parrocchiaId, anno, tentativo]);

  const nomeIscritto = r => [r.nome, r.cognome].filter(Boolean).join(" ");
  // La RPC comunica la modalità per anno pastorale nel riepilogo, non per ogni iscritto.
  const offertaLibera = riepilogo?.modalita_contribuzione === "offerta_libera";
  const quotaIscritto = r => offertaLibera ? "Offerta libera" : r.esente ? "Esente" : r.quota == null ? "Da definire" : euroComunione(r.quota);
  const residuoIscritto = r => offertaLibera ? "Non previsto" : r.residuo == null ? "—" : euroComunione(r.residuo);
  const iscritti = riepilogo?.iscritti || [];

  function stampaElenco() {
    if (!riepilogo || caricamento) return;
    setErroreStampa("");
    // Finestra di stampa isolata: nessuna informazione personale nell'URL,
    // intestazione comune con dati escapati, righe create con textContent, nessuna scrittura contabile.
    let finestra;
    try {
      finestra = window.open("about:blank", "_blank");
      if (!finestra) throw new Error("Il browser ha bloccato la stampa. Consenti le finestre per questo sito e riprova.");
      finestra.opener = null;
      const doc = finestra.document;
      doc.title = `Situazione economica Prima Comunione ${anno}`;
      doc.documentElement.lang = "it";
      const crea = (tag, testo, parent, classe) => {
        const nodo = doc.createElement(tag);
        if (testo != null) nodo.textContent = String(testo);
        if (classe) nodo.className = classe;
        parent.appendChild(nodo);
        return nodo;
      };
      const stile = crea("style", null, doc.head);
      stile.textContent = `${STILI_INTESTAZIONE_STAMPA_ARS}@page{size:A4 portrait;margin:15mm}body{margin:24px;color:#222;font:10.5pt/1.35 Arial,sans-serif}h1{font:700 17pt Georgia,serif;text-align:center;margin:0 0 9px}h2{font:700 13pt Georgia,serif;text-align:center;margin:0 0 9px}p{margin:5px 0}table{border-collapse:collapse;width:100%;margin-top:14px}th,td{padding:5px 7px;border-bottom:1px solid #bbb;text-align:left;vertical-align:top}th{border-top:1px solid #888;background:#f2f2f2;font-weight:700}th:not(:first-child),td:not(:first-child){text-align:right;white-space:nowrap}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}button{margin:18px 0;padding:8px 14px;cursor:pointer}@media print{body{margin:0}button{display:none}}`;
      const corpo = doc.body;
      corpo.replaceChildren();
      corpo.insertAdjacentHTML("afterbegin", intestazioneStampaArs(nomeParrocchia));
      crea("h1", `Prima Comunione ${anno} – Situazione economica degli iscritti`, corpo);
      crea("p", `Elenco al ${mostraDataComunione(new Date().toISOString(), true)}`, corpo);
      crea("p", `Numero iscritti: ${riepilogo.numero_iscritti}   ·   ${riepilogo.modalita_contribuzione === "offerta_libera" ? "Offerte incassate" : "Totale quote incassate"}: ${euroComunione(riepilogo.totale_incassato)}`, corpo);
      const tabella = crea("table", null, corpo);
      const testa = crea("tr", null, crea("thead", null, tabella));
      ["Nome e cognome", offertaLibera ? "Contributo" : "Quota", "Versato", offertaLibera ? "Obbligo residuo" : "Residuo"].forEach(t => crea("th", t, testa));
      const righe = crea("tbody", null, tabella);
      iscritti.forEach(r => {
        const tr = crea("tr", null, righe);
        [nomeIscritto(r), quotaIscritto(r), euroComunione(r.versato), residuoIscritto(r)].forEach(t => crea("td", t, tr));
      });
      if (!iscritti.length) crea("p", "Nessun iscritto per questo anno catechistico.", corpo);
      const pulsante = crea("button", "Stampa elenco", corpo);
      pulsante.addEventListener("click", () => finestra.print());
      finestra.focus();
      finestra.print();
    } catch (err) {
      setErroreStampa(err?.message || "Non è stato possibile avviare la stampa.");
    }
  }

  return <section className="ars-com-situazione-economica">
    <h4>Situazione economica degli iscritti</h4>
    <details className="ars-com-istruzioni-quote">
      <summary>? Come utilizzare questa pagina</summary>
      <p>Consulta i contributi registrati per ogni iscritto e per l'anno pastorale indicato.</p>
      <p>Con «Quota stabilita» leggi quota, versato e residuo. Con «Offerta libera» non esistono importi obbligatori né morosità.</p>
      <p>«Stampa elenco» prepara una copia per la parrocchia; «Gestisci i pagamenti» apre la contabilità dell'attività.</p>
    </details>
    {caricamento ? <p role="status">Caricamento situazione economica…</p> : errore ? <>
      <p className="ars-com-errore-iscrizioni" role="alert">{errore}</p>
      <button type="button" className="ars-sac-stampa" onClick={() => setTentativo(n => n + 1)}>Riprova</button>
    </> : riepilogo && <>
      <div className="ars-com-economica-indicatori">
        <div><span>Numero iscritti</span><strong>{riepilogo.numero_iscritti}</strong></div>
        <div><span>{riepilogo.modalita_contribuzione === "offerta_libera" ? "Offerte incassate" : "Totale quote incassate"}</span><strong className="ars-com-stato-ok">{euroComunione(riepilogo.totale_incassato)}</strong></div>
      </div>
      <div className="ars-com-economica-testa-elenco">
        <h5>Elenco degli iscritti</h5>
        <button type="button" className="ars-sac-stampa" onClick={stampaElenco}>Stampa elenco</button>
      </div>
      {erroreStampa && <p role="alert" className="ars-com-errore-iscrizioni">{erroreStampa}</p>}
      {iscritti.length ? <div className="ars-com-economica-scroll" tabIndex={0} role="region" aria-label="Elenco economico degli iscritti">
        <table className="ars-com-economica-tabella">
          <thead><tr><th scope="col">Nome e cognome</th><th scope="col">{offertaLibera ? "Contributo" : "Quota"}</th><th scope="col">Versato</th><th scope="col">{offertaLibera ? "Obbligo residuo" : "Residuo"}</th></tr></thead>
          <tbody>{iscritti.map(r => <tr key={r.iscrizione_id}>
            <td>{nomeIscritto(r)}</td>
            <td>{quotaIscritto(r)}</td>
            <td>{euroComunione(r.versato)}</td>
            <td className={offertaLibera || r.residuo == null ? "" : Number(r.residuo) > 0 ? "ars-com-residuo-aperto" : "ars-com-stato-ok"}>{residuoIscritto(r)}</td>
          </tr>)}</tbody>
        </table>
      </div> : <p>Nessun iscritto per questo anno catechistico.</p>}
    </>}
    <div className="ars-com-economica-collegamento">
      <p>Registra gli incassi e consulta il bilancio di <strong>«Prima Comunione {anno}»</strong> direttamente dalla gestione economica dell’attività.</p>
      <p>Gli incassi, le spese e i rimborsi di questa attività confluiscono nel bilancio generale della parrocchia.</p>
      {typeof onGestisciPagamenti === "function" ?
        <button type="button" className="ars-sac-conferma" onClick={() => onGestisciPagamenti(anno)}>Gestisci i pagamenti</button>
        : typeof tornaDashboard === "function" ?
          <button type="button" className="ars-sac-conferma" onClick={() => tornaDashboard()}>Vai alla dashboard del parroco</button>
          : null}
    </div>
  </section>;
}

function QuoteComunioneParroco({ parrocchiaId, annoAttivo, nomeParrocchia, onGestisciPagamenti, tornaDashboard, sezioneIniziale = "quote" }) {
  const [config, setConfig] = useState(null);
  const [quote, setQuote] = useState({});
  const [modalitaScelta, setModalitaScelta] = useState("quota_stabilita");
  const [motivi, setMotivi] = useState({});
  const [rimborsi, setRimborsi] = useState([]);
  const [metodi, setMetodi] = useState({});
  const [sezione, setSezione] = useState(sezioneIniziale);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [erroreRimborsi, setErroreRimborsi] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [occupato, setOccupato] = useState("");
  const blocco = useRef(false);
  const [aggiorna, setAggiorna] = useState(0);
  const [daStampare, setDaStampare] = useState(null);
  const [documentiRecenti, setDocumentiRecenti] = useState({});
  useEffect(() => {
    let vivo = true;
    setCaricamento(true); setErrore(""); setErroreRimborsi("");
    setConfig(null); setRimborsi([]);
    (async () => {
      try {
        const {data, error} = await supabase.from("ars_comunione_impostazioni")
          .select("anno_pastorale,durata,quota_anno_1,quota_anno_2,quota_anno_3,modalita_contribuzione")
          .eq("parrocchia_id", parrocchiaId).maybeSingle();
        if (!vivo) return;
        if (error || !data) throw error || new Error("Salva prima le impostazioni dell'anno catechistico.");
        setConfig(data);
        setModalitaScelta(data.modalita_contribuzione || "quota_stabilita");
        setQuote(Object.fromEntries([1,2,3].map(n => [n, data[`quota_anno_${n}`] == null ? "" : String(data[`quota_anno_${n}`])])));
        setMotivi({});
        const elenco = await supabase.rpc("ars_comunione_elenco_rimborsi", {p_parrocchia_id:parrocchiaId,p_anno_pastorale:data.anno_pastorale});
        if (!vivo) return;
        if (elenco.error || !Array.isArray(elenco.data)) setErroreRimborsi(elenco.error?.message || "Elenco rimborsi non disponibile.");
        else setRimborsi(elenco.data);
      } catch (err) { if (vivo) setErrore(err?.message || "Dati non disponibili."); }
      finally { if (vivo) setCaricamento(false); }
    })();
    return () => { vivo = false; };
  }, [parrocchiaId, annoAttivo, aggiorna]);

  async function salvaModalitaContribuzione() {
    if (blocco.current || !config ||
       modalitaScelta === (config.modalita_contribuzione || "quota_stabilita")) return;
    blocco.current = true; setOccupato("modalita"); setMessaggio("");
    try {
      const {data,error} = await supabase.rpc("ars_comunione_imposta_modalita_contribuzione", {
        p_parrocchia_id:parrocchiaId,
        p_anno_pastorale:config.anno_pastorale,
        p_modalita:modalitaScelta,
      });
      if(error || data?.ok !== true) throw error || new Error("Modalità non aggiornata.");
      setConfig(prev => ({...prev,modalita_contribuzione:modalitaScelta}));
      setMessaggio(modalitaScelta === "offerta_libera"
        ? "Offerta libera attivata. Le famiglie non hanno alcuna quota obbligatoria da saldare."
        : "Quota stabilita attivata per l’anno pastorale selezionato.");
      setAggiorna(n=>n+1);
    }catch(err){setMessaggio("Impossibile salvare la modalità: "+(err?.message||"riprova"));}
    finally{blocco.current=false;setOccupato("");}
  }

  function valoreQuota(n) {
    const s = String(quote[n] ?? "").trim().replace(",", ".");
    return /^\d+(\.\d{1,2})?$/.test(s) && Number.isFinite(Number(s)) ? Number(s) : null;
  }
  async function salvaQuota(n) {
    if (blocco.current || !config) return;
    const importo = valoreQuota(n);
    if (importo === null) {setMessaggio("Inserisci un importo valido, anche 0 se non è prevista una quota.");return;}
    blocco.current = true; setOccupato(`quota:${n}`); setMessaggio("");
    try {
      const {data,error} = await supabase.rpc("ars_comunione_imposta_quota", {
        p_parrocchia_id:parrocchiaId, p_anno_pastorale:config.anno_pastorale,
        p_anno_percorso:n, p_nuova_quota:importo, p_motivo:motivi[n]?.trim() || null,
      });
      if (error) throw error;
      if (data?.ok === false) throw new Error(data?.messaggio || "Quota non salvata.");
      setConfig(prev => ({...prev,[`quota_anno_${n}`]:importo}));
      setQuote(prev => ({...prev,[n]:String(importo)})); setMotivi(prev=>({...prev,[n]:""}));
      setMessaggio(`Quota del ${n}° anno salvata.`);
    } catch (err) {setMessaggio("Quota non salvata: " + (err?.message || "riprova"));}
    finally {blocco.current=false;setOccupato("");}
  }
  function avviaStampa(riga, documenti) {
    if (!Array.isArray(documenti) || !documenti.length) {setMessaggio("Rimborso registrato, ma il documento non è disponibile per la stampa.");return;}
    setDaStampare({riga, documenti});
  }
  useEffect(() => {
    if (!daStampare) return;
    const classe="ars-com-stampa-rimborso";
    const fine=()=>{document.body.classList.remove(classe);setDaStampare(null);};
    document.body.classList.add(classe);
    window.addEventListener("afterprint",fine);
    const timer=window.setTimeout(()=>{try{window.print();}catch{fine();setMessaggio("Stampa non avviata. Il rimborso resta registrato.");}},180);
    return ()=>{window.clearTimeout(timer);window.removeEventListener("afterprint",fine);document.body.classList.remove(classe);};
  },[daStampare]);
  async function rimborsa(riga) {
    if (blocco.current || !(Number(riga.da_restituire)>0)) return;
    blocco.current=true;setOccupato(riga.iscrizione_id);setMessaggio("");
    try {
      const {data,error}=await supabase.rpc("ars_comunione_rimborsa_iscrizione",{
        p_parrocchia_id:parrocchiaId,p_iscrizione_id:riga.iscrizione_id,
        p_metodo:metodi[riga.iscrizione_id] || "consegna_diretta",
      });
      if(error || !data?.ok) throw error || new Error("Rimborso non confermato.");
      const documenti=Array.isArray(data.documenti)?data.documenti:[];
      setDocumentiRecenti(prev=>({...prev,[riga.iscrizione_id]:documenti}));
      setRimborsi(prev=>prev.map(x=>x.iscrizione_id!==riga.iscrizione_id?x:{...x,
        totale_rimborsato:Number(x.totale_rimborsato||0)+Number(data.rimborsato_ora||0),
        da_restituire:data.da_restituire,pagamenti_in_attesa:data.pagamenti_in_attesa,
        stato_rimborso:data.pratica_conclusa?"rimborsato":"incassi_da_verificare"}));
      setMessaggio(Number(data.rimborsato_ora)>0 ? `Rimborso registrato: ${euroComunione(data.rimborsato_ora)}.` : "Nessuna nuova somma da rimborsare.");
      if (Number(data.rimborsato_ora)>0) {
        const precedenti = new Set([
          ...(documentiRecenti[riga.iscrizione_id] || []).map(d=>d.id),
          ...(riga.versamenti || []).flatMap(p=>(p.regolazioni || []).map(q=>q.documento_id).filter(Boolean)),
        ]);
        const nuovi = documenti.filter(d=>!precedenti.has(d.id));
        const somma = nuovi.reduce((tot,d)=>tot+Math.round(Number(d.importo||0)*100),0);
        if (somma === Math.round(Number(data.rimborsato_ora)*100)) avviaStampa(riga,nuovi);
        else setMessaggio("Rimborso registrato. I documenti sono disponibili con «Ristampa ricevuta».");
      }
      // Rileggi lo stato effettivo anche se un altro operatore ha già registrato il rimborso.
      setAggiorna(n=>n+1);
    }catch(err){setMessaggio("Non è stato possibile confermare il rimborso: "+(err?.message||"riprova"));}
    finally{blocco.current=false;setOccupato("");}
  }
  async function ristampa(riga) {
    if (blocco.current) return;
    // Una ristampa non deve MAI invocare una funzione che registra denaro.
    const memorizzati=documentiRecenti[riga.iscrizione_id];
    if(memorizzati?.length){avviaStampa(riga,memorizzati);return;}
    const ids=[...new Set((riga.versamenti||[]).flatMap(p=>(p.regolazioni||[]).filter(q=>q.tipo==="rimborso" && q.documento_id).map(q=>q.documento_id)))];
    if(!ids.length){setMessaggio("Nessuna ricevuta disponibile per la ristampa.");return;}
    blocco.current=true;setOccupato(`stampa:${riga.iscrizione_id}`);
    try{
      const {data,error}=await supabase.from("ars_documenti_economici")
        .select("id,anno,numero,data_documento,nominativo,causale,importo,valuta,dati_documento,tipo_documento")
        .eq("parrocchia_id",parrocchiaId).eq("tipo_documento","rimborso").in("id",ids).order("anno").order("numero");
      if(error||!Array.isArray(data)||data.length!==ids.length)throw error||new Error("Documenti non accessibili o incompleti.");
      avviaStampa(riga,data);
    }catch(err){setMessaggio("Ristampa non disponibile: "+(err?.message||"riprova"));}
    finally{blocco.current=false;setOccupato("");}
  }
  return <section className="ars-sac-pannello ars-com-quote-pannello">
    <h3>Quote e iscrizioni</h3>
    <p>Prima Comunione {config?.anno_pastorale || annoAttivo}</p>
    <div className="ars-com-sottocard-grid ars-com-quote-sottocard" role="group" aria-label="Gestione economica">
      {[["quote","Quote annuali","Definisci la quota per ogni anno"],["situazione","Situazione economica degli iscritti","Versamenti, acconti, saldi e quote da pagare"],["rimborsi","Iscrizioni annullate e rimborsi","Restituzioni e ricevute"]].map(([id,titolo,descrizione])=><button key={id} type="button" disabled={Boolean(occupato)} className={`ars-com-sottocard ${sezione===id?"ars-com-sottocard-attiva":""}`} onClick={()=>{setSezione(id);setMessaggio("");}}><strong>{titolo}</strong><span>{descrizione}</span></button>)}
    </div>
    {messaggio&&<p role="status" className="ars-com-messaggio-documenti">{messaggio}</p>}
    {caricamento?<p role="status">Caricamento…</p>:errore?<p role="alert" className="ars-com-errore-iscrizioni">{errore}</p>:sezione==="quote"?<>
      <details className="ars-com-istruzioni-quote">
        <summary>? Come utilizzare questa pagina</summary>
        <p>Seleziona la modalità di contribuzione per l’anno pastorale visualizzato.</p>
        <p>Con «Quota stabilita» puoi definire importi differenti per anno di Catechismo. Con «Offerta libera» ogni famiglia sceglie se e quanto contribuire, senza risultare morosa.</p>
        <p>La scelta non cancella i versamenti o le ricevute già registrati.</p>
      </details>
      <fieldset className="ars-com-quota-anno" disabled={Boolean(occupato)}>
        <legend>Modalità di contribuzione</legend>
        <p className="ars-com-modalita-intro">Contributo richiesto alle famiglie</p>
        <div className="ars-com-modalita-scelte" role="radiogroup" aria-label="Contributo richiesto alle famiglie">
          <label className={`ars-com-modalita-opzione ${modalitaScelta === "quota_stabilita" ? "ars-com-modalita-selezionata" : ""}`}>
            <input type="radio" name="ars-com-modalita-contribuzione" value="quota_stabilita"
              checked={modalitaScelta === "quota_stabilita"}
              onChange={() => setModalitaScelta("quota_stabilita")} />
            <span className="ars-com-modalita-testo">
              <strong>Quota stabilita dalla parrocchia</strong>
              <small>La parrocchia definisce l'importo annuale.</small>
            </span>
          </label>
          <label className={`ars-com-modalita-opzione ${modalitaScelta === "offerta_libera" ? "ars-com-modalita-selezionata" : ""}`}>
            <input type="radio" name="ars-com-modalita-contribuzione" value="offerta_libera"
              checked={modalitaScelta === "offerta_libera"}
              onChange={() => setModalitaScelta("offerta_libera")} />
            <span className="ars-com-modalita-testo">
              <strong>Offerta libera</strong>
              <small>Ogni famiglia decide liberamente quanto versare.</small>
            </span>
          </label>
        </div>
        <p>Questa scelta riguarda la Prima Comunione dell’anno {config.anno_pastorale}.</p>
        <button type="button" className="ars-sac-conferma" onClick={salvaModalitaContribuzione}
          disabled={Boolean(occupato) || modalitaScelta === (config.modalita_contribuzione || "quota_stabilita")}>
          {occupato==="modalita" ? "Salvataggio…" : "Salva modalità"}
        </button>
      </fieldset>
      {modalitaScelta !== (config.modalita_contribuzione || "quota_stabilita") &&
        <p className="ars-com-quote-libera">La nuova scelta non è ancora attiva: premi «Salva modalità» per applicarla.</p>}
      {(config.modalita_contribuzione || "quota_stabilita") === "offerta_libera" ?
        <p className="ars-com-quote-libera">Offerta libera attiva: nessuna quota obbligatoria. Le famiglie potranno decidere autonomamente quanto versare nella sezione «Quote e pagamenti».</p>
        : Array.from({length:Number(config.durata)||2},(_,i)=>i+1).map(n=>{
        const precedente=config[`quota_anno_${n}`]; const importo=valoreQuota(n);
        const variazione=precedente!=null&&importo!==null&&Number(precedente)!==importo;
        return <fieldset className="ars-com-quota-anno" key={n} disabled={Boolean(occupato)}>
          <legend>{n}° anno del percorso</legend>
          <p>{precedente==null?"Quota da definire":`Quota attuale: ${euroComunione(precedente)}`}</p>
          <label>Quota annuale (€)<input inputMode="decimal" value={quote[n]??""} onChange={e=>setQuote(p=>({...p,[n]:e.target.value}))} placeholder="Da definire"/></label>
          {variazione&&<label>Motivo della variazione (facoltativo)<textarea rows={2} value={motivi[n]||""} onChange={e=>setMotivi(p=>({...p,[n]:e.target.value}))}/></label>}
          <button type="button" className="ars-sac-conferma" disabled={importo===null||(precedente!=null&&Number(precedente)===importo)||Boolean(occupato)} onClick={()=>salvaQuota(n)}>{occupato===`quota:${n}`?"Salvataggio…":"Salva quota"}</button>
        </fieldset>;
      })}
    </>:sezione==="situazione"?<SituazioneEconomicaComunione key={`${parrocchiaId}:${config.anno_pastorale}`}
      parrocchiaId={parrocchiaId} anno={config.anno_pastorale} nomeParrocchia={nomeParrocchia}
      onGestisciPagamenti={onGestisciPagamenti} tornaDashboard={tornaDashboard} />:<>
      <h4>Iscrizioni annullate e rimborsi</h4>
      <p>Al momento della restituzione del denaro, premi «Rimborsa e stampa ricevuta».</p>
      {erroreRimborsi?<p role="alert" className="ars-com-errore-iscrizioni">{erroreRimborsi}</p>:!rimborsi.length?<p>Nessuna iscrizione annullata per questo anno.</p>:
        [...rimborsi].sort((a,b)=>Number(Number(b.da_restituire)>0)-Number(Number(a.da_restituire)>0)).map(r=>{
          const residuo=Number(r.da_restituire||0), attesa=Number(r.pagamenti_in_attesa||0);
          return <article className="ars-com-rimborso-riga" key={r.iscrizione_id}>
            <h4>{r.nome} {r.cognome}</h4>
            <p>{r.anno_percorso}° anno · {r.anno_pastorale}{r.genitore?` · Genitore: ${r.genitore}`:""}</p>
            <p>Versato: <strong>{euroComunione(r.totale_versato)}</strong> · Rimborsato: <strong>{euroComunione(r.totale_rimborsato)}</strong></p>
            {residuo>0?<><strong className="ars-com-rimborso-importo">Da restituire: {euroComunione(residuo)}</strong>
              <label>Modalità di restituzione<select value={metodi[r.iscrizione_id]||"consegna_diretta"} disabled={Boolean(occupato)} onChange={e=>setMetodi(p=>({...p,[r.iscrizione_id]:e.target.value}))}>{METODI_RIMBORSO_COMUNIONE.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
              <button type="button" className="ars-sac-conferma" disabled={Boolean(occupato)} onClick={()=>rimborsa(r)}>{occupato===r.iscrizione_id?"Registrazione…":"Rimborsa e stampa ricevuta"}</button>
            </>:attesa<=0?<p className="ars-com-stato-ok">{Number(r.totale_rimborsato)>0?"Rimborso completato":Number(r.totale_donato)>0?"Pratica regolata":"Nessun rimborso necessario"}</p>:null}
            {attesa>0&&<p className="ars-com-stato-attesa">Incassi da verificare: {euroComunione(attesa)}</p>}
            {Number(r.totale_rimborsato)>0&&<button type="button" className="ars-sac-stampa" disabled={Boolean(occupato)} onClick={()=>ristampa(r)}>Ristampa ricevuta</button>}
          </article>;
        })}
    </>}
    {erroreRimborsi&&sezione==="rimborsi"&&<button type="button" className="ars-sac-stampa" onClick={()=>setAggiorna(n=>n+1)}>Riprova</button>}
    {daStampare&&<div className="ars-com-rimborso-stampa"><RicevutaRimborsoComunione riga={daStampare.riga} documenti={daStampare.documenti}/></div>}
  </section>;
}
function RicevutaRimborsoComunione({riga,documenti}) {
  // Ogni documento conserva la propria intestazione emessa (nessuna sostituzione con dati odierni).
  return <article><style>{STILI_INTESTAZIONE_STAMPA_ARS}</style><h2>{documenti.length>1?"Prospetto delle ricevute di rimborso":"Ricevuta di rimborso"}</h2>
    <p>Prima Comunione · {riga.anno_pastorale} · {riga.nome} {riga.cognome}</p>
    {documenti.map(d=>{
      const dati=d.dati_documento||{}, h=dati.intestazione_parrocchia||{};
      const metodo=METODI_RIMBORSO_COMUNIONE.find(([v])=>v===dati.metodo_rimborso)?.[1]||dati.metodo_rimborso;
      return <section className="ars-com-documento-rimborso" key={d.id}>
        <div dangerouslySetInnerHTML={{__html:intestazioneStampaArs(h.nome || "Intestazione non disponibile nel documento storico", [
          [h.indirizzo,[h.cap,h.comune,h.provincia].filter(Boolean).join(" ")].filter(Boolean).join(" · "),
          h.diocesi ? `Diocesi: ${h.diocesi}` : "", h.codice_fiscale ? `Codice fiscale: ${h.codice_fiscale}` : "",
          [h.telefono,h.email,h.sito_web].filter(Boolean).join(" · ")
        ])}} />
        <p><strong>Documento n. {d.numero}/{d.anno}</strong> · {mostraDataComunione(d.data_documento)}</p>
        <p>Intestatario del documento: {d.nominativo||dati.genitore||"—"}</p>
        <p>Iscritto: {dati.iscritto||[riga.nome,riga.cognome].filter(Boolean).join(" ")}</p>
        <p>{d.causale||"Rimborso quota"}{metodo?` · ${metodo}`:""}</p>
        <p>Importo: <strong>{euroComunione(d.importo)}</strong></p>
      </section>;
    })}
    <h3>Totale dei rimborsi riportati: {euroComunione(documenti.reduce((s,d)=>s+Number(d.importo||0),0))}</h3>
    <p>Il sottoscritto conferma di aver ricevuto le somme sopra indicate.</p>
    <p>Nome e cognome di chi riceve: __________________________________</p>
    <p>Luogo e data: _______________________</p>
    <p>Firma del genitore o tutore: ____________________________________</p>
  </article>;
}

function GruppiChatComunione({ parrocchiaId, annoPastorale, durata }) {
  const [anno, setAnno] = useState(1);
  const [quadro, setQuadro] = useState(null);
  const [errore, setErrore] = useState("");
  const [aperto, setAperto] = useState(null);
  const [ricarica, setRicarica] = useState(0);
  const [gruppoDaRinominare, setGruppoDaRinominare] = useState(null);
  const [nomeGruppo, setNomeGruppo] = useState("");

  useEffect(() => {
    let corrente = true;
    setQuadro(null);
    setErrore("");
    async function carica() {
      try {
        const { data, error } = await supabase.rpc("ars_comunione_quadro_gruppi", {
          p_parrocchia_id: parrocchiaId, p_anno_pastorale: annoPastorale, p_anno_percorso: anno
        });
        if (error) throw error;
        if (corrente) setQuadro(data);
      } catch (e) {
        if (corrente) setErrore(e.message || "Impossibile caricare i gruppi.");
      }
    }
    if (parrocchiaId && annoPastorale) carica();
    return () => { corrente = false; };
  }, [anno, annoPastorale, parrocchiaId, ricarica]);

  const [massimo, setMassimo] = useState("");
  const [catechisti, setCatechisti] = useState("");
  const disponibili = Number(quadro?.totale_da_assegnare || 0);
  const capienza = Number(massimo);
  const educatori = Number(catechisti);
  const gruppiPrevisti = Number.isInteger(capienza) && capienza > 0 && capienza <= 2147483647
    ? Math.ceil(disponibili / capienza) : 0;
  const conteggioValido = catechisti !== "" && Number.isSafeInteger(educatori) && educatori >= 0;
  const taglio = gruppiPrevisti ? Math.floor(disponibili / gruppiPrevisti) : 0;
  const grandi = gruppiPrevisti ? disponibili % gruppiPrevisti : 0;
  function descrivi(numero, dimensione) {
    return numero + (numero === 1 ? " gruppo da " : " gruppi da ") + dimensione +
      (dimensione === 1 ? " ragazzo" : " ragazzi");
  }
  const [selezione, setSelezione] = useState([]);
  const [destinazione, setDestinazione] = useState("");
  const [avviso, setAvviso] = useState("");
  const [occupato, setOccupato] = useState(false);
  const operazione = useRef(false);

  async function aggiornaGruppi(genera) {
    if (operazione.current) return;
    operazione.current = true;
    setOccupato(true);
    setAvviso("");
    try {
      const base = { p_parrocchia_id: parrocchiaId, p_anno_pastorale: annoPastorale, p_anno_percorso: anno };
      const risposta = genera
        ? await supabase.rpc("ars_comunione_genera_gruppi", { ...base, p_massimo: Number(massimo) })
        : await supabase.rpc("ars_comunione_assegna_ragazzi", {
            ...base, p_gruppo_destinazione: destinazione === "liberi" ? null : destinazione,
            p_selezione: quadro.ragazzi.filter(r => selezione.includes(r.iscrizione_id)).map(r => ({
              iscrizione_id: r.iscrizione_id, gruppo_annuale_id: r.gruppo_annuale_id
            }))
          });
      if (risposta.error) throw risposta.error;
      setAvviso(genera ? "Gruppi creati: " + risposta.data.numero_gruppi : "Assegnazioni aggiornate.");
    } catch (e) {
      setAvviso(e.message || "Operazione non riuscita. Controlla l’elenco aggiornato.");
    } finally {
      operazione.current = false; setOccupato(false);
      setSelezione([]); setDestinazione(""); setQuadro(null); setRicarica(n => n + 1);
    }
  }

  function iniziaRinomina(gruppo) {
    setGruppoDaRinominare(gruppo.gruppo_annuale_id);
    setNomeGruppo(gruppo.nome || "");
    setAvviso("");
  }

  function annullaRinomina() {
    setGruppoDaRinominare(null);
    setNomeGruppo("");
  }

  async function rinominaGruppo(evento, gruppo) {
    evento.preventDefault();
    const nome = nomeGruppo.trim();
    if (!nome || occupato || operazione.current) return;
    operazione.current = true;
    setOccupato(true);
    setAvviso("");
    try {
      const { data, error } = await supabase.rpc("ars_comunione_rinomina_gruppo", {
        p_parrocchia_id: parrocchiaId,
        p_gruppo_annuale_id: gruppo.gruppo_annuale_id,
        p_nuovo_nome: nome
      });
      if (error) throw error;
      if (!data?.ok) throw new Error("Il nome del gruppo non è stato aggiornato.");
      annullaRinomina();
      setAvviso("Nome del gruppo aggiornato: " + data.nome);
      setQuadro(null);
      setRicarica(n => n + 1);
    } catch (e) {
      setAvviso(e.message || "Impossibile rinominare il gruppo.");
    } finally {
      operazione.current = false;
      setOccupato(false);
    }
  }

  if (aperto) return <ChatGruppoComunione key={aperto.gruppo_annuale_id} gruppo={aperto}
    indietro={() => { setAperto(null); setRicarica(n => n + 1); }} />;

  return <section className="ars-sac-dettaglio ars-gruppi-chat">
    <h3>Gruppi di catechismo</h3>
    <details><summary>Come utilizzare questa pagina</summary>
      <p>Scegli l’anno e indica i catechisti disponibili e il massimo di ragazzi per gruppo. Controlla la proposta prima di salvare. Usa «Rinomina gruppo» per dare a un gruppo un nome personalizzato senza cambiare iscritti o messaggi della chat. Per cambiare le assegnazioni, seleziona i ragazzi e il gruppo di destinazione.</p>
    </details>
    <label>Anno di percorso <select disabled={occupato} value={anno} onChange={e => {
      setSelezione([]); setAvviso(""); setCatechisti(""); setMassimo(""); setDestinazione(""); annullaRinomina(); setQuadro(null); setAnno(Number(e.target.value));
    }}>{[1, 2, 3].filter(n => n <= Number(durata)).map(n =>
      <option key={n} value={n}>{n}° anno</option>)}</select></label>
    {avviso && <p role="status">{avviso}</p>}
    {quadro && <form onSubmit={e => { e.preventDefault(); aggiornaGruppi(true); }}>
      <p>{quadro.totale_da_assegnare} ragazzi con iscrizione completa da assegnare.</p>
      <label>Catechisti disponibili per questi ragazzi <input type="number" min="0" step="1" required
        value={catechisti} disabled={occupato} onChange={e => setCatechisti(e.target.value)} /></label>
      <label>Numero massimo di ragazzi per gruppo <input type="number" min="1" max="2147483647" step="1"
        required value={massimo} disabled={occupato} onChange={e => setMassimo(e.target.value)} /></label>
      {gruppiPrevisti > 0 && <div aria-live="polite">
        <p><strong>Distribuzione proposta</strong><br />
          {[grandi > 0 && descrivi(grandi, taglio + 1), descrivi(gruppiPrevisti - grandi, taglio)].filter(Boolean).join(" e ")}.
        </p>
        {conteggioValido && <p>{educatori === 0
          ? "Non hai indicato catechisti disponibili. Puoi comunque salvare i gruppi."
          : educatori < gruppiPrevisti
          ? "Per coprire tutti i gruppi, almeno un catechista dovrà seguirne più di uno. Per avere un solo gruppo per catechista, imposta il massimo ad almeno " + Math.ceil(disponibili / educatori) + " ragazzi."
          : "I catechisti disponibili bastano per affidare ogni gruppo a una persona diversa."}</p>}
      </div>}
      <button type="submit" disabled={occupato || !gruppiPrevisti || !conteggioValido}>
        {gruppiPrevisti === 1 ? "Salva il gruppo" : gruppiPrevisti ? "Salva i " + gruppiPrevisti + " gruppi" : "Salva gruppi"}
      </button>
    </form>}
    {errore ? <p role="alert">{errore} <button onClick={() => setRicarica(n => n + 1)}>Riprova</button></p>
      : !quadro ? <p>Caricamento gruppi…</p>
      : !quadro.gruppi.length ? <p>Nessun gruppo per questo anno di percorso.</p>
      : quadro.gruppi.map(g => <article key={g.gruppo_annuale_id}>
        <h4>{g.nome}</h4><p>Ragazzi assegnati: {g.numero_ragazzi}</p>
        <div className="ars-sac-azioni">
          <button type="button" disabled={occupato} onClick={() => setAperto(g)}>Apri chat</button>
          <button type="button" className="ars-sac-stampa" disabled={occupato}
            onClick={() => gruppoDaRinominare === g.gruppo_annuale_id ? annullaRinomina() : iniziaRinomina(g)}>
            {gruppoDaRinominare === g.gruppo_annuale_id ? "Chiudi modifica nome" : "Rinomina gruppo"}
          </button>
        </div>
        {gruppoDaRinominare === g.gruppo_annuale_id && <form
          onSubmit={e => rinominaGruppo(e, g)} className="ars-sac-form">
          <label>Nuovo nome del gruppo
            <input type="text" required value={nomeGruppo} disabled={occupato}
              onChange={e => setNomeGruppo(e.target.value)} />
          </label>
          <div className="ars-sac-azioni">
            <button type="submit" className="ars-sac-conferma"
              disabled={occupato || !nomeGruppo.trim() || nomeGruppo.trim() === g.nome}>
              {occupato ? "Salvataggio…" : "Salva nome"}
            </button>
            <button type="button" disabled={occupato} onClick={annullaRinomina}>Annulla</button>
          </div>
        </form>}
      </article>)}
    {quadro?.gruppi.length > 0 && quadro.ragazzi.length > 0 && <details>
      <summary>Modifica assegnazioni</summary>
      <fieldset disabled={occupato}><legend>Seleziona i ragazzi da spostare</legend>
        {quadro.ragazzi.map(r => <label key={r.iscrizione_id} style={{display:"block", textAlign:"left"}}>
          <input type="checkbox" checked={selezione.includes(r.iscrizione_id)} onChange={e =>
            setSelezione(e.target.checked ? [...selezione, r.iscrizione_id] : selezione.filter(id => id !== r.iscrizione_id))} />
          {" "}{r.cognome} {r.nome} · {r.nome_gruppo || "Da assegnare"}
        </label>)}
        <label>Destinazione <select value={destinazione} onChange={e => setDestinazione(e.target.value)}>
          <option value="">Scegli la destinazione</option>
          {quadro.gruppi.map(g => <option key={g.gruppo_annuale_id} value={g.gruppo_annuale_id}>{g.nome}</option>)}
          <option value="liberi">Da assegnare</option>
        </select></label>
        <button disabled={!selezione.length || !destinazione} onClick={() => aggiornaGruppi(false)}>Sposta selezionati</button>
      </fieldset>
    </details>}
  </section>;
}

function ChatGruppoComunione({ gruppo, indietro }) {
  const [pagina, setPagina] = useState(null);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [busy, setBusy] = useState(false);
  const blocco = useRef(false);
  const invio = useRef(null);
  const parametri = { p_gruppo_id: gruppo.gruppo_id };

  async function rpc(nome, extra = {}) {
    const { data, error } = await supabase.rpc("ars_comunione_chat_" + nome, { ...parametri, ...extra });
    if (error) throw error;
    return data;
  }
  async function leggi(extra) {
    const data = await rpc("leggi", extra);
    if (data.accesso.gruppo_annuale_id !== gruppo.gruppo_annuale_id)
      throw new Error("Il gruppo annuale è cambiato. Torna ai gruppi.");
    return data;
  }

  useEffect(() => {
    let attiva = true;
    leggi().then(data => { if (attiva) setPagina(data); })
      .catch(e => { if (attiva) setErrore(e.message || "Lettura non riuscita."); });
    return () => { attiva = false; };
  }, [gruppo.gruppo_annuale_id, gruppo.gruppo_id]);

  async function esegui(azione) {
    if (blocco.current) return;
    blocco.current = true; setBusy(true); setErrore("");
    try { await azione(); }
    catch (e) { setErrore(e.message || "Operazione non riuscita. Riprova."); }
    finally { blocco.current = false; setBusy(false); }
  }

  async function invia() {
    if (!testo.trim()) return;
    if (!invio.current) invio.current = crypto.randomUUID();
    await rpc("invia", { p_gruppo_annuale_id: gruppo.gruppo_annuale_id,
      p_invio_id: invio.current, p_testo: testo });
    setTesto(""); invio.current = null;
    setPagina(await leggi());
  }

  async function precedenti() {
    const primo = pagina.messaggi[0];
    const prima = await leggi({ p_prima_del: primo.inviato_il, p_prima_id: primo.id });
    setPagina({ ...prima, messaggi: [...prima.messaggi, ...pagina.messaggi] });
  }

  return <section className="ars-sac-dettaglio ars-gruppi-chat">
    <button disabled={busy} onClick={indietro}>Torna ai gruppi</button>
    <h3>Chat · {gruppo.nome}</h3>
    <details><summary>Come utilizzare questa pagina</summary>
      <p>Scrivi il messaggio e premi Invia. Usa «Aggiorna messaggi» per leggere le risposte.</p>
      {pagina?.accesso.puo_moderare && <p>Puoi rimuovere un messaggio oppure chiudere e riaprire la chat del gruppo.</p>}
    </details>
    {errore && <p role="alert">{errore}</p>}
    {(pagina || errore) && <button disabled={busy} onClick={() => esegui(async () => setPagina(await leggi()))}>Aggiorna messaggi</button>}
    {!pagina && !errore && <p>Caricamento messaggi…</p>}
    {pagina && <>
      {pagina.accesso.puo_moderare && <button disabled={busy} onClick={() => esegui(async () => {
        await rpc("imposta_chiusura", { p_chiusa: !pagina.accesso.chat_chiusa });
        setPagina(await leggi());
      })}>{pagina.accesso.chat_chiusa ? "Riapri chat" : "Chiudi chat"}</button>}
      {pagina.accesso.chat_chiusa && <p>Chat chiusa. I messaggi restano leggibili.</p>}
      {pagina.altri_precedenti && <button disabled={busy} onClick={() => esegui(precedenti)}>Carica messaggi precedenti</button>}
      {!pagina.messaggi.length && <p>In questo gruppo non ci sono ancora messaggi.</p>}
      {pagina.messaggi.map(m => <article key={m.id}>
        <small>{m.mio ? "Tu" : "Partecipante"} · {new Date(m.inviato_il).toLocaleString("it-IT")}</small>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.rimosso ? "Messaggio rimosso" : m.testo}</p>
        {pagina.accesso.puo_moderare && !m.rimosso && <button disabled={busy} onClick={() => esegui(async () => {
          await rpc("rimuovi_messaggio", { p_messaggio_id: m.id });
          setPagina(p => ({ ...p, messaggi: p.messaggi.map(x => x.id === m.id ? { ...x, rimosso: true, testo: null } : x) }));
        })}>Rimuovi messaggio</button>}
      </article>)}
      {pagina.accesso.puo_scrivere && <form onSubmit={e => { e.preventDefault(); esegui(invia); }}>
        <label>Messaggio<textarea disabled={busy} value={testo} onChange={e => {
          invio.current = null; setTesto(e.target.value);
        }} rows={3} /></label>
        <button disabled={busy || !testo.trim()} type="submit">Invia</button>
      </form>}
    </>}
  </section>;
}

export default function SacramentiParroco({ tornaDashboard, nomeParrocchia = "", parrocchiaId, onGestisciPagamentiComunione }) {
  const [scelto, setScelto] = useState(null);
  const [sezione, setSezione] = useState(null);
  const [annoGestioneEconomica, setAnnoGestioneEconomica] = useState(null);
  const [ripresaSituazioneEconomica, setRipresaSituazioneEconomica] = useState(false);
  const [impostazioni, setImpostazioni] = useState(impostazioniIniziali);
  // Orari per anno pastorale e anno di percorso: i gruppi si formano nella card 05.
  const [modalitaFirme, setModalitaFirme] = useState("cartacea");
  const [modalitaFirmeSalva, setModalitaFirmeSalva] = useState(false);
  const [modalitaFirmeMessaggio, setModalitaFirmeMessaggio] = useState("");
  const [orariCatechismo, setOrariCatechismo] = useState({});
  const [messaggio, setMessaggio] = useState("");
  const [salvato, setSalvato] = useState(false);
  const [modifica, setModifica] = useState(true);
  const [anteprima, setAnteprima] = useState(false);
  const [caricamento, setCaricamento] = useState(false);
  const [operazione, setOperazione] = useState(false);
  const modificaRichiesta = useRef(false);
  const annoConfiguratoPrecedente = useRef("");
  // Privacy Prima Comunione: gestione distinta dalle impostazioni già operative.
  const [privacyTesto, setPrivacyTesto] = useState("");
  const [privacyScelta, setPrivacyScelta] = useState(""); // "modello" oppure "personale"
  const [privacyVersione, setPrivacyVersione] = useState("");
  const [privacyModifica, setPrivacyModifica] = useState(true);
  const [privacyAnteprima, setPrivacyAnteprima] = useState(false);
  const [privacyStampa, setPrivacyStampa] = useState(false);
  const [privacyOperazione, setPrivacyOperazione] = useState(false);
  const [privacyMessaggio, setPrivacyMessaggio] = useState("");
  const [parrocchiaPrivacy, setParrocchiaPrivacy] = useState(null);
  const privacyPubblicata = useRef({ testo: "", versione: "" });
  const privacyModificaRichiesta = useRef(false);
  // Finestra di conferma in stile Ars Liturgica: sostituisce l'avviso del browser.
  const [confermaCambioInformativa, setConfermaCambioInformativa] = useState(null);
  const pulsanteAnnullaConferma = useRef(null);
  const finestraConferma = useRef(null);

  useEffect(() => {
    if (!confermaCambioInformativa) return undefined;
    const elementoPrecedente = document.activeElement;
    pulsanteAnnullaConferma.current?.focus();

    const tastoFinestra = (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setConfermaCambioInformativa(null);
      }
      if (evento.key !== "Tab" || !finestraConferma.current) return;
      const pulsanti = Array.from(
        finestraConferma.current.querySelectorAll('button:not([disabled])')
      );
      if (!pulsanti.length) return;
      const primo = pulsanti[0];
      const ultimo = pulsanti[pulsanti.length - 1];
      if (evento.shiftKey && document.activeElement === primo) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primo.focus();
      }
    };
    document.addEventListener("keydown", tastoFinestra);
    return () => {
      document.removeEventListener("keydown", tastoFinestra);
      elementoPrecedente?.focus?.();
    };
  }, [confermaCambioInformativa]);

  useEffect(() => {
    let attivo = true;
    modificaRichiesta.current = false;
    annoConfiguratoPrecedente.current = "";
    setSalvato(false);
    setModifica(true);
    setAnteprima(false);
    setOrariCatechismo({});
    setImpostazioni({ ...impostazioniIniziali, date: { 1: { apertura: "", chiusura: "" }, 2: { apertura: "", chiusura: "" }, 3: { apertura: "", chiusura: "" } } });
    privacyModificaRichiesta.current = false;
    privacyPubblicata.current = { testo: "", versione: "" };
    setPrivacyTesto("");
    setPrivacyScelta("");
    setPrivacyVersione("");
    setPrivacyModifica(true);
    setPrivacyAnteprima(false);
    setPrivacyStampa(false);
    setPrivacyMessaggio("");
    setParrocchiaPrivacy(null);
    setConfermaCambioInformativa(null);
    if (!parrocchiaId) return;
    async function carica() {
      setCaricamento(true);
      const { data, error } = await supabase.from("ars_comunione_impostazioni")
        .select("anno_pastorale, durata, date_iscrizioni, informazioni, orari_catechismo, certificato_battesimo_interno_obbligatorio, informativa_privacy_testo, informativa_privacy_versione")
        .eq("parrocchia_id", parrocchiaId).maybeSingle();
      if (!attivo) return;
      setCaricamento(false);
      if (error) { setMessaggio("Impossibile caricare le impostazioni: " + error.message); return; }
      if (data && !modificaRichiesta.current) {
        annoConfiguratoPrecedente.current = data.anno_pastorale;
        setOrariCatechismo(data.orari_catechismo && typeof data.orari_catechismo === "object"
          ? data.orari_catechismo : {});
        setImpostazioni({ anno: data.anno_pastorale, durata: String(data.durata),
          informazioni: data.informazioni || "",
          certificatoBattesimoInternoObbligatorio: data.certificato_battesimo_interno_obbligatorio === true,
          date: { 1: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[1] || {}) },
            2: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[2] || {}) },
            3: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[3] || {}) } } });
        setSalvato(true);
        setModifica(false);
      }
      if (data && !privacyModificaRichiesta.current) {
        const testo = data.informativa_privacy_testo || "";
        const versione = data.informativa_privacy_versione || "";
        privacyPubblicata.current = { testo, versione };
        setPrivacyTesto(testo);
        setPrivacyVersione(versione);
        setPrivacyModifica(!testo.trim());
      }
    }
    async function caricaParrocchia() {
      // Campi richiesti solo per completare l'intestazione del modello.
      const { data, error } = await supabase.from("parrocchie")
        .select("nome, indirizzo, telefono, email")
        .eq("id", parrocchiaId).maybeSingle();
      if (!attivo) return;
      if (!error && data) setParrocchiaPrivacy(data);
    }
    caricaParrocchia();
    carica();
    return () => { attivo = false; };
  }, [parrocchiaId]);
  useEffect(() => {
    let attivo=true;
    setModalitaFirme("cartacea"); setModalitaFirmeMessaggio("");
    if (!parrocchiaId) return undefined;
    (async () => {
      const {data,error} = await supabase.rpc("ars_firme_leggi_modalita", {
        p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",
      });
      if (!attivo) return;
      if (error) setModalitaFirmeMessaggio("Impostazioni della firma non disponibili: " + error.message);
      else setModalitaFirme(["app","cartacea","entrambe"].includes(data?.modalita) ? data.modalita : "cartacea");
    })();
    return () => {attivo=false;};
  },[parrocchiaId]);

  async function salvaModalitaFirme() {
    if (modalitaFirmeSalva || !parrocchiaId) return;
    setModalitaFirmeSalva(true); setModalitaFirmeMessaggio("");
    const {data,error} = await supabase.rpc("ars_firme_imposta_modalita", {
      p_parrocchia_id:parrocchiaId,p_ambito:"prima_comunione",p_modalita:modalitaFirme,
    });
    setModalitaFirmeSalva(false);
    setModalitaFirmeMessaggio(error || !data?.ok
      ? "Modalità non salvata: " + (error?.message || "riprova")
      : "Modalità di conferma salvata per la Prima Comunione.");
  }

  const sacramento = sacramenti.find((s) => s.id === scelto);
  const sezioneAttiva = sezioniComunione.find((s) => s.id === sezione);

  function indietro() {
    if (sezione) { setSezione(null); setMessaggio(""); setRipresaSituazioneEconomica(false); }
    else if (sacramento) setScelto(null);
    else tornaDashboard?.();
  }

  function aggiorna(campo, valore) {
    setImpostazioni((precedenti) => ({ ...precedenti, [campo]: valore }));
    setMessaggio("");
  }

  function aggiornaData(anno, campo, valore) {
    setImpostazioni((precedenti) => ({
      ...precedenti,
      date: { ...precedenti.date, [anno]: { ...precedenti.date[anno], [campo]: valore } },
    }));
    setMessaggio("");
  }

  // Orari generali pubblicabili alle famiglie; la decisione dei gruppi resta al parroco.
  const orarioVuoto = () => ({ giorno: "", inizio: "", fine: "" });
  const orariAnno = (anno) =>
    orariCatechismo[impostazioni.anno]?.[String(anno)] || { stato: "da_definire", fasce: [] };

  function modificaOrari(anno, trasformazione) {
    setOrariCatechismo((precedenti) => {
      const annoPastorale = impostazioni.anno;
      const periodo = precedenti[annoPastorale] || {};
      const corrente = periodo[String(anno)] || { stato: "da_definire", fasce: [] };
      return {
        ...precedenti,
        [annoPastorale]: { ...periodo, [String(anno)]: trasformazione(corrente) },
      };
    });
    setMessaggio("");
  }

  function cambiaStatoOrari(anno, stato) {
    modificaOrari(anno, (attuale) => ({
      ...attuale, stato,
      fasce: stato === "definiti" && !(attuale.fasce || []).length
        ? [orarioVuoto()] : (attuale.fasce || []),
    }));
  }

  function aggiornaFascia(anno, indice, campo, valore) {
    modificaOrari(anno, (attuale) => ({
      ...attuale,
      fasce: (attuale.fasce || []).map((fascia, i) =>
        i === indice ? { ...fascia, [campo]: valore } : fascia),
    }));
  }

  function aggiungiFascia(anno) {
    modificaOrari(anno, (attuale) => ({
      ...attuale, fasce: [...(attuale.fasce || []), orarioVuoto()],
    }));
  }

  function eliminaFascia(anno, indice) {
    modificaOrari(anno, (attuale) => ({
      ...attuale, fasce: (attuale.fasce || []).filter((_, i) => i !== indice),
    }));
  }

  function controllaImpostazioni() {
    if (!/^\d{4}\/\d{4}$/.test(impostazioni.anno)) return "Inserisci l'anno pastorale nel formato 2026/2027.";
    const [inizio, fine] = impostazioni.anno.split("/").map(Number);
    if (fine !== inizio + 1) return "L'anno pastorale deve comprendere due anni consecutivi.";
    for (let anno = 1; anno <= Number(impostazioni.durata); anno++) {
      const { apertura, chiusura } = impostazioni.date[anno];
      if (apertura && chiusura && chiusura < apertura) return `Per il ${anno}° anno la chiusura precede l'apertura.`;
      const orari = orariAnno(anno);
      if (orari.stato === "definiti") {
        if (!Array.isArray(orari.fasce) || !orari.fasce.length)
          return `Inserisci almeno un giorno e un orario per il ${anno}° anno.`;
        for (const fascia of orari.fasce) {
          if (!fascia.giorno || !fascia.inizio || !fascia.fine || fascia.fine <= fascia.inizio)
            return `Controlla il giorno e gli orari del ${anno}° anno: l'ora finale deve essere successiva all'inizio.`;
        }
      }
    }
    return "";
  }

  async function salvaImpostazioni(e) {
    e.preventDefault();
    if (!modifica || operazione || caricamento) return;
    const errore = controllaImpostazioni();
    if (errore) { setMessaggio(errore); return; }
    if (!parrocchiaId) { setMessaggio("Parrocchia non disponibile: torna alla dashboard e riprova."); return; }
    const nuovoAnno = Boolean(annoConfiguratoPrecedente.current &&
      annoConfiguratoPrecedente.current !== impostazioni.anno);
    setOperazione(true);
    const { error } = await supabase.from("ars_comunione_impostazioni").upsert({
      parrocchia_id: parrocchiaId,
      anno_pastorale: impostazioni.anno,
      durata: Number(impostazioni.durata),
      date_iscrizioni: impostazioni.date,
      informazioni: impostazioni.informazioni,
      certificato_battesimo_interno_obbligatorio: impostazioni.certificatoBattesimoInternoObbligatorio,
      orari_catechismo: orariCatechismo,
      aggiornato_il: new Date().toISOString(),
      // L'inizio di un nuovo anno pastorale non eredita automaticamente la
      // modalita' e le quote dell'anno precedente.
      ...(nuovoAnno ? {modalita_contribuzione:"quota_stabilita",
        quota_anno_1:null,quota_anno_2:null,quota_anno_3:null} : {}),
    }, { onConflict: "parrocchia_id" });
    setOperazione(false);
    if (error) { setMessaggio("Salvataggio non riuscito: " + error.message); return; }
    modificaRichiesta.current = false;
    annoConfiguratoPrecedente.current = impostazioni.anno;
    setSalvato(true);
    setModifica(false);
    setMessaggio("Impostazioni salvate correttamente.");
  }

  // Due percorsi chiari: modello Ars Liturgica oppure testo libero della parrocchia.
  // Il testo pubblicato resta sempre invariato fino a una nuova pubblicazione.
  function applicaSceltaInformativa(tipo) {
    privacyModificaRichiesta.current = true;
    setPrivacyScelta(tipo);
    setPrivacyTesto(tipo === "modello"
      ? modelloPrivacyComunione(parrocchiaPrivacy, nomeParrocchia, impostazioni.anno)
      : "");
    setPrivacyModifica(true);
    setPrivacyAnteprima(false);
    setPrivacyMessaggio(tipo === "modello"
      ? "Modello inserito. Completa i campi tra parentesi quadre prima della pubblicazione."
      : "Scrivi qui il testo della parrocchia oppure incolla quello fornito dalla Diocesi."
    );
  }

  function scegliInformativa(tipo) {
    if (caricamento || privacyOperazione || confermaCambioInformativa) return;
    if (privacyScelta === tipo && privacyModifica) return;
    if (privacyTesto.trim()) {
      setConfermaCambioInformativa({ tipo });
      return;
    }
    applicaSceltaInformativa(tipo);
  }

  function confermaSceltaInformativa() {
    if (!confermaCambioInformativa || caricamento || privacyOperazione) return;
    const tipo = confermaCambioInformativa.tipo;
    setConfermaCambioInformativa(null);
    applicaSceltaInformativa(tipo);
  }

  async function pubblicaPrivacy() {
    if (!parrocchiaId) {
      setPrivacyMessaggio("Parrocchia non disponibile: torna alla dashboard e riprova.");
      return;
    }
    if (!privacyModifica || privacyOperazione || caricamento) return;
    const testo = privacyTesto.trim();
    if (testo.length < 300) {
      setPrivacyMessaggio("Il testo è incompleto: compila l'informativa prima di pubblicarla.");
      return;
    }
    if (/\[[^\]\r\n]+\]/.test(testo)) {
      setPrivacyMessaggio("Completa o rimuovi tutti i campi tra parentesi quadre prima di pubblicare.");
      return;
    }
    const precedente = privacyPubblicata.current;
    if (testo === precedente.testo.trim()) {
      setPrivacyMessaggio("Il testo coincide con la versione già pubblicata.");
      setPrivacyModifica(false);
      return;
    }
    const versione = prossimaVersionePrivacy(precedente.versione);
    setPrivacyOperazione(true);
    setPrivacyMessaggio("");
    // Controllo versione: evita di sovrascrivere una revisione pubblicata altrove.
    let query = supabase.from("ars_comunione_impostazioni")
      .update({ informativa_privacy_testo: testo,
                informativa_privacy_versione: versione,
                aggiornato_il: new Date().toISOString() })
      .eq("parrocchia_id", parrocchiaId);
    if (precedente.versione) query = query.eq("informativa_privacy_versione", precedente.versione);
    else query = query.is("informativa_privacy_versione", null);
    const { data, error } = await query.select("informativa_privacy_versione").maybeSingle();
    setPrivacyOperazione(false);
    if (error) {
      setPrivacyMessaggio("Pubblicazione non riuscita: " + error.message);
      return;
    }
    if (!data || data.informativa_privacy_versione !== versione) {
      setPrivacyMessaggio("Informativa non aggiornata. Potrebbe essere stata modificata da un altro operatore: ricarica la pagina prima di riprovare.");
      return;
    }
    privacyPubblicata.current = { testo, versione };
    setPrivacyTesto(testo);
    setPrivacyVersione(versione);
    privacyModificaRichiesta.current = false;
    setPrivacyModifica(false);
    setPrivacyMessaggio(`Informativa versione ${versione} pubblicata correttamente.`);
  }

  function stampaInformativa() {
    if (!privacyTesto.trim()) {
      setPrivacyMessaggio("Inserisci prima il testo dell'informativa.");
      return;
    }
    setPrivacyStampa(true);
    setPrivacyAnteprima(true);
    setPrivacyMessaggio("");
    // Il layout di stampa cambia soltanto per l'informativa.
    window.setTimeout(() => {
      window.print();
      setPrivacyStampa(false);
    }, 80);
  }

  function stampaVolantino() {
    const errore = controllaImpostazioni();
    if (errore) { setMessaggio(errore); return; }
    if (!nomeParrocchia.trim()) {
      setMessaggio("Nome della parrocchia non disponibile. Riprova dalla dashboard.");
      return;
    }
    setAnteprima(true);
    setMessaggio("");
    window.setTimeout(() => window.print(), 50);
  }

  function formattaData(valore) {
    if (!valore) return "Da definire";
    const [anno, mese, giorno] = valore.split("-");
    return `${giorno}/${mese}/${anno}`;
  }

  if (annoGestioneEconomica) return <GestioneEconomicaComunione
    key={`${parrocchiaId}:${annoGestioneEconomica}`} parrocchiaId={parrocchiaId}
    nomeParrocchia={nomeParrocchia} anno={annoGestioneEconomica}
    onIndietro={() => { setRipresaSituazioneEconomica(true); setAnnoGestioneEconomica(null); }} />;

  return (
    <main className={`ars-sacramenti-parroco ${privacyStampa ? "ars-privacy-stampa-attiva" : ""}`}>
      <style>{STILE}</style>
      {confermaCambioInformativa && (
        <div className="ars-sac-conferma-sfondo">
          <section
            className="ars-sac-conferma-finestra"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ars-sac-conferma-titolo"
            aria-describedby="ars-sac-conferma-descrizione"
            ref={finestraConferma}
          >
            <div className="ars-sac-conferma-simbolo" aria-hidden="true">!</div>
            <h3 id="ars-sac-conferma-titolo">Vuoi sostituire il testo?</h3>
            <p id="ars-sac-conferma-descrizione">
              {confermaCambioInformativa.tipo === "modello"
                ? "Il testo nell'editor verrà sostituito con il modello Ars Liturgica."
                : "Il testo nell'editor verrà cancellato, così potrai scrivere o incollare la tua informativa."}
            </p>
            <p className="ars-sac-conferma-nota">
              {privacyPubblicata.current.testo.trim()
                ? "L'informativa già pubblicata resterà invariata fino a una nuova pubblicazione."
                : "Il testo attuale non è stato pubblicato e andrà perso se continui."}
            </p>
            <div className="ars-sac-conferma-pulsanti">
              <button type="button" className="ars-sac-conferma-annulla"
                ref={pulsanteAnnullaConferma}
                onClick={() => setConfermaCambioInformativa(null)}>
                Annulla
              </button>
              <button type="button" className="ars-sac-conferma-continua"
                onClick={confermaSceltaInformativa}>
                {confermaCambioInformativa.tipo === "modello" ? "Usa il modello" : "Svuota l'editor"}
              </button>
            </div>
          </section>
        </div>
      )}
      <button type="button" className="ars-sac-indietro" onClick={indietro}>
        ← {sezione ? "Prima Comunione" : sacramento ? "Tutti i Sacramenti" : "Torna alla dashboard"}
      </button>
      <header className="ars-sac-header">
        <h2>{sacramento ? sacramento.nome : "Sacramenti"}</h2>
        <p>{sacramento ? sacramento.descrizione : "Battesimo, Prima Comunione, Cresima e Matrimonio"}</p>
      </header>
      {!sacramento ? (
        <div className="ars-sac-griglia">
          {sacramenti.map((s) => (
            <button type="button" className="ars-sac-card" key={s.id}
              onClick={() => { setScelto(s.id); setSezione(null); }} aria-label={`${s.nome} — ${s.descrizione}`}>
              <span className="ars-sac-simbolo" aria-hidden="true"><Simbolo tipo={s.id} /></span>
              <strong>{s.nome}</strong>
              <span className="ars-sac-descrizione">{s.descrizione}</span>
            </button>
          ))}
        </div>
      ) : sacramento.id !== "comunione" ? (
        <section className="ars-sac-dettaglio">
          <span className="ars-sac-simbolo ars-sac-simbolo-grande" aria-hidden="true"><Simbolo tipo={sacramento.id} /></span>
          <h3>{sacramento.nome}</h3>
          <p>La gestione di questo Sacramento sarà disponibile prossimamente.</p>
        </section>
      ) : !sezioneAttiva ? (
        <div className="ars-sac-griglia ars-sac-griglia-sezioni">
          {sezioniComunione.map((s, i) => (
            <button type="button" key={s.id} className="ars-sac-card ars-sac-card-sezione"
              onClick={() => { setSezione(s.id); setMessaggio(""); }}>
              <span className="ars-sac-numero">{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.nome}</strong>
              <span className="ars-sac-descrizione">{s.descrizione}</span>
              {s.id === "impostazioni" && <span className="ars-sac-etichetta">Prima fase</span>}
            </button>
          ))}
        </div>
      ) : sezione === "impostazioni" ? (
        <section className="ars-sac-pannello">
          <h3>Impostazioni anno catechistico</h3>
          <p>Definisci l'anno pastorale, le iscrizioni e gli eventuali giorni e orari del Catechismo.</p>
          <form className="ars-sac-form" onSubmit={salvaImpostazioni}>
            <>
            <label>Anno pastorale
              <input type="text" value={impostazioni.anno} placeholder="2026/2027"
                onChange={(e) => aggiorna("anno", e.target.value)} disabled={!modifica || caricamento || operazione} required />
            </label>
            <label>Durata del percorso
              <select value={impostazioni.durata} onChange={(e) => aggiorna("durata", e.target.value)} disabled={!modifica || caricamento || operazione}>
                <option value="2">2 anni</option>
                <option value="3">3 anni</option>
              </select>
            </label>
            {[1, 2, 3].map((anno) => (
              <fieldset className={`ars-sac-anno ${anno > Number(impostazioni.durata) ? "ars-sac-anno-non-previsto" : ""}`} key={anno} disabled={!modifica || caricamento || operazione || anno > Number(impostazioni.durata)}>
                <legend>{anno}° anno {anno > Number(impostazioni.durata) ? "(non previsto)" : ""}</legend>
                <div className="ars-sac-date">
                  <label>Apertura iscrizioni
                    <input type="date" value={impostazioni.date[anno].apertura}
                      onChange={(e) => aggiornaData(anno, "apertura", e.target.value)} />
                  </label>
                  <label>Chiusura iscrizioni
                    <input type="date" value={impostazioni.date[anno].chiusura}
                      onChange={(e) => aggiornaData(anno, "chiusura", e.target.value)} />
                  </label>
                </div>
              </fieldset>
            ))}
            <fieldset className="ars-sac-anno ars-sac-orari-sezione" disabled={!modifica || caricamento || operazione}>
              <legend>Giorni e orari del Catechismo</legend>
              <p className="ars-sac-orari-intro">Puoi indicare gli orari già stabiliti, oppure comunicarli alle famiglie in seguito. I gruppi e le assegnazioni saranno organizzati nella card «Gruppi di catechismo».</p>
              {[1, 2, 3].filter((anno) => anno <= Number(impostazioni.durata)).map((anno) => {
                const configOrari = orariAnno(anno);
                const definiti = configOrari.stato === "definiti";
                return <div className="ars-sac-orari-anno" key={anno}>
                  <h4>{anno}° anno</h4>
                  <label className="ars-sac-orari-stato">Disponibilità degli orari
                    <select value={definiti ? "definiti" : "da_definire"}
                      onChange={(e) => cambiaStatoOrari(anno, e.target.value)}>
                      <option value="da_definire">Giorni e orari da definire</option>
                      <option value="definiti">Giorni e orari già stabiliti</option>
                    </select>
                  </label>
                  {definiti ? <>
                    {(configOrari.fasce || []).map((fascia, indice) => <div className="ars-sac-orari-fascia" key={indice}>
                      <label>Giorno
                        <select value={fascia.giorno} onChange={(e) => aggiornaFascia(anno, indice, "giorno", e.target.value)}>
                          <option value="">Seleziona il giorno</option>
                          {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map(giorno =>
                            <option value={giorno} key={giorno}>{giorno}</option>)}
                        </select>
                      </label>
                      <label>Dalle
                        <input type="time" value={fascia.inizio || ""}
                          onChange={(e) => aggiornaFascia(anno, indice, "inizio", e.target.value)} />
                      </label>
                      <label>Alle
                        <input type="time" value={fascia.fine || ""}
                          onChange={(e) => aggiornaFascia(anno, indice, "fine", e.target.value)} />
                      </label>
                      <button type="button" className="ars-sac-orari-rimuovi"
                        onClick={() => eliminaFascia(anno, indice)}>Rimuovi</button>
                    </div>)}
                    <button type="button" className="ars-sac-stampa" onClick={() => aggiungiFascia(anno)}>
                      + Aggiungi giorno e orario
                    </button>
                  </> : <p className="ars-sac-orari-avviso">I giorni e gli orari del Catechismo saranno comunicati dalla Parrocchia non appena definiti. Le famiglie potranno consultarli nel Calendario del Catechismo e riceveranno un avviso nelle Comunicazioni.</p>}
                </div>;
              })}
            </fieldset>
            <fieldset className="ars-sac-anno" disabled={!modifica || caricamento || operazione}>
              <legend>Certificato di Battesimo</legend>
              <p>Se il bambino è stato battezzato in un'altra parrocchia, il certificato è sempre richiesto.</p>
              <label className="ars-com-segreteria-spunta">
                <input type="checkbox" checked={impostazioni.certificatoBattesimoInternoObbligatorio}
                  onChange={e => aggiorna("certificatoBattesimoInternoObbligatorio", e.target.checked)} />
                <span>Richiedi il certificato anche ai bambini battezzati in questa parrocchia.</span>
              </label>
              <p>Se non selezioni questa opzione, il certificato interno non è necessario.</p>
            </fieldset>
            <label className="ars-sac-intera">Informazioni e istruzioni per le famiglie
              <textarea rows="6" value={impostazioni.informazioni}
                placeholder="Orari, documenti necessari, incontri informativi e altre comunicazioni..."
                onChange={(e) => aggiorna("informazioni", e.target.value)} disabled={!modifica || caricamento || operazione} />
            </label>
            </>
            <div className="ars-sac-form-footer">
              <div className="ars-sac-azioni">
                {modifica ? <button key="salva-impostazioni" type="submit" className="ars-sac-conferma" disabled={caricamento || operazione}>{operazione ? "Salvataggio..." : salvato ? "Salva modifiche" : "Salva impostazioni"}</button>
                  : <button key="modifica-impostazioni" type="button" className="ars-sac-conferma" onClick={(e) => { e.preventDefault(); modificaRichiesta.current = true; setModifica(true); setMessaggio(""); }}>Modifica impostazioni</button>}
                <button type="button" className="ars-sac-stampa" onClick={() => setAnteprima((v) => !v)}>{anteprima ? "Chiudi anteprima" : "Anteprima volantino"}</button>
                {anteprima && <button type="button" className="ars-sac-stampa" onClick={stampaVolantino}>Stampa volantino</button>}
              </div>
            </div>
          </form>
          {messaggio && <p className="ars-sac-messaggio" role="status">{messaggio}</p>}
          <div className={`ars-sac-volantino ${anteprima ? "" : "ars-sac-volantino-nascosto"}`} aria-label="Volantino per le famiglie">
            <div className="ars-sac-volantino-interno">
              <div className="ars-sac-volantino-parrocchia">{nomeParrocchia ? `Parrocchia ${nomeParrocchia.replace(/^parrocchia\s+/i, "")}` : "Parrocchia"}</div>
              <div className="ars-sac-volantino-simbolo"><Simbolo tipo="comunione" /></div>
              <h1>Prima Comunione</h1>
              <h2>Anno catechistico {impostazioni.anno}</h2>
              <div className="ars-sac-volantino-linea" />
              <h3>Iscrizioni al catechismo</h3>
              {[1, 2, 3].filter((anno) => anno <= Number(impostazioni.durata)).map((anno) => (
                <div className="ars-sac-volantino-anno" key={anno}>
                  <strong>{anno}° anno</strong>
                  <span>Apertura: {formattaData(impostazioni.date[anno].apertura)}</span>
                  <span>Chiusura: {formattaData(impostazioni.date[anno].chiusura)}</span>
                </div>
              ))}
              <div className="ars-sac-volantino-info">
                <h3>Giorni e orari del Catechismo</h3>
                {[1, 2, 3].filter((anno) => anno <= Number(impostazioni.durata)).map((anno) => {
                  const configOrari = orariAnno(anno);
                  const fasce = configOrari.stato === "definiti" ? (configOrari.fasce || []) : [];
                  return <p key={anno}><strong>{anno}° anno:</strong> {fasce.length
                    ? fasce.map((f) => `${f.giorno}, ${f.inizio}–${f.fine}`).join("; ")
                    : "Giorni e orari saranno comunicati dalla Parrocchia."}</p>;
                })}
              </div>
              {impostazioni.informazioni.trim() && <div className="ars-sac-volantino-info">
                <h3>Informazioni per le famiglie</h3>
                <p>{impostazioni.informazioni}</p>
              </div>}
              <div className="ars-sac-volantino-fine">La comunità parrocchiale vi aspetta</div>
            </div>
          </div>

          <div className="ars-sac-privacy-pannello" aria-label="Modalità di firma Prima Comunione">
            <h3>Firma e conferma della domanda</h3>
            <p>Scegli come i genitori possono sottoscrivere la domanda. La segreteria usa sempre la firma cartacea quando il genitore non ha un account.</p>
            <div className="ars-com-scelta-firma" role="radiogroup" aria-label="Modalità di conferma consentita">
              {[
                {id:"app",titolo:"Conferma nell'app",nota:"Il genitore legge e conferma la domanda direttamente online."},
                {id:"cartacea",titolo:"Firma su carta",nota:"Il genitore stampa e firma la domanda."},
                {id:"entrambe",titolo:"Entrambe le modalità",nota:"Il genitore sceglie come confermare la domanda."},
              ].map(opzione => <label key={opzione.id}
                className={`ars-com-firma-opzione ${modalitaFirme === opzione.id ? "ars-com-firma-opzione-attiva" : ""}`}>
                <input type="radio" name="modalita-firma-parroco" value={opzione.id}
                  checked={modalitaFirme === opzione.id} disabled={modalitaFirmeSalva}
                  onChange={() => {setModalitaFirme(opzione.id);setModalitaFirmeMessaggio("");}} />
                <span><strong>{opzione.titolo}</strong><small>{opzione.nota}</small></span>
              </label>)}
            </div>
            <div className="ars-sac-privacy-azioni"><button type="button"
              className="ars-sac-conferma" disabled={modalitaFirmeSalva}
              onClick={salvaModalitaFirme}>{modalitaFirmeSalva ? "Salvataggio…" : "Salva modalità di firma"}</button></div>
            {modalitaFirmeMessaggio && <p role="status" className="ars-sac-privacy-stato">{modalitaFirmeMessaggio}</p>}
            <p className="ars-sac-privacy-nota">La conferma nell'app permette al genitore di sottoscrivere la domanda di iscrizione,
              dichiarando di averne letto e accettato il contenuto. Il sistema registra la conferma e la conserva insieme alla domanda.</p>
          </div>

          <div className="ars-sac-privacy-pannello" aria-label="Informativa privacy Prima Comunione">
            <h3>Informativa privacy per le iscrizioni</h3>
            <p>Scegli come preparare l'informativa della tua parrocchia:</p>
            <div className="ars-sac-privacy-scelte" role="group" aria-label="Come preparare l'informativa">
              <button type="button"
                className={`ars-sac-privacy-scelta ${privacyScelta === "modello" ? "ars-sac-privacy-scelta-attiva" : ""}`}
                aria-pressed={privacyScelta === "modello"}
                onClick={() => scegliInformativa("modello")}
                disabled={caricamento || privacyOperazione}>
                <strong>Usa l'informativa Ars Liturgica</strong>
                <span>Un modello con i dati della parrocchia, che puoi modificare.</span>
              </button>
              <button type="button"
                className={`ars-sac-privacy-scelta ${privacyScelta === "personale" ? "ars-sac-privacy-scelta-attiva" : ""}`}
                aria-pressed={privacyScelta === "personale"}
                onClick={() => scegliInformativa("personale")}
                disabled={caricamento || privacyOperazione}>
                <strong>Scrivi o incolla la tua informativa</strong>
                <span>Puoi anche incollare il testo fornito dalla tua Diocesi.</span>
              </button>
            </div>
            <p className="ars-sac-privacy-stato">
              {privacyVersione ? `Versione pubblicata: ${privacyVersione}` : "Nessuna informativa ancora pubblicata"}
            </p>
            {!privacyModifica && <div className="ars-sac-privacy-azioni">
              <button type="button" className="ars-sac-stampa"
                onClick={() => { privacyModificaRichiesta.current = true; setPrivacyModifica(true); setPrivacyMessaggio(""); }}>
                Modifica il testo già pubblicato
              </button>
            </div>}
            {(privacyScelta || privacyTesto.trim()) ? <>
              <label className="ars-sac-privacy-etichetta">Testo dell'informativa
                <textarea value={privacyTesto} rows={16} maxLength={30000}
                  disabled={!privacyModifica || caricamento || privacyOperazione}
                  onChange={(e) => { privacyModificaRichiesta.current = true; setPrivacyTesto(e.target.value); setPrivacyMessaggio(""); }}
                  placeholder="Scrivi qui la tua informativa oppure incolla quella della Diocesi" />
              </label>
              <p className="ars-sac-privacy-nota">Prima di pubblicare, controlla che il testo sia completo e adatto alla tua parrocchia. Se utilizzi il modello Ars Liturgica, completa i campi tra parentesi quadre. Le iscrizioni già presentate conserveranno la versione letta al momento dell'invio.</p>
              <div className="ars-sac-privacy-azioni">
                {privacyModifica && <button type="button" className="ars-sac-conferma"
                  onClick={pubblicaPrivacy} disabled={caricamento || privacyOperazione}>
                  {privacyOperazione ? "Pubblicazione..." : "Pubblica informativa"}
                </button>}
                <button type="button" className="ars-sac-stampa"
                  onClick={() => setPrivacyAnteprima((v) => !v)} disabled={!privacyTesto.trim()}>
                  {privacyAnteprima ? "Chiudi anteprima" : "Anteprima informativa"}
                </button>
                <button type="button" className="ars-sac-stampa"
                  onClick={stampaInformativa} disabled={!privacyTesto.trim()}>Stampa informativa</button>
              </div>
            </> : <p className="ars-sac-privacy-nota">Seleziona una delle due possibilità per iniziare.</p>}
            {privacyMessaggio && <p className="ars-sac-messaggio" role="status">{privacyMessaggio}</p>}
            {privacyAnteprima && <div className="ars-sac-privacy-stampa" aria-label="Anteprima informativa privacy">
              <p className="ars-sac-privacy-marcatura">
                {privacyTesto.trim() === privacyPubblicata.current.testo.trim() && privacyVersione
                  ? `Informativa pubblicata — versione ${privacyVersione}`
                  : "BOZZA DA COMPLETARE — NON PUBBLICATA"}
              </p>
              <div className="ars-sac-privacy-testo">{privacyTesto}</div>
            </div>}
          </div>
        </section>
      ) : sezione === "gruppi" ? (
        <GruppiChatComunione key={[parrocchiaId, impostazioni.anno, impostazioni.durata].join("-")}
          parrocchiaId={parrocchiaId} annoPastorale={impostazioni.anno} durata={impostazioni.durata} />
      ) : sezione === "quote" ? (
        <QuoteComunioneParroco key={parrocchiaId} parrocchiaId={parrocchiaId} annoAttivo={impostazioni.anno} nomeParrocchia={nomeParrocchia} onGestisciPagamenti={onGestisciPagamentiComunione || setAnnoGestioneEconomica} tornaDashboard={tornaDashboard} sezioneIniziale={ripresaSituazioneEconomica ? "situazione" : "quote"} />
      ) : sezione === "iscrizioni" ? (
        <IscrizioniComunioneParroco parrocchiaId={parrocchiaId}
          nomeParrocchia={nomeParrocchia} annoAttivo={impostazioni.anno} />
      ) : (
        <section className="ars-sac-dettaglio">
          <h3>{sezioneAttiva.nome}</h3>
          <p>Questa funzione sarà attivata nelle prossime fasi.</p>
        </section>
      )}
    </main>
  );
}

const STILE = `

/* Aiuto alle quote: discreto e specifico della pagina. */
.ars-com-istruzioni-quote{padding:12px 16px;margin:12px 0;background:#fffaf1;border:1px solid #dfcba6;border-radius:10px}
.ars-com-istruzioni-quote summary{cursor:pointer;color:#173955;font-weight:700}
.ars-com-istruzioni-quote p{line-height:1.5;margin:8px 0 0}
.ars-com-quote-libera{padding:12px 16px;border-radius:10px;background:#f7f5ec;color:#173955;line-height:1.55}
/* Card 03 — Iscrizioni e rinnovi. Stili confinati alla card. */
/* Avvisi brevi per le iscrizioni assistite: leggibili anche da telefono */
.ars-com-avviso-firma{margin:12px 0;padding:12px 14px;background:#fff9ea;border:1px solid #e5cf9b;border-left:4px solid #9f772e;border-radius:9px;color:#493a1e;line-height:1.48;font-size:.92rem}
.ars-com-avviso-firma>strong{display:block;margin-bottom:3px;font-size:1rem}
.ars-com-avviso-firma p{margin:5px 0}
.ars-com-segreteria-apri{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin:16px 0}
.ars-com-segreteria-apri>p{flex:1;min-width:210px;font-size:.9rem;color:#63706e;margin:0}
.ars-com-segreteria{border:1px solid #d6bd88;border-radius:13px;background:#fffaf0;padding:18px;margin:16px 0 24px}
.ars-com-segreteria-testa h4{font:700 1.25rem Georgia,serif;color:#243c40;margin:0 0 10px}
.ars-com-segreteria-testa p{font-size:.94rem;line-height:1.5;color:#5b6663;margin:6px 0}
.ars-com-segreteria fieldset{border:1px solid #e6d7b9;border-radius:10px;padding:15px;margin:16px 0;background:#fffdf8;min-width:0}
.ars-com-segreteria legend{font:700 1.06rem Georgia,serif;color:#79551f;padding:0 8px}
.ars-com-segreteria-campi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
.ars-com-segreteria-campi label,.ars-com-segreteria-deleghe{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:.91rem;min-width:0}
.ars-com-segreteria-campi input,.ars-com-segreteria-deleghe textarea{box-sizing:border-box;width:100%;min-height:43px;background:#fff;border:1px solid #d8c9a8;border-radius:8px;color:#243c40;padding:9px;font:inherit}
.ars-com-segreteria-deleghe textarea{resize:vertical}
.ars-com-segreteria-nota{margin:12px 0 0;color:#5b6663;font-size:.9rem}
.ars-com-segreteria-privacy p{font-size:.92rem;line-height:1.5;color:#5b6663;margin:0 0 13px}
.ars-com-segreteria-spunta{display:flex;gap:10px;align-items:flex-start;font-weight:600;line-height:1.45;cursor:pointer}
.ars-com-segreteria-spunta input{width:18px;height:18px;flex:none;margin-top:3px;accent-color:#926b27}
.ars-com-segreteria-azioni{display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap}
.ars-com-segreteria-azioni button,.ars-com-segreteria-apri button{min-height:43px}
.ars-com-segreteria-successo{padding:13px;border:1px solid #b5d7bf;background:#eff8f0;color:#265b38;border-radius:9px;line-height:1.55}
@media(max-width:650px){.ars-com-segreteria-campi{grid-template-columns:1fr}.ars-com-segreteria{padding:12px}}

.ars-com-iscrizioni-pannello{max-width:900px}
.ars-com-filtri-iscrizioni{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}
.ars-com-filtri-iscrizioni label{display:flex;flex-direction:column;gap:6px;font-weight:600}
.ars-com-filtri-iscrizioni :is(input,select){min-height:44px;width:100%;padding:9px;border:1px solid #d8c9a8;border-radius:8px;background:white;color:#243c40;font:inherit}
.ars-com-riepilogo-iscrizioni{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}
.ars-com-riepilogo-iscrizioni span{border:1px solid #e5d4b2;border-radius:9px;padding:10px 13px;background:#fff8eb}
.ars-com-riepilogo-iscrizioni strong{color:#926b27;font-size:1.2rem}
.ars-com-elenco-iscrizioni{display:flex;flex-direction:column;gap:12px}
.ars-com-riga-iscrizione{border:1px solid #e5d4b2;border-radius:12px;padding:16px;background:#fffefa;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
.ars-com-anagrafica-iscrizione{display:flex;flex-direction:column;gap:5px;min-width:0}
.ars-com-anagrafica-iscrizione strong{font:700 1.12rem Georgia,serif;color:#243c40}
.ars-com-anagrafica-iscrizione span,.ars-com-anagrafica-iscrizione small{color:#65716f}
.ars-com-stato-ok{color:#276445!important}
.ars-com-stato-attesa{color:#8b642b!important}
.ars-com-scheda-iscrizione{grid-column:1/-1;border-top:1px solid #e5d4b2;padding-top:15px}
.ars-com-intestazione-domanda h3{font:700 1.38rem Georgia,serif;margin:0 0 7px;color:#243c40}
.ars-com-intestazione-domanda h4{font:700 1.07rem Georgia,serif;margin:0 0 8px;color:#243c40}
.ars-com-intestazione-domanda p{margin:0 0 6px;color:#5f6d70}
.ars-com-sezione-domanda{margin:17px 0}
.ars-com-sezione-domanda h5{font:700 1rem Georgia,serif;margin:0 0 9px;color:#795a24}
.ars-com-sezione-domanda dl{display:grid;grid-template-columns:1fr 1fr;gap:9px 14px;margin:0}
.ars-com-sezione-domanda dl>div{border-bottom:1px solid #eee4d2;padding:5px 0;overflow-wrap:anywhere}
.ars-com-sezione-domanda dt{font-size:.83rem;font-weight:600;color:#617072}
.ars-com-sezione-domanda dd{margin:3px 0 0;color:#243c40}
.ars-com-prese-blocco{padding:13px 0;border-top:1px solid #e7d9c2}
.ars-com-prese-blocco:first-of-type{border-top:0;padding-top:0}
.ars-com-prese-blocco h6{font:700 .99rem Georgia,serif;color:#795a24;margin:0 0 10px}
.ars-com-prese-dichiarazione{margin:0 0 12px;color:#243c40;line-height:1.5}
.ars-com-prese-stato{color:#795a24;margin:7px 0}
.ars-com-gestione-documenti{margin:20px 0;border:1px solid #e6d5b4;background:#fffaf1;border-radius:11px;padding:15px}
.ars-com-gestione-documenti h4{font:700 1.05rem Georgia,serif;margin:0 0 12px}
.ars-com-riga-documento{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid #eee1c9}
.ars-com-riga-documento:last-of-type{border-bottom:none}
.ars-com-riga-documento>span{font-weight:600;flex:1;min-width:140px}
.ars-com-riga-documento button{padding:8px 13px}
.ars-com-messaggio-documenti{margin:12px 0 0;color:#365d4a}
.ars-com-errore-iscrizioni{color:#a32424!important}
.ars-com-vuoto-iscrizioni{padding:20px;background:#fff8eb;border-radius:8px}
.ars-com-piede-iscrizioni{margin-top:18px}
.ars-com-solo-stampa{display:none}
.ars-com-firme-domanda{margin-top:24px}
.ars-com-firme-domanda p{margin:7px 0}
.ars-com-informativa-stampa{margin-top:25px;padding-top:20px;border-top:1px solid #aaa;break-before:page}
.ars-com-informativa-stampa>div{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;font-size:10pt}
@media(max-width:650px){.ars-com-filtri-iscrizioni{grid-template-columns:1fr}.ars-com-riga-iscrizione{grid-template-columns:1fr}.ars-com-sezione-domanda dl{grid-template-columns:1fr}}
@media print{
  body.ars-com-stampa-iscrizione .ars-sac-volantino,body.ars-com-stampa-iscrizione .ars-sac-privacy-stampa{display:none!important;visibility:hidden!important}
  body.ars-com-stampa-iscrizione *,body.ars-com-stampa-iscrizione .ars-sac-volantino *{visibility:hidden!important}
  body.ars-com-stampa-iscrizione .ars-com-solo-stampa,body.ars-com-stampa-iscrizione .ars-com-solo-stampa *{visibility:visible!important}
  body.ars-com-stampa-iscrizione .ars-com-solo-stampa{display:block!important;position:absolute!important;left:0!important;top:0!important;width:100%!important;box-sizing:border-box!important;background:#fff!important;color:#111!important;margin:0!important;padding:0!important;font:11pt/1.4 Arial,sans-serif!important}
  body.ars-com-stampa-iscrizione .ars-com-sezione-domanda{break-inside:avoid}
  body.ars-com-stampa-iscrizione .ars-com-sezione-domanda dl{grid-template-columns:1fr 1fr}
  body.ars-com-stampa-iscrizione .ars-com-informativa-stampa{break-before:page}
}

.ars-sacramenti-parroco{max-width:960px;margin:0 auto;padding:18px;color:#243c40}
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
.ars-sac-card:focus-visible,.ars-sac-indietro:focus-visible,.ars-sac-conferma:focus-visible{outline:3px solid #c58928;outline-offset:3px}
.ars-sac-griglia-sezioni{max-width:850px;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.ars-sac-card-sezione{min-height:166px;padding:18px 12px;gap:9px}
.ars-sac-card-sezione strong{font-size:1.1rem}
.ars-sac-numero{font:700 1.1rem Georgia,serif;color:#b98a31}
.ars-sac-etichetta{font-size:.75rem;color:#866222;border:1px solid #e6d5b4;border-radius:30px;padding:3px 10px}
.ars-sac-pannello{max-width:700px;margin:0 auto;padding:26px;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px}
.ars-sac-pannello h3{font:700 1.5rem Georgia,serif;margin:0 0 8px}
.ars-sac-pannello>p{color:#5f6d70;margin:0 0 22px;line-height:1.5}
.ars-sac-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.ars-sac-form input:disabled,.ars-sac-form select:disabled,.ars-sac-form textarea:disabled{background:#fff;color:#243c40;opacity:1;cursor:default}
.ars-sac-form label{display:flex;flex-direction:column;gap:7px;font-weight:600;font-size:.95rem}
/* Caselle di spunta: testo e checkbox affiancati nelle impostazioni. */
.ars-sac-form label.ars-com-segreteria-spunta{flex-direction:row;align-items:center;gap:10px}
.ars-sac-form label.ars-com-segreteria-spunta input[type="checkbox"]{width:18px;height:18px;min-height:18px;flex:0 0 18px;margin:0;padding:0}

.ars-sac-form input,.ars-sac-form select,.ars-sac-form textarea{box-sizing:border-box;width:100%;min-height:44px;border:1px solid #d8c9a8;border-radius:9px;background:white;color:#243c40;padding:10px;font:inherit}
.ars-sac-form textarea{resize:vertical;line-height:1.5}
.ars-sac-intera{grid-column:1/-1}
.ars-sac-anno{grid-column:1/-1;min-width:0;border:1px solid #e2d2b3;border-radius:11px;padding:14px;margin:0}
.ars-sac-anno legend{font-weight:700;color:#594c36;padding:0 7px}
.ars-sac-anno:disabled{opacity:1;color:#243c40}.ars-sac-anno:disabled label{color:#243c40}.ars-sac-anno.ars-sac-anno-non-previsto{opacity:.48}
.ars-sac-date{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.ars-sac-azioni{display:flex;gap:10px;flex-wrap:wrap}
.ars-sac-stampa{border:1px solid #a67a29;border-radius:9px;background:white;color:#795a24;padding:12px 18px;font-weight:700;cursor:pointer}
.ars-sac-volantino{margin:28px auto 0;max-width:560px;background:#fff;color:#111;padding:12px;box-shadow:0 2px 12px #00000016}
.ars-sac-volantino-nascosto{display:none}
.ars-sac-volantino-interno{border:1px solid #777;padding:26px 30px;text-align:center;font-family:Georgia,serif;background:#fff}
.ars-sac-volantino-parrocchia{font-size:1.35rem;font-weight:bold;margin:4px 0 12px;overflow-wrap:anywhere}
.ars-sac-volantino-simbolo{color:#222;display:flex;justify-content:center}
.ars-sac-volantino-simbolo svg{width:75px;height:75px}
.ars-sac-volantino h1{font-size:2rem;margin:7px 0;color:#111}
.ars-sac-volantino h2{font-size:1.12rem;margin:0 0 16px;color:#222}
.ars-sac-volantino h3{font-size:1.15rem;margin:14px 0;color:#111}
.ars-sac-volantino-linea{height:1px;background:#999;margin:12px 0}
.ars-sac-volantino-anno{display:grid;grid-template-columns:90px 1fr 1fr;gap:6px;text-align:left;border-bottom:1px solid #ddd;padding:10px 0;font:14px Arial,sans-serif}
.ars-sac-volantino-info{text-align:left;margin-top:20px;overflow-wrap:anywhere}
.ars-sac-volantino-info p{white-space:pre-wrap;line-height:1.5;font:14px/1.5 Arial,sans-serif;color:#111}
.ars-sac-volantino-fine{margin-top:25px;font-style:italic;font-size:13px}
.ars-sac-form-footer{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.ars-sac-conferma{border:0;border-radius:9px;background:#a67a29;color:white;padding:12px 18px;font-weight:700;cursor:pointer}
.ars-sac-form-footer small{color:#687477}
.ars-sac-messaggio{margin-top:16px!important;color:#5c4825!important;font-weight:600}
 .ars-sac-privacy-pannello{margin:34px 0 0;padding:23px;background:#fffdf8;border:1px solid #e2d2b3;border-radius:13px}
 .ars-sac-privacy-pannello h3{font:700 1.28rem Georgia,serif;color:#243c40;margin:0 0 8px}
 .ars-sac-privacy-pannello>p{line-height:1.55;color:#5f6d70}
 .ars-sac-privacy-stato{font-weight:700;color:#785a22!important}
 .ars-sac-privacy-scelte{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0 15px}
 .ars-sac-privacy-scelta{display:flex;flex-direction:column;text-align:left;align-items:flex-start;gap:7px;padding:17px 16px;border:1px solid #d8c9a8;border-radius:12px;background:#fff;color:#243c40;cursor:pointer;font:inherit;line-height:1.4;min-width:0}
 .ars-sac-privacy-scelta strong{font:700 1.03rem Georgia,serif;color:#77551f}
 .ars-sac-privacy-scelta span{font-size:.9rem;color:#5f6d70}
 .ars-sac-privacy-scelta:hover{border-color:#a67a29;background:#fffaf0}
 .ars-sac-privacy-scelta-attiva{border:2px solid #a67a29;background:#fff8eb;padding:16px 15px}
 .ars-sac-privacy-scelta:focus-visible{outline:3px solid #c58928;outline-offset:3px}
 .ars-sac-privacy-scelta:disabled{opacity:.6;cursor:default}
 .ars-sac-privacy-azioni{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}
 .ars-sac-privacy-azioni button:disabled{opacity:.6;cursor:default}
 .ars-sac-privacy-etichetta{display:flex;flex-direction:column;gap:8px;font-weight:700}
 .ars-sac-privacy-etichetta textarea{width:100%;box-sizing:border-box;min-height:260px;border:1px solid #d8c9a8;border-radius:9px;padding:12px;line-height:1.6;font:inherit;background:white;color:#243c40;resize:vertical}
 .ars-sac-privacy-etichetta textarea:disabled{background:#fff;color:#243c40;opacity:1}
 .ars-sac-privacy-nota{font-size:.9rem;line-height:1.5}
/* Conferma domanda: tre scelte semplici al posto della tendina. */
.ars-com-scelta-firma{display:grid;grid-template-columns:1fr;gap:10px;margin:17px 0}
.ars-com-firma-opzione{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid #dcc8a0;border-radius:11px;background:#fff;color:#243c40;cursor:pointer}
.ars-com-firma-opzione input{margin:5px 2px 0 0;flex:0 0 auto;accent-color:#a67a29;width:18px;height:18px}
.ars-com-firma-opzione strong{display:block;font:700 1.04rem Georgia,serif;color:#77551f;margin-bottom:5px}
.ars-com-firma-opzione small{display:block;font-size:.93rem;line-height:1.45;color:#566863}
.ars-com-firma-opzione:hover{background:#fffaf0;border-color:#b58d42}
.ars-com-firma-opzione-attiva{background:#fff8e9;border:2px solid #a67a29;padding:13px 15px}
.ars-com-firma-opzione:focus-within{outline:2px solid #c58928;outline-offset:2px}

 .ars-sac-privacy-stampa{background:#fff;color:#111;border:1px solid #bbb;padding:26px;margin:16px 0 0;font:14px/1.6 Arial,sans-serif}
 .ars-sac-privacy-marcatura{font-weight:bold;color:#6b5127;border-bottom:1px solid #ccc;padding-bottom:8px}
 .ars-sac-privacy-testo{white-space:pre-wrap;overflow-wrap:anywhere;color:#111}
/* Conferma discreta in stile crema e oro: non modifica l'editor o la stampa. */
.ars-sac-conferma-sfondo{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(27,34,34,.56);box-sizing:border-box}
.ars-sac-conferma-finestra{box-sizing:border-box;width:min(100%,470px);max-height:calc(100dvh - 40px);overflow-y:auto;padding:28px 30px 24px;background:linear-gradient(165deg,#fffefa,#fff8eb);border:1px solid #d8bc82;border-top:4px solid #b58c43;border-radius:17px;box-shadow:0 20px 70px rgba(20,26,27,.26);color:#243c40;text-align:center}
.ars-sac-conferma-simbolo{display:flex;align-items:center;justify-content:center;margin:0 auto 14px;width:44px;height:44px;border-radius:50%;border:1px solid #e3cf9e;background:#fff0d1;color:#8d6728;font:700 1.45rem Georgia,serif}
.ars-sac-conferma-finestra h3{font:700 1.5rem Georgia,serif;color:#334746;margin:0 0 12px}
.ars-sac-conferma-finestra p{font-size:1rem;line-height:1.55;margin:0 0 13px;color:#3e5554}
.ars-sac-conferma-finestra .ars-sac-conferma-nota{font-size:.91rem;color:#735c35;background:#fff3dc;padding:11px 13px;border:1px solid #eddbb9;border-radius:9px;margin:15px 0 23px}
.ars-sac-conferma-pulsanti{display:flex;justify-content:center;gap:11px;flex-wrap:wrap}
.ars-sac-conferma-pulsanti button{min-width:145px;min-height:44px;padding:10px 17px;border-radius:9px;font-family:inherit;font-size:.96rem;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s}
.ars-sac-conferma-annulla{background:white;border:1px solid #bea675;color:#73551f}
.ars-sac-conferma-annulla:hover{background:#fcf2df}
.ars-sac-conferma-continua{background:#a67a29;border:1px solid #a67a29;color:white}
.ars-sac-conferma-continua:hover{background:#8e661d}
.ars-sac-conferma-pulsanti button:focus-visible{outline:3px solid #ae8a42;outline-offset:3px}
@media print{
  .ars-sac-conferma-sfondo{display:none!important}
  @page{size:A4;margin:12mm}
  body *{visibility:hidden!important}
   .ars-privacy-stampa-attiva .ars-sac-volantino{display:none!important}
   .ars-privacy-stampa-attiva .ars-sac-privacy-stampa,.ars-privacy-stampa-attiva .ars-sac-privacy-stampa *{visibility:visible!important}
   .ars-privacy-stampa-attiva .ars-sac-privacy-stampa{display:block!important;position:absolute;left:0;top:0;width:100%;max-width:none;box-sizing:border-box;margin:0;padding:10mm;border:0!important;box-shadow:none!important;background:white!important;color:black!important}
   .ars-privacy-stampa-attiva .ars-sac-privacy-testo{white-space:pre-wrap;font:11pt/1.45 Arial,sans-serif}
   .ars-sacramenti-parroco:not(.ars-privacy-stampa-attiva) .ars-sac-privacy-stampa{display:none!important}
  .ars-sac-volantino,.ars-sac-volantino *{visibility:visible!important}
  .ars-sac-volantino-nascosto{display:none!important}
  .ars-sac-volantino{position:absolute;left:0;top:0;width:100%;max-width:none;box-sizing:border-box;margin:0;padding:0;box-shadow:none!important;background:#fff!important;color:#111!important}
  .ars-sac-volantino-interno{min-height:255mm;box-sizing:border-box;border:1px solid #777;padding:18mm 15mm;break-inside:avoid}
  .ars-sac-volantino-anno,.ars-sac-volantino-info{break-inside:avoid}
}
@media(max-width:650px){.ars-sac-privacy-scelte{grid-template-columns:1fr}.ars-sacramenti-parroco{padding:12px}.ars-sac-griglia{gap:12px}.ars-sac-card{min-height:185px;padding:15px 8px}.ars-sac-card strong{font-size:1.08rem}.ars-sac-descrizione{font-size:.83rem}.ars-sac-header h2{font-size:1.65rem}.ars-sac-simbolo{width:78px;height:78px}.ars-sac-simbolo svg{width:65px;height:65px}.ars-sac-griglia-sezioni{grid-template-columns:repeat(2,minmax(0,1fr))}.ars-sac-card-sezione{min-height:150px}.ars-sac-pannello{padding:18px}.ars-sac-form{grid-template-columns:1fr}.ars-sac-date{grid-template-columns:1fr}.ars-sac-volantino-interno{padding:15px}.ars-sac-volantino-anno{grid-template-columns:1fr;gap:4px}}
@media(max-width:380px){.ars-sac-griglia{grid-template-columns:1fr}.ars-sac-card{min-height:165px}}

.ars-sac-orari-sezione{background:#fffdf8}
.ars-sac-orari-intro{font-size:.93rem;line-height:1.6;color:#5f6d70;margin:7px 0 16px}
.ars-sac-orari-anno{padding:15px 0;border-top:1px solid #e9dcc1}
.ars-sac-orari-anno h4{font:700 1.12rem Georgia,serif;color:#79551f;margin:0 0 13px}
.ars-sac-orari-stato{max-width:420px;margin:0 0 13px}
.ars-sac-orari-fascia{display:grid;grid-template-columns:minmax(145px,1.3fr) minmax(110px,1fr) minmax(110px,1fr) auto;gap:9px;align-items:end;padding:10px 0}
.ars-sac-orari-rimuovi{min-height:44px;border:1px solid #dcc7a1;border-radius:9px;background:#fffaf0;color:#795a24;padding:9px 12px;cursor:pointer;font-weight:600}
.ars-sac-orari-avviso{border:1px solid #e8d7b4;border-radius:9px;padding:13px 14px;background:#fff8ea;color:#645235;line-height:1.6;font-size:.92rem}
@media(max-width:650px){.ars-sac-orari-fascia{grid-template-columns:1fr 1fr}.ars-sac-orari-fascia label:first-child{grid-column:1/-1}.ars-sac-orari-rimuovi{grid-column:1/-1}}

/* Card 03 completa: sottocard, mancanze, collegamento account, solleciti nella pratica. */
.ars-com-sottocard-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:17px 0 23px}
.ars-com-sottocard{display:flex;flex-direction:column;text-align:left;gap:9px;border:1px solid #d5bf91;background:#fffaf0;color:#243c40;min-height:105px;border-radius:13px;padding:15px;font:inherit;cursor:pointer}
.ars-com-sottocard strong{font:700 1.07rem Georgia,serif;color:#77551f}
.ars-com-sottocard span{font-size:.88rem;color:#5f6d70}
.ars-com-sottocard-attiva{background:#f6e9cf;border:2px solid #9b7328;padding:14px}
.ars-com-titolo-lista{font:700 1.23rem Georgia,serif;color:#243c40;margin:12px 0 8px}
.ars-com-mancanze{background:#fff3f2;border-left:4px solid #af3d36;border-radius:7px;padding:10px 12px;color:#922a28;margin:9px 0}
.ars-com-mancanze strong{font:700 .92rem sans-serif!important;color:#922a28!important}
.ars-com-mancanze ul{margin:7px 0 0 20px;padding:0;line-height:1.6}
.ars-com-correzioni,.ars-com-solleciti{background:#fffaf2;border:1px solid #e3d1ad;border-radius:10px;padding:14px;margin:13px 0}
.ars-com-correzioni h4,.ars-com-solleciti h4{font:700 1.03rem Georgia,serif;color:#79551f;margin:0 0 10px}
.ars-com-correzioni .ars-com-segreteria-azioni{margin-top:15px}
.ars-com-solleciti p{font-size:.93rem;line-height:1.5}
.ars-com-storico-solleciti{border-top:1px solid #ded0b9;margin-top:15px;padding-top:12px}
.ars-com-storico-solleciti p{margin:6px 0}
.ars-com-modalita{display:flex;flex-wrap:wrap;gap:9px;margin:16px 0}
.ars-com-modalita button{background:#fff;border:1px solid #c4ac81;color:#79551f;padding:11px 15px;font-weight:bold;border-radius:9px;cursor:pointer}
.ars-com-modalita button.ars-com-scelta-attiva{background:#f8e9ca;border:2px solid #916b2b}
.ars-com-ricerca-genitore{background:#fffaf0;border:1px solid #e2ceae;border-radius:9px;padding:12px;margin-bottom:16px}
.ars-com-candidato{display:flex;align-items:center;gap:9px;padding:8px 3px}
.ars-com-candidato input{width:18px;height:18px}
.ars-com-paginazione{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.ars-com-paginazione label{display:flex;align-items:center;gap:8px}
.ars-com-paginazione select{background:white;border:1px solid #d8c9a8;border-radius:7px;padding:9px}
@media(max-width:750px){.ars-com-sottocard-grid{grid-template-columns:1fr}}

.ars-com-domanda-dettaglio .ars-com-sezione-domanda dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:10px 16px;margin:12px 0}
.ars-com-domanda-dettaglio .ars-com-sezione-domanda dl>div{padding:10px 12px;background:#fffdf8;border:1px solid #ece1cc;border-radius:8px;min-width:0}
.ars-com-domanda-dettaglio .ars-com-sezione-domanda dt{font-size:.78rem;font-weight:600;color:#64716b;margin-bottom:4px}
.ars-com-domanda-dettaglio .ars-com-sezione-domanda dd{font-size:.97rem;margin:0;line-height:1.45;overflow-wrap:anywhere;font-weight:500;color:#263d41}
.ars-com-verifica-manuale{background:#fdfaf3;border:1px solid #c9b58d;border-radius:10px;margin:15px 0;padding:15px}
.ars-com-verifica-manuale h4{font:700 1.03rem Georgia,serif;color:#79551f;margin:0 0 9px}
.ars-com-verifica-manuale p{line-height:1.5}
.ars-com-verifica-spunta{display:flex;gap:10px;align-items:center;margin:9px 0}
.ars-com-verifica-spunta input{width:18px;height:18px;flex:0 0 auto}

.ars-com-ricevuta-nuova{border:2px solid #a78439;background:#fff7df;border-radius:12px;padding:18px;margin:16px 0;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.ars-com-ricevuta-nuova h4{font:700 1.1rem Georgia,serif;margin:0;color:#55391b}
.ars-com-ricevuta-nuova p{margin:0}
.ars-com-ricevuta-nuova input{width:100%;max-width:450px;padding:10px;border:1px solid #c0a672;border-radius:7px;font:600 1rem monospace;background:white}

/* Annullamento e gestione economica Prima Comunione */
.ars-com-azioni-domanda{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0}
@media(max-width:650px){.ars-com-azioni-domanda{flex-direction:row;flex-wrap:wrap}}
.ars-com-annulla-iscrizione{border:1px solid #a13933;background:#fff7f6;color:#942e29;border-radius:9px;padding:10px 14px;font:inherit;font-weight:600;font-size:.94rem;cursor:pointer;min-height:42px}
.ars-com-annulla-iscrizione:hover{background:#fce7e5}.ars-com-annulla-iscrizione:disabled{opacity:.55;cursor:default}
.ars-com-dialogo-annulla{width:min(90vw,470px);max-height:85vh;box-sizing:border-box;border:1px solid #bd746f;border-top:4px solid #a13933;border-radius:14px;background:#fffdf8;color:#243c40;padding:24px;overflow:auto}
.ars-com-dialogo-annulla::backdrop{background:rgba(25,30,30,.55)}.ars-com-dialogo-annulla h3{color:#942e29;margin-top:0}.ars-com-dialogo-annulla p{line-height:1.5}.ars-com-dialogo-annulla .ars-sac-conferma-pulsanti{margin-top:18px}
.ars-com-quote-sottocard{grid-template-columns:repeat(3,minmax(0,1fr))}.ars-com-situazione-economica{border:1px solid #dfcba6;border-radius:12px;background:#fffaf1;padding:20px;margin:16px 0;min-width:0}.ars-com-situazione-economica h4{color:#77551f;font:700 1.15rem Georgia,serif;margin:0 0 10px}.ars-com-situazione-economica p{line-height:1.55;margin:10px 0}.ars-com-situazione-economica button{margin-top:10px}.ars-com-quota-anno,.ars-com-rimborso-riga{border:1px solid #dfcba6;border-radius:12px;background:#fffaf1;padding:16px;margin:12px 0;min-width:0}
.ars-com-quota-anno legend,.ars-com-rimborso-riga h4{color:#77551f;font:700 1.15rem Georgia,serif}.ars-com-rimborso-riga h4{margin:0 0 8px}.ars-com-rimborso-riga p{margin:7px 0}
.ars-com-quota-anno label,.ars-com-rimborso-riga label{display:flex;flex-direction:column;gap:6px;font-weight:600;margin:12px 0;max-width:430px}
.ars-com-quota-anno input,.ars-com-quota-anno textarea,.ars-com-rimborso-riga select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8c9a8;border-radius:8px;font:inherit;color:#243c40;background:white}
/* Scelta immediata fra quota stabilita e offerta libera: due opzioni sempre visibili. */
.ars-com-quota-anno .ars-com-modalita-intro{font-weight:700;color:#173955;margin:14px 0 10px}
.ars-com-modalita-scelte{display:grid;grid-template-columns:1fr;gap:10px;max-width:620px;margin-bottom:14px}
.ars-com-quota-anno .ars-com-modalita-opzione{display:flex;flex-direction:row;align-items:center;max-width:none;gap:13px;margin:0;padding:14px 15px;box-sizing:border-box;border:1px solid #d8c9a8;border-radius:11px;background:#fffdf8;color:#173955;cursor:pointer;transition:border-color .14s ease,background-color .14s ease}
.ars-com-quota-anno .ars-com-modalita-opzione:hover{border-color:#af842f;background:#fff9ea}
.ars-com-quota-anno .ars-com-modalita-opzione.ars-com-modalita-selezionata{border:2px solid #aa7a27;background:#f8edda;padding:13px 14px}
.ars-com-quota-anno .ars-com-modalita-opzione input[type="radio"]{width:20px;height:20px;min-width:20px;flex:0 0 20px;margin:0;padding:0;border:0;accent-color:#a47b2d;cursor:pointer}
.ars-com-modalita-testo{display:flex;flex-direction:column;gap:3px;min-width:0}
.ars-com-modalita-testo strong{font-size:1rem;line-height:1.3}
.ars-com-modalita-testo small{font-size:.9rem;line-height:1.4;font-weight:400;color:#455d65}
.ars-com-quota-anno .ars-com-modalita-opzione:focus-within{outline:2px solid #244e68;outline-offset:2px}
.ars-com-quota-anno:disabled .ars-com-modalita-opzione{cursor:default;opacity:.7}
.ars-com-rimborso-importo{display:block;font-size:1.2rem;color:#9c322b;margin-top:12px}.ars-com-rimborso-riga button{margin:8px 8px 0 0}.ars-com-rimborso-stampa{display:none}
@media(max-width:650px){.ars-com-quote-sottocard{grid-template-columns:1fr}}
@media print{
 body.ars-com-stampa-rimborso *{visibility:hidden!important}
 body.ars-com-stampa-rimborso .ars-com-rimborso-stampa,body.ars-com-stampa-rimborso .ars-com-rimborso-stampa *{visibility:visible!important}
 body.ars-com-stampa-rimborso .ars-com-rimborso-stampa{display:block!important;position:absolute;top:0;left:0;width:100%;box-sizing:border-box;margin:0;padding:0;background:#fff;color:#111;font:11pt/1.45 Arial,sans-serif}
 body.ars-com-stampa-rimborso .ars-com-documento-rimborso{break-inside:avoid;border-top:1px solid #777;padding:12px 0}
 body.ars-com-stampa-rimborso .ars-com-documento-rimborso p{margin:4px 0}
}

/* Card 02: consultazione compatta, una riga per iscritto. */
.ars-com-economica-indicatori{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:15px 0 20px}
.ars-com-economica-indicatori>div{display:flex;flex-direction:column;gap:6px;border:1px solid #dfcba6;border-radius:10px;padding:14px;background:#fffdf8;min-width:0}
.ars-com-economica-indicatori span{font-size:.9rem;color:#596565;line-height:1.35}
.ars-com-economica-indicatori strong{font-size:1.45rem;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.ars-com-economica-testa-elenco{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0 8px;flex-wrap:wrap}
.ars-com-economica-testa-elenco h5{margin:0;font:700 1.05rem Georgia,serif;color:#77551f}
.ars-com-situazione-economica .ars-com-economica-testa-elenco button{margin:0}
.ars-com-economica-scroll{width:100%;overflow-x:auto;border:1px solid #e4d7bf;border-radius:8px;background:#fffdf9}
.ars-com-economica-tabella{width:100%;min-width:510px;border-collapse:collapse;font-size:.92rem;line-height:1.4;font-variant-numeric:tabular-nums}
.ars-com-economica-tabella th,.ars-com-economica-tabella td{padding:9px 11px;border-bottom:1px solid #e9dfce;text-align:left;white-space:nowrap}
.ars-com-economica-tabella th{background:#f2e7d1;color:#77551f;font-weight:700}
.ars-com-economica-tabella th:not(:first-child),.ars-com-economica-tabella td:not(:first-child){text-align:right}
.ars-com-economica-tabella tr:last-child td{border-bottom:0}
.ars-com-economica-tabella tbody tr:nth-child(even){background:#faf5ea}
.ars-sacramenti-parroco .ars-com-economica-tabella tbody td{color:#173955!important}
.ars-sacramenti-parroco .ars-com-economica-tabella tbody td.ars-com-residuo-aperto{color:#982f28!important}
.ars-sacramenti-parroco .ars-com-economica-tabella tbody td.ars-com-stato-ok{color:#276445!important}
.ars-com-residuo-aperto{color:#982f28;font-weight:600}
.ars-com-economica-collegamento{border-top:1px solid #dfcba6;margin-top:20px;padding-top:9px}
@media(max-width:430px){.ars-com-economica-indicatori>div{padding:10px}.ars-com-economica-indicatori strong{font-size:1.15rem}.ars-com-economica-indicatori span{font-size:.82rem}}

.ars-gruppi-chat form>label{display:block;margin:12px 0}.ars-gruppi-chat form input[type=number]{width:6em;padding:6px;font:inherit}.ars-gruppi-chat label:has(>select){display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin:16px 0;color:#173955;font-weight:600}
.ars-gruppi-chat select{min-height:44px;min-width:10rem;max-width:100%;padding:8px 12px;border:1px solid #b79b66;border-radius:9px;background-color:#fffaf1;color:#173955;font:inherit;cursor:pointer}
.ars-gruppi-chat select:focus-visible{outline:3px solid #295477;outline-offset:2px}
@media(max-width:540px){.ars-gruppi-chat label:has(>select){align-items:stretch;flex-direction:column;text-align:left}.ars-gruppi-chat select{width:100%}}
.ars-gruppi-chat article{margin:12px 0;padding:14px;border:1px solid #dfcba6;border-radius:10px;background:#fffaf1}
.ars-gruppi-chat details{margin:12px 0}.ars-gruppi-chat summary{cursor:pointer}
.ars-gruppi-chat button{font:inherit;margin:4px;padding:8px 12px;cursor:pointer;border:1px solid #bdab89;border-radius:8px;background:#fffaf1;color:#173955}
.ars-gruppi-chat textarea{display:block;box-sizing:border-box;width:100%;padding:10px;font:inherit}
`;