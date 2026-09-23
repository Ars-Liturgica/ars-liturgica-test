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
  id: null, titolo: "GREST 2027", descrizione: "", luogo: "", dataInizio: "", dataFine: "",
  modelloQuota: "gratuita", importoQuota: "", scadenzaQuota: "", configurazioneModulo: { versione: 1, tipo: "grest" },
  iscrizioniOnline: false, moduloScelto: "ars", statoOriginale: "bozza",
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
  const data = new Date(`${String(valore).slice(0, 10)}T12:00:00`);
  return Number.isNaN(data.getTime()) ? null : new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(data);
}

function numeroWhatsApp(valore) {
  const numero = String(valore || "").replace(/[^\d+]/g, "");
  if (numero.startsWith("+")) return /^\+[1-9]\d{7,14}$/.test(numero) ? numero.slice(1) : null;
  if (numero.startsWith("00")) return /^00[1-9]\d{7,14}$/.test(numero) ? numero.slice(2) : null;
  if (/^39\d{9,10}$/.test(numero)) return numero;
  if (/^3\d{9}$/.test(numero)) return `39${numero}`;
  return null;
}

export default function AttivitaGruppiParroco({ parrocchiaId, tornaDashboard }) {
  const [attivita, setAttivita] = useState([]);
  const [praticheCancellate, setPraticheCancellate] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [mostraModulo, setMostraModulo] = useState(false);
  const [bozza, setBozza] = useState(bozzaIniziale);
  const [pdfParrocchia, setPdfParrocchia] = useState(null);
  const [grestIscrizioni, setGrestIscrizioni] = useState(null);
  const [grestGruppi, setGrestGruppi] = useState(null);
  const [cancellazione, setCancellazione] = useState(null);
  const [testoCancellazione, setTestoCancellazione] = useState("");
  const [cancellazioneInCorso, setCancellazioneInCorso] = useState(false);
  const [praticaAperta, setPraticaAperta] = useState(null);
  const [famiglie, setFamiglie] = useState([]);
  const [avvisoInCorso, setAvvisoInCorso] = useState(null);
  const grest2027InBozza = attivita.find((voce) =>
    voce.tipo?.toLowerCase() === "grest" &&
    voce.titolo?.trim().toLowerCase() === "grest 2027" &&
    voce.stato === "bozza"
  );

  const caricaAttivita = useCallback(async () => {
    if (!parrocchiaId) {
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");
    const [{ data, error }, { data: pratiche, error: errorePratiche }] = await Promise.all([
      supabase.rpc("ars_elenco_attivita_parroco", { p_parrocchia_id: parrocchiaId }),
      supabase.rpc("ars_elenco_attivita_cancellate_parroco", { p_parrocchia_id: parrocchiaId }),
    ]);

    if (error || errorePratiche) {
      console.error("Errore caricamento attività:", error || errorePratiche);
      setErrore("Impossibile caricare le attività. Riprova tra poco.");
    } else {
      const elenco = elencoDaRisposta(data);
      const archivio = elencoDaRisposta(pratiche);
      if (!elenco || !archivio) {
        console.error("Formato elenco attività inatteso:", data, pratiche);
        setErrore("Il formato dell'elenco delle attività non è riconosciuto.");
      } else {
        setAttivita(elenco.filter((voce) => voce.stato !== "annullata"));
        setPraticheCancellate(archivio);
      }
    }
    setCaricamento(false);
  }, [parrocchiaId]);

  useEffect(() => {
    caricaAttivita();
  }, [caricaAttivita]);

  function modificaBozza(voce) {
    setBozza({
      id: voce.id,
      titolo: voce.titolo || "GREST 2027",
      descrizione: voce.descrizione || "",
      luogo: voce.luogo || "",
      dataInizio: dataPerInput(voce.data_inizio),
      dataFine: dataPerInput(voce.data_fine),
      modelloQuota: voce.modello_quota || "gratuita",
      importoQuota: voce.importo_quota == null ? "" : String(voce.importo_quota),
      scadenzaQuota: voce.scadenza_quota || "",
      configurazioneModulo: voce.configurazione_modulo || { versione: 1, tipo: "grest" },
      iscrizioniOnline: voce.configurazione_modulo?.abilita_iscrizioni_grest === true,
      moduloScelto: voce.configurazione_modulo?.modulo_cartaceo_modalita || (voce.configurazione_modulo?.modulo_cartaceo_url ? "parrocchia" : "ars"),
      statoOriginale: voce.stato,
    });
    setPdfParrocchia(null);
    setErrore("");
    setMessaggio("");
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
    if (bozza.dataInizio && bozza.dataFine && new Date(bozza.dataFine) < new Date(bozza.dataInizio)) {
      return setErrore("La data finale deve seguire quella iniziale.");
    }
    if (bozza.modelloQuota === "quota_fissa" && (bozza.importoQuota === "" || !Number.isFinite(Number(bozza.importoQuota)) || Number(bozza.importoQuota) <= 0)) {
      return setErrore("La quota fissa deve essere maggiore di zero.");
    }
    if (stato === "pubblicata" && bozza.modelloQuota === "quota_fissa" && bozza.scadenzaQuota && bozza.scadenzaQuota < oggiLocale()) {
      return setErrore("La scadenza della quota è passata. Aggiornala prima di pubblicare.");
    }
    if (bozza.id && bozza.moduloScelto !== "ars" && !pdfParrocchia && !bozza.configurazioneModulo?.modulo_cartaceo_url) {
      return setErrore("Seleziona il PDF della parrocchia prima di salvare.");
    }

    setSalvataggio(true);
    let urlPersonalizzato = bozza.configurazioneModulo?.modulo_cartaceo_url;
    if (bozza.moduloScelto !== "ars" && pdfParrocchia) {
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
    const configurazioneModulo = { ...bozza.configurazioneModulo,
      abilita_iscrizioni_grest: stato === "pubblicata" && bozza.iscrizioniOnline,
      modulo_cartaceo_modalita: bozza.moduloScelto,
    };
    if (bozza.moduloScelto !== "ars" && urlPersonalizzato) configurazioneModulo.modulo_cartaceo_url = urlPersonalizzato;
    else delete configurazioneModulo.modulo_cartaceo_url;
    const { data, error } = await supabase.rpc("ars_salva_attivita_parrocchiale", {
      p_parrocchia_id: parrocchiaId,
      p_id: bozza.id,
      p_tipo: "grest",
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
      ? bozza.iscrizioniOnline
        ? "Attività pubblicata. I fedeli possono inviare le iscrizioni."
        : "Attività pubblicata. Le iscrizioni online sono ancora chiuse."
      : "Bozza salvata. L'attività non è ancora visibile ai fedeli.");
  }

  function preparaCancellazione(voce) {
    setMostraModulo(false);
    setErrore("");
    setMessaggio("");
    setCancellazione(voce);
    setTestoCancellazione(`L’attività ${voce.titolo} è stata cancellata. Per informazioni, vi invitiamo a contattare il parroco o la segreteria parrocchiale.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confermaCancellazione(evento) {
    evento.preventDefault();
    if (!cancellazione || !testoCancellazione.trim() || cancellazioneInCorso) return;
    setCancellazioneInCorso(true);
    setErrore("");
    const { data, error } = await supabase.rpc("ars_cancella_attivita_parroco", {
      p_attivita_id: cancellazione.id,
      p_messaggio: testoCancellazione.trim(),
    });
    setCancellazioneInCorso(false);
    if (error || data?.stato !== "annullata") {
      setErrore(error?.message || "Non è stato possibile cancellare l'attività. Riprova.");
      return;
    }
    setCancellazione(null);
    setTestoCancellazione("");
    await caricaAttivita();
    setMessaggio(`Attività cancellata e avviso pubblicato. ${data.destinatari_in_attesa || 0} recapiti telefonici da verificare e avvisare; ${data.destinatari_da_contattare || 0} famiglie senza telefono da contattare con altro mezzo.`);
  }

  async function apriFamiglie(pratica) {
    if (praticaAperta?.id === pratica.id) {
      setPraticaAperta(null);
      setFamiglie([]);
      return;
    }
    setErrore("");
    const { data, error } = await supabase.rpc("ars_famiglie_cancellazione_parroco", {
      p_attivita_id: pratica.id,
    });
    if (error || !Array.isArray(data)) {
      setErrore(error?.message || "Impossibile caricare i recapiti delle famiglie.");
      return;
    }
    setPraticaAperta(pratica);
    setFamiglie(data);
  }

  async function confermaAvviso(avviso) {
    if (!praticaAperta || avvisoInCorso) return;
    setAvvisoInCorso(avviso.id);
    setErrore("");
    const { error } = await supabase.rpc("ars_conferma_avviso_whatsapp_parroco", {
      p_attivita_id: praticaAperta.id,
      p_avviso_id: avviso.id,
    });
    setAvvisoInCorso(null);
    if (error) return setErrore(error.message || "Impossibile registrare la conferma.");
    setFamiglie((precedenti) => precedenti.map((f) => f.id === avviso.id ? { ...f, stato: "inviato" } : f));
    await caricaAttivita();
    setMessaggio("Invio WhatsApp registrato su tua conferma.");
  }

  async function concludiQuestioni(pratica) {
    if (!window.confirm(`Confermi che tutte le questioni relative a «${pratica.titolo}» sono state risolte? Le informazioni resteranno conservate secondo le scadenze previste.`)) return;
    setErrore("");
    const { error } = await supabase.rpc("ars_concludi_questioni_attivita_parroco", {
      p_attivita_id: pratica.id,
    });
    if (error) return setErrore(error.message || "Impossibile chiudere la pratica.");
    await caricaAttivita();
    setMessaggio("Questioni concluse registrate. La pratica resta nell'archivio riservato.");
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
          <h1>Attività e Gruppi</h1>
          <p>Le attività della tua parrocchia, comprese le bozze.</p>
        </div>
        <button type="button" style={stile.pulsante} onClick={caricaAttivita} disabled={caricamento || !parrocchiaId}>
          Aggiorna elenco
        </button>
        {!mostraModulo && <button type="button" style={stile.pulsante} disabled={!parrocchiaId || caricamento || Boolean(errore)} onClick={() => {
          if (grest2027InBozza) modificaBozza(grest2027InBozza);
          else { setBozza(bozzaIniziale); setPdfParrocchia(null); setMostraModulo(true); setErrore(""); setMessaggio(""); }
        }}>
          {grest2027InBozza ? "Riprendi GREST 2027" : "+ Prepara GREST"}
        </button>}
      </header>

      {cancellazione && (
        <form onSubmit={confermaCancellazione} style={{ ...stile.card, marginBottom: 24 }}>
          <h2>Cancella «{cancellazione.titolo}»</h2>
          <p>L'attività non accetterà nuove iscrizioni. La pratica e le iscrizioni resteranno conservate per la parrocchia.</p>
          <label style={stile.campo}>Avviso di cancellazione
            <textarea style={stile.controllo} rows={4} maxLength={2000} required value={testoCancellazione} onChange={(e) => setTestoCancellazione(e.target.value)} />
          </label>
          <button type="submit" style={stile.pulsante} disabled={cancellazioneInCorso || !testoCancellazione.trim()}>
            {cancellazioneInCorso ? "Cancellazione…" : "Conferma cancellazione"}
          </button>{" "}
          <button type="button" style={stile.pulsante} disabled={cancellazioneInCorso} onClick={() => setCancellazione(null)}>Torna indietro</button>
        </form>
      )}

      {mostraModulo && (
        <form onSubmit={(evento) => salvaAttivita(evento)} style={{ ...stile.card, marginBottom: 24 }}>
          <h2>{bozza.statoOriginale === "pubblicata" ? "Gestisci GREST pubblicato" : bozza.id ? "Modifica GREST in bozza" : "Nuovo GREST in bozza"}</h2>
          <p>Seleziona i moduli cartacei da mostrare ai fedeli. Le iscrizioni online si gestiscono separatamente.</p>
          <label style={stile.campo}>Titolo <input style={stile.controllo} required value={bozza.titolo} onChange={(e) => setBozza({ ...bozza, titolo: e.target.value })} /></label>
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
          <fieldset style={{ border: "1px solid #ded5c6", borderRadius: 10, margin: "16px 0", padding: 16 }}>
            <legend>Modulo cartaceo per chi non ha email</legend>
            <label style={{ display: "block", marginBottom: 10 }}>
              <input type="radio" name="moduloCartaceo" checked={bozza.moduloScelto === "ars"} onChange={() => { setBozza({ ...bozza, moduloScelto: "ars" }); setPdfParrocchia(null); }} /> Usa il modulo Ars Liturgica
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              <input type="radio" name="moduloCartaceo" checked={bozza.moduloScelto === "parrocchia"} onChange={() => setBozza({ ...bozza, moduloScelto: "parrocchia" })} /> Usa il modulo della parrocchia
            </label>
            <label style={{ display: "block", marginBottom: 10 }}>
              <input type="radio" name="moduloCartaceo" checked={bozza.moduloScelto === "entrambi"} onChange={() => setBozza({ ...bozza, moduloScelto: "entrambi" })} /> Mostra entrambi i moduli
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
          <button type="submit" style={stile.pulsante} disabled={salvataggio}>{salvataggio ? "Salvataggio…" : bozza.statoOriginale === "pubblicata" ? "Salva modifiche" : "Salva bozza"}</button>{" "}
          {bozza.id && bozza.statoOriginale !== "pubblicata" && <button type="button" style={stile.pulsante} disabled={salvataggio} onClick={(evento) => {
            if (evento.currentTarget.form?.reportValidity()) salvaAttivita(evento, "pubblicata");
          }}>{salvataggio ? "Pubblicazione…" : "Pubblica"}</button>}{" "}
          <button type="button" style={stile.pulsante} disabled={salvataggio} onClick={() => setMostraModulo(false)}>Annulla</button>
        </form>
      )}
      {caricamento && <p role="status">Caricamento delle attività…</p>}
      {errore && <p role="alert">{errore}</p>}
      {messaggio && <p role="status">{messaggio}</p>}
      {!caricamento && !errore && attivita.length === 0 && praticheCancellate.length === 0 && (
        <section style={stile.card}>
          <h2>Nessuna attività ancora creata</h2>
          <p>Qui appariranno GREST, catechismo, gruppi e altre attività quando saranno salvate dalla parrocchia.</p>
        </section>
      )}
      {!caricamento && !errore && attivita.length > 0 && (
        <div style={stile.griglia}>
          {attivita.map((voce) => {
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
                {["bozza", "pubblicata"].includes(voce.stato) && voce.tipo?.toLowerCase() === "grest" && (
                  <button type="button" style={stile.pulsante} onClick={() => modificaBozza(voce)}>{voce.stato === "bozza" ? "Modifica bozza" : "Gestisci attività e moduli"}</button>
                )}
                {["bozza", "pubblicata"].includes(voce.stato) && voce.tipo?.toLowerCase() === "grest" && <>
                  {voce.stato === "pubblicata" && <>{" "}<button type="button" style={stile.pulsante} onClick={() => setGrestIscrizioni(voce)}>Vedi iscrizioni</button></>}
                  {" "}<button type="button" style={stile.pulsante} onClick={() => setGrestGruppi(voce)}>Gestisci gruppi</button>
                </>}
                {["bozza", "pubblicata"].includes(voce.stato) && <>{" "}
                  <button type="button" style={stile.pulsante} onClick={() => preparaCancellazione(voce)}>Cancella attività</button>
                </>}
              </article>
            );
          })}
        </div>
      )}
      {!caricamento && !errore && praticheCancellate.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2>Attività cancellate</h2>
          <p>Pratiche riservate alla parrocchia. Apri le chat e invia gli avvisi alle famiglie che hanno accettato comunicazioni WhatsApp dalla parrocchia.</p>
          <div style={stile.griglia}>
            {praticheCancellate.map((pratica) => <article key={pratica.id} style={stile.card}>
              <span style={stile.etichetta}>Annullata</span>
              <h3>{pratica.titolo}</h3>
              <p>{pratica.messaggio}</p>
              <p>Iscrizioni: {pratica.iscrizioni} · Pagamenti registrati: {pratica.pagamenti_registrati} (in attesa: {pratica.pagamenti_in_attesa})</p>
              <p>Recapiti telefonici da verificare: {pratica.avvisi_in_attesa} · Senza telefono: {pratica.da_contattare}</p>
              <button type="button" style={stile.pulsante} onClick={() => apriFamiglie(pratica)}>
                {praticaAperta?.id === pratica.id ? "Chiudi recapiti" : "Avvisa le famiglie"}
              </button>
              {praticaAperta?.id === pratica.id && <div style={{ marginTop: 16 }}>
                {famiglie.length === 0 && <p>Nessuna famiglia da avvisare.</p>}
                {famiglie.map((famiglia, indice) => {
                  const numero = numeroWhatsApp(famiglia.telefono);
                  return <div key={famiglia.id} style={{ borderTop: "1px solid #ded5c6", padding: "12px 0" }}>
                    <strong>Famiglia {indice + 1}</strong> · {famiglia.telefono || famiglia.email || "Recapito assente"}
                    <p>{famiglia.stato === "inviato" ? "Invio confermato dalla parrocchia" : numero ? "Da inviare" : "Da contattare con altro mezzo"}</p>
                    {numero && famiglia.stato !== "inviato" && <>
                      <a href={`https://wa.me/${numero}?text=${encodeURIComponent(pratica.messaggio)}`}
                        target="_blank" rel="noopener noreferrer" style={stile.pulsante}>Apri WhatsApp</a>{" "}
                      <button type="button" style={stile.pulsante} disabled={Boolean(avvisoInCorso)} onClick={() => confermaAvviso(famiglia)}>
                        {avvisoInCorso === famiglia.id ? "Registrazione…" : "Conferma che hai inviato"}
                      </button>
                    </>}
                  </div>;
                })}
              </div>}
              {pratica.questioni_concluse_at
                ? <p>Questioni concluse dalla parrocchia.</p>
                : <button type="button" style={stile.pulsante} onClick={() => concludiQuestioni(pratica)}>Questioni concluse</button>}
            </article>)}
          </div>
        </section>
      )}
    </main>
  );
}
