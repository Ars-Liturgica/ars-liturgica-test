import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import ElencoIscrizioniGrestParroco from "./ElencoIscrizioniGrestParroco";
import GestioneGruppiGrestParroco from "./GestioneGruppiGrestParroco";

const stile = {
  pagina: { maxWidth: 1120, margin: "0 auto", padding: "24px 16px" },
  intestazione: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  griglia: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 },
  card: { border: "1px solid #ded5c6", borderRadius: 14, padding: 20, background: "#fffdf8" },
  etichetta: { color: "#765c3e", fontSize: 13, fontWeight: 700, textTransform: "uppercase" },
  pulsante: { border: "1px solid #765c3e", borderRadius: 8, padding: "9px 14px", background: "transparent", color: "#503b28", cursor: "pointer" },
  campo: { display: "grid", gap: 6, marginBottom: 14 },
  controllo: { padding: 10, borderRadius: 8, border: "1px solid #b8aa99", font: "inherit" },
};

const bozzaIniziale = {
  id: null, tipo: "altro", attivitaPrincipaleId: null, titolo: "", descrizione: "", luogo: "", dataInizio: "", dataFine: "",
  modelloQuota: "gratuita", importoQuota: "", scadenzaQuota: "", configurazioneModulo: { versione: 1, tipo: "altro" },
  iscrizioniOnline: false, moduloScelto: "ars", statoOriginale: "bozza",
  informativaPrivacy: "", usaInformativaDiversa: false,
};

const bucketModuli = "ars-grest-moduli";

function oggiLocale() {
  const oggi = new Date();
  const dueCifre = (numero) => String(numero).padStart(2, "0");
  return `${oggi.getFullYear()}-${dueCifre(oggi.getMonth() + 1)}-${dueCifre(oggi.getDate())}`;
}

function dataPerInput(valore) {
  if (!valore) return "";
  const data = new Date(valore);
  if (Number.isNaN(data.getTime())) return "";
  const dueCifre = (numero) => String(numero).padStart(2, "0");
  return `${data.getFullYear()}-${dueCifre(data.getMonth() + 1)}-${dueCifre(data.getDate())}T${dueCifre(data.getHours())}:${dueCifre(data.getMinutes())}`;
}

function elencoDaRisposta(valore) {
  if (Array.isArray(valore)) return valore;
  for (const chiave of ["attivita", "data", "risultati"]) {
    if (Array.isArray(valore?.[chiave])) return valore[chiave];
  }
  return null;
}

function dataItaliana(valore) {
  if (!valore) return null;
  const data = new Date(valore);
  return Number.isNaN(data.getTime()) ? null : new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(data);
}

function modelloInformativaGrest(parrocchia, titolo) {
  const pulisci = (valore) => String(valore || "").trim();
  const localita = [pulisci(parrocchia.cap), pulisci(parrocchia.comune), pulisci(parrocchia.provincia) ? `provincia di ${pulisci(parrocchia.provincia)}` : ""]
    .filter(Boolean).join(" ");
  const sede = [pulisci(parrocchia.indirizzo), localita].filter(Boolean).join(", ");
  const contatti = [pulisci(parrocchia.email) ? `email ${pulisci(parrocchia.email)}` : "",
    pulisci(parrocchia.telefono) ? `telefono ${pulisci(parrocchia.telefono)}` : ""].filter(Boolean).join(", ");
  const attivita = pulisci(titolo) || "GREST";

  return `INFORMATIVA PER L'ISCRIZIONE A ${attivita.toUpperCase()}

La Parrocchia ${pulisci(parrocchia.nome)}, rappresentata dalla persona del parroco, con sede in ${sede}, ${contatti}, è il titolare del trattamento dei dati forniti per l'iscrizione a ${attivita}. Puoi contattarla agli stessi recapiti per domande sull'uso dei dati personali.

Quali dati raccogliamo. Per organizzare l'attività raccogliamo nome, cognome, data di nascita e taglia della maglietta del ragazzo; nome, cognome, rapporto con il ragazzo e telefono del genitore o tutore; l'eventuale indirizzo email; le persone delegate al ritiro e le autorizzazioni indicate nel modulo. Usiamo questi dati per ricevere e gestire le iscrizioni, seguire i partecipanti, comunicare con le famiglie e gestire l'eventuale quota e i pagamenti. Il telefono è necessario per poter contattare la famiglia; l'email è facoltativa. Questi dati sono trattati nell'ambito dell'attività pastorale ed educativa della parrocchia e degli obblighi amministrativi connessi.

Informazioni sulla salute. Il genitore o tutore può segnalare farmaci, patologie, intolleranze e altre indicazioni utili alla sicurezza e all'assistenza del ragazzo. Queste informazioni sono usate soltanto dalle persone autorizzate che ne hanno bisogno per assisterlo durante l'attività. Per trattare questi dati viene richiesto un consenso specifico, distinto dalla conferma di lettura di questa informativa.

Fotografia del partecipante. La fotografia del ragazzo è facoltativa. Se viene fornita con specifica autorizzazione, è usata per riconoscerlo negli elenchi delle iscrizioni e dei gruppi accessibili agli animatori e accompagnatori autorizzati. La pubblicazione di immagini o video su siti o social richiede una diversa autorizzazione. La mancata autorizzazione alle immagini non impedisce l'iscrizione.

Chi può accedere ai dati. Il parroco e le persone autorizzate dalla parrocchia possono vedere i dati necessari ai rispettivi compiti. Agli animatori e accompagnatori sono comunicati solo i dati utili alla gestione del gruppo e alla sicurezza dei ragazzi. I fornitori tecnici dell'app e degli eventuali servizi di pagamento trattano i dati per erogare i rispettivi servizi.

Per quanto tempo conserviamo i dati. I dati dell'iscrizione e l'eventuale fotografia del partecipante sono conservati fino alla successiva edizione dell'attività, salvo cancellazione anticipata decisa dalla parrocchia o ulteriore conservazione necessaria per obblighi di legge o per gestire richieste e contestazioni. La documentazione contabile relativa ai pagamenti è conservata per i termini previsti dalle norme applicabili.

I tuoi diritti. Puoi chiedere alla parrocchia accesso, correzione o cancellazione dei dati, limitazione del loro uso e le altre tutele previste dalle norme applicabili. Quando il trattamento si basa su un consenso, puoi revocarlo per il futuro contattando la parrocchia. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.

Confermare la lettura di questa informativa permette di passare al modulo d'iscrizione. Le autorizzazioni e gli eventuali consensi specifici vengono richiesti separatamente.`;
}

export default function AttivitaGruppiParroco({ parrocchiaId, tornaDashboard }) {
  const [attivita, setAttivita] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [caricamentoInformativa, setCaricamentoInformativa] = useState(false);
  const [mostraModulo, setMostraModulo] = useState(false);
  const [bozza, setBozza] = useState(bozzaIniziale);
  const [datiInformativa, setDatiInformativa] = useState(null);
  const [testoInformativaDiversa, setTestoInformativaDiversa] = useState("");
  const [informativaAutomatica, setInformativaAutomatica] = useState(false);
  const [pdfParrocchia, setPdfParrocchia] = useState(null);
  const [grestIscrizioni, setGrestIscrizioni] = useState(null);
  const [grestGruppi, setGrestGruppi] = useState(null);
  const [cartellaId, setCartellaId] = useState(null);
  const cartella = attivita.find((voce) => voce.id === cartellaId) || null;
  const principaleBozza = attivita.find((voce) => voce.id === bozza.attivitaPrincipaleId);
  const testoAggiunta = cartella
    ? cartella.tipo?.toLowerCase() === "grest" ? "Aggiungi un’attività al GREST" : "Aggiungi un’attività a questa iniziativa"
    : "Nuova attività";
  const elencoVisibile = attivita.filter((voce) =>
    cartella ? voce.attivita_principale_id === cartella.id : !voce.attivita_principale_id
  );

  function apriCartella(voce) {
    setCartellaId(voce.id);
    setMostraModulo(false);
    setErrore("");
    setMessaggio("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chiudiCartella() {
    setCartellaId(null);
    setMostraModulo(false);
    setErrore("");
    setMessaggio("");
  }

  async function cambiaTipo(tipo) {
    if (tipo !== "grest") {
      setBozza((precedente) => ({ ...precedente, tipo, iscrizioniOnline: false }));
      return;
    }
    setCaricamentoInformativa(true);
    const { data, error } = await supabase.rpc("ars_dati_parrocchia_informativa", {
      p_parrocchia_id: parrocchiaId,
    });
    setCaricamentoInformativa(false);
    if (error || !data?.nome?.trim() || !data?.indirizzo?.trim() || !data?.comune?.trim() ||
        !(data?.email?.trim() || data?.telefono?.trim())) {
      setErrore("Per preparare il GREST, completa nome, indirizzo, comune e almeno un recapito nella scheda della parrocchia.");
      return;
    }
    setDatiInformativa(data);
    setInformativaAutomatica(true);
    setErrore("");
    setBozza((precedente) => ({ ...precedente, tipo,
      usaInformativaDiversa: false,
      informativaPrivacy: modelloInformativaGrest(data, precedente.titolo),
    }));
  }

  const caricaAttivita = useCallback(async () => {
    if (!parrocchiaId) {
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");
    const { data, error } = await supabase.rpc("ars_elenco_attivita_parroco", {
      p_parrocchia_id: parrocchiaId,
    });

    if (error) {
      console.error("Errore caricamento attività:", error);
      setErrore("Impossibile caricare le attività. Riprova tra poco.");
    } else {
      const elenco = elencoDaRisposta(data);
      if (!elenco) {
        console.error("Formato elenco attività inatteso:", data);
        setErrore("Il formato dell'elenco delle attività non è riconosciuto.");
      } else {
        setAttivita(elenco);
      }
    }
    setCaricamento(false);
  }, [parrocchiaId]);

  useEffect(() => {
    caricaAttivita();
  }, [caricaAttivita]);

  async function apriModulo(voce = null, principaleId = null) {
    setErrore("");
    setMessaggio("");
    const tipo = voce?.tipo || "altro";
    const configurazione = voce?.configurazione_modulo || { versione: 1, tipo };
    let informativaPrivacy = configurazione.informativa_privacy_testo || "";
    let datiParrocchia = null;
    const usaInformativaDiversa = Boolean(informativaPrivacy.trim()) &&
      configurazione.informativa_privacy_modalita !== "standard";

    if (!parrocchiaId) return setErrore("La parrocchia non è ancora disponibile.");
    if (tipo === "grest") {
    setCaricamentoInformativa(true);
    const { data, error } = await supabase.rpc("ars_dati_parrocchia_informativa", {
      p_parrocchia_id: parrocchiaId,
    });
    setCaricamentoInformativa(false);
    if (!error && data?.nome?.trim() && data?.indirizzo?.trim() && data?.comune?.trim() && (data?.email?.trim() || data?.telefono?.trim())) {
      datiParrocchia = data;
    } else if (!informativaPrivacy.trim()) {
      console.error("Caricamento dati parrocchia per informativa:", error || data);
      return setErrore("Per preparare l'informativa, completa nome, indirizzo, comune e almeno un recapito nella scheda della parrocchia.");
    }
    // Un testo già salvato non viene rigenerato all'apertura.
    if (!informativaPrivacy.trim()) {
      informativaPrivacy = modelloInformativaGrest(datiParrocchia, voce?.titolo || "GREST");
    }

    }
    setDatiInformativa(datiParrocchia);
    setTestoInformativaDiversa(usaInformativaDiversa ? informativaPrivacy : "");
    setInformativaAutomatica(Boolean(datiParrocchia) && !usaInformativaDiversa);
    setBozza(voce ? {
      id: voce.id,
      tipo,
      attivitaPrincipaleId: voce.attivita_principale_id || null,
      titolo: voce.titolo || "",
      descrizione: voce.descrizione || "",
      luogo: voce.luogo || "",
      dataInizio: dataPerInput(voce.data_inizio),
      dataFine: dataPerInput(voce.data_fine),
      modelloQuota: voce.modello_quota || "gratuita",
      importoQuota: voce.importo_quota == null ? "" : String(voce.importo_quota),
      scadenzaQuota: voce.scadenza_quota || "",
      configurazioneModulo: configurazione,
      iscrizioniOnline: configurazione.abilita_iscrizioni_grest === true,
      informativaPrivacy,
      usaInformativaDiversa,
      moduloScelto: configurazione.modulo_cartaceo_modalita === "parrocchia" ||
        (configurazione.modulo_cartaceo_modalita === "entrambi" && configurazione.modulo_cartaceo_url) ||
        (!configurazione.modulo_cartaceo_modalita && configurazione.modulo_cartaceo_url) ? "parrocchia" : "ars",
      statoOriginale: voce.stato,
    } : { ...bozzaIniziale, attivitaPrincipaleId: principaleId, configurazioneModulo: { ...bozzaIniziale.configurazioneModulo }, informativaPrivacy });
    setPdfParrocchia(null);
    setMostraModulo(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvaAttivita(evento, stato = bozza.statoOriginale || "bozza") {
    evento?.preventDefault();
    setErrore("");
    setMessaggio("");
    if (stato === "pubblicata" && !bozza.id) return setErrore("Salva prima la bozza, poi pubblicala.");
    if (!parrocchiaId) return setErrore("La parrocchia non è ancora disponibile.");
    if (!bozza.titolo.trim()) return setErrore("Inserisci il titolo.");
    if (stato === "pubblicata" && bozza.tipo === "grest" && bozza.iscrizioniOnline && !bozza.informativaPrivacy.trim()) {
      return setErrore("Controlla e completa l'informativa prima di aprire le iscrizioni online.");
    }
    if (bozza.dataInizio && bozza.dataFine && new Date(bozza.dataFine) < new Date(bozza.dataInizio)) {
      return setErrore("La data finale deve seguire quella iniziale.");
    }
    if (bozza.modelloQuota === "quota_fissa" && (bozza.importoQuota === "" || !Number.isFinite(Number(bozza.importoQuota)) || Number(bozza.importoQuota) <= 0)) {
      return setErrore("La quota fissa deve essere maggiore di zero.");
    }
    if (stato === "pubblicata" && bozza.modelloQuota === "quota_fissa" && bozza.scadenzaQuota && bozza.scadenzaQuota < oggiLocale()) {
      return setErrore("La scadenza della quota è passata. Aggiornala prima di pubblicare.");
    }
    if (bozza.tipo === "grest" && bozza.id && bozza.moduloScelto !== "ars" && !pdfParrocchia && !bozza.configurazioneModulo?.modulo_cartaceo_url) {
      return setErrore("Seleziona il PDF della parrocchia prima di salvare.");
    }

    setSalvataggio(true);
    let urlPersonalizzato = bozza.configurazioneModulo?.modulo_cartaceo_url;
    if (bozza.tipo === "grest" && bozza.moduloScelto !== "ars" && pdfParrocchia) {
      if (!bozza.id) {
        setSalvataggio(false);
        return setErrore("Salva prima la bozza, poi carica il PDF della parrocchia.");
      }
      if (pdfParrocchia.size > 5 * 1024 * 1024 || pdfParrocchia.size === 0 ||
          pdfParrocchia.type !== "application/pdf" || (await pdfParrocchia.slice(0, 5).text()) !== "%PDF-") {
        setSalvataggio(false);
        return setErrore("Carica un PDF valido di massimo 5 MB, senza dati compilati.");
      }
      const percorso = `${parrocchiaId}/${bozza.id}.pdf`;
      const { error: errorePdf } = await supabase.storage.from(bucketModuli).upload(percorso, pdfParrocchia, {
        contentType: "application/pdf", upsert: true, cacheControl: "0",
      });
      if (errorePdf) {
        console.error("Caricamento modulo GREST:", errorePdf);
        setSalvataggio(false);
        return setErrore("Impossibile caricare il PDF della parrocchia. Riprova.");
      }
      const { data: pubblico } = supabase.storage.from(bucketModuli).getPublicUrl(percorso);
      urlPersonalizzato = `${pubblico.publicUrl}?v=${Date.now()}`;
    }
    const configurazioneModulo = bozza.tipo === "grest" ? { ...bozza.configurazioneModulo,
      tipo: bozza.tipo,
      informativa_privacy_testo: bozza.informativaPrivacy.trim(),
      informativa_privacy_modalita: bozza.usaInformativaDiversa ? "diversa" : "standard",
      abilita_iscrizioni_grest: stato === "pubblicata" && bozza.iscrizioniOnline,
      modulo_cartaceo_modalita: bozza.moduloScelto,
    } : { ...bozza.configurazioneModulo, tipo: bozza.tipo, abilita_iscrizioni_grest: false };
    if (bozza.tipo === "grest" && bozza.moduloScelto !== "ars" && urlPersonalizzato) configurazioneModulo.modulo_cartaceo_url = urlPersonalizzato;
    else delete configurazioneModulo.modulo_cartaceo_url;
    const { data, error } = await supabase.rpc("ars_salva_attivita_collegata", {
      p_parrocchia_id: parrocchiaId,
      p_id: bozza.id,
      p_tipo: bozza.tipo,
      p_attivita_principale_id: bozza.attivitaPrincipaleId,
      p_titolo: bozza.titolo.trim(),
      p_descrizione: bozza.descrizione.trim() || null,
      p_luogo: bozza.luogo.trim() || null,
      p_data_inizio: bozza.dataInizio ? new Date(bozza.dataInizio).toISOString() : null,
      p_data_fine: bozza.dataFine ? new Date(bozza.dataFine).toISOString() : null,
      p_stato: stato,
      p_modello_quota: bozza.modelloQuota,
      p_importo_quota: bozza.modelloQuota === "quota_fissa" ? Number(bozza.importoQuota) : null,
      p_valuta: "EUR",
      p_scadenza_quota: bozza.modelloQuota === "quota_fissa" ? (bozza.scadenzaQuota || null) : null,
      p_configurazione_modulo: configurazioneModulo,
    });
    setSalvataggio(false);
    if (error || !data?.id || data?.stato !== stato) {
      console.error("Errore salvataggio attività:", error || data);
      setErrore(error?.message || "Non è stato possibile confermare il salvataggio dell'attività.");
      return;
    }
    setMostraModulo(false);
    setBozza(bozzaIniziale);
    await caricaAttivita();
    setMessaggio(stato === "pubblicata"
      ? bozza.statoOriginale === "pubblicata"
        ? "Modifiche salvate nell’attività pubblicata."
        : bozza.tipo === "grest" && bozza.iscrizioniOnline
          ? "Attività pubblicata. I fedeli possono inviare le iscrizioni."
          : "Attività pubblicata."
      : "Bozza salvata. L’attività non è ancora visibile ai fedeli.");
  }

  return (
    grestIscrizioni ? <ElencoIscrizioniGrestParroco
      attivita={grestIscrizioni}
      onIndietro={() => { setGrestIscrizioni(null); caricaAttivita(); }}
    /> :
    grestGruppi ? <GestioneGruppiGrestParroco
      attivita={grestGruppi}
      parrocchiaId={parrocchiaId}
      onIndietro={() => { setGrestGruppi(null); caricaAttivita(); }}
    /> :
    <main style={stile.pagina}>
      <header style={stile.intestazione}>
        <div>
          <button type="button" style={stile.pulsante} onClick={tornaDashboard}>
            ← Torna alla dashboard
          </button>
          <h1>{cartella ? cartella.titolo : "Attività e Gruppi"}</h1>
          <p>{cartella ? "Gestisci questa attività e le iniziative al suo interno." : "Le attività della tua parrocchia, comprese le bozze. Puoi creare un GREST, una gita o un’altra attività parrocchiale."}</p>
          {cartella && <button type="button" style={stile.pulsante} onClick={chiudiCartella}>← Tutte le attività</button>}
        </div>
        <button type="button" style={stile.pulsante} onClick={caricaAttivita} disabled={caricamento || !parrocchiaId}>
          Aggiorna elenco
        </button>
        {!mostraModulo && <button type="button" style={stile.pulsante} disabled={!parrocchiaId || caricamento || caricamentoInformativa || (cartella && !["bozza", "pubblicata"].includes(cartella.stato))} onClick={() => apriModulo(null, cartella?.id || null)}>
          + {testoAggiunta}
        </button>}
      </header>

      {cartella && !mostraModulo && <section style={{ ...stile.card, marginBottom: 24 }}>
        <span style={stile.etichetta}>{cartella.stato}</span>
        <h2>{cartella.titolo}</h2>
        {cartella.descrizione && <p>{cartella.descrizione}</p>}
        {(cartella.data_inizio || cartella.data_fine) && <p>{[dataItaliana(cartella.data_inizio), dataItaliana(cartella.data_fine)].filter(Boolean).join(" – ")}</p>}
        {cartella.luogo && <p>Luogo: {cartella.luogo}</p>}
        <p>{cartella.modello_quota === "quota_fissa" ? `Quota: ${Number(cartella.importo_quota).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}` : cartella.modello_quota === "contributo_libero" ? "Contributo libero" : "Gratuita"}</p>
        {["bozza", "pubblicata"].includes(cartella.stato) && <>
          <button type="button" style={stile.pulsante} disabled={caricamentoInformativa} onClick={() => apriModulo(cartella)}>Modifica</button>
          {cartella.tipo?.toLowerCase() === "grest" && <>
            {cartella.stato === "pubblicata" && <> {" "}<button type="button" style={stile.pulsante} onClick={() => setGrestIscrizioni(cartella)}>Vedi iscrizioni</button></>}
            {" "}<button type="button" style={stile.pulsante} onClick={() => setGrestGruppi(cartella)}>Gestisci gruppi</button>
          </>}
        </>}
        <h3>{cartella.tipo?.toLowerCase() === "grest" ? "Attività del GREST" : "Attività collegate"}</h3>
        <p>{cartella.tipo?.toLowerCase() === "grest"
          ? "Organizza una gita, un picnic o un’altra iniziativa per i partecipanti al GREST."
          : "Aggiungi una gita, un picnic o un’altra iniziativa collegata a questa attività."}</p>
      </section>}
      {mostraModulo && (
        <form onSubmit={(evento) => salvaAttivita(evento)} style={{ ...stile.card, marginBottom: 24 }}>
          <h2>{bozza.id ? "Modifica attività" : principaleBozza?.tipo?.toLowerCase() === "grest" ? `Nuova attività del ${principaleBozza.titolo}` : "Nuova attività"}</h2>
          {bozza.attivitaPrincipaleId && <p>Questa attività fa parte {principaleBozza?.tipo?.toLowerCase() === "grest" ? `del ${principaleBozza.titolo}` : `di «${principaleBozza?.titolo || "attività principale"}»`}.</p>}
          {bozza.statoOriginale === "pubblicata" && <p>Le modifiche salvate saranno subito visibili nell’attività pubblicata.</p>}
          <label style={stile.campo}>Tipo di attività
            <select style={stile.controllo} value={bozza.tipo} disabled={salvataggio || caricamentoInformativa || Boolean(bozza.id)} onChange={(e) => cambiaTipo(e.target.value)}>
              <option value="altro">Altra attività</option>
              <option value="grest">GREST</option>
              <option value="gita">Gita</option>
              <option value="picnic">Picnic</option>
              <option value="pellegrinaggio">Pellegrinaggio</option>
              <option value="catechismo">Catechismo</option>
              {!["altro", "grest", "gita", "picnic", "pellegrinaggio", "catechismo"].includes(bozza.tipo) && <option value={bozza.tipo}>{bozza.tipo}</option>}
            </select>
          </label>
          <label style={stile.campo}>Titolo <input style={stile.controllo} required value={bozza.titolo} onChange={(e) => {
            const titolo = e.target.value;
            setBozza({ ...bozza, titolo, informativaPrivacy: bozza.tipo === "grest" && informativaAutomatica && !bozza.usaInformativaDiversa && datiInformativa
              ? modelloInformativaGrest(datiInformativa, titolo) : bozza.informativaPrivacy });
          }} /></label>
          <label style={stile.campo}>Descrizione <textarea style={stile.controllo} rows={4} value={bozza.descrizione} onChange={(e) => setBozza({ ...bozza, descrizione: e.target.value })} /></label>
          <label style={stile.campo}>Luogo <input style={stile.controllo} value={bozza.luogo} onChange={(e) => setBozza({ ...bozza, luogo: e.target.value })} /></label>
          <label style={stile.campo}>Inizio <input style={stile.controllo} type="datetime-local" value={bozza.dataInizio} onChange={(e) => setBozza({ ...bozza, dataInizio: e.target.value })} /></label>
          <label style={stile.campo}>Fine <input style={stile.controllo} type="datetime-local" value={bozza.dataFine} onChange={(e) => setBozza({ ...bozza, dataFine: e.target.value })} /></label>
          <label style={stile.campo}>Tipo di quota
            <select style={stile.controllo} value={bozza.modelloQuota} onChange={(e) => setBozza({ ...bozza, modelloQuota: e.target.value })}>
              <option value="gratuita">Gratuita</option>
              <option value="quota_fissa">Quota fissa</option>
              <option value="contributo_libero">Contributo libero</option>
            </select>
          </label>
          {bozza.modelloQuota === "quota_fissa" && <>
            <label style={stile.campo}>Quota fissa in euro <input style={stile.controllo} type="number" min="0.01" step="0.01" required value={bozza.importoQuota} onChange={(e) => setBozza({ ...bozza, importoQuota: e.target.value })} /></label>
            <label style={stile.campo}>Scadenza quota <input style={stile.controllo} type="date" value={bozza.scadenzaQuota} onChange={(e) => setBozza({ ...bozza, scadenzaQuota: e.target.value })} /></label>
          </>}
          {bozza.tipo === "grest" && <>
          <fieldset style={{ border: "1px solid #ded5c6", borderRadius: 10, margin: "16px 0", padding: 16 }}>
            <legend>Informativa privacy per le iscrizioni online</legend>
            <p>L'informativa standard usa i dati della parrocchia. Verifica che i recapiti e le modalità descritte corrispondano alla tua attività.</p>
            <label style={{ display: "block", marginBottom: 12 }}>
              <input type="checkbox" checked={bozza.usaInformativaDiversa} onChange={(e) => {
                if (e.target.checked) {
                  setBozza({ ...bozza, usaInformativaDiversa: true,
                    informativaPrivacy: testoInformativaDiversa || bozza.informativaPrivacy });
                  setInformativaAutomatica(false);
                  return;
                }
                if (!datiInformativa) {
                  setErrore("Per usare l'informativa standard riapri l'attività: servono i dati aggiornati della parrocchia.");
                  return;
                }
                setTestoInformativaDiversa(bozza.informativaPrivacy);
                setBozza({ ...bozza, usaInformativaDiversa: false,
                  informativaPrivacy: modelloInformativaGrest(datiInformativa, bozza.titolo) });
                setInformativaAutomatica(true);
                setErrore("");
              }} /> Usa un'informativa diversa
            </label>
            <label style={stile.campo}>Testo dell’informativa
              <textarea style={stile.controllo} rows={10} maxLength={30000} value={bozza.informativaPrivacy}
                readOnly={!bozza.usaInformativaDiversa}
                onChange={(e) => { setBozza({ ...bozza, informativaPrivacy: e.target.value }); }}
                placeholder="Incolla l’informativa della parrocchia per questa attività" />
            </label>
          </fieldset>
          <fieldset style={{ border: "1px solid #ded5c6", borderRadius: 10, margin: "16px 0", padding: 16 }}>
            <legend>Modulo cartaceo per chi non ha email</legend>
            <label style={{ display: "block", marginBottom: 10 }}>
              <input type="radio" name="moduloCartaceo" checked={bozza.moduloScelto === "ars"} onChange={() => { setBozza({ ...bozza, moduloScelto: "ars" }); setPdfParrocchia(null); }} /> Usa il modulo Ars Liturgica
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              <input type="radio" name="moduloCartaceo" checked={bozza.moduloScelto === "parrocchia"} onChange={() => setBozza({ ...bozza, moduloScelto: "parrocchia" })} /> Usa il modulo della parrocchia
            </label>
            {bozza.moduloScelto !== "ars" && (
              bozza.id ? <>
                <label style={stile.campo}>Carica un PDF vuoto (massimo 5 MB)
                  <input style={stile.controllo} type="file" accept="application/pdf,.pdf" onChange={(e) => setPdfParrocchia(e.target.files?.[0] || null)} />
                </label>
                {bozza.configurazioneModulo?.modulo_cartaceo_url && !pdfParrocchia && <p>Il PDF già caricato rimane attivo. Scegli un file solo per sostituirlo.</p>}
                {bozza.configurazioneModulo?.modulo_cartaceo_url && <p><a href={bozza.configurazioneModulo.modulo_cartaceo_url} target="_blank" rel="noopener noreferrer">Apri il PDF della parrocchia attualmente caricato</a></p>}
                <p>Il PDF sarà pubblico. Non caricare moduli compilati né dati sanitari.</p>
              </> : <p>Salva prima la bozza per poter caricare il PDF della parrocchia.</p>
            )}
            {bozza.moduloScelto === "ars" && bozza.configurazioneModulo?.modulo_cartaceo_url && <p>Dopo il salvataggio il PDF della parrocchia non sarà più mostrato ai fedeli. Il file già caricato rimarrà nel deposito pubblico.</p>}
          </fieldset>
          {bozza.id && <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 16 }}>
            <input type="checkbox" checked={bozza.iscrizioniOnline} onChange={(e) => setBozza({ ...bozza, iscrizioniOnline: e.target.checked })} />
            {bozza.statoOriginale === "pubblicata" ? "Iscrizioni online aperte" : "Apri le iscrizioni online quando pubblichi questa attività"}
          </label>}
          </>}
          <button type="submit" style={stile.pulsante} disabled={salvataggio || caricamentoInformativa}>{salvataggio ? "Salvataggio…" : bozza.statoOriginale === "pubblicata" ? "Salva modifiche" : "Salva bozza"}</button>{" "}
          {bozza.id && bozza.statoOriginale !== "pubblicata" && <button type="button" style={stile.pulsante} disabled={salvataggio || caricamentoInformativa} onClick={(evento) => {
            if (evento.currentTarget.form?.reportValidity()) salvaAttivita(evento, "pubblicata");
          }}>{salvataggio ? "Pubblicazione…" : "Pubblica"}</button>}{" "}
          <button type="button" style={stile.pulsante} disabled={salvataggio || caricamentoInformativa} onClick={() => setMostraModulo(false)}>Annulla</button>
        </form>
      )}
      {caricamento && <p role="status">Caricamento delle attività…</p>}
      {errore && <p role="alert">{errore}</p>}
      {messaggio && <p role="status">{messaggio}</p>}
      {!caricamento && !errore && elencoVisibile.length === 0 && (
        <section style={stile.card}>
          <h2>{cartella ? cartella.tipo?.toLowerCase() === "grest" ? "Non hai ancora aggiunto attività al GREST" : "Non hai ancora aggiunto attività collegate" : "Nessuna attività ancora creata"}</h2>
          <p>Premi «{testoAggiunta}» per iniziare.</p>
        </section>
      )}
      {!caricamento && !errore && elencoVisibile.length > 0 && (
        <div style={stile.griglia}>
          {elencoVisibile.map((voce) => {
            const inizio = dataItaliana(voce.data_inizio);
            const fine = dataItaliana(voce.data_fine);
            return (
              <article key={voce.id} style={stile.card}>
                <span style={stile.etichetta}>{voce.stato || "Attività"}</span>
                <h2>{voce.titolo || "Attività senza titolo"}</h2>
                {voce.descrizione && <p>{voce.descrizione}</p>}
                {(inizio || fine) && <p>{[inizio, fine].filter(Boolean).join(" – ")}</p>}
                {voce.luogo && <p>Luogo: {voce.luogo}</p>}
                <p>{voce.modello_quota === "quota_fissa" ? `Quota: ${Number(voce.importo_quota).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}` : voce.modello_quota === "contributo_libero" ? "Contributo libero" : "Gratuita"}</p>
                {!cartella && <><button type="button" style={stile.pulsante} onClick={() => apriCartella(voce)}>Apri attività</button>{" "}</>}
                {["bozza", "pubblicata"].includes(voce.stato) && (
                  <button type="button" style={stile.pulsante} disabled={caricamentoInformativa} onClick={() => apriModulo(voce)}>Modifica</button>
                )}
                {["bozza", "pubblicata"].includes(voce.stato) && voce.tipo?.toLowerCase() === "grest" && <>
                  {voce.stato === "pubblicata" && <>{" "}<button type="button" style={stile.pulsante} onClick={() => setGrestIscrizioni(voce)}>Vedi iscrizioni</button></>}
                  {" "}<button type="button" style={stile.pulsante} onClick={() => setGrestGruppi(voce)}>Gestisci gruppi</button>
                </>}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}