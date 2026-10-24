
import React, { useEffect, useMemo, useState } from "react";
import { stampaDocumento } from "../ArchivioDocumenti/stampaDocumentoEconomico";


const TIPI = {
  ricevuta: "Ricevuta",
  uscita: "Documento di uscita",
  rimborso: "Rimborso",
  storno: "Storno",
  conversione_donazione: "Conversione in donazione",
};

const euro = (v, valuta = "EUR") => {
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: valuta || "EUR",
    }).format(Number(v || 0));
  } catch {
    return `${v} ${valuta}`;
  }
};

const dataIt = (v) =>
  v ? new Date(v).toLocaleDateString("it-IT") : "—";

export default function ArchivioRicevute({
  parrocchiaId,
  nomeParrocchia = "",
  tornaIndietro,
}) {
  const [documenti, setDocumenti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [tipo, setTipo] = useState("");
  const [attivitaId, setAttivitaId] = useState("");
  const [revisione, setRevisione] = useState(0);

  useEffect(() => {
    let attivo = true;

    async function carica() {
      setCaricamento(true);
      setErrore("");

      try {
        if (!parrocchiaId) {
          throw new Error("Parrocchia non selezionata.");
        }

        const { data, error } = await supabase.rpc(
          "ars_elenco_documenti_economici",
          {
            p_parrocchia_id: parrocchiaId,
            p_attivita_id: null,
          }
        );

        if (error) throw error;
        if (!Array.isArray(data)) {
          throw new Error("Risposta dell'archivio non valida.");
        }

        if (attivo) setDocumenti(data);
      } catch (e) {
        if (attivo) setErrore(e.message || "Errore nel caricamento.");
      } finally {
        if (attivo) setCaricamento(false);
      }
    }

    carica();
    return () => { attivo = false; };
  }, [parrocchiaId, revisione]);

  const attivita = useMemo(() => {
    return [...new Set(
      documenti.map((d) => d.attivita_id).filter(Boolean)
    )];
  }, [documenti]);

  const filtrati = useMemo(() => {
    const q = ricerca.trim().toLocaleLowerCase("it-IT");

    return documenti.filter((d) => {
      if (tipo && d.tipo_documento !== tipo) return false;
      if (attivitaId && d.attivita_id !== attivitaId) return false;

      const dettagli = d.dati_documento || {};
      const contenuto = [
        d.numero,
        d.anno,
        d.causale,
        d.nominativo,
        dettagli.iscritto,
        dettagli.genitore,
        dettagli.donatore,
        d.importo,
      ].join(" ").toLocaleLowerCase("it-IT");

      return !q || contenuto.includes(q);
    });
  }, [documenti, ricerca, tipo, attivitaId]);

  function apri(doc) {
    try {
      stampaDocumento(doc, nomeParrocchia);
    } catch (e) {
      setErrore(e.message);
    }
  }

  return (
    <main className="ars-archivio-ricevute">
      <style>{`
        .ars-archivio-ricevute {
          color: #263747;
          padding: 20px;
        }
        .ars-archivio-ricevute h2 {
          color: #725521;
          margin-bottom: 8px;
        }
        .ar-filtri {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 20px 0;
        }
        .ar-filtri input, .ar-filtri select {
          padding: 11px;
          border: 1px solid #d9c9ae;
          border-radius: 9px;
          background: white;
          max-width: 100%;
        }
        .ars-archivio-ricevute button {
          padding: 10px 15px;
          background: #fff8eb;
          color: #263747;
          border: 1px solid #c69b4c;
          border-radius: 9px;
          cursor: pointer;
        }
        .ar-elenco {
          display: grid;
          gap: 13px;
        }
        .ar-documento {
          padding: 18px;
          background: #fffdf8;
          border: 1px solid #e7d9c2;
          border-radius: 13px;
        }
        .ar-documento h3 { margin: 0 0 9px; }
        .ar-documento p { margin: 6px 0; }
        .ar-documento strong { color: #725521; }
        .ar-errore { color: #a32626; }
      `}</style>

      {tornaIndietro && (
        <button type="button" onClick={tornaIndietro}>
          ← Torna indietro
        </button>
      )}

      <h2>Ricevute e documenti economici</h2>
      <p>
        Archivio dei documenti numerati relativi a incassi,
        spese, rimborsi e altre operazioni registrate.
      </p>

      <div className="ar-filtri">
        <input
          aria-label="Cerca documento"
          placeholder="Cerca nome, causale o numero"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
        />

        <select
          aria-label="Tipo documento"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Tutti i documenti</option>
          {Object.entries(TIPI).map(([id, nome]) => (
            <option key={id} value={id}>{nome}</option>
          ))}
        </select>

        <select
          aria-label="Filtra attività"
          value={attivitaId}
          onChange={(e) => setAttivitaId(e.target.value)}
        >
          <option value="">Tutte le attività</option>
          {attivita.map((id) => (
            <option key={id} value={id}>
              Attività {id.slice(0, 8)}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={caricamento}
          onClick={() => setRevisione((v) => v + 1)}
        >
          Aggiorna
        </button>
      </div>

      {errore && <p className="ar-errore" role="alert">{errore}</p>}
      {caricamento && <p>Caricamento documenti…</p>}

      {!caricamento && !errore && (
        <>
          <p><strong>{filtrati.length}</strong> documenti trovati</p>

          {!filtrati.length && (
            <p>Nessun documento corrisponde ai filtri selezionati.</p>
          )}

          <div className="ar-elenco">
            {filtrati.map((d) => {
              const dettagli = d.dati_documento || {};

              return (
                <article className="ar-documento" key={d.id}>
                  <h3>
                    {TIPI[d.tipo_documento] || d.tipo_documento}
                    {" "}n. {d.numero}/{d.anno}
                  </h3>

                  <p>Data: {dataIt(d.data_documento)}</p>
                  <p>Causale: {d.causale || "—"}</p>

                  {dettagli.iscritto && (
                    <p>Iscritto: {dettagli.iscritto}</p>
                  )}
                  {dettagli.genitore && (
                    <p>Genitore: {dettagli.genitore}</p>
                  )}
                  {dettagli.donatore && (
                    <p>Donatore: {dettagli.donatore}</p>
                  )}
                  {dettagli.tipo_pagamento &&
                    dettagli.tipo_pagamento !== "DA_DETERMINARE" && (
                      <p>Pagamento: {dettagli.tipo_pagamento}</p>
                    )}

                  <p>
                    <strong>
                      {euro(d.importo, d.valuta)}
                    </strong>
                  </p>

                  <button type="button" onClick={() => apri(d)}>
                    Stampa / Salva PDF
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
