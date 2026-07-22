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

export default function NuovoAvviso({
  nomeParrocchia,
  tornaAllaBacheca,
}) {
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
  const [firma, setFirma] = useState("parroco");
const [firmaAltroNome, setFirmaAltroNome] = useState("");
const [firmaAltroRuolo, setFirmaAltroRuolo] = useState("");

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
      {!mostraAnteprima && (
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
)}
      <div className="nuovo-avviso-layout">
{!mostraAnteprima && (
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
    <option value="parroco">
      Parroco
    </option>

    <option value="viceparroco">
      Viceparroco
    </option>

    <option value="segreteria">
      Segreteria Parrocchiale
    </option>

    <option value="altro">
      Altro...
    </option>
  </select>
</div>
              {firma === "altro" && (
  <>
    <div className="campo-avviso">
      <label htmlFor="firma-altro-nome">
        Nome
      </label>

      <input
        id="firma-altro-nome"
        type="text"
        placeholder="Nome di chi firma"
        value={firmaAltroNome}
        onChange={(event) =>
          setFirmaAltroNome(event.target.value)
        }
      />
    </div>

    <div className="campo-avviso">
      <label htmlFor="firma-altro-ruolo">
        Ruolo
      </label>

      <input
        id="firma-altro-ruolo"
        type="text"
        placeholder="Ruolo di chi firma"
        value={firmaAltroRuolo}
        onChange={(event) =>
          setFirmaAltroRuolo(event.target.value)
        }
      />
    </div>
  </>
)}
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
  )}
        {mostraAnteprima && (
          <aside className="anteprima-avviso">
            <article className="foglio-ufficiale">
              <header className="foglio-intestazione">
                <p className="foglio-sovratitolo">
                  Ars Liturgica
                </p>

                <div
                  className="foglio-simbolo-chiesa"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 120 92">
  {/* Croce */}
  <path d="M60 5V18" />
  <path d="M54 11H66" />

  {/* Tetto */}
  <path d="M22 44L60 20L98 44" />

  {/* Facciata */}
  <path d="M32 44V82" />
  <path d="M88 44V82" />

  {/* Basamento */}
  <path d="M18 82H102" />

  {/* Portale */}
  <path d="M52 82V58C52 52 56 48 60 48C64 48 68 52 68 58V82" />

  {/* Rosone */}
  <circle cx="60" cy="35" r="5" />

  {/* Finestre */}
  <path d="M41 70V56" />
  <path d="M79 70V56" />

  {/* Navate */}
  <path d="M18 82V58L32 44" />
  <path d="M102 82V58L88 44" />
</svg>
                </div>

                <h2 className="foglio-nome-parrocchia">
                  {nomeParrocchia || "Nome della Parrocchia"}
                </h2>

                <p className="foglio-localita">
                  Avviso alla comunità parrocchiale
                </p>

                <div className="foglio-separatore">
                  <span />
                  <strong>✦</strong>
                  <span />
                </div>

                <p className="foglio-tipo-documento">
                  Avviso parrocchiale
                </p>

                <div className="foglio-dati-documento">
                  <div>
                    <span>Pubblicazione</span>

                    <strong>
                      {pubblicazione === "subito"
                        ? new Date().toLocaleDateString("it-IT")
                        : dataPubblicazione
                        ? new Date(
                            `${dataPubblicazione}T00:00:00`
                          ).toLocaleDateString("it-IT")
                        : "Da definire"}
                    </strong>
                  </div>

                  <div>
                    <span>Scadenza</span>

                    <strong>
                      {tipoScadenza === "nessuna"
                        ? "Nessuna scadenza"
                        : dataScadenza
                        ? new Date(
                            `${dataScadenza}T00:00:00`
                          ).toLocaleDateString("it-IT")
                        : "Da definire"}
                    </strong>
                  </div>
                </div>
              </header>

              <main className="foglio-corpo">
                {(categoria || categoriaPersonalizzata) && (
                  <p className="foglio-categoria">
                    {categoria === "Altro"
                      ? categoriaPersonalizzata || "Altro"
                      : categoria}
                  </p>
                )}

                <h1 className="foglio-titolo">
                  {titolo || "Titolo dell’avviso"}
                </h1>

                <div className="foglio-ornamento">
                  <span />
                  <strong>◆</strong>
                  <span />
                </div>

                <div className="foglio-testo">
                  {testo ? (
                    testo.split("\n").map((riga, indice) => (
                      <p key={indice}>
                        {riga || "\u00A0"}
                      </p>
                    ))
                  ) : (
                    <p>
                      Il testo dell’avviso comparirà qui.
                    </p>
                  )}
                </div>

                {immagine && (
                  <div className="foglio-allegato">
                    <span>Immagine o locandina</span>
                    <strong>{immagine.name}</strong>
                  </div>
                )}

                {allegato && (
                  <div className="foglio-allegato">
                    <span>Allegato PDF</span>
                    <strong>{allegato.name}</strong>
                  </div>
                )}

               <div className="foglio-firma">
  {firma === "parroco" && (
    <p>Parroco</p>
  )}

  {firma === "viceparroco" && (
    <p>Viceparroco</p>
  )}

  {firma === "segreteria" && (
    <p>Segreteria Parrocchiale</p>
  )}

  {firma === "altro" && (
    <>
      {firmaAltroNome.trim() && (
        <p>{firmaAltroNome}</p>
      )}

      {firmaAltroRuolo.trim() && (
        <p>{firmaAltroRuolo}</p>
      )}
    </>
  )}
</div>
              </main>

              <footer className="foglio-piede">
                <div className="foglio-separatore foglio-separatore-finale">
                  <span />
                  <strong>✦</strong>
                  <span />
                </div>

                <p>
                  Comunicazione ufficiale della comunità
                  parrocchiale
                </p>

                <div className="foglio-informazioni-finali">
                  <span>
                    Destinazioni:{" "}
                    {destinazioni.join(", ")}
                  </span>

                  <span>
                    Importanza:{" "}
                    {priorita.charAt(0).toUpperCase() +
                      priorita.slice(1)}
                  </span>
                </div>
              </footer>
            </article>
          </aside>
        )}
       
      </div>
    </div>
  );
}
