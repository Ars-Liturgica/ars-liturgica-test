import React, { useEffect, useState } from "react";
import "./BachecaAvvisi.css";
import NuovoAvviso from "./NuovoAvviso";
import { leggiDocumentiInArchivio } from "../../motoreDocumentale/MotoreDocumentale";

function formattaData(data) {
  if (!data) return "";

  return new Date(data).toLocaleDateString("it-IT");
}

function formattaFirma(avviso) {
  if (avviso.firma_nome) {
    return [avviso.firma_nome, avviso.firma_ruolo]
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
  const [mostraNuovoAvviso, setMostraNuovoAvviso] =
    useState(false);

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
      <div className="bacheca-contenitore">
        <div className="bacheca-barra-superiore">
          {solaLettura && onTorna ? (
            <button
              type="button"
              className="btn-torna-parrocchia"
              onClick={onTorna}
            >
              ← Torna alla mia Parrocchia
            </button>
          ) : (
            <div />
          )}

          {!solaLettura && (
            <button
              type="button"
              className="btn-nuovo-avviso"
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

        <header className="bacheca-testata">
          <div
            className="bacheca-simbolo"
            aria-hidden="true"
          >
            ⛪
          </div>

          <p className="bacheca-sovratitolo">
            {parrocchia?.nome || "La tua Parrocchia"}
          </p>

          <h1>Bacheca Avvisi</h1>

          <p className="bacheca-sottotitolo">
            {solaLettura
              ? "Consulta gli avvisi della tua comunità parrocchiale."
              : "Pubblica e gestisci gli avvisi destinati alla comunità parrocchiale."}
          </p>

          <div className="bacheca-separatore">
            <span />
            <strong>✦</strong>
            <span />
          </div>
        </header>

        <section className="bacheca-sezione-avvisi">
          <div className="bacheca-titolo-sezione">
            <p>Comunità</p>
            <h2>Avvisi pubblicati</h2>
          </div>

          {caricamento && (
            <div className="bacheca-stato">
              Caricamento degli avvisi...
            </div>
          )}

          {!caricamento && errore && (
            <div className="bacheca-stato bacheca-stato-errore">
              <h3>
                Impossibile caricare gli avvisi
              </h3>
              <p>{errore}</p>
            </div>
          )}

          {!caricamento &&
            !errore &&
            avvisi.length === 0 && (
              <div className="bacheca-stato">
                <div className="bacheca-stato-icona">
                  📌
                </div>

                <h3>Nessun avviso presente</h3>

                <p>
                  Gli avvisi pubblicati dal parroco
                  compariranno qui.
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
            )}

          {!caricamento &&
            !errore &&
            avvisi.length > 0 && (
              <div className="elenco-avvisi">
                {avvisi.map((avviso) => (
                  <article
                    key={avviso.id}
                    className={`scheda-avviso priorita-${
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
                    <div className="scheda-avviso-data">
                      <span>
                        {formattaData(
                          avviso.data_pubblicazione
                        )}
                      </span>
                    </div>

                    <div className="scheda-avviso-corpo">
                      {avviso.categoria && (
                        <p className="categoria-avviso-bacheca">
                          {avviso.categoria}
                        </p>
                      )}

                      <h3>{avviso.titolo}</h3>

                      <div className="scheda-avviso-fondo">
                        <span>
                          Avviso della comunità
                        </span>

                        <strong>
                          Leggi tutto →
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>
      </div>

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
