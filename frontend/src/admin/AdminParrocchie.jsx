import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminParrocchie({ tornaHome }) {
  const [parrocchie, setParrocchie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [diocesiSelezionata, setDiocesiSelezionata] = useState("tutte");
  const [statoSelezionato, setStatoSelezionato] = useState("tutti");
  const [parrocchiaSelezionata, setParrocchiaSelezionata] = useState(null);

  const [contattiAperti, setContattiAperti] = useState(false);
  const [contatti, setContatti] = useState([]);
  const [caricamentoContatti, setCaricamentoContatti] = useState(false);
  const [erroreContatti, setErroreContatti] = useState("");

  useEffect(() => {
    caricaParrocchie();
  }, []);

  async function caricaParrocchie() {
    setCaricamento(true);
    setErrore("");

    const { data, error } = await supabase
      .from("parrocchie")
      .select(`
        id,
        codice_parrocchia,
        nome,
        diocesi,
        comune,
        provincia,
        cap,
        indirizzo,
        telefono,
        email,
        sito_web,
        patrono,
        festa_patronale,
        logo_url,
        foto_chiesa_url,
        stato,
        created_at,
        updated_at
      `)
      .order("diocesi", { ascending: true })
      .order("nome", { ascending: true });

    console.log("ERRORE PARROCCHIE:", error);
    console.log("DATI PARROCCHIE:", data);

    if (error) {
      console.error("Errore caricamento parrocchie:", error);
      setErrore(
        "Non è stato possibile caricare l’elenco delle parrocchie."
      );
      setParrocchie([]);
      setCaricamento(false);
      return;
    }

    setParrocchie(data || []);

    if (parrocchiaSelezionata) {
      const aggiornata = (data || []).find(
        (parrocchia) => parrocchia.id === parrocchiaSelezionata.id
      );

      if (aggiornata) {
        setParrocchiaSelezionata(aggiornata);
      }
    }

    setCaricamento(false);
  }

  const diocesiDisponibili = useMemo(() => {
    return [
      ...new Set(
        parrocchie
          .map((parrocchia) => parrocchia.diocesi)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "it"));
  }, [parrocchie]);

  const parrocchieFiltrate = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    return parrocchie.filter((parrocchia) => {
      const corrispondeRicerca =
        !testo ||
        parrocchia.nome?.toLowerCase().includes(testo) ||
        parrocchia.diocesi?.toLowerCase().includes(testo) ||
        parrocchia.comune?.toLowerCase().includes(testo) ||
        parrocchia.provincia?.toLowerCase().includes(testo) ||
        parrocchia.codice_parrocchia?.toLowerCase().includes(testo);

      const corrispondeDiocesi =
        diocesiSelezionata === "tutte" ||
        parrocchia.diocesi === diocesiSelezionata;

      const corrispondeStato =
        statoSelezionato === "tutti" ||
        parrocchia.stato === statoSelezionato;

      return (
        corrispondeRicerca &&
        corrispondeDiocesi &&
        corrispondeStato
      );
    });
  }, [
    parrocchie,
    ricerca,
    diocesiSelezionata,
    statoSelezionato,
  ]);

  const parrocchieRaggruppate = useMemo(() => {
    return parrocchieFiltrate.reduce((gruppi, parrocchia) => {
      const diocesi = parrocchia.diocesi || "Diocesi non indicata";

      if (!gruppi[diocesi]) {
        gruppi[diocesi] = [];
      }

      gruppi[diocesi].push(parrocchia);
      return gruppi;
    }, {});
  }, [parrocchieFiltrate]);

  function formattaData(data) {
    if (!data) return "Non indicata";

    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  }

  function formattaRuolo(ruolo) {
    if (!ruolo) return "Fedele";

    const ruoli = {
      parroco: "Parroco",
      viceparroco: "Viceparroco",
      sacerdote: "Sacerdote",
      collaboratore: "Collaboratore",
      fedele: "Fedele",
    };

    return ruoli[ruolo.toLowerCase()] || ruolo;
  }

  function stampaElenco() {
    window.print();
  }

  async function eliminaParrocchia(parrocchia) {
    const conferma = window.confirm(
      `Vuoi eliminare definitivamente la parrocchia "${parrocchia.nome}"?\n\nQuesta operazione non può essere annullata.`
    );

    if (!conferma) return;

    const { error } = await supabase.rpc(
      "elimina_parrocchia_completa",
      {
        p_parrocchia_id: parrocchia.id,
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    setParrocchiaSelezionata(null);
    setContattiAperti(false);
    setContatti([]);
    await caricaParrocchie();
  }

  function apriParrocchia(parrocchia) {
    setParrocchiaSelezionata(parrocchia);
    setContattiAperti(false);
    setContatti([]);
    setErroreContatti("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function tornaAlleParrocchie() {
    setParrocchiaSelezionata(null);
    setContattiAperti(false);
    setContatti([]);
    setErroreContatti("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function apriContatti() {
    if (!parrocchiaSelezionata) return;

    setCaricamentoContatti(true);
    setErroreContatti("");
    setContatti([]);

    try {
      const { data: collegamenti, error: erroreCollegamenti } =
        await supabase
          .from("utenti_parrocchie")
          .select("*")
          .eq("parrocchia_id", parrocchiaSelezionata.id);

      if (erroreCollegamenti) {
        throw erroreCollegamenti;
      }

      const idsUtenti = [
        ...new Set(
          (collegamenti || [])
            .map((riga) => riga.utente_id)
            .filter(Boolean)
        ),
      ];

      let utenti = [];

      if (idsUtenti.length > 0) {
        const { data: datiUtenti, error: erroreUtenti } =
          await supabase
            .from("utenti")
            .select("*")
            .in("id", idsUtenti);

        if (erroreUtenti) {
          throw erroreUtenti;
        }

        utenti = datiUtenti || [];
      }

      const { data: personeRubrica, error: erroreRubrica } =
        await supabase
          .from("persone_parrocchia")
          .select("*")
          .eq("parrocchia_id", parrocchiaSelezionata.id);

      if (erroreRubrica) {
        throw erroreRubrica;
      }

      const elenco = new Map();

      (collegamenti || []).forEach((collegamento) => {
        const utente = utenti.find(
          (persona) => persona.id === collegamento.utente_id
        );

        if (!utente) return;

        const chiave = `utente-${utente.id}`;

        elenco.set(chiave, {
          id: chiave,
          utente_id: utente.id,
          nome: utente.nome || "",
          cognome: utente.cognome || "",
          email: utente.email || "",
          telefono: utente.telefono || "",
          ruolo: collegamento.ruolo || "fedele",
        });
      });

      (personeRubrica || []).forEach((persona) => {
        if (persona.utente_id) {
          const chiaveUtente = `utente-${persona.utente_id}`;

          if (elenco.has(chiaveUtente)) {
            const esistente = elenco.get(chiaveUtente);

            elenco.set(chiaveUtente, {
              ...esistente,
              nome: persona.nome || esistente.nome,
              cognome: persona.cognome || esistente.cognome,
              email: persona.email || esistente.email,
              telefono: persona.telefono || esistente.telefono,
              ruolo:
                persona.ruolo_base ||
                esistente.ruolo ||
                "fedele",
            });

            return;
          }
        }

        const chiaveNome = `persona-${persona.id}`;

        elenco.set(chiaveNome, {
          id: chiaveNome,
          utente_id: persona.utente_id || null,
          nome: persona.nome || "",
          cognome: persona.cognome || "",
          email: persona.email || "",
          telefono: persona.telefono || "",
          ruolo: persona.ruolo_base || "fedele",
        });
      });

      const ordinati = Array.from(elenco.values()).sort((a, b) => {
        const ordineRuoli = {
          parroco: 1,
          viceparroco: 2,
          sacerdote: 3,
          collaboratore: 4,
          fedele: 5,
        };

        const ordineA =
          ordineRuoli[(a.ruolo || "").toLowerCase()] || 99;

        const ordineB =
          ordineRuoli[(b.ruolo || "").toLowerCase()] || 99;

        if (ordineA !== ordineB) {
          return ordineA - ordineB;
        }

        const nomeA = `${a.cognome || ""} ${a.nome || ""}`;
        const nomeB = `${b.cognome || ""} ${b.nome || ""}`;

        return nomeA.localeCompare(nomeB, "it");
      });

      setContatti(ordinati);
      setContattiAperti(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Errore caricamento contatti:", error);

      setErroreContatti(
        "Non è stato possibile caricare i contatti della parrocchia."
      );

      setContattiAperti(true);
    } finally {
      setCaricamentoContatti(false);
    }
  }

  if (parrocchiaSelezionata && contattiAperti) {
    return (
      <div style={paginaStyle}>
        <div className="pagina-admin" style={sfondoStyle}>
          <header style={headerStyle}>
            <div>
              <h1 style={logoStyle}>Ars Liturgica</h1>
              <p style={payoffStyle}>Al servizio della celebrazione</p>
              <p style={areaAdminStyle}>Area Admin</p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                tornaHome();
              }}
              style={pulsanteHomeStyle}
            >
              Torna alla Home
            </button>
          </header>

          <main style={contenitoreStyle}>
            <button
              type="button"
              onClick={() => {
                setContattiAperti(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={pulsanteIndietroStyle}
            >
              ← Torna alla scheda
            </button>

            <p style={sovratitoloStyle}>CONTATTI DELLA PARROCCHIA</p>

            <h2 style={titoloStyle}>
              {parrocchiaSelezionata.nome}
            </h2>

            <p style={descrizioneStyle}>
              Persone, ruoli e recapiti della comunità parrocchiale.
            </p>

            {caricamentoContatti && (
              <div style={messaggioStyle}>
                Caricamento dei contatti in corso…
              </div>
            )}

            {erroreContatti && (
              <div style={erroreStyle}>
                {erroreContatti}
              </div>
            )}

            {!caricamentoContatti &&
              !erroreContatti &&
              contatti.length === 0 && (
                <div style={messaggioStyle}>
                  Nessun contatto presente per questa parrocchia.
                </div>
              )}

            {!caricamentoContatti &&
              !erroreContatti &&
              contatti.length > 0 && (
                <div style={elencoContattiStyle}>
                  {contatti.map((persona) => (
                    <div
                      key={persona.id}
                      style={personaStyle}
                    >
                      <div>
                        <p style={nomePersonaStyle}>
                          {[persona.nome, persona.cognome]
                            .filter(Boolean)
                            .join(" ") || "Nome non indicato"}
                        </p>

                        <span style={ruoloPersonaStyle}>
                          {formattaRuolo(persona.ruolo)}
                        </span>
                      </div>

                      <div style={recapitiPersonaStyle}>
                        <p>
                          <strong>Telefono:</strong>{" "}
                          {persona.telefono || "Non indicato"}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {persona.email || "Non indicata"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={paginaStyle}>
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .non-stampare {
              display: none !important;
            }

            .pagina-admin {
              background: white !important;
              padding: 0 !important;
            }

            .contenitore-admin {
              max-width: none !important;
              box-shadow: none !important;
              border: none !important;
            }

            .scheda-parrocchia {
              break-inside: avoid;
              box-shadow: none !important;
            }
          }

          @media (max-width: 760px) {
            .barra-filtri {
              grid-template-columns: 1fr !important;
            }

            .griglia-parrocchie {
              grid-template-columns: 1fr !important;
            }

            .testata-admin {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .azioni-scheda {
              flex-direction: column !important;
            }

            .griglia-dettagli {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div className="pagina-admin" style={sfondoStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={logoStyle}>Ars Liturgica</h1>
            <p style={payoffStyle}>Al servizio della celebrazione</p>
            <p style={areaAdminStyle}>Area Admin</p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              tornaHome();
            }}
            className="non-stampare"
            style={pulsanteHomeStyle}
          >
            Torna alla Home
          </button>
        </header>

        <main className="contenitore-admin" style={contenitoreStyle}>
          {parrocchiaSelezionata ? (
            <>
              <button
                type="button"
                onClick={tornaAlleParrocchie}
                className="non-stampare"
                style={pulsanteIndietroStyle}
              >
                ← Tutte le Parrocchie
              </button>

              <div style={testataSchedaSingolaStyle}>
                <div>
                  <p style={sovratitoloStyle}>
                    SCHEDA PARROCCHIA
                  </p>

                  <h2 style={titoloStyle}>
                    {parrocchiaSelezionata.nome}
                  </h2>

                  <p style={descrizioneStyle}>
                    {parrocchiaSelezionata.comune ||
                      "Comune non indicato"}

                    {parrocchiaSelezionata.provincia
                      ? ` (${parrocchiaSelezionata.provincia})`
                      : ""}

                    {parrocchiaSelezionata.diocesi
                      ? ` — Diocesi di ${parrocchiaSelezionata.diocesi}`
                      : ""}
                  </p>
                </div>

                <span
                  style={{
                    ...statoGrandeStyle,
                    background:
                      parrocchiaSelezionata.stato === "attiva"
                        ? "#e7f5ea"
                        : "#f7e5e5",
                    color:
                      parrocchiaSelezionata.stato === "attiva"
                        ? "#176b32"
                        : "#8a1f1f",
                  }}
                >
                  {parrocchiaSelezionata.stato ||
                    "non definito"}
                </span>
              </div>

              <section style={schedaDettaglioStyle}>
                <div
                  className="griglia-dettagli"
                  style={grigliaDettagliStyle}
                >
                  <div style={bloccoDettaglioStyle}>
                    <p style={titoloBloccoStyle}>
                      Dati identificativi
                    </p>

                    <p>
                      <strong>Codice:</strong>{" "}
                      {parrocchiaSelezionata.codice_parrocchia ||
                        "Non assegnato"}
                    </p>

                    <p>
                      <strong>Diocesi:</strong>{" "}
                      {parrocchiaSelezionata.diocesi ||
                        "Non indicata"}
                    </p>

                    <p>
                      <strong>Comune:</strong>{" "}
                      {parrocchiaSelezionata.comune ||
                        "Non indicato"}

                      {parrocchiaSelezionata.provincia
                        ? ` (${parrocchiaSelezionata.provincia})`
                        : ""}
                    </p>

                    <p>
                      <strong>CAP:</strong>{" "}
                      {parrocchiaSelezionata.cap ||
                        "Non indicato"}
                    </p>

                    <p>
                      <strong>Indirizzo:</strong>{" "}
                      {parrocchiaSelezionata.indirizzo ||
                        "Non indicato"}
                    </p>
                  </div>

                  <div style={bloccoDettaglioStyle}>
                    <p style={titoloBloccoStyle}>Contatti</p>

                    <p>
                      <strong>Telefono:</strong>{" "}
                      {parrocchiaSelezionata.telefono ||
                        "Non indicato"}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {parrocchiaSelezionata.email ||
                        "Non indicata"}
                    </p>

                    <p>
                      <strong>Sito web:</strong>{" "}
                      {parrocchiaSelezionata.sito_web ? (
                        <a
                          href={parrocchiaSelezionata.sito_web}
                          target="_blank"
                          rel="noreferrer"
                          style={linkInlineStyle}
                        >
                          Apri sito
                        </a>
                      ) : (
                        "Non indicato"
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={apriContatti}
                      disabled={caricamentoContatti}
                      className="non-stampare"
                      style={pulsanteContattiStyle}
                    >
                      {caricamentoContatti
                        ? "Caricamento..."
                        : "Apri contatti"}
                    </button>
                  </div>

                  <div style={bloccoDettaglioStyle}>
                    <p style={titoloBloccoStyle}>
                      Vita parrocchiale
                    </p>

                    <p>
                      <strong>Patrono:</strong>{" "}
                      {parrocchiaSelezionata.patrono ||
                        "Non indicato"}
                    </p>

                    <p>
                      <strong>Festa patronale:</strong>{" "}
                      {formattaData(
                        parrocchiaSelezionata.festa_patronale
                      )}
                    </p>
                  </div>

                  <div style={bloccoDettaglioStyle}>
                    <p style={titoloBloccoStyle}>
                      Registrazione Ars
                    </p>

                    <p>
                      <strong>Registrata il:</strong>{" "}
                      {formattaData(
                        parrocchiaSelezionata.created_at
                      )}
                    </p>

                    <p>
                      <strong>Ultimo aggiornamento:</strong>{" "}
                      {formattaData(
                        parrocchiaSelezionata.updated_at
                      )}
                    </p>

                    <p>
                      <strong>Stato:</strong>{" "}
                      {parrocchiaSelezionata.stato ||
                        "Non definito"}
                    </p>
                  </div>
                </div>

                <div
                  className="azioni-scheda non-stampare"
                  style={azioniSchedaStyle}
                >
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={pulsanteStampaSchedaStyle}
                  >
                    Stampa scheda
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminaParrocchia(
                        parrocchiaSelezionata
                      )
                    }
                    style={pulsanteEliminaStyle}
                  >
                    Elimina parrocchia
                  </button>
                </div>
              </section>
            </>
          ) : (
            <>
              <div
                className="testata-admin"
                style={testataStyle}
              >
                <div>
                  <p style={sovratitoloStyle}>
                    AMMINISTRAZIONE
                  </p>

                  <h2 style={titoloStyle}>
                    Gestione delle Parrocchie
                  </h2>

                  <p style={descrizioneStyle}>
                    Consulta, ricerca e apri le parrocchie
                    registrate in Ars Liturgica.
                  </p>
                </div>

                <div style={contatoreStyle}>
                  <strong style={{ fontSize: "30px" }}>
                    {parrocchieFiltrate.length}
                  </strong>

                  <span>
                    {parrocchieFiltrate.length === 1
                      ? "parrocchia"
                      : "parrocchie"}
                  </span>
                </div>
              </div>

              <section
                className="barra-filtri non-stampare"
                style={filtriStyle}
              >
                <div>
                  <label style={labelStyle}>Cerca</label>

                  <input
                    type="search"
                    value={ricerca}
                    onChange={(event) =>
                      setRicerca(event.target.value)
                    }
                    placeholder="Nome, comune, diocesi o codice"
                    style={campoStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Diocesi</label>

                  <select
                    value={diocesiSelezionata}
                    onChange={(event) =>
                      setDiocesiSelezionata(
                        event.target.value
                      )
                    }
                    style={campoStyle}
                  >
                    <option value="tutte">
                      Tutte le diocesi
                    </option>

                    {diocesiDisponibili.map((diocesi) => (
                      <option key={diocesi} value={diocesi}>
                        {diocesi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Stato</label>

                  <select
                    value={statoSelezionato}
                    onChange={(event) =>
                      setStatoSelezionato(
                        event.target.value
                      )
                    }
                    style={campoStyle}
                  >
                    <option value="tutti">
                      Tutti gli stati
                    </option>

                    <option value="attiva">
                      Attive
                    </option>

                    <option value="disattiva">
                      Disattivate
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={stampaElenco}
                  style={pulsanteStampaStyle}
                >
                  Stampa elenco
                </button>
              </section>

              {caricamento && (
                <div style={messaggioStyle}>
                  Caricamento delle parrocchie in corso…
                </div>
              )}

              {!caricamento && errore && (
                <div style={erroreStyle}>
                  <strong>Attenzione.</strong>

                  <p style={{ margin: "8px 0 18px" }}>
                    {errore}
                  </p>

                  <button
                    type="button"
                    onClick={caricaParrocchie}
                    style={pulsanteRiprovaStyle}
                  >
                    Riprova
                  </button>
                </div>
              )}

              {!caricamento &&
                !errore &&
                parrocchieFiltrate.length === 0 && (
                  <div style={messaggioStyle}>
                    Nessuna parrocchia corrisponde ai criteri
                    selezionati.
                  </div>
                )}

              {!caricamento &&
                !errore &&
                Object.entries(
                  parrocchieRaggruppate
                ).map(([diocesi, elenco]) => (
                  <section
                    key={diocesi}
                    style={sezioneDiocesiStyle}
                  >
                    <div style={titoloDiocesiStyle}>
                      <div>
                        <p style={etichettaDiocesiStyle}>
                          DIOCESI
                        </p>

                        <h3 style={nomeDiocesiStyle}>
                          {diocesi}
                        </h3>
                      </div>

                      <span style={numeroDiocesiStyle}>
                        {elenco.length}
                      </span>
                    </div>

                    <div
                      className="griglia-parrocchie"
                      style={grigliaStyle}
                    >
                      {elenco.map((parrocchia) => (
                        <article
                          key={parrocchia.id}
                          className="scheda-parrocchia"
                          style={schedaStyle}
                        >
                          <div style={schedaTestataStyle}>
                            <div>
                              <p style={codiceStyle}>
                                {parrocchia.codice_parrocchia ||
                                  "Codice non assegnato"}
                              </p>

                              <h4
                                style={nomeParrocchiaStyle}
                              >
                                {parrocchia.nome}
                              </h4>
                            </div>

                            <span
                              style={{
                                ...statoStyle,
                                background:
                                  parrocchia.stato ===
                                  "attiva"
                                    ? "#e7f5ea"
                                    : "#f7e5e5",
                                color:
                                  parrocchia.stato ===
                                  "attiva"
                                    ? "#176b32"
                                    : "#8a1f1f",
                              }}
                            >
                              {parrocchia.stato ||
                                "non definito"}
                            </span>
                          </div>

                          <div style={datiStyle}>
                            <p>
                              <strong>Comune:</strong>{" "}
                              {parrocchia.comune ||
                                "Non indicato"}

                              {parrocchia.provincia
                                ? ` (${parrocchia.provincia})`
                                : ""}
                            </p>

                            <p>
                              <strong>CAP:</strong>{" "}
                              {parrocchia.cap ||
                                "Non indicato"}
                            </p>

                            <p>
                              <strong>Diocesi:</strong>{" "}
                              {parrocchia.diocesi ||
                                "Non indicata"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              apriParrocchia(parrocchia)
                            }
                            className="non-stampare"
                            style={pulsanteApriStyle}
                          >
                            Apri scheda
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const paginaStyle = {
  minHeight: "100vh",
  background: "#f8f0df",
  fontFamily: "Georgia, 'Times New Roman', serif",
  color: "#082c4c",
};

const sfondoStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f8f0df 0%, #fffaf0 45%, #f4ead5 100%)",
};

const headerStyle = {
  background:
    "linear-gradient(135deg, #062844 0%, #0b3a61 100%)",
  color: "#ffffff",
  borderBottom: "3px solid #c99a2e",
  padding: "30px clamp(22px, 5vw, 70px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "25px",
};

const logoStyle = {
  margin: 0,
  fontSize: "clamp(38px, 5vw, 56px)",
};

const payoffStyle = {
  color: "#e0b64d",
  margin: "4px 0 10px",
  fontSize: "20px",
};

const areaAdminStyle = {
  margin: 0,
  fontWeight: "bold",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const pulsanteHomeStyle = {
  background: "#fff8e8",
  color: "#082c4c",
  border: "1px solid #d7a93a",
  borderRadius: "12px",
  padding: "13px 22px",
  fontWeight: "bold",
  cursor: "pointer",
};

const contenitoreStyle = {
  maxWidth: "1320px",
  margin: "48px auto",
  padding: "clamp(22px, 4vw, 48px)",
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid #d7a93a",
  borderRadius: "28px",
  boxShadow: "0 18px 45px rgba(30, 42, 54, 0.12)",
};

const testataStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "25px",
  borderBottom: "1px solid #ead9b3",
  paddingBottom: "28px",
};

const sovratitoloStyle = {
  margin: "0 0 8px",
  color: "#aa7b18",
  fontSize: "13px",
  fontWeight: "bold",
  letterSpacing: "3px",
};

const titoloStyle = {
  margin: 0,
  color: "#082c4c",
  fontSize: "clamp(32px, 4vw, 48px)",
};

const descrizioneStyle = {
  margin: "14px 0 30px",
  color: "#5a6570",
  fontFamily: "Arial, sans-serif",
  fontSize: "17px",
  lineHeight: 1.6,
};

const contatoreStyle = {
  minWidth: "130px",
  padding: "18px",
  borderRadius: "18px",
  background: "#fff7e5",
  border: "1px solid #d7a93a",
  color: "#082c4c",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const filtriStyle = {
  margin: "30px 0",
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr auto",
  gap: "16px",
  alignItems: "end",
  padding: "22px",
  background: "#f8f2e5",
  borderRadius: "18px",
  border: "1px solid #ead9b3",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
  color: "#082c4c",
};

const campoStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  border: "1px solid #c9a34c",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#263746",
  fontSize: "16px",
};

const pulsanteStampaStyle = {
  padding: "13px 22px",
  border: "none",
  borderRadius: "10px",
  background: "#082c4c",
  color: "#ffffff",
  fontWeight: "bold",
  cursor: "pointer",
};

const messaggioStyle = {
  marginTop: "25px",
  padding: "35px",
  textAlign: "center",
  background: "#fff8e8",
  border: "1px solid #e2c77e",
  borderRadius: "18px",
  color: "#5a4420",
  fontSize: "18px",
};

const erroreStyle = {
  marginTop: "25px",
  padding: "28px",
  background: "#fff0f0",
  border: "1px solid #c66a6a",
  borderRadius: "18px",
  color: "#7a1616",
};

const pulsanteRiprovaStyle = {
  padding: "11px 18px",
  background: "#7a1616",
  color: "#ffffff",
  border: "none",
  borderRadius: "9px",
  cursor: "pointer",
};

const sezioneDiocesiStyle = {
  marginTop: "38px",
};

const titoloDiocesiStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
  paddingBottom: "12px",
  borderBottom: "2px solid #d7a93a",
};

const etichettaDiocesiStyle = {
  margin: "0 0 4px",
  color: "#aa7b18",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "3px",
};

const nomeDiocesiStyle = {
  margin: 0,
  color: "#6d0909",
  fontSize: "28px",
};

const numeroDiocesiStyle = {
  minWidth: "38px",
  height: "38px",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#082c4c",
  color: "#ffffff",
  fontWeight: "bold",
};

const grigliaStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
  gap: "20px",
};

const schedaStyle = {
  padding: "24px",
  background: "#fffdf8",
  border: "1px solid #dec27c",
  borderRadius: "20px",
  boxShadow: "0 8px 24px rgba(30, 42, 54, 0.08)",
};

const schedaTestataStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "flex-start",
  paddingBottom: "16px",
  borderBottom: "1px solid #ead9b3",
};

const codiceStyle = {
  margin: "0 0 7px",
  color: "#9b792c",
  fontSize: "13px",
  fontFamily: "Arial, sans-serif",
  fontWeight: "bold",
};

const nomeParrocchiaStyle = {
  margin: 0,
  color: "#082c4c",
  fontSize: "25px",
  lineHeight: 1.25,
};

const statoStyle = {
  padding: "7px 11px",
  borderRadius: "999px",
  fontFamily: "Arial, sans-serif",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
};

const statoGrandeStyle = {
  padding: "10px 17px",
  borderRadius: "999px",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  fontWeight: "bold",
  textTransform: "uppercase",
};

const datiStyle = {
  marginTop: "18px",
  color: "#364651",
  fontFamily: "Arial, sans-serif",
  lineHeight: 1.55,
};

const pulsanteApriStyle = {
  marginTop: "16px",
  padding: "12px 18px",
  background: "#082c4c",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const pulsanteContattiStyle = {
  marginTop: "18px",
  padding: "11px 18px",
  background: "#082c4c",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const pulsanteEliminaStyle = {
  padding: "12px 18px",
  background: "#8a1f1f",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const pulsanteIndietroStyle = {
  marginBottom: "30px",
  padding: "11px 18px",
  background: "#fff8e8",
  color: "#082c4c",
  border: "1px solid #d7a93a",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const testataSchedaSingolaStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "25px",
  paddingBottom: "28px",
  borderBottom: "2px solid #d7a93a",
};

const schedaDettaglioStyle = {
  marginTop: "30px",
};

const grigliaDettagliStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "20px",
};

const bloccoDettaglioStyle = {
  padding: "24px",
  background: "#fffdf8",
  border: "1px solid #ead9b3",
  borderRadius: "18px",
  fontFamily: "Arial, sans-serif",
  color: "#364651",
  lineHeight: 1.6,
};

const titoloBloccoStyle = {
  margin: "0 0 18px",
  color: "#6d0909",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontWeight: "bold",
  fontSize: "20px",
};

const azioniSchedaStyle = {
  marginTop: "28px",
  paddingTop: "24px",
  borderTop: "1px solid #ead9b3",
  display: "flex",
  gap: "14px",
  justifyContent: "space-between",
};

const pulsanteStampaSchedaStyle = {
  padding: "12px 18px",
  background: "#082c4c",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const linkInlineStyle = {
  color: "#6d0909",
  fontWeight: "bold",
};

const elencoContattiStyle = {
  marginTop: "28px",
  display: "grid",
  gap: "16px",
};

const personaStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "30px",
  padding: "22px 24px",
  background: "#fffdf8",
  border: "1px solid #ead9b3",
  borderRadius: "16px",
  fontFamily: "Arial, sans-serif",
};

const nomePersonaStyle = {
  margin: "0 0 8px",
  color: "#082c4c",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "22px",
  fontWeight: "bold",
};

const ruoloPersonaStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#fff2cd",
  color: "#6d0909",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
};

const recapitiPersonaStyle = {
  minWidth: "310px",
  color: "#364651",
  lineHeight: 1.5,
};
