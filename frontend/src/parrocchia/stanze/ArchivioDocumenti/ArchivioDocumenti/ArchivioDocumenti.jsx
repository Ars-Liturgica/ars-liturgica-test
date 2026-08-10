import React, { useEffect, useMemo, useState } from "react";
import {
  eliminaDocumentoDaArchivio,
  leggiDocumentiInArchivio,
} from "../../../motoreDocumentale/MotoreDocumentale";

import "./ArchivioDocumenti.css";

const FILTRI_STATO = [
  { valore: "bozza", etichetta: "Bozze" },
  { valore: "in_essere", etichetta: "In essere" },
  { valore: "scaduto", etichetta: "Scaduti" },
];

function formattaData(data) {
  if (!data) return "—";

  const valore = new Date(data);

  if (Number.isNaN(valore.getTime())) {
    return "—";
  }

  return valore.toLocaleDateString("it-IT");
}

function formattaTesto(testo, valorePredefinito = "—") {
  if (!testo) return valorePredefinito;

  return testo
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (lettera) => lettera.toUpperCase());
}

function etichettaStato(stato) {
  switch (stato) {
    case "bozza":
      return "Bozza";
    case "in_essere":
      return "In essere";
    case "scaduto":
      return "Scaduto";
    default:
      return stato || "—";
  }
}

export default function ArchivioDocumenti({
  parrocchiaId,
  tornaDashboard,
}) {
  const [documenti, setDocumenti] = useState([]);
  const [statoFiltro, setStatoFiltro] = useState("in_essere");
  const [ricerca, setRicerca] = useState("");
  const [documentoAperto, setDocumentoAperto] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    let componenteAttivo = true;

    async function caricaDocumenti() {
      if (!parrocchiaId) {
        if (componenteAttivo) {
          setDocumenti([]);
          setCaricamento(false);
          setErrore("La parrocchia non è disponibile.");
        }
        return;
      }

      try {
        setCaricamento(true);
        setErrore("");
        setMessaggio("");

        const risultati = await leggiDocumentiInArchivio({
          parrocchiaId,
          stato: statoFiltro,
        });

        if (componenteAttivo) {
          setDocumenti(risultati || []);
        }
      } catch (error) {
        console.error(
          "Errore durante il caricamento dell'archivio:",
          error
        );

        if (componenteAttivo) {
          setErrore(
            error?.message ||
              "Non è stato possibile caricare l'archivio."
          );
        }
      } finally {
        if (componenteAttivo) {
          setCaricamento(false);
        }
      }
    }

    setDocumentoAperto(null);
    caricaDocumenti();

    return () => {
      componenteAttivo = false;
    };
  }, [parrocchiaId, statoFiltro]);

  const documentiVisibili = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    if (!testo) {
      return documenti;
    }

    return documenti.filter((documento) => {
      const titolo = documento.titolo || "";
      const tipo = documento.tipo || "";
      const stanza = documento.stanza_origine || "";

      return (
        titolo.toLowerCase().includes(testo) ||
        tipo.toLowerCase().includes(testo) ||
        stanza.toLowerCase().includes(testo)
      );
    });
  }, [documenti, ricerca]);

  async function eliminaDocumento(documento) {
    const conferma = window.confirm(
      `Vuoi eliminare definitivamente "${
        documento.titolo || "questo documento"
      }"?\n\nL'operazione non può essere annullata.`
    );

    if (!conferma) return;

    try {
      setErrore("");
      setMessaggio("");

      await eliminaDocumentoDaArchivio({
        documentoId: documento.id,
        parrocchiaId,
      });

      setDocumenti((documentiAttuali) =>
        documentiAttuali.filter(
          (elemento) => elemento.id !== documento.id
        )
      );

      if (documentoAperto?.id === documento.id) {
        setDocumentoAperto(null);
      }

      setMessaggio("Documento eliminato definitivamente.");
    } catch (error) {
      console.error(
        "Errore durante l'eliminazione del documento:",
        error
      );

      setErrore(
        error?.message ||
          "Non è stato possibile eliminare il documento."
      );
    }
  }

  return (
    <section className="archivio-documenti">
      <header className="archivio-documenti__intestazione">
        <div>
          <h1>Archivio Documenti</h1>
          <p>Consulta e gestisci i documenti della parrocchia.</p>
        </div>

        {typeof tornaDashboard === "function" && (
          <button
            type="button"
            className="archivio-documenti__torna"
            onClick={tornaDashboard}
          >
            Torna alla Dashboard
          </button>
        )}
      </header>

      <nav
        className="archivio-documenti__filtri"
        aria-label="Filtra documenti per stato"
      >
        {FILTRI_STATO.map((filtro) => (
          <button
            key={filtro.valore}
            type="button"
            className={
              statoFiltro === filtro.valore
                ? "archivio-documenti__filtro archivio-documenti__filtro--attivo"
                : "archivio-documenti__filtro"
            }
            onClick={() => setStatoFiltro(filtro.valore)}
          >
            {filtro.etichetta}
          </button>
        ))}
      </nav>

      <div className="archivio-documenti__ricerca">
        <label htmlFor="ricerca-documenti">
          Cerca nell'archivio
        </label>

        <input
          id="ricerca-documenti"
          type="search"
          value={ricerca}
          onChange={(event) => setRicerca(event.target.value)}
          placeholder="Titolo, tipo o stanza..."
        />
      </div>

      {messaggio && (
        <p className="archivio-documenti__successo">
          {messaggio}
        </p>
      )}

      {errore && (
        <p className="archivio-documenti__errore" role="alert">
          {errore}
        </p>
      )}

      {caricamento && (
        <p className="archivio-documenti__stato">
          Caricamento documenti...
        </p>
      )}

      {!caricamento &&
        !errore &&
        documentiVisibili.length === 0 && (
          <div className="archivio-documenti__vuoto">
            <p>Nessun documento presente in questa sezione.</p>
          </div>
        )}

      {!caricamento &&
        !errore &&
        documentiVisibili.length > 0 && (
          <div className="archivio-documenti__elenco">
            {documentiVisibili.map((documento) => (
              <article
                key={documento.id}
                className="archivio-documenti__card"
              >
                <div className="archivio-documenti__card-contenuto">
                  <span className="archivio-documenti__stato-documento">
                    {etichettaStato(documento.stato)}
                  </span>

                  <h2>
                    {documento.titolo || "Documento senza titolo"}
                  </h2>

                  <div className="archivio-documenti__dati">
                    <span>
                      {formattaTesto(documento.tipo, "Documento")}
                    </span>

                    <span>
                      {formattaTesto(documento.stanza_origine)}
                    </span>

                    <span>
                      {formattaData(
                        documento.data_pubblicazione ||
                          documento.created_at
                      )}
                    </span>
                  </div>
                </div>

                <div className="archivio-documenti__azioni">
                  <button
                    type="button"
                    onClick={() => setDocumentoAperto(documento)}
                  >
                    Apri
                  </button>

                  <button
                    type="button"
                    className="archivio-documenti__elimina"
                    onClick={() => eliminaDocumento(documento)}
                  >
                    Elimina
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      {documentoAperto && (
        <div
          className="archivio-documenti__sfondo-dettaglio"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDocumentoAperto(null);
            }
          }}
        >
          <article
            className="archivio-documenti__dettaglio"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titolo-documento-aperto"
          >
            <header className="archivio-documenti__dettaglio-header">
              <div>
                <span>
                  {etichettaStato(documentoAperto.stato)}
                </span>

                <h2 id="titolo-documento-aperto">
                  {documentoAperto.titolo ||
                    "Documento senza titolo"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Chiudi documento"
                onClick={() => setDocumentoAperto(null)}
              >
                ×
              </button>
            </header>

            <div className="archivio-documenti__dettaglio-dati">
              <p>
                <strong>Tipo:</strong>{" "}
                {formattaTesto(
                  documentoAperto.tipo,
                  "Documento"
                )}
              </p>

              <p>
                <strong>Stanza:</strong>{" "}
                {formattaTesto(
                  documentoAperto.stanza_origine
                )}
              </p>

              <p>
                <strong>Creato:</strong>{" "}
                {formattaData(documentoAperto.created_at)}
              </p>

              {documentoAperto.data_pubblicazione && (
                <p>
                  <strong>Pubblicato:</strong>{" "}
                  {formattaData(
                    documentoAperto.data_pubblicazione
                  )}
                </p>
              )}

              {documentoAperto.data_scadenza && (
                <p>
                  <strong>Scadenza:</strong>{" "}
                  {formattaData(
                    documentoAperto.data_scadenza
                  )}
                </p>
              )}
            </div>

            <div className="archivio-documenti__testo">
              {documentoAperto.contenuto ||
                "Nessun contenuto disponibile."}
            </div>

            {(documentoAperto.firma_nome ||
              documentoAperto.firma_ruolo) && (
              <footer className="archivio-documenti__firma">
                {documentoAperto.firma_nome && (
                  <strong>{documentoAperto.firma_nome}</strong>
                )}

                {documentoAperto.firma_ruolo && (
                  <span>{documentoAperto.firma_ruolo}</span>
                )}
              </footer>
            )}

            <div className="archivio-documenti__dettaglio-azioni">
              <button
                type="button"
                onClick={() => setDocumentoAperto(null)}
              >
                Chiudi
              </button>

              <button
                type="button"
                className="archivio-documenti__elimina"
                onClick={() =>
                  eliminaDocumento(documentoAperto)
                }
              >
                Elimina documento
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
