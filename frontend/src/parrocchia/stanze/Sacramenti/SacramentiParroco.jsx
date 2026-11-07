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

export default function SacramentiParroco({ tornaDashboard, nomeParrocchia = "", parrocchiaId }) {
  const [scelto, setScelto] = useState(null);
  const [sezione, setSezione] = useState(null);
  const [impostazioni, setImpostazioni] = useState(impostazioniIniziali);
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
        .select("anno_pastorale, durata, date_iscrizioni, informazioni, informativa_privacy_testo, informativa_privacy_versione")
        .eq("parrocchia_id", parrocchiaId).maybeSingle();
      if (!attivo) return;
      setCaricamento(false);
      if (error) { setMessaggio("Impossibile caricare le impostazioni: " + error.message); return; }
      if (data && !modificaRichiesta.current) {
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

  function controllaImpostazioni() {
    if (!/^\d{4}\/\d{4}$/.test(impostazioni.anno)) return "Inserisci l'anno pastorale nel formato 2026/2027.";
    const [inizio, fine] = impostazioni.anno.split("/").map(Number);
    if (fine !== inizio + 1) return "L'anno pastorale deve comprendere due anni consecutivi.";
    for (let anno = 1; anno <= Number(impostazioni.durata); anno++) {
      const { apertura, chiusura } = impostazioni.date[anno];
      if (apertura && chiusura && chiusura < apertura) return `Per il ${anno}° anno la chiusura precede l'apertura.`;
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
    if (!window.confirm(`Pubblicare l'informativa versione ${versione}? Le nuove iscrizioni conserveranno questo testo; quelle già inviate manterranno il precedente.`)) return;
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
          <p>Definisci l'anno pastorale e le date delle iscrizioni per ciascun anno di catechismo.</p>
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
`;