import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

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
};

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

export default function AttivitaGruppiParroco({ parrocchiaId, tornaDashboard }) {
  const [attivita, setAttivita] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [mostraModulo, setMostraModulo] = useState(false);
  const [bozza, setBozza] = useState(bozzaIniziale);
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
    });
    setErrore("");
    setMessaggio("");
    setMostraModulo(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvaBozza(evento) {
    evento.preventDefault();
    setErrore("");
    setMessaggio("");
    if (!parrocchiaId) return setErrore("La parrocchia non è ancora disponibile.");
    if (!bozza.titolo.trim()) return setErrore("Inserisci il titolo.");
    if (bozza.dataInizio && bozza.dataFine && new Date(bozza.dataFine) < new Date(bozza.dataInizio)) {
      return setErrore("La data finale deve seguire quella iniziale.");
    }
    if (bozza.modelloQuota === "quota_fissa" && (bozza.importoQuota === "" || !Number.isFinite(Number(bozza.importoQuota)) || Number(bozza.importoQuota) <= 0)) {
      return setErrore("La quota fissa deve essere maggiore di zero.");
    }

    setSalvataggio(true);
    const { data, error } = await supabase.rpc("ars_salva_attivita_parrocchiale", {
      p_parrocchia_id: parrocchiaId,
      p_id: bozza.id,
      p_tipo: "grest",
      p_titolo: bozza.titolo.trim(),
      p_descrizione: bozza.descrizione.trim() || null,
      p_luogo: bozza.luogo.trim() || null,
      p_data_inizio: bozza.dataInizio ? new Date(bozza.dataInizio).toISOString() : null,
      p_data_fine: bozza.dataFine ? new Date(bozza.dataFine).toISOString() : null,
      p_stato: "bozza",
      p_modello_quota: bozza.modelloQuota,
      p_importo_quota: bozza.modelloQuota === "quota_fissa" ? Number(bozza.importoQuota) : null,
      p_valuta: "EUR",
      p_scadenza_quota: bozza.modelloQuota === "quota_fissa" ? (bozza.scadenzaQuota || null) : null,
      p_configurazione_modulo: bozza.configurazioneModulo,
    });
    setSalvataggio(false);
    if (error || !data?.id || data?.stato !== "bozza") {
      console.error("Errore salvataggio attività:", error || data);
      setErrore(error?.message || "Non è stato possibile confermare il salvataggio della bozza.");
      return;
    }
    setMostraModulo(false);
    setBozza(bozzaIniziale);
    await caricaAttivita();
    setMessaggio("Bozza salvata. L'attività non è ancora visibile ai fedeli.");
  }

  return (
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
          else { setBozza(bozzaIniziale); setMostraModulo(true); setErrore(""); setMessaggio(""); }
        }}>
          {grest2027InBozza ? "Riprendi GREST 2027" : "+ Prepara GREST"}
        </button>}
      </header>

      {mostraModulo && (
        <form onSubmit={salvaBozza} style={{ ...stile.card, marginBottom: 24 }}>
          <h2>{bozza.id ? "Modifica GREST in bozza" : "Nuovo GREST in bozza"}</h2>
          <p>Iscrizioni e autorizzazioni saranno configurate prima della pubblicazione.</p>
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
          <button type="submit" style={stile.pulsante} disabled={salvataggio}>{salvataggio ? "Salvataggio…" : "Salva bozza"}</button>{" "}
          <button type="button" style={stile.pulsante} disabled={salvataggio} onClick={() => setMostraModulo(false)}>Annulla</button>
        </form>
      )}
      {caricamento && <p role="status">Caricamento delle attività…</p>}
      {errore && <p role="alert">{errore}</p>}
      {messaggio && <p role="status">{messaggio}</p>}
      {!caricamento && !errore && attivita.length === 0 && (
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
                {voce.stato === "bozza" && voce.tipo?.toLowerCase() === "grest" && (
                  <button type="button" style={stile.pulsante} onClick={() => modificaBozza(voce)}>Modifica bozza</button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
