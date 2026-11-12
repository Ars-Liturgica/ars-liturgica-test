import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

const sezioniComunione = [
  { id: "impostazioni", nome: "Impostazioni anno catechistico", descrizione: "Anno pastorale, durata e iscrizioni" },
  { id: "quote", nome: "Quote e pagamenti", descrizione: "Quote annuali, metodi e agevolazioni" },
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
  date: { 1: { apertura: "", chiusura: "" }, 2: { apertura: "", chiusura: "" }, 3: { apertura: "", chiusura: "" } },
};

// CARD 03 - Iscrizioni e rinnovi: consulta le domande gia' registrate.
// I gruppi vengono formati esclusivamente nella card 05.
const SEZIONI_DOMANDA = [
  ["Dati del bambino", [
    ["Nome", "nome"], ["Cognome", "cognome"], ["Data di nascita", "dataNascita"],
    ["Luogo di nascita", "luogoNascita"], ["Codice fiscale", "codiceFiscale"],
    ["Indirizzo di residenza", "indirizzo"], ["Comune", "comune"], ["CAP", "cap"],
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
  { tipo: "domanda_firmata", nome: "Domanda firmata" },
  { tipo: "informativa_firmata", nome: "Informativa privacy firmata" },
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
  return (riga?.documenti || []).some(d => d.tipo === tipo && d.stato === "ricevuto");
}

function DomandaComunioneDettaglio({ riga, nomeParrocchia, perStampa = false }) {
  const d = riga.dati_modulo || {};
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
          <div key={chiave}><dt>{etichetta}</dt><dd>{chiave.startsWith("data") || chiave === "dataBattesimo"
            ? mostraDataComunione(d[chiave]) : String(d[chiave])}</dd></div>
        )}</dl>
      </section>;
    })}
    <section className="ars-com-sezione-domanda">
      <h5>Privacy e autorizzazioni</h5>
      <dl>
        <div><dt>Account del ragazzo</dt><dd>{d.autorizzaAccount ? "Autorizzato" : "Non autorizzato"}</dd></div>
        <div><dt>Chat del Catechismo</dt><dd>{d.autorizzaChat ? "Autorizzata" : "Non autorizzata"}</dd></div>
        <div><dt>Informativa privacy</dt><dd>Versione {riga.privacy_versione || "—"}</dd></div>
        <div><dt>Presa visione</dt><dd>{riga.privacy_presa_visione_il ? mostraDataComunione(riga.privacy_presa_visione_il, true) : "Non registrata"}</dd></div>
      </dl>
    </section>
    <section className="ars-com-sezione-domanda">
      <h5>Documenti da riconsegnare</h5>
      <dl>{DOCUMENTI_COMUNIONE.map(doc => <div key={doc.tipo}>
        <dt>{doc.nome}</dt>
        <dd>{documentoRicevuto(riga, doc.tipo) ? "Ricevuto" : "Da consegnare"}</dd>
      </div>)}</dl>
    </section>
    {perStampa && <>
      <div className="ars-com-firme-domanda">
        <p>Luogo e data: _______________________________________</p>
        <p>Firma del genitore/tutore: _____________________________</p>
        <p>Firma del secondo genitore, se richiesta: ________________</p>
      </div>
      {riga.privacy_testo && <section className="ars-com-informativa-stampa">
        <h4>Informativa privacy — versione {riga.privacy_versione || "—"}</h4>
        <div>{riga.privacy_testo}</div>
        <div className="ars-com-firme-domanda">
          <p>Luogo e data: _______________________________________</p>
          <p>Firma del genitore/tutore: _____________________________</p>
          <p>Firma del secondo genitore, se richiesta: ________________</p>
        </div>
      </section>}
    </>}
  </div>;
}

// Prima iscrizione presentata in segreteria per un genitore senza account.
// La funzione Supabase applica i permessi assegnati dal parroco.
const DATI_SEGRETERIA_INIZIALI = {
  nome: "", cognome: "", dataNascita: "", luogoNascita: "", codiceFiscale: "",
  indirizzo: "", comune: "", cap: "", parrocchiaBattesimo: "", dataBattesimo: "",
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
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const cambia = (chiave, valore) => {
    setValori(precedenti => ({ ...precedenti, [chiave]: valore }));
    if (errore) setErrore("");
  };

  async function invia(evento) {
    evento.preventDefault();
    if (salvataggio) return;
    if (!valori.genitore1Telefono.trim() && !valori.genitore1Email.trim()) {
      setErrore("Inserisci almeno un recapito del genitore o tutore: telefono oppure email.");
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
        Object.entries(valori).map(([chiave, valore]) => [chiave, valore.trim()])
      );
      const { data, error } = await supabase.rpc("ars_comunione_presenta_domanda_segreteria", {
        p_parrocchia_id: parrocchiaId,
        p_dati: dati,
        p_privacy_presa_visione: true,
      });
      if (error) throw error;
      if (!data?.ok || !data.iscrizione_id) {
        throw new Error("Non è arrivata la conferma dell'iscrizione.");
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
      <p>Per famiglie senza account Ars Liturgica. La domanda sarà inserita nello stesso elenco delle iscrizioni online; non viene creato un account.</p>
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
      <legend>Deleghe</legend>
      <label className="ars-com-segreteria-deleghe">Persone delegate al ritiro (se previste)
        <textarea value={valori.delegati} rows={3} disabled={salvataggio}
          onChange={e => cambia("delegati", e.target.value)} />
      </label>
    </fieldset>
    <fieldset className="ars-com-segreteria-privacy">
      <legend>Informativa privacy</legend>
      <p>Consegna al genitore o tutore l'informativa pubblicata dalla parrocchia. La firma cartacea sarà raccolta e registrata tra i documenti riconsegnati.</p>
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
      <button type="submit" className="ars-sac-conferma" disabled={salvataggio || !privacyConfermata}>
        {salvataggio ? "Registrazione in corso…" : "Registra la prima iscrizione"}
      </button>
    </div>
  </form>;
}

function IscrizioniComunioneParroco({ parrocchiaId, nomeParrocchia, annoAttivo }) {
  const [domande, setDomande] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [annoFiltro, setAnnoFiltro] = useState("corrente");
  const [apertaId, setApertaId] = useState(null);
  const [stampaId, setStampaId] = useState(null);
  const [aggiorna, setAggiorna] = useState(0);
  const [documentoInSalvataggio, setDocumentoInSalvataggio] = useState("");
  const [messaggioDocumento, setMessaggioDocumento] = useState("");
  const [mostraInserimento, setMostraInserimento] = useState(false);
  const [messaggioIscrizione, setMessaggioIscrizione] = useState("");

  useEffect(() => {
    let attivo = true;
    setCaricamento(true); setErrore("");
    if (!parrocchiaId) {
      setErrore("Parrocchia non disponibile. Rientra dalla dashboard.");
      setCaricamento(false); return undefined;
    }
    (async () => {
      const { data, error } = await supabase.rpc("ars_comunione_elenco_domande_parroco", {
        p_parrocchia_id: parrocchiaId,
      });
      if (!attivo) return;
      setCaricamento(false);
      if (error || !Array.isArray(data)) {
        setErrore("Non è stato possibile caricare le iscrizioni. Verifica che il SQL della card 03 sia stato installato.");
        setDomande([]);
      } else setDomande(data);
    })();
    return () => { attivo = false; };
  }, [parrocchiaId, aggiorna]);

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
  const filtrate = domande.filter(r => {
    const d = r.dati_modulo || {};
    const testo = [d.nome, d.cognome, d.genitore1Nome, d.genitore1Cognome]
      .map(s => String(s || "")).join(" ").toLocaleLowerCase("it");
    return (annoFiltro === "tutti" || r.anno_pastorale === (annoFiltro === "corrente" ? annoCorrenteParrocchia : annoFiltro))
      && testo.includes(ricerca.trim().toLocaleLowerCase("it"));
  });
  const selezionata = domande.find(r => r.id === apertaId);
  const daStampare = domande.find(r => r.id === stampaId);
  const documentiCompleti = filtrate.filter(r => DOCUMENTI_COMUNIONE.every(doc => documentoRicevuto(r, doc.tipo))).length;

  function iscrizioneRegistrata(risultato) {
    setMostraInserimento(false);
    setAnnoFiltro("corrente");
    setRicerca("");
    setApertaId(risultato.iscrizione_id);
    setMessaggioDocumento("");
    setMessaggioIscrizione("Iscrizione registrata. La domanda si trova nell'elenco qui sotto: stampala insieme all'informativa e raccogli le firme cartacee.");
    setAggiorna(n => n + 1);
  }

  async function cambiaDocumento(riga, tipo, nuovoStato) {
    if (documentoInSalvataggio) return;
    setMessaggioDocumento("");
    setDocumentoInSalvataggio(`${riga.id}:${tipo}`);
    const { data, error } = await supabase.rpc("ars_comunione_segna_documento_parroco", {
      p_parrocchia_id: parrocchiaId,
      p_iscrizione_id: riga.id,
      p_tipo: tipo,
      p_stato: nuovoStato,
    });
    setDocumentoInSalvataggio("");
    if (error || !data) {
      setMessaggioDocumento("Non è stato possibile aggiornare la consegna del documento.");
      return;
    }
    setDomande(precedenti => precedenti.map(d => d.id !== riga.id ? d : ({
      ...d, documenti: [...(d.documenti || []).filter(x => x.tipo !== tipo), data],
    })));
    setMessaggioDocumento("Consegna del documento aggiornata.");
  }

  return <section className="ars-sac-pannello ars-com-iscrizioni-pannello">
    <h3>Iscrizioni e rinnovi</h3>
    <p>Qui trovi le domande ricevute e lo storico degli anni precedenti. I ragazzi saranno assegnati nella card «Gruppi di catechismo».</p>
    <div className="ars-com-segreteria-apri">
      <button type="button" className="ars-sac-conferma"
        onClick={() => { setMostraInserimento(v => !v); setMessaggioIscrizione(""); }}>
        {mostraInserimento ? "Chiudi nuovo modulo" : "+ Nuova iscrizione in segreteria"}
      </button>
      <p>La segreteria autorizzata può iscrivere un bambino anche se il genitore non possiede un account.</p>
    </div>
    {mostraInserimento && <NuovaIscrizioneComunioneSegreteria
      parrocchiaId={parrocchiaId} onSalvata={iscrizioneRegistrata}
      onAnnulla={() => setMostraInserimento(false)} />}
    {messaggioIscrizione && <p className="ars-com-segreteria-successo" role="status">{messaggioIscrizione}</p>}
    <div className="ars-com-filtri-iscrizioni">
      <label>Anno catechistico
        <select value={annoFiltro} onChange={e => { setAnnoFiltro(e.target.value); setApertaId(null); setMessaggioDocumento(""); }}>
          <option value="corrente">{annoCorrenteParrocchia ? `${annoCorrenteParrocchia} — anno corrente` : "Anno corrente"}</option>
          <option value="tutti">Archivio — tutti gli anni</option>
          {anni.filter(anno => anno !== annoCorrenteParrocchia).map(anno => <option value={anno} key={anno}>{anno}</option>)}
        </select>
      </label>
      <label>Cerca ragazzo o genitore
        <input type="search" value={ricerca} onChange={e => setRicerca(e.target.value)} placeholder="Nome o cognome" />
      </label>
    </div>
    <div className="ars-com-riepilogo-iscrizioni">
      <span><strong>{filtrate.length}</strong> domande</span>
      <span><strong>{filtrate.filter(r => Number(r.anno_percorso) === 1).length}</strong> prime iscrizioni</span>
      <span><strong>{filtrate.filter(r => Number(r.anno_percorso) > 1).length}</strong> rinnovi</span>
      <span><strong>{documentiCompleti}</strong> documentazioni complete</span>
    </div>
    {caricamento ? <p role="status">Caricamento delle iscrizioni…</p> : errore ?
      <p className="ars-com-errore-iscrizioni" role="alert">{errore}</p> :
      filtrate.length ? <div className="ars-com-elenco-iscrizioni">
        {filtrate.map(r => { const d = r.dati_modulo || {};
          const completi = DOCUMENTI_COMUNIONE.every(doc => documentoRicevuto(r, doc.tipo));
          return <article className="ars-com-riga-iscrizione" key={r.id}>
            <div className="ars-com-anagrafica-iscrizione">
              <strong>{[d.nome, d.cognome].filter(Boolean).join(" ") || "Ragazzo"}</strong>
              <span>{r.anno_percorso}° anno · {r.anno_pastorale} · {mostraDataComunione(r.presentata_il)}</span>
              {d.modalitaPresentazione === "segreteria_senza_account" && <small>Inserita dalla segreteria · genitore senza account</small>}
              <small>Genitore: {[d.genitore1Nome, d.genitore1Cognome].filter(Boolean).join(" ") || "—"}</small>
              <small className={completi ? "ars-com-stato-ok" : "ars-com-stato-attesa"}>
                Documenti: {completi ? "completi" : "da completare"}
              </small>
            </div>
            <button type="button" className="ars-sac-stampa" onClick={() => {setApertaId(v => v === r.id ? null : r.id);setMessaggioDocumento("");}}>
              {apertaId === r.id ? "Chiudi" : "Apri domanda"}
            </button>
            {apertaId === r.id && <div className="ars-com-scheda-iscrizione">
              <DomandaComunioneDettaglio riga={r} nomeParrocchia={nomeParrocchia} />
              <div className="ars-com-gestione-documenti">
                <h4>Documenti riconsegnati in parrocchia</h4>
                {DOCUMENTI_COMUNIONE.map(doc => {
                  const ricevuto = documentoRicevuto(r, doc.tipo);
                  const busy = Boolean(documentoInSalvataggio);
                  return <div className="ars-com-riga-documento" key={doc.tipo}>
                    <span>{doc.nome}</span>
                    <strong className={ricevuto ? "ars-com-stato-ok" : "ars-com-stato-attesa"}>
                      {ricevuto ? "Ricevuto" : "Da consegnare"}
                    </strong>
                    <button type="button" className="ars-sac-stampa" disabled={busy}
                      onClick={() => cambiaDocumento(r, doc.tipo, ricevuto ? "da_consegnare" : "ricevuto") }>
                      {documentoInSalvataggio === `${r.id}:${doc.tipo}` ? "Salvataggio…" : ricevuto ? "Segna da consegnare" : "Segna ricevuto"}
                    </button>
                  </div>;
                })}
                {messaggioDocumento && <p className="ars-com-messaggio-documenti" role="status">{messaggioDocumento}</p>}
              </div>
              <button type="button" className="ars-sac-conferma" onClick={() => setStampaId(r.id)}>Stampa domanda e informativa</button>
            </div>}
          </article>;
        })}
      </div> : <p className="ars-com-vuoto-iscrizioni">Nessuna domanda trovata per l'anno o la ricerca selezionati.</p>}
    <div className="ars-com-piede-iscrizioni">
      <button type="button" className="ars-sac-stampa" disabled={caricamento} onClick={() => {setAggiorna(n => n + 1);setMessaggioDocumento("");}}>Aggiorna elenco</button>
    </div>
    {daStampare && <div className="ars-com-solo-stampa"><DomandaComunioneDettaglio riga={daStampare} nomeParrocchia={nomeParrocchia} perStampa /></div>}
  </section>;
}

export default function SacramentiParroco({ tornaDashboard, nomeParrocchia = "", parrocchiaId }) {
  const [scelto, setScelto] = useState(null);
  const [sezione, setSezione] = useState(null);
  const [impostazioni, setImpostazioni] = useState(impostazioniIniziali);
  // Orari per anno pastorale e anno di percorso: i gruppi si formano nella card 05.
  const [orariCatechismo, setOrariCatechismo] = useState({});
  const [messaggio, setMessaggio] = useState("");
  const [salvato, setSalvato] = useState(false);
  const [modifica, setModifica] = useState(true);
  const [anteprima, setAnteprima] = useState(false);
  const [caricamento, setCaricamento] = useState(false);
  const [operazione, setOperazione] = useState(false);
  const modificaRichiesta = useRef(false);
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
        .select("anno_pastorale, durata, date_iscrizioni, informazioni, orari_catechismo, informativa_privacy_testo, informativa_privacy_versione")
        .eq("parrocchia_id", parrocchiaId).maybeSingle();
      if (!attivo) return;
      setCaricamento(false);
      if (error) { setMessaggio("Impossibile caricare le impostazioni: " + error.message); return; }
      if (data && !modificaRichiesta.current) {
        setOrariCatechismo(data.orari_catechismo && typeof data.orari_catechismo === "object"
          ? data.orari_catechismo : {});
        setImpostazioni({ anno: data.anno_pastorale, durata: String(data.durata),
          informazioni: data.informazioni || "",
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
  const sacramento = sacramenti.find((s) => s.id === scelto);
  const sezioneAttiva = sezioniComunione.find((s) => s.id === sezione);

  function indietro() {
    if (sezione) { setSezione(null); setMessaggio(""); }
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
    setOperazione(true);
    const { error } = await supabase.from("ars_comunione_impostazioni").upsert({
      parrocchia_id: parrocchiaId,
      anno_pastorale: impostazioni.anno,
      durata: Number(impostazioni.durata),
      date_iscrizioni: impostazioni.date,
      informazioni: impostazioni.informazioni,
      orari_catechismo: orariCatechismo,
      aggiornato_il: new Date().toISOString(),
    }, { onConflict: "parrocchia_id" });
    setOperazione(false);
    if (error) { setMessaggio("Salvataggio non riuscito: " + error.message); return; }
    modificaRichiesta.current = false;
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

/* Card 03 — Iscrizioni e rinnovi. Stili confinati alla card. */
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
`;