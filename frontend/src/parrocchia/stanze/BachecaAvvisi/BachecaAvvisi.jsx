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
}) {
  const [
    mostraNuovoAvviso,
    setMostraNuovoAvviso,
  ] = useState(false);

  const [avvisi, setAvvisi] = useState([]);
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
        <div className="bacheca-intestazione">
          <h1>Bacheca Avvisi</h1>

          <p>
            Pubblica e gestisci gli avvisi destinati
            alla comunità parrocchiale.
          </p>
        </div>

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

                      <button
                        type="button"
                        className="btn-crea-primo-avviso"
                        onClick={() =>
                          setMostraNuovoAvviso(true)
                        }
                      >
                        Crea il primo avviso
                      </button>
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
                          avviso.priorita ||
                          "normale"
                        }`}
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

                        <div className="testo-avviso-bacheca">
                          {avviso.contenuto
                            .split("\n")
                            .map(
                              (
                                riga,
                                indice
                              ) => (
                                <p key={indice}>
                                  {riga ||
                                    "\u00A0"}
                                </p>
                              )
                            )}
                        </div>

                        <footer className="dati-avviso-bacheca">
                          <span>
                            {formattaData(
                              avviso.data_pubblicazione
                            )}
                          </span>

                          <strong>
                            {formattaFirma(avviso)}
                          </strong>
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
