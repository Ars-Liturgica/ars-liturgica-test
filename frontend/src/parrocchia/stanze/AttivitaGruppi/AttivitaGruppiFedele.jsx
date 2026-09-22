import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import IscrizioneGrestFedele from "./IscrizioneGrestFedele";

const stile = {
  sfondo: { minHeight: "100vh", background: "#f7f3ed" },
  pagina: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "#173955" },
  intestazione: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 28 },
  griglia: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 },
  card: { background: "#fffdf9", border: "1px solid #e5d9ca", borderRadius: 18, padding: 24 },
  pulsante: { border: "1px solid #c99536", borderRadius: 10, background: "#fffaf0", color: "#173955", padding: "10px 16px", cursor: "pointer", font: "inherit" },
};

function dataItaliana(valore) {
  if (!valore) return null;
  const data = new Date(`${String(valore).slice(0, 10)}T12:00:00`);
  return Number.isNaN(data.getTime()) ? null : new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(data);
}

function elencoDaRisposta(valore) {
  if (Array.isArray(valore)) return valore;
  for (const chiave of ["attivita", "data", "risultati"]) {
    if (Array.isArray(valore?.[chiave])) return valore[chiave];
  }
  return null;
}

function indirizzoPdf(valore) {
  if (typeof valore !== "string" || !valore.trim()) return null;
  try {
    const url = new URL(valore.trim(), window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function moduliCartacei(voce) {
  const config = voce.configurazione_modulo || {};
  const urlParrocchia = indirizzoPdf(config.modulo_cartaceo_url);
  const modalita = config.modulo_cartaceo_modalita || (urlParrocchia ? "parrocchia" : "ars");
  const moduli = [];
  if (modalita !== "parrocchia" || !urlParrocchia) {
    moduli.push({ etichetta: modalita === "entrambi" ? "Scarica il modulo Ars Liturgica" : "Scarica il modulo cartaceo", url: "/modulo-grest-cartaceo.pdf" });
  }
  if (urlParrocchia && modalita !== "ars") {
    moduli.push({ etichetta: modalita === "entrambi" ? "Scarica il modulo della parrocchia" : "Scarica il modulo cartaceo", url: urlParrocchia });
  }
  return moduli;
}

export default function AttivitaGruppiFedele({ parrocchiaId, tornaDashboard }) {
  const [attivita, setAttivita] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [grestSelezionato, setGrestSelezionato] = useState(null);

  const caricaAttivita = useCallback(async () => {
    if (!parrocchiaId) {
      setCaricamento(false);
      setErrore("Non è stata selezionata una parrocchia.");
      return;
    }
    setCaricamento(true);
    setErrore("");
    const { data, error } = await supabase.rpc("ars_elenco_attivita_pubbliche", {
      p_parrocchia_id: parrocchiaId,
    });
    if (error) {
      console.error("Errore caricamento attività pubbliche:", error);
      setErrore("Impossibile caricare le attività della parrocchia.");
    } else {
      const elenco = elencoDaRisposta(data);
      if (!elenco) {
        console.error("Risposta attività pubbliche inattesa:", data);
        setErrore("Impossibile leggere l'elenco delle attività.");
      } else {
        setAttivita(elenco);
      }
    }
    setCaricamento(false);
  }, [parrocchiaId]);

  useEffect(() => { caricaAttivita(); }, [caricaAttivita]);

  return (
    <div style={stile.sfondo}>
    <main style={stile.pagina}>
      {grestSelezionato ? (
        <IscrizioneGrestFedele attivita={grestSelezionato} onIndietro={() => setGrestSelezionato(null)} />
      ) : <>
      <header style={stile.intestazione}>
        <div>
          <button type="button" style={stile.pulsante} onClick={tornaDashboard}>← Torna alla dashboard</button>
          <h1>Attività e Gruppi</h1>
          <p>Scopri le iniziative della tua parrocchia.</p>
        </div>
        <button type="button" style={stile.pulsante} onClick={caricaAttivita} disabled={caricamento}>Aggiorna elenco</button>
      </header>
      {caricamento && <p role="status">Caricamento delle attività…</p>}
      {errore && <p role="alert">{errore}</p>}
      {!caricamento && !errore && attivita.length === 0 && (
        <section style={stile.card}><h2>Nessuna attività aperta</h2><p>Le prossime attività della parrocchia compariranno qui.</p></section>
      )}
      {!caricamento && !errore && attivita.length > 0 && (
        <div style={stile.griglia}>
          {attivita.map((voce) => (
            <article key={voce.id} style={stile.card}>
              <h2>{voce.titolo}</h2>
              {voce.descrizione && <p>{voce.descrizione}</p>}
              {(voce.data_inizio || voce.data_fine) && <p>{[dataItaliana(voce.data_inizio), dataItaliana(voce.data_fine)].filter(Boolean).join(" – ")}</p>}
              {voce.luogo && <p>Luogo: {voce.luogo}</p>}
              {voce.modello_quota === "quota_fissa" && <p>Quota: {Number(voce.importo_quota).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</p>}
              {voce.modello_quota === "contributo_libero" && <p>Contributo libero</p>}
              {voce.modello_quota === "gratuita" && <p>Partecipazione gratuita</p>}
              {String(voce.tipo).toLowerCase() === "grest" && <>
                {voce.configurazione_modulo?.abilita_iscrizioni_grest === true ? (
                  <button type="button" style={stile.pulsante} onClick={() => setGrestSelezionato(voce)}>Iscrivi un ragazzo</button>
                ) : <p>Iscrizioni in preparazione.</p>}
                {moduliCartacei(voce).map((modulo) => (
                  <p key={modulo.url}>
                    <a href={modulo.url} target="_blank" rel="noopener noreferrer" style={{ ...stile.pulsante, display: "inline-block", textDecoration: "none" }}>
                      {modulo.etichetta}
                    </a>
                  </p>
                ))}
                <p>Compila il modulo e consegnalo alla segreteria della parrocchia.</p>
              </>}
            </article>
          ))}
        </div>
      )}
      </>}
    </main>
    </div>
  );
}
