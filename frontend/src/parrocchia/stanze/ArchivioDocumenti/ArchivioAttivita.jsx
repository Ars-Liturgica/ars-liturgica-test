
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

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

      const { data, error } = await supabase
        .from("ars_archivio_attivita")
        .select("*")
        .eq("parrocchia_id", parrocchiaId)
        .order("titolo", { ascending: true });

      if (!attivo) return;

      if (error) {
        setErrore(error.message);
      } else {
        setAttivita(data || []);
      }

      setCaricamento(false);
    }

    caricaArchivio();

    return () => {
      attivo = false;
    };
  }, [parrocchiaId]);

  const cartelle = useMemo(() => {
    const risultato = {};

    for (const elemento of attivita) {
      const tipo = elemento.tipo || "altro";

      if (!risultato[tipo]) {
        risultato[tipo] = [];
      }

      risultato[tipo].push(elemento);
    }

    return risultato;
  }, [attivita]);

  function formattaTipo(tipo) {
    return tipo
      .replace(/_/g, " ")
      .replace(/\b\w/g, (lettera) => lettera.toUpperCase());
  }

  if (caricamento) {
    return <p>Caricamento archivio attività...</p>;
  }

  if (errore) {
    return <p role="alert">{errore}</p>;
  }

  return (
    <section>
      <h2>Archivio attività</h2>

      {Object.keys(cartelle).length === 0 && (
        <p>Nessuna attività archiviata.</p>
      )}

      {Object.entries(cartelle).map(([tipo, elenco]) => (
        <div key={tipo}>
          <button
            type="button"
            onClick={() =>
              setTipoAperto(tipoAperto === tipo ? null : tipo)
            }
          >
            📁 {formattaTipo(tipo)} ({elenco.length})
          </button>

          {tipoAperto === tipo && (
            <div style={{ paddingLeft: 24 }}>
              {elenco.map((elemento) => (
                <div key={elemento.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setFascicoloAperto(
                        fascicoloAperto === elemento.id
                          ? null
                          : elemento.id
                      )
                    }
                  >
                    📂 {elemento.titolo}
                  </button>

                  {fascicoloAperto === elemento.id && (
                    <div style={{ paddingLeft: 24 }}>
                      <p>
                        Stato: {elemento.motivo_archiviazione}
                      </p>
                      <p>
                        Descrizione: {elemento.descrizione || "—"}
                      </p>
                      <p>
                        Inizio: {elemento.data_inizio
                          ? new Date(elemento.data_inizio)
                              .toLocaleDateString("it-IT")
                          : "—"}
                      </p>
                      <p>
                        Fine: {elemento.data_fine
                          ? new Date(elemento.data_fine)
                              .toLocaleDateString("it-IT")
                          : "—"}
                      </p>
                      <p>
                        Iscrizioni, documenti e movimenti economici
                        saranno collegati nei prossimi passaggi.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
