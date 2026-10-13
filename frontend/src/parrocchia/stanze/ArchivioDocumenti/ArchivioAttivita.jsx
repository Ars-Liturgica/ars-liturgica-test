import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const colori = {
  testo: "#51351f",
  marrone: "#765638",
  oro: "#d9b77d",
  bordo: "#e5d6c1",
  fondo: "#fffaf2",
  bianco: "#ffffff",
};

const stile = {
  titolo: { color: "#182b40", margin: "0 0 18px", fontSize: "1.5rem" },
  griglia: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 215px), 1fr))", gap: 12 },
  card: { appearance: "none", background: colori.fondo, border: `1px solid ${colori.bordo}`, borderRadius: 12, padding: "15px 16px", color: colori.testo, textAlign: "left", cursor: "pointer", width: "100%", font: "inherit", boxShadow: "0 2px 7px rgba(80,50,25,.04)", transition: "background .15s, border-color .15s" },
  cardAttiva: { borderColor: colori.marrone, background: "#f4e9d8" },
  dettaglio: { marginTop: 18, padding: "18px 20px", border: `1px solid ${colori.bordo}`, borderRadius: 12, background: colori.bianco, color: colori.testo },
  etichetta: { display: "inline-block", background: "#efe4d5", color: colori.marrone, borderRadius: 20, padding: "3px 9px", fontSize: ".78rem", marginTop: 9 },
};

function formattaTipo(tipo) {
  return String(tipo || "altro").replace(/_/g, " ").replace(/\b\w/g, (lettera) => lettera.toUpperCase());
}

function formattaData(data) {
  if (!data) return "—";
  const valore = new Date(data);
  return Number.isNaN(valore.getTime()) ? "—" : valore.toLocaleDateString("it-IT");
}

function statoAttivita(motivo) {
  const valore = String(motivo || "").toLowerCase();
  if (valore.includes("annull")) return "Annullata";
  if (valore.includes("conclus") || valore.includes("scad") || valore.includes("termin")) return "Conclusa";
  return formattaTipo(motivo || "Archiviata");
}

export default function ArchivioAttivita({ parrocchiaId }) {
  const [attivita, setAttivita] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [tipoAperto, setTipoAperto] = useState(null);
  const [fascicoloAperto, setFascicoloAperto] = useState(null);

  useEffect(() => {
    let attivo = true;
    async function caricaArchivio() {
      setCaricamento(true);
      setErrore("");
      setAttivita([]);
      if (!parrocchiaId) {
        setErrore("Parrocchia non disponibile.");
        setCaricamento(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("ars_archivio_attivita")
          .select("*")
          .eq("parrocchia_id", parrocchiaId)
          .order("titolo", { ascending: true });
        if (!attivo) return;
        if (error) setErrore(error.message);
        else setAttivita(data || []);
      } catch (error) {
        if (attivo) setErrore(error?.message || "Impossibile caricare l'archivio.");
      } finally {
        if (attivo) setCaricamento(false);
      }
    }
    caricaArchivio();
    return () => { attivo = false; };
  }, [parrocchiaId]);

  const cartelle = useMemo(() => {
    const risultato = {};
    for (const elemento of attivita) {
      const tipo = elemento.tipo || "altro";
      if (!risultato[tipo]) risultato[tipo] = [];
      risultato[tipo].push(elemento);
    }
    return risultato;
  }, [attivita]);

  const elencoAperto = tipoAperto ? cartelle[tipoAperto] || [] : [];
  const fascicolo = elencoAperto.find((elemento) => elemento.id === fascicoloAperto);

  if (caricamento) return <p>Caricamento archivio attività...</p>;
  if (errore) return <p role="alert">{errore}</p>;

  return (
    <section aria-label="Archivio attività">
      <h2 style={stile.titolo}>Archivio attività</h2>
      {Object.keys(cartelle).length === 0 && <p>Nessuna attività archiviata.</p>}

      <div style={stile.griglia}>
        {Object.entries(cartelle).map(([tipo, elenco]) => {
          const aperta = tipoAperto === tipo;
          return (
            <button key={tipo} type="button" aria-expanded={aperta}
              onClick={() => { setTipoAperto(aperta ? null : tipo); setFascicoloAperto(null); }}
              style={{ ...stile.card, ...(aperta ? stile.cardAttiva : {}) }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden="true" style={{ fontSize: 25, color: colori.marrone }}>▣</span>
                <strong style={{ fontSize: "1.08rem" }}>{formattaTipo(tipo)}</strong>
              </span>
              <span style={{ display: "block", marginTop: 7, fontSize: ".85rem", opacity: .8 }}>
                {elenco.length} {elenco.length === 1 ? "fascicolo" : "fascicoli"} · {aperta ? "Chiudi" : "Apri"} →
              </span>
            </button>
          );
        })}
      </div>

      {tipoAperto && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: colori.testo, fontSize: "1.15rem", margin: "0 0 12px" }}>
            Fascicoli · {formattaTipo(tipoAperto)}
          </h3>
          <div style={stile.griglia}>
            {elencoAperto.map((elemento) => {
              const aperto = fascicoloAperto === elemento.id;
              return (
                <button key={elemento.id} type="button" aria-expanded={aperto}
                  onClick={() => setFascicoloAperto(aperto ? null : elemento.id)}
                  style={{ ...stile.card, background: colori.bianco, ...(aperto ? stile.cardAttiva : {}) }}>
                  <span style={{ display: "block", color: colori.marrone, fontSize: 22, marginBottom: 5 }} aria-hidden="true">▤</span>
                  <strong style={{ display: "block", lineHeight: 1.35, overflowWrap: "anywhere" }}>{elemento.titolo || "Attività senza titolo"}</strong>
                  <span style={stile.etichetta}>{statoAttivita(elemento.motivo_archiviazione)}</span>
                  <span style={{ display: "block", marginTop: 9, fontSize: ".82rem", opacity: .8 }}>
                    Fine: {formattaData(elemento.data_fine)}
                  </span>
                  <span style={{ display: "block", marginTop: 7, fontSize: ".82rem" }}>{aperto ? "Chiudi dettagli ↑" : "Apri fascicolo →"}</span>
                </button>
              );
            })}
          </div>

          {fascicolo && (
            <article style={stile.dettaglio}>
              <h3 style={{ margin: "0 0 12px", color: colori.testo }}>{fascicolo.titolo}</h3>
              <p><strong>Stato:</strong> {statoAttivita(fascicolo.motivo_archiviazione)}</p>
              <p><strong>Descrizione:</strong> {fascicolo.descrizione || "—"}</p>
              <p><strong>Inizio:</strong> {formattaData(fascicolo.data_inizio)}</p>
              <p><strong>Fine:</strong> {formattaData(fascicolo.data_fine)}</p>
              <p style={{ fontSize: ".9rem", opacity: .8 }}>
                Iscrizioni, documenti e movimenti economici saranno collegati nei prossimi passaggi.
              </p>
            </article>
          )}
        </div>
      )}
    </section>
  );
}
