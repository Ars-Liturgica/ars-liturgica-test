import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../../supabaseClient";

const TIPI_INTENZIONE = [
  { valore: "defunto", etichetta: "Per un defunto" },
  {
    valore: "persona_vivente",
    etichetta: "Per una persona vivente",
  },
  { valore: "ringraziamento", etichetta: "In ringraziamento" },
  { valore: "altra", etichetta: "Altra intenzione" },
];

const stilePulsantePrincipale = {
  border: 0,
  borderRadius: "11px",
  padding: "12px 20px",
  background: "#173955",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const stilePulsanteSecondario = {
  border: "1px solid #c99536",
  borderRadius: "11px",
  padding: "11px 18px",
  background: "#fffaf0",
  color: "#173955",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const stilePulsantePericolo = {
  border: "1px solid #b85c52",
  borderRadius: "11px",
  padding: "11px 18px",
  background: "#fff4f2",
  color: "#8a2f25",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const stileCampo = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d8cbbc",
  borderRadius: "10px",
  padding: "12px 14px",
  background: "#ffffff",
  color: "#3e3328",
  fontSize: "16px",
  fontFamily: "Arial, sans-serif",
};

function formattaData(data) {
  if (!data) {
    return "";
  }

  const [anno, mese, giorno] = data.split("-").map(Number);

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(anno, mese - 1, giorno));
}

function formattaOra(ora) {
  return ora ? ora.slice(0, 5) : "";
}

function etichettaTipo(tipo) {
  return (
    TIPI_INTENZIONE.find((voce) => voce.valore === tipo)
      ?.etichetta || "Intenzione"
  );
}

function etichettaStato(stato) {
  const etichette = {
    prenotata: "Prenotata",
    registrata: "Registrata",
    annullata: "Annullata",
    da_regolarizzare: "Da regolarizzare",
  };

  return etichette[stato] || stato;
}

function descrizioneMessa(messa) {
  const disponibilita =
    messa.posti_disponibili === null
      ? ""
      : ` · ${messa.posti_disponibili} posti disponibili`;

  return `${formattaData(messa.data_locale)} · ore ${formattaOra(
    messa.ora_locale
  )} · ${messa.luogo || "Parrocchia"}${disponibilita}`;
}

export default function IntenzioniMesseFedele({
  parrocchiaId,
  utenteId,
  tornaDashboard,
}) {
  const [vista, setVista] = useState("elenco");
  const [messe, setMesse] = useState([]);
  const [intenzioni, setIntenzioni] = useState([]);

  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const [eventoSelezionato, setEventoSelezionato] =
    useState("");
  const [tipoIntenzione, setTipoIntenzione] =
    useState("defunto");
  const [testoIntenzione, setTestoIntenzione] =
    useState("");
  const [pubblicabile, setPubblicabile] = useState(false);

  const [intenzioneDaSpostare, setIntenzioneDaSpostare] =
    useState(null);
  const [nuovoEventoId, setNuovoEventoId] = useState("");

  const [intenzioneDaModificare, setIntenzioneDaModificare] =
    useState(null);
  const [intenzioneDaAnnullare, setIntenzioneDaAnnullare] =
    useState(null);
  const [motivoAnnullamento, setMotivoAnnullamento] =
    useState("");

  const caricaDati = useCallback(async () => {
    if (!utenteId || !parrocchiaId) {
      setErrore(
        "Non è stato possibile riconoscere il fedele o la parrocchia."
      );
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const [risultatoMesse, risultatoIntenzioni] =
      await Promise.all([
        supabase.rpc(
          "ars_elenco_messe_intenzioni_fedele",
          {
            p_utente_id: utenteId,
            p_parrocchia_id: parrocchiaId,
          }
        ),
        supabase.rpc("ars_elenco_intenzioni_fedele", {
          p_utente_id: utenteId,
          p_parrocchia_id: parrocchiaId,
        }),
      ]);

    if (risultatoMesse.error) {
      console.error(
        "Errore caricamento Messe:",
        risultatoMesse.error
      );
      setErrore(risultatoMesse.error.message);
      setCaricamento(false);
      return;
    }

    if (risultatoIntenzioni.error) {
      console.error(
        "Errore caricamento intenzioni:",
        risultatoIntenzioni.error
      );
      setErrore(risultatoIntenzioni.error.message);
      setCaricamento(false);
      return;
    }

    setMesse(risultatoMesse.data || []);
    setIntenzioni(risultatoIntenzioni.data || []);
    setCaricamento(false);
  }, [utenteId, parrocchiaId]);

  useEffect(() => {
    caricaDati();
  }, [caricaDati]);

  const messePrenotabili = useMemo(
    () => messe.filter((messa) => messa.prenotabile),
    [messe]
  );

  const messeDisponibiliPerSpostamento = useMemo(() => {
    const limiteMinimo = Date.now() + 24 * 60 * 60 * 1000;

    return messe.filter((messa) => {
      const dataMessa = new Date(
        messa.data_ora_inizio
      ).getTime();

      return (
        messa.prenotabile &&
        dataMessa > limiteMinimo &&
        messa.evento_id !== intenzioneDaSpostare?.evento_id
      );
    });
  }, [messe, intenzioneDaSpostare]);

  function tornaElenco() {
    setVista("elenco");
    setEventoSelezionato("");
    setTipoIntenzione("defunto");
    setTestoIntenzione("");
    setPubblicabile(false);
    setIntenzioneDaSpostare(null);
    setNuovoEventoId("");
    setIntenzioneDaModificare(null);
    setIntenzioneDaAnnullare(null);
    setMotivoAnnullamento("");
    setErrore("");
  }

  async function inserisciIntenzione(evento) {
    evento.preventDefault();

    if (!eventoSelezionato) {
      setErrore("Scegli la Messa per l’intenzione.");
      return;
    }

    if (!testoIntenzione.trim()) {
      setErrore("Scrivi il testo dell’intenzione.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc(
      "ars_inserisci_intenzione_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
        p_evento_id: eventoSelezionato,
        p_tipo_intenzione: tipoIntenzione,
        p_testo_intenzione: testoIntenzione.trim(),
        p_pubblicabile: pubblicabile,
      }
    );

    if (error) {
      console.error(
        "Errore inserimento intenzione:",
        error
      );
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    await caricaDati();

    setVista("elenco");
    setEventoSelezionato("");
    setTipoIntenzione("defunto");
    setTestoIntenzione("");
    setPubblicabile(false);
    setMessaggio(
      "L’intenzione è stata registrata correttamente."
    );
    setSalvataggio(false);
  }

  function apriSpostamento(intenzione) {
    setIntenzioneDaSpostare(intenzione);
    setNuovoEventoId("");
    setErrore("");
    setMessaggio("");
    setVista("sposta");
  }

  async function spostaIntenzione(evento) {
    evento.preventDefault();

    if (!intenzioneDaSpostare || !nuovoEventoId) {
      setErrore("Scegli la nuova Messa.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc(
      "ars_sposta_intenzione_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
        p_intenzione_id: intenzioneDaSpostare.id,
        p_nuovo_evento_id: nuovoEventoId,
      }
    );

    if (error) {
      console.error(
        "Errore spostamento intenzione:",
        error
      );
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    await caricaDati();

    setVista("elenco");
    setIntenzioneDaSpostare(null);
    setNuovoEventoId("");
    setMessaggio(
      "L’intenzione è stata spostata correttamente."
    );
    setSalvataggio(false);
  }

  function apriModifica(intenzione) {
    setIntenzioneDaModificare(intenzione);
    setTipoIntenzione(intenzione.tipo_intenzione);
    setTestoIntenzione(intenzione.testo_intenzione);
    setPubblicabile(Boolean(intenzione.pubblicabile));
    setErrore("");
    setMessaggio("");
    setVista("modifica");
  }

  async function modificaIntenzione(evento) {
    evento.preventDefault();

    if (!intenzioneDaModificare) {
      setErrore("Non è stato possibile riconoscere l’intenzione.");
      return;
    }

    if (!testoIntenzione.trim()) {
      setErrore("Scrivi il testo dell’intenzione.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc(
      "ars_modifica_intenzione_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
        p_intenzione_id: intenzioneDaModificare.id,
        p_tipo_intenzione: tipoIntenzione,
        p_testo_intenzione: testoIntenzione.trim(),
        p_pubblicabile: pubblicabile,
      }
    );

    if (error) {
      console.error("Errore modifica intenzione:", error);
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    await caricaDati();

    setVista("elenco");
    setIntenzioneDaModificare(null);
    setTipoIntenzione("defunto");
    setTestoIntenzione("");
    setPubblicabile(false);
    setMessaggio("L’intenzione è stata modificata correttamente.");
    setSalvataggio(false);
  }

  function apriAnnullamento(intenzione) {
    setIntenzioneDaAnnullare(intenzione);
    setMotivoAnnullamento("");
    setErrore("");
    setMessaggio("");
    setVista("annulla");
  }

  async function annullaIntenzione(evento) {
    evento.preventDefault();

    if (!intenzioneDaAnnullare) {
      setErrore("Non è stato possibile riconoscere l’intenzione.");
      return;
    }

    if (!motivoAnnullamento.trim()) {
      setErrore("Indica il motivo dell’annullamento.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc(
      "ars_annulla_intenzione_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
        p_intenzione_id: intenzioneDaAnnullare.id,
        p_motivo: motivoAnnullamento.trim(),
      }
    );

    if (error) {
      console.error("Errore annullamento intenzione:", error);
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    await caricaDati();

    setVista("elenco");
    setIntenzioneDaAnnullare(null);
    setMotivoAnnullamento("");
    setMessaggio("L’intenzione è stata annullata correttamente.");
    setSalvataggio(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3ed",
        padding: "32px 20px 50px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#3e3328",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={tornaDashboard}
          style={{
            ...stilePulsanteSecondario,
            marginBottom: "28px",
          }}
        >
          ← Torna alla mia Parrocchia
        </button>

        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              color: "#8a7258",
              fontSize: "13px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Celebrazioni
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "36px",
              fontWeight: "500",
            }}
          >
            Intenzioni per le Messe
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              color: "#6e6257",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.6",
            }}
          >
            Puoi affidare un’intenzione alla tua Parrocchia
            scegliendo una delle Messe disponibili.
          </p>
        </div>

        {errore && (
          <div
            style={{
              background: "#fff0ee",
              border: "1px solid #e3aaa2",
              borderRadius: "12px",
              padding: "14px 16px",
              color: "#8a2f25",
              fontFamily: "Arial, sans-serif",
              marginBottom: "20px",
            }}
          >
            {errore}
          </div>
        )}

        {messaggio && (
          <div
            style={{
              background: "#edf7ef",
              border: "1px solid #a8cfad",
              borderRadius: "12px",
              padding: "14px 16px",
              color: "#285f31",
              fontFamily: "Arial, sans-serif",
              marginBottom: "20px",
            }}
          >
            {messaggio}
          </div>
        )}

        {caricamento ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2d7ca",
              borderRadius: "16px",
              padding: "28px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Caricamento...
          </div>
        ) : (
          <>
            {vista === "elenco" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "22px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      fontWeight: "500",
                    }}
                  >
                    Le mie intenzioni
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      setErrore("");
                      setMessaggio("");
                      setVista("nuova");
                    }}
                    style={stilePulsantePrincipale}
                  >
                    + Nuova intenzione
                  </button>
                </div>

                {intenzioni.length === 0 ? (
                  <div
                    style={{
                      background: "#fffdf9",
                      border: "1px solid #e2d7ca",
                      borderRadius: "16px",
                      padding: "30px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "12px",
                      }}
                    >
                      🕊️
                    </div>

                    <h3
                      style={{
                        margin: "0 0 10px",
                        fontSize: "21px",
                        fontWeight: "500",
                      }}
                    >
                      Non hai ancora inserito intenzioni
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#75695e",
                        fontFamily: "Arial, sans-serif",
                        lineHeight: "1.6",
                      }}
                    >
                      Premi “Nuova intenzione” per scegliere
                      una Messa.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: "16px",
                    }}
                  >
                    {intenzioni.map((intenzione) => (
                      <div
                        key={intenzione.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2d7ca",
                          borderRadius: "16px",
                          padding: "22px",
                          boxShadow:
                            "0 6px 18px rgba(68, 52, 35, 0.06)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "16px",
                          }}
                        >
                          <div style={{ flex: "1 1 520px" }}>
                            <div
                              style={{
                                color: "#8a7258",
                                fontFamily: "Arial, sans-serif",
                                fontSize: "13px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                marginBottom: "8px",
                              }}
                            >
                              {etichettaTipo(
                                intenzione.tipo_intenzione
                              )}
                            </div>

                            <h3
                              style={{
                                margin: "0 0 12px",
                                fontSize: "21px",
                                fontWeight: "500",
                              }}
                            >
                              {intenzione.testo_intenzione}
                            </h3>

                            <div
                              style={{
                                color: "#62564b",
                                fontFamily: "Arial, sans-serif",
                                lineHeight: "1.7",
                              }}
                            >
                              <div>
                                <strong>
                                  {formattaData(
                                    intenzione.data_celebrazione
                                  )}
                                </strong>
                                {" · "}ore{" "}
                                {formattaOra(
                                  intenzione.ora_celebrazione
                                )}
                              </div>

                              <div>
                                {intenzione.luogo ||
                                  "San Marcellino"}
                              </div>

                              <div>
                                Stato:{" "}
                                <strong>
                                  {etichettaStato(
                                    intenzione.stato
                                  )}
                                </strong>
                              </div>

                              <div>
                                Visibilità:{" "}
                                <strong>
                                  {intenzione.pubblicabile
                                    ? "Pubblica"
                                    : "Riservata"}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              flex: "0 1 auto",
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "flex-end",
                              gap: "10px",
                            }}
                          >
                            {intenzione.modificabile ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    apriModifica(intenzione)
                                  }
                                  style={stilePulsanteSecondario}
                                >
                                  Modifica
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    apriSpostamento(intenzione)
                                  }
                                  style={stilePulsanteSecondario}
                                >
                                  Sposta
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    apriAnnullamento(intenzione)
                                  }
                                  style={stilePulsantePericolo}
                                >
                                  Annulla
                                </button>
                              </>
                            ) : (
                              intenzione.stato === "prenotata" && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    background: "#f7f3ed",
                                    borderRadius: "11px",
                                    padding: "12px 14px",
                                    color: "#62564b",
                                    fontFamily: "Arial, sans-serif",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  Nelle ultime 24 ore, per modificare,
                                  spostare o annullare l’intenzione,
                                  contatta direttamente la parrocchia.
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {vista === "nuova" && (
              <form
                onSubmit={inserisciIntenzione}
                style={{
                  background: "#fffdf9",
                  border: "1px solid #e2d7ca",
                  borderRadius: "18px",
                  padding: "28px",
                  boxShadow:
                    "0 8px 24px rgba(68, 52, 35, 0.06)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 24px",
                    fontSize: "27px",
                    fontWeight: "500",
                  }}
                >
                  Nuova intenzione
                </h2>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="messa-intenzione"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                    }}
                  >
                    Scegli la Messa
                  </label>

                  <select
                    id="messa-intenzione"
                    value={eventoSelezionato}
                    onChange={(evento) =>
                      setEventoSelezionato(
                        evento.target.value
                      )
                    }
                    style={stileCampo}
                    required
                  >
                    <option value="">
                      Seleziona una Messa
                    </option>

                    {messePrenotabili.map((messa) => (
                      <option
                        key={messa.evento_id}
                        value={messa.evento_id}
                      >
                        {descrizioneMessa(messa)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="tipo-intenzione"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                    }}
                  >
                    Tipo di intenzione
                  </label>

                  <select
                    id="tipo-intenzione"
                    value={tipoIntenzione}
                    onChange={(evento) =>
                      setTipoIntenzione(
                        evento.target.value
                      )
                    }
                    style={stileCampo}
                  >
                    {TIPI_INTENZIONE.map((tipo) => (
                      <option
                        key={tipo.valore}
                        value={tipo.valore}
                      >
                        {tipo.etichetta}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="testo-intenzione"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                    }}
                  >
                    Intenzione
                  </label>

                  <textarea
                    id="testo-intenzione"
                    value={testoIntenzione}
                    onChange={(evento) =>
                      setTestoIntenzione(
                        evento.target.value
                      )
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="Scrivi qui l’intenzione"
                    style={{
                      ...stileCampo,
                      resize: "vertical",
                    }}
                    required
                  />
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "15px",
                    background: "#f7f3ed",
                    borderRadius: "11px",
                    marginBottom: "24px",
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.5",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={pubblicabile}
                    onChange={(evento) =>
                      setPubblicabile(
                        evento.target.checked
                      )
                    }
                    style={{
                      marginTop: "3px",
                      width: "17px",
                      height: "17px",
                    }}
                  />

                  <span>
                    Desidero che l’intenzione sia visibile
                    alla comunità. Se non selezioni questa
                    scelta, resterà riservata.
                  </span>
                </label>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <button
                    type="submit"
                    disabled={salvataggio}
                    style={{
                      ...stilePulsantePrincipale,
                      opacity: salvataggio ? 0.65 : 1,
                    }}
                  >
                    {salvataggio
                      ? "Registrazione..."
                      : "Conferma intenzione"}
                  </button>

                  <button
                    type="button"
                    onClick={tornaElenco}
                    disabled={salvataggio}
                    style={stilePulsanteSecondario}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            )}

            {vista === "sposta" &&
              intenzioneDaSpostare && (
                <form
                  onSubmit={spostaIntenzione}
                  style={{
                    background: "#fffdf9",
                    border: "1px solid #e2d7ca",
                    borderRadius: "18px",
                    padding: "28px",
                    boxShadow:
                      "0 8px 24px rgba(68, 52, 35, 0.06)",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 14px",
                      fontSize: "27px",
                      fontWeight: "500",
                    }}
                  >
                    Sposta l’intenzione
                  </h2>

                  <p
                    style={{
                      margin: "0 0 22px",
                      color: "#6e6257",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.6",
                    }}
                  >
                    “
                    {
                      intenzioneDaSpostare.testo_intenzione
                    }
                    ” è attualmente prevista per{" "}
                    <strong>
                      {formattaData(
                        intenzioneDaSpostare.data_celebrazione
                      )}
                    </strong>{" "}
                    alle{" "}
                    <strong>
                      {formattaOra(
                        intenzioneDaSpostare.ora_celebrazione
                      )}
                    </strong>
                    .
                  </p>

                  <div style={{ marginBottom: "22px" }}>
                    <label
                      htmlFor="nuova-messa"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "700",
                      }}
                    >
                      Scegli la nuova Messa
                    </label>

                    <select
                      id="nuova-messa"
                      value={nuovoEventoId}
                      onChange={(evento) =>
                        setNuovoEventoId(
                          evento.target.value
                        )
                      }
                      style={stileCampo}
                      required
                    >
                      <option value="">
                        Seleziona una nuova Messa
                      </option>

                      {messeDisponibiliPerSpostamento.map(
                        (messa) => (
                          <option
                            key={messa.evento_id}
                            value={messa.evento_id}
                          >
                            {descrizioneMessa(messa)}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    style={{
                      background: "#f7f3ed",
                      borderRadius: "11px",
                      padding: "14px",
                      color: "#62564b",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.5",
                      marginBottom: "24px",
                    }}
                  >
                    Lo spostamento è consentito fino a 24
                    ore prima della Messa. L’eventuale
                    offerta resta collegata all’intenzione.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={salvataggio}
                      style={{
                        ...stilePulsantePrincipale,
                        opacity: salvataggio ? 0.65 : 1,
                      }}
                    >
                      {salvataggio
                        ? "Spostamento..."
                        : "Conferma spostamento"}
                    </button>

                    <button
                      type="button"
                      onClick={tornaElenco}
                      disabled={salvataggio}
                      style={stilePulsanteSecondario}
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              )}

            {vista === "modifica" &&
              intenzioneDaModificare && (
                <form
                  onSubmit={modificaIntenzione}
                  style={{
                    background: "#fffdf9",
                    border: "1px solid #e2d7ca",
                    borderRadius: "18px",
                    padding: "28px",
                    boxShadow:
                      "0 8px 24px rgba(68, 52, 35, 0.06)",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 12px",
                      fontSize: "27px",
                      fontWeight: "500",
                    }}
                  >
                    Modifica l’intenzione
                  </h2>

                  <p
                    style={{
                      margin: "0 0 24px",
                      color: "#6e6257",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.6",
                    }}
                  >
                    La Messa resta fissata per{" "}
                    <strong>
                      {formattaData(
                        intenzioneDaModificare.data_celebrazione
                      )}
                    </strong>{" "}
                    alle{" "}
                    <strong>
                      {formattaOra(
                        intenzioneDaModificare.ora_celebrazione
                      )}
                    </strong>
                    . Per cambiare data o orario usa il comando
                    “Sposta”.
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      htmlFor="tipo-intenzione-modifica"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "700",
                      }}
                    >
                      Tipo di intenzione
                    </label>

                    <select
                      id="tipo-intenzione-modifica"
                      value={tipoIntenzione}
                      onChange={(evento) =>
                        setTipoIntenzione(evento.target.value)
                      }
                      style={stileCampo}
                    >
                      {TIPI_INTENZIONE.map((tipo) => (
                        <option
                          key={tipo.valore}
                          value={tipo.valore}
                        >
                          {tipo.etichetta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      htmlFor="testo-intenzione-modifica"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "700",
                      }}
                    >
                      Intenzione
                    </label>

                    <textarea
                      id="testo-intenzione-modifica"
                      value={testoIntenzione}
                      onChange={(evento) =>
                        setTestoIntenzione(evento.target.value)
                      }
                      rows={4}
                      maxLength={500}
                      style={{
                        ...stileCampo,
                        resize: "vertical",
                      }}
                      required
                    />
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "15px",
                      background: "#f7f3ed",
                      borderRadius: "11px",
                      marginBottom: "24px",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.5",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={pubblicabile}
                      onChange={(evento) =>
                        setPubblicabile(evento.target.checked)
                      }
                      style={{
                        marginTop: "3px",
                        width: "17px",
                        height: "17px",
                      }}
                    />

                    <span>
                      Desidero che l’intenzione sia visibile alla
                      comunità. Se non selezioni questa scelta,
                      resterà riservata.
                    </span>
                  </label>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={salvataggio}
                      style={{
                        ...stilePulsantePrincipale,
                        opacity: salvataggio ? 0.65 : 1,
                      }}
                    >
                      {salvataggio
                        ? "Salvataggio..."
                        : "Salva modifiche"}
                    </button>

                    <button
                      type="button"
                      onClick={tornaElenco}
                      disabled={salvataggio}
                      style={stilePulsanteSecondario}
                    >
                      Torna indietro
                    </button>
                  </div>
                </form>
              )}

            {vista === "annulla" &&
              intenzioneDaAnnullare && (
                <form
                  onSubmit={annullaIntenzione}
                  style={{
                    background: "#fffdf9",
                    border: "1px solid #e2d7ca",
                    borderRadius: "18px",
                    padding: "28px",
                    boxShadow:
                      "0 8px 24px rgba(68, 52, 35, 0.06)",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 12px",
                      fontSize: "27px",
                      fontWeight: "500",
                    }}
                  >
                    Annulla l’intenzione
                  </h2>

                  <p
                    style={{
                      margin: "0 0 20px",
                      color: "#6e6257",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.6",
                    }}
                  >
                    Stai annullando “
                    {intenzioneDaAnnullare.testo_intenzione}”,
                    prevista per{" "}
                    <strong>
                      {formattaData(
                        intenzioneDaAnnullare.data_celebrazione
                      )}
                    </strong>{" "}
                    alle{" "}
                    <strong>
                      {formattaOra(
                        intenzioneDaAnnullare.ora_celebrazione
                      )}
                    </strong>
                    .
                  </p>

                  <div
                    style={{
                      background: "#fff4f2",
                      border: "1px solid #e3aaa2",
                      borderRadius: "11px",
                      padding: "14px",
                      color: "#7c3831",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.5",
                      marginBottom: "20px",
                    }}
                  >
                    L’annullamento non cancella automaticamente
                    l’eventuale offerta, che resta collegata e sarà
                    gestita separatamente dalla parrocchia.
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label
                      htmlFor="motivo-annullamento"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "700",
                      }}
                    >
                      Motivo dell’annullamento
                    </label>

                    <textarea
                      id="motivo-annullamento"
                      value={motivoAnnullamento}
                      onChange={(evento) =>
                        setMotivoAnnullamento(evento.target.value)
                      }
                      rows={3}
                      maxLength={500}
                      placeholder="Indica brevemente il motivo"
                      style={{
                        ...stileCampo,
                        resize: "vertical",
                      }}
                      required
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={salvataggio}
                      style={{
                        ...stilePulsantePericolo,
                        opacity: salvataggio ? 0.65 : 1,
                      }}
                    >
                      {salvataggio
                        ? "Annullamento..."
                        : "Conferma annullamento"}
                    </button>

                    <button
                      type="button"
                      onClick={tornaElenco}
                      disabled={salvataggio}
                      style={stilePulsanteSecondario}
                    >
                      Torna indietro
                    </button>
                  </div>
                </form>
              )}
          </>
        )}
      </div>
    </div>
  );
}
