import React, { useEffect, useState } from "react";
import "./BachecaAvvisi.css";
import NuovoAvviso from "./NuovoAvviso";
import { leggiDocumentiInArchivio } from "../../motoreDocumentale/MotoreDocumentale";

function formattaData(data) {
  if (!data) {
    return "";
  }

  return new Date(data).toLocaleDateString(
    "it-IT"
  );
}

function formattaFirma(avviso) {
  if (avviso.firma_nome) {
    return [
      avviso.firma_nome,
      avviso.firma_ruolo,
    ]
      .filter(Boolean)
      .join(" — ");
  }

  switch (avviso.firma_tipo) {
    case "parroco":
      return "Parroco";

    case "viceparroco":
      return "Viceparroco";

    case "segreteria":
      return "Segreteria Parrocchiale";

    default:
      return "";
  }
}

export default function BachecaAvvisi({
  parrocchia,
  solaLettura = false,
  onTorna,
}) {
  const [
    mostraNuovoAvviso,
    setMostraNuovoAvviso,
  ] = useState(false);

  const [avvisi, setAvvisi] = useState([]);
  const [avvisoAperto, setAvvisoAperto] =
  useState(null);
  const [caricamento, setCaricamento] =
    useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    let componenteAttivo = true;

    async function caricaAvvisi() {
      if (!parrocchia?.id) {
        setAvvisi([]);
        setCaricamento(false);
        return;
      }

      setCaricamento(true);
      setErrore("");

      try {
        const documenti =
          await leggiDocumentiInArchivio({
            parrocchiaId: parrocchia.id,
            tipo: "avviso",
            stato: "in_essere",
            destinazione: "Bacheca Avvisi",
            pubblicatiFinoA:
              new Date().toISOString(),
          });

        const oggi = new Date()
          .toISOString()
          .split("T")[0];

        const documentiVisibili =
          documenti.filter((documento) => {
            if (
              documento.senza_scadenza ||
              !documento.data_scadenza
            ) {
              return true;
            }

            return (
              documento.data_scadenza.slice(
                0,
                10
              ) >= oggi
            );
          });

        if (componenteAttivo) {
          setAvvisi(documentiVisibili);
        }
      } catch (error) {
        console.error(
          "Errore durante il caricamento degli avvisi:",
          error
        );

        if (componenteAttivo) {
          setErrore(
            error?.message ||
              "Non è stato possibile caricare gli avvisi."
          );
          setAvvisi([]);
        }
      } finally {
        if (componenteAttivo) {
          setCaricamento(false);
        }
      }
    }

    if (!mostraNuovoAvviso) {
      caricaAvvisi();
    }

    return () => {
      componenteAttivo = false;
    };
  }, [parrocchia?.id, mostraNuovoAvviso]);

  if (mostraNuovoAvviso) {
    return (
      <NuovoAvviso
        parrocchia={parrocchia}
        nomeParrocchia={parrocchia?.nome}
        tornaAllaBacheca={() =>
          setMostraNuovoAvviso(false)
        }
      />
    );
  }

  return (
    <div className="bacheca-avvisi">
 <header className="bacheca-header">
  <div className="bacheca-header-superiore">
    {solaLettura && onTorna && (
      <button
        type="button"
        className="btn-torna-parrocchia"
        onClick={onTorna}
      >
        ← Torna alla mia Parrocchia
      </button>
    )}

    {!solaLettura && (
      <button
        className="btn-nuovo-avviso"
        type="button"
        onClick={() =>
          setMostraNuovoAvviso(true)
        }
      >
        <span className="simbolo-aggiungi">
          ＋
        </span>
        Nuovo Avviso
      </button>
    )}
  </div>

  <div className="bacheca-intestazione">
    <div
      className="bacheca-simbolo"
      aria-hidden="true"
    >
      ⛪
    </div>

    <h1>Bacheca Avvisi</h1>

    <p>
      {solaLettura
        ? "Consulta gli avvisi della tua comunità parrocchiale."
        : "Pubblica e gestisci gli avvisi destinati alla comunità parrocchiale."}
    </p>
  </div>
</header>

      <section className="cornice-legno">
        <div className="cornice-modanatura">
          <div className="cornice-bordo-interno">
            <div className="pannello-sughero">
              {caricamento && (
                <div className="bacheca-vuota">
                  <div className="foglio-avviso">
                    <h2>
                      Caricamento degli avvisi...
                    </h2>
                  </div>
                </div>
              )}

              {!caricamento && errore && (
                <div className="bacheca-vuota">
                  <div className="foglio-avviso">
                    <h2>
                      Impossibile caricare gli avvisi
                    </h2>

                    <p>{errore}</p>
                  </div>
                </div>
              )}

              {!caricamento &&
                !errore &&
                avvisi.length === 0 && (
                  <div className="bacheca-vuota">
                    <div
                      className="puntina"
                      aria-hidden="true"
                    />

                    <div className="foglio-avviso">
                      <div
                        className="icona-avviso"
                        aria-hidden="true"
                      >
                        📌
                      </div>

                      <h2>
                        Nessun avviso presente
                      </h2>

                      <p>
                        Gli avvisi pubblicati dal
                        parroco compariranno qui.
                      </p>
{!solaLettura && (
                      <button
                        type="button"
                        className="btn-crea-primo-avviso"
                        onClick={() =>
                          setMostraNuovoAvviso(true)
                        }
                      >
                        Crea il primo avviso
                      </button>
  )}
                    </div>
                  </div>
                )}

              {!caricamento &&
                !errore &&
                avvisi.length > 0 && (
                  <div className="elenco-avvisi">
                    {avvisi.map((avviso) => (
  <article
    key={avviso.id}
    className={`foglio-avviso foglio-avviso-pubblicato priorita-${
      avviso.priorita || "normale"
    }`}
    role="button"
    tabIndex={0}
    aria-label={`Apri l'avviso ${avviso.titolo}`}
    onClick={() =>
      setAvvisoAperto(avviso)
    }
    onKeyDown={(event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setAvvisoAperto(avviso);
      }
    }}
  >
    <div
      className="puntina puntina-avviso"
      aria-hidden="true"
    />

    {avviso.categoria && (
      <p className="categoria-avviso-bacheca">
        {avviso.categoria}
      </p>
    )}

    <h2>{avviso.titolo}</h2>

    <footer className="dati-avviso-bacheca">
      <span>
        {formattaData(
          avviso.data_pubblicazione
        )}
      </span>

      <strong>Apri avviso</strong>
    </footer>
  </article>
))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>
            {avvisoAperto && (
        <div
          className="sfondo-dettaglio-avviso"
          onClick={() =>
            setAvvisoAperto(null)
          }
        >
          <section
            className="dettaglio-avviso"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titolo-avviso-aperto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="btn-chiudi-avviso"
              aria-label="Chiudi avviso"
              onClick={() =>
                setAvvisoAperto(null)
              }
            >
              ×
            </button>

            {avvisoAperto.categoria && (
              <p className="categoria-avviso-bacheca">
                {avvisoAperto.categoria}
              </p>
            )}

            <h2 id="titolo-avviso-aperto">
              {avvisoAperto.titolo}
            </h2>

            <div className="testo-avviso-bacheca">
              {(avvisoAperto.contenuto || "")
                .split("\n")
                .map((riga, indice) => (
                  <p key={indice}>
                    {riga || "\u00A0"}
                  </p>
                ))}
            </div>

            <footer className="dati-avviso-bacheca">
              <span>
                {formattaData(
                  avvisoAperto.data_pubblicazione
                )}
              </span>

              <strong>
                {formattaFirma(avvisoAperto)}
              </strong>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
