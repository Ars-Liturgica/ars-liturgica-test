import React, { useEffect, useState } from "react";
import "./BachecaAvvisi.css";
import NuovoAvviso from "./NuovoAvviso";
import { supabase } from "../../../supabaseClient";
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
  const [progettiPubblici, setProgettiPubblici] = useState([]);
  const [progettoAperto, setProgettoAperto] = useState(null);
  const [allegatiProgetto, setAllegatiProgetto] = useState([]);
  const [erroreAllegati, setErroreAllegati] = useState("");
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
        setProgettiPubblici([]);
        setCaricamento(false);
        return;
      }

      setCaricamento(true);
      setErrore("");

      try {
        const [documenti, rispostaProgetti] = await Promise.all([
          leggiDocumentiInArchivio({
            parrocchiaId: parrocchia.id,
            tipo: "avviso",
            stato: "in_essere",
            destinazione: "Bacheca Avvisi",
            pubblicatiFinoA:
              new Date().toISOString(),
          }),
          supabase.rpc("ars_elenco_progetti_donazioni_pubblici", {
            p_parrocchia_id: parrocchia.id,
          }),
        ]);
        if (rispostaProgetti.error) throw rispostaProgetti.error;
        const datiProgetti = typeof rispostaProgetti.data === "string"
          ? JSON.parse(rispostaProgetti.data)
          : rispostaProgetti.data;
        const progettiVisibili = (Array.isArray(datiProgetti) ? datiProgetti : [])
          .filter(p => p.tipo_iniziativa === "progetto");

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
          setProgettiPubblici(progettiVisibili);
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
          setProgettiPubblici([]);
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

  async function apriProgetto(progetto) {
    setProgettoAperto(progetto);
    setAllegatiProgetto([]);
    setErroreAllegati("");
    const { data, error } = await supabase.from("ars_allegati_iniziative")
      .select("id, nome_file, percorso, tipo_mime")
      .eq("parrocchia_id", parrocchia.id)
      .eq("iniziativa_id", progetto.id)
      .order("creato_at");
    if (error) {
      setErroreAllegati("Impossibile caricare gli allegati: " + error.message);
      return;
    }
    setAllegatiProgetto(data || []);
  }

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
         {onTorna ? (
            <button
              type="button"
              className="btn-torna-parrocchia"
              onClick={onTorna}
            >
           {solaLettura
  ? "← Torna alla mia Parrocchia"
  : "← Torna a Gestione Parrocchia"}
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
            avvisi.length === 0 && progettiPubblici.length === 0 && (
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
        {!caricamento && !errore && progettiPubblici.length > 0 && (
          <section className="bacheca-sezione-avvisi" aria-label="Progetti della parrocchia">
            <div className="bacheca-titolo-sezione"><p>Comunità</p><h2>Progetti pubblicati</h2></div>
            <div className="elenco-avvisi">
              {progettiPubblici.map(progetto => (
                <article key={progetto.id} className="scheda-avviso priorita-normale"
                  role="button" tabIndex={0} aria-label={`Apri il progetto ${progetto.titolo}`}
                  onClick={() => apriProgetto(progetto)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); apriProgetto(progetto); } }}>
                  <div className="scheda-avviso-corpo" style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                    <p className="categoria-avviso-bacheca">Progetto della parrocchia</p>
                    <h3 style={{ overflowWrap: "anywhere" }}>{progetto.titolo}</h3>
                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {(progetto.descrizione || "").slice(0, 240)}{(progetto.descrizione || "").length > 240 ? "…" : ""}
                    </p>
                    <div className="scheda-avviso-fondo"><span>Progetto pubblicato</span><strong>Scopri il progetto →</strong></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {progettoAperto && (
        <div className="sfondo-dettaglio-avviso" onClick={() => setProgettoAperto(null)}>
          <section className="dettaglio-avviso" role="dialog" aria-modal="true"
            aria-labelledby="titolo-progetto-aperto" onClick={e => e.stopPropagation()}
            style={{ maxHeight: "85vh", overflowY: "auto", overflowWrap: "anywhere" }}>
            <button type="button" className="btn-chiudi-avviso" aria-label="Chiudi progetto"
              onClick={() => setProgettoAperto(null)}>×</button>
            <p className="categoria-avviso-bacheca">Progetto della parrocchia</p>
            <h2 id="titolo-progetto-aperto" style={{ overflowWrap: "anywhere" }}>{progettoAperto.titolo}</h2>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
              {progettoAperto.descrizione}
            </p>
            {progettoAperto.mostra_contatore && (
              <div style={{ padding: 14, border: "1px solid #ddc89d", borderRadius: 10, margin: "16px 0" }}>
                <strong>Offerte raccolte: {Number(progettoAperto.raccolto || 0).toLocaleString("it-IT", { style: "currency", currency: progettoAperto.valuta || "EUR" })}</strong>
                {Number(progettoAperto.obiettivo || 0) > 0 && <p>
                  Obiettivo: {Number(progettoAperto.obiettivo).toLocaleString("it-IT", { style: "currency", currency: progettoAperto.valuta || "EUR" })}
                  <progress value={Math.min(100, Number(progettoAperto.percentuale || 0))} max="100" style={{ display: "block", width: "100%" }} />
                </p>}
              </div>
            )}
            {erroreAllegati && <p role="alert">{erroreAllegati}</p>}
            {allegatiProgetto.length > 0 && (() => {
              const fotografie = allegatiProgetto.filter(a =>
                (a.tipo_mime || "").startsWith("image/") ||
                /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(a.nome_file || "")
              );
              const documenti = allegatiProgetto.filter(a => !fotografie.includes(a));
              const urlAllegato = a => supabase.storage.from("ars-progetti")
                .getPublicUrl(a.percorso).data.publicUrl;
              return (
                <div className="progetto-allegati">
                  <h3>Fotografie e documenti</h3>
                  {fotografie.length > 0 && (
                    <div className="progetto-gruppo-allegati">
                      <h4>Fotografie</h4>
                      <div className="progetto-griglia-foto">
                        {fotografie.map((a, i) => (
                          <a key={a.id} className="progetto-foto" href={urlAllegato(a)}
                            target="_blank" rel="noopener noreferrer"
                            aria-label={`Apri fotografia ${i + 1}: ${a.nome_file || "fotografia"}`}>
                            <img src={urlAllegato(a)} alt={a.nome_file || `Fotografia ${i + 1}`} loading="lazy" />
                            <span>Apri fotografia {i + 1} ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {documenti.length > 0 && (
                    <div className="progetto-gruppo-allegati">
                      <h4>Documenti</h4>
                      <div className="progetto-elenco-documenti">
                        {documenti.map(a => (
                          <a key={a.id} className="progetto-documento" href={urlAllegato(a)}
                            target="_blank" rel="noopener noreferrer"
                            title={a.nome_file || "Apri documento"}>
                            <span className="progetto-documento-icona" aria-hidden="true">PDF</span>
                            <span className="progetto-documento-nome">{a.nome_file || "Documento"}</span>
                            <span className="progetto-documento-apri">Apri ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>
      )}

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