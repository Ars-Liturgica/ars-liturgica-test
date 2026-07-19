import React, { useState } from "react";
import "./NuovoAvviso.css";

const categorie = [
  "Celebrazione",
  "Catechesi",
  "Carità",
  "Formazione",
  "Giovani",
  "Liturgia",
  "Pellegrinaggio",
  "Festa Patronale",
  "Amministrazione",
  "Altro",
];

const stanzeDisponibili = [
  "Bacheca Avvisi",
  "Home della Parrocchia",
  "Catechismo",
  "Prima Comunione",
  "Cresime",
  "Coro",
  "Ministranti",
  "Caritas",
  "Rosario",
  "Gruppi Famiglia",
  "Giovani",
  "Grest",
  "Eventi Parrocchiali",
  "Pellegrinaggi",
];

export default function NuovoAvviso({ tornaAllaBacheca }) {
  const oggi = new Date().toISOString().split("T")[0];

  const [titolo, setTitolo] = useState("");
  const [testo, setTesto] = useState("");
  const [categoria, setCategoria] = useState("");
const [categoriaPersonalizzata, setCategoriaPersonalizzata] = useState("");
  const [immagine, setImmagine] = useState(null);
  const [allegato, setAllegato] = useState(null);

  const [destinazioni, setDestinazioni] = useState([
    "Bacheca Avvisi",
  ]);

  const [pubblicazione, setPubblicazione] = useState("subito");
  const [dataPubblicazione, setDataPubblicazione] = useState(oggi);
  const [oraPubblicazione, setOraPubblicazione] = useState("");

  const [tipoScadenza, setTipoScadenza] = useState("data");
  const [dataScadenza, setDataScadenza] = useState("");
  const [oraScadenza, setOraScadenza] = useState("");
  const [azioneScadenza, setAzioneScadenza] = useState("archivia");

  const [priorita, setPriorita] = useState("normale");
  const [destinatari, setDestinatari] = useState("tutti");
  const [firma, setFirma] = useState("parrocchia");

  const [mostraAnteprima, setMostraAnteprima] = useState(false);

  function cambiaDestinazione(nomeStanza) {
    setDestinazioni((destinazioniAttuali) => {
      if (destinazioniAttuali.includes(nomeStanza)) {
        return destinazioniAttuali.filter(
          (destinazione) => destinazione !== nomeStanza
        );
      }

      return [...destinazioniAttuali, nomeStanza];
    });
  }

  function gestisciPubblicazione() {
    if (!titolo.trim() || !testo.trim()) {
      window.alert(
        "Inserisci almeno il titolo e il testo dell’avviso."
      );
      return;
    }

    if (destinazioni.length === 0) {
      window.alert(
        "Seleziona almeno una destinazione per l’avviso."
      );
      return;
    }

    window.alert(
      "La struttura dell’avviso è pronta. Nel prossimo passaggio collegheremo il salvataggio a Supabase."
    );
  }

  function salvaBozza() {
    window.alert(
      "La funzione Salva bozza verrà collegata al database."
    );
  }

  return (
    <div className="nuovo-avviso">
      <header className="nuovo-avviso-header">
        <div>
          <p className="nuovo-avviso-sezione">
            Bacheca Avvisi
          </p>

          <h1>Nuovo Avviso</h1>

          <p>
            Prepara una comunicazione e scegli dove e quando
            pubblicarla.
          </p>
        </div>

        <button
          type="button"
          className="btn-torna-bacheca"
          onClick={tornaAllaBacheca}
        >
          ← Torna alla Bacheca
        </button>
      </header>

      <div className="nuovo-avviso-layout">
        <div className="nuovo-avviso-modulo">
          <section className="sezione-avviso">
            <div className="titolo-sezione-avviso">
              <span>1</span>

              <div>
                <h2>L’avviso</h2>
                <p>Scrivi il contenuto della comunicazione.</p>
              </div>
            </div>

            <div className="campo-avviso">
              <label htmlFor="categoria-avviso">
                Categoria
              </label>

              <select
                id="categoria-avviso"
                value={categoria}
                onChange={(event) =>
                  setCategoria(event.target.value)
                }
              >
                <option value="">
                  Seleziona una categoria
                </option>

                {categorie.map((nomeCategoria) => (
                  <option
                    key={nomeCategoria}
                    value={nomeCategoria}
                  >
                    {nomeCategoria}
                  </option>
                ))}
              </select>
            </div>
{categoria === "Altro" && (
  <div className="campo-avviso">
    <label htmlFor="categoria-personalizzata">
      Nome della nuova categoria
    </label>

    <input
      id="categoria-personalizzata"
      type="text"
      placeholder="Es. Volontari Festa Patronale"
      value={categoriaPersonalizzata}
      onChange={(event) =>
        setCategoriaPersonalizzata(event.target.value)
      }
    />
  </div>
)}
            <div className="campo-avviso">
              <label htmlFor="titolo-avviso">
                Titolo dell’avviso
              </label>

              <input
                id="titolo-avviso"
                type="text"
                placeholder="Esempio: Celebrazione della Santa Messa"
                value={titolo}
                onChange={(event) =>
                  setTitolo(event.target.value)
                }
              />
            </div>

            <div className="campo-avviso">
              <label htmlFor="testo-avviso">
                Testo
              </label>

              <textarea
                id="testo-avviso"
                placeholder="Scrivi qui il testo dell’avviso..."
                value={testo}
                onChange={(event) =>
                  setTesto(event.target.value)
                }
                rows={12}
              />
            </div>

            <div className="allegati-avviso">
              <div className="campo-avviso">
                <label htmlFor="immagine-avviso">
                  Immagine o locandina
                  <small> Facoltativa</small>
                </label>

                <input
                  id="immagine-avviso"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setImmagine(
                      event.target.files?.[0] || null
                    )
                  }
                />

                {immagine && (
                  <p className="file-selezionato">
                    {immagine.name}
                  </p>
                )}
              </div>

              <div className="campo-avviso">
                <label htmlFor="allegato-avviso">
                  Allegato PDF
                  <small> Facoltativo</small>
                </label>

                <input
                  id="allegato-avviso"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setAllegato(
                      event.target.files?.[0] || null
                    )
                  }
                />

                {allegato && (
                  <p className="file-selezionato">
                    {allegato.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="sezione-avviso">
            <div className="titolo-sezione-avviso">
              <span>2</span>

              <div>
                <h2>Dove pubblicarlo</h2>

                <p>
                  L’avviso può comparire contemporaneamente
                  in più stanze.
                </p>
              </div>
            </div>

            <div className="griglia-destinazioni">
              {stanzeDisponibili.map((nomeStanza) => (
                <label
                  key={nomeStanza}
                  className="scelta-destinazione"
                >
                  <input
                    type="checkbox"
                    checked={destinazioni.includes(nomeStanza)}
                    onChange={() =>
                      cambiaDestinazione(nomeStanza)
                    }
                  />

                  <span>{nomeStanza}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="sezione-avviso">
            <div className="titolo-sezione-avviso">
              <span>3</span>

              <div>
                <h2>Quando pubblicarlo</h2>

                <p>
                  Stabilisci la data di affissione e la
                  durata dell’avviso.
                </p>
              </div>
            </div>

            <div className="blocco-programmazione">
              <h3>Pubblicazione</h3>

              <div className="scelte-in-linea">
                <label>
                  <input
                    type="radio"
                    name="pubblicazione"
                    value="subito"
                    checked={pubblicazione === "subito"}
                    onChange={(event) =>
                      setPubblicazione(event.target.value)
                    }
                  />
                  Subito
                </label>

                <label>
                  <input
                    type="radio"
                    name="pubblicazione"
                    value="programmata"
                    checked={
                      pubblicazione === "programmata"
                    }
                    onChange={(event) =>
                      setPubblicazione(event.target.value)
                    }
                  />
                  Programma
                </label>
              </div>

              {pubblicazione === "programmata" && (
                <div className="riga-data-ora">
                  <div className="campo-avviso">
                    <label htmlFor="data-pubblicazione">
                      Data di affissione
                    </label>

                    <input
                      id="data-pubblicazione"
                      type="date"
                      value={dataPubblicazione}
                      onChange={(event) =>
                        setDataPubblicazione(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="campo-avviso">
                    <label htmlFor="ora-pubblicazione">
                      Ora
                    </label>

                    <input
                      id="ora-pubblicazione"
                      type="time"
                      value={oraPubblicazione}
                      onChange={(event) =>
                        setOraPubblicazione(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="blocco-programmazione">
              <h3>Scadenza</h3>

              <div className="scelte-in-linea">
                <label>
                  <input
                    type="radio"
                    name="scadenza"
                    value="nessuna"
                    checked={tipoScadenza === "nessuna"}
                    onChange={(event) =>
                      setTipoScadenza(event.target.value)
                    }
                  />
                  Nessuna scadenza
                </label>

                <label>
                  <input
                    type="radio"
                    name="scadenza"
                    value="data"
                    checked={tipoScadenza === "data"}
                    onChange={(event) =>
                      setTipoScadenza(event.target.value)
                    }
                  />
                  Imposta una data
                </label>
              </div>

              {tipoScadenza === "data" && (
                <>
                  <div className="riga-data-ora">
                    <div className="campo-avviso">
                      <label htmlFor="data-scadenza">
                        Data di rimozione
                      </label>

                      <input
                        id="data-scadenza"
                        type="date"
                        value={dataScadenza}
                        onChange={(event) =>
                          setDataScadenza(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="campo-avviso">
                      <label htmlFor="ora-scadenza">
                        Ora
                      </label>

                      <input
                        id="ora-scadenza"
                        type="time"
                        value={oraScadenza}
                        onChange={(event) =>
                          setOraScadenza(
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="campo-avviso">
                    <label htmlFor="azione-scadenza">
                      Alla scadenza
                    </label>

                    <select
                      id="azione-scadenza"
                      value={azioneScadenza}
                      onChange={(event) =>
                        setAzioneScadenza(
                          event.target.value
                        )
                      }
                    >
                      <option value="archivia">
                        Archivia l’avviso
                      </option>

                      <option value="elimina">
                        Elimina l’avviso
                      </option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="sezione-avviso">
            <div className="titolo-sezione-avviso">
              <span>4</span>

              <div>
                <h2>Visibilità e importanza</h2>

                <p>
                  Definisci il rilievo e i destinatari della
                  comunicazione.
                </p>
              </div>
            </div>

            <div className="griglia-impostazioni">
              <div className="campo-avviso">
                <label htmlFor="priorita-avviso">
                  Importanza
                </label>

                <select
                  id="priorita-avviso"
                  value={priorita}
                  onChange={(event) =>
                    setPriorita(event.target.value)
                  }
                >
                  <option value="normale">Normale</option>
                  <option value="importante">
                    Importante
                  </option>
                  <option value="urgente">Urgente</option>
                  <option value="evidenza">
                    In evidenza
                  </option>
                </select>
              </div>

              <div className="campo-avviso">
                <label htmlFor="destinatari-avviso">
                  Destinatari
                </label>

                <select
                  id="destinatari-avviso"
                  value={destinatari}
                  onChange={(event) =>
                    setDestinatari(event.target.value)
                  }
                >
                  <option value="tutti">
                    Tutta la comunità
                  </option>

                  <option value="membri">
                    Membri delle stanze selezionate
                  </option>

                  <option value="responsabili">
                    Solo responsabili
                  </option>

                  <option value="sacerdoti">
                    Solo sacerdoti
                  </option>
                </select>
              </div>

              <div className="campo-avviso">
                <label htmlFor="firma-avviso">
                  Firma
                </label>

                <select
                  id="firma-avviso"
                  value={firma}
                  onChange={(event) =>
                    setFirma(event.target.value)
                  }
                >
                  <option value="parrocchia">
                    Nome della Parrocchia
                  </option>

                  <option value="parroco">
                    Nome del Parroco
                  </option>

                  <option value="nessuna">
                    Nessuna firma personale
                  </option>
                </select>
              </div>
            </div>
          </section>

          <div className="azioni-nuovo-avviso">
            <button
              type="button"
              className="btn-annulla-avviso"
              onClick={tornaAllaBacheca}
            >
              Annulla
            </button>

            <button
              type="button"
              className="btn-bozza-avviso"
              onClick={salvaBozza}
            >
              Salva bozza
            </button>

            <button
              type="button"
              className="btn-anteprima-avviso"
              onClick={() =>
                setMostraAnteprima(
                  (anteprimaAttuale) =>
                    !anteprimaAttuale
                )
              }
            >
              {mostraAnteprima
                ? "Chiudi anteprima"
                : "Anteprima"}
            </button>

            <button
              type="button"
              className="btn-pubblica-avviso"
              onClick={gestisciPubblicazione}
            >
              Pubblica
            </button>
          </div>
        </div>

        {mostraAnteprima && (
          <aside className="anteprima-avviso">
            <div className="foglio-ufficiale">
              <header className="carta-intestata">
                <div
                  className="simbolo-chiesa-oro"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 120 90">
                    <path d="M60 7v16" />
                    <path d="M52 15h16" />
                    <path d="M18 78h84" />
                    <path d="M24 78V43l36-24 36 24v35" />
                    <path d="M34 78V50h16v28" />
                    <path d="M70 78V50h16v28" />
                    <path d="M52 78V52c0-8 16-8 16 0v26" />
                    <path d="M24 43h72" />
                  </svg>
                </div>

                <p className="nome-parrocchia-avviso">
                  Parrocchia
                </p>

                <p className="diocesi-avviso">
                  Diocesi
                </p>

                <div className="linea-intestata" />
              </header>

              <main className="corpo-anteprima-avviso">
                {categoria && (
                  <p className="categoria-anteprima">
                    {categoria}
                  </p>
                )}

                <h2>
                  {titolo || "Titolo dell’avviso"}
                </h2>

                <div className="testo-anteprima">
                  {testo
                    ? testo
                        .split("\n")
                        .map((riga, indice) => (
                          <p key={`${riga}-${indice}`}>
                            {riga || "\u00A0"}
                          </p>
                        ))
                    : "Il testo dell’avviso comparirà qui."}
                </div>

                {immagine && (
                  <p className="allegato-anteprima">
                    Immagine: {immagine.name}
                  </p>
                )}

                {allegato && (
                  <p className="allegato-anteprima">
                    Allegato PDF: {allegato.name}
                  </p>
                )}
              </main>

              <footer className="piede-anteprima-avviso">
                <p>
                  Pubblicazione:{" "}
                  {pubblicazione === "subito"
                    ? "immediata"
                    : dataPubblicazione || "da definire"}
                </p>

                <p>
                  Scadenza:{" "}
                  {tipoScadenza === "nessuna"
                    ? "nessuna"
                    : dataScadenza || "da definire"}
                </p>
              </footer>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
