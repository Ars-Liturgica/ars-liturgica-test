import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminParrocchie({ tornaHome }) {
  const [parrocchie, setParrocchie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [diocesiSelezionata, setDiocesiSelezionata] = useState("tutte");
  const [statoSelezionato, setStatoSelezionato] = useState("tutti");

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
    setCaricamento(false);
  }

  const diocesiDisponibili = useMemo(() => {
    return [...new Set(
      parrocchie
        .map((parrocchia) => parrocchia.diocesi)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "it"));
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

  function stampaElenco() {
    window.print();
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
            onClick={tornaHome}
            className="non-stampare"
            style={pulsanteHomeStyle}
          >
            Torna alla Home
          </button>
        </header>

        <main className="contenitore-admin" style={contenitoreStyle}>
          <div className="testata-admin" style={testataStyle}>
            <div>
              <p style={sovratitoloStyle}>AMMINISTRAZIONE</p>

              <h2 style={titoloStyle}>
                Gestione delle Parrocchie
              </h2>

              <p style={descrizioneStyle}>
                Consulta, ricerca, filtra e stampa le parrocchie
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
                onChange={(event) => setRicerca(event.target.value)}
                placeholder="Nome, comune, diocesi o codice"
                style={campoStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Diocesi</label>
              <select
                value={diocesiSelezionata}
                onChange={(event) =>
                  setDiocesiSelezionata(event.target.value)
                }
                style={campoStyle}
              >
                <option value="tutte">Tutte le diocesi</option>

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
                  setStatoSelezionato(event.target.value)
                }
                style={campoStyle}
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="attiva">Attive</option>
                <option value="disattiva">Disattivate</option>
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
              <p style={{ margin: "8px 0 18px" }}>{errore}</p>

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
                Nessuna parrocchia corrisponde ai criteri selezionati.
              </div>
            )}

          {!caricamento &&
            !errore &&
            Object.entries(parrocchieRaggruppate).map(
              ([diocesi, elenco]) => (
                <section key={diocesi} style={sezioneDiocesiStyle}>
                  <div style={titoloDiocesiStyle}>
                    <div>
                      <p style={etichettaDiocesiStyle}>DIOCESI</p>
                      <h3 style={nomeDiocesiStyle}>{diocesi}</h3>
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

                            <h4 style={nomeParrocchiaStyle}>
                              {parrocchia.nome}
                            </h4>
                          </div>

                          <span
                            style={{
                              ...statoStyle,
                              background:
                                parrocchia.stato === "attiva"
                                  ? "#e7f5ea"
                                  : "#f7e5e5",
                              color:
                                parrocchia.stato === "attiva"
                                  ? "#176b32"
                                  : "#8a1f1f",
                            }}
                          >
                            {parrocchia.stato || "non definito"}
                          </span>
                        </div>

                        <div style={datiStyle}>
                          <p>
                            <strong>Comune:</strong>{" "}
                            {parrocchia.comune || "Non indicato"}
                            {parrocchia.provincia
                              ? ` (${parrocchia.provincia})`
                              : ""}
                          </p>

                          <p>
                            <strong>CAP:</strong>{" "}
                            {parrocchia.cap || "Non indicato"}
                          </p>

                          <p>
                            <strong>Indirizzo:</strong>{" "}
                            {parrocchia.indirizzo || "Non indicato"}
                          </p>

                          <p>
                            <strong>Telefono:</strong>{" "}
                            {parrocchia.telefono || "Non indicato"}
                          </p>

                          <p>
                            <strong>Email:</strong>{" "}
                            {parrocchia.email || "Non indicata"}
                          </p>

                          <p>
                            <strong>Patrono:</strong>{" "}
                            {parrocchia.patrono || "Non indicato"}
                          </p>

                          <p>
                            <strong>Festa patronale:</strong>{" "}
                            {formattaData(parrocchia.festa_patronale)}
                          </p>

                          <p>
                            <strong>Registrata il:</strong>{" "}
                            {formattaData(parrocchia.created_at)}
                          </p>
                        </div>

                        {parrocchia.sito_web && (
                          <a
                            href={parrocchia.sito_web}
                            target="_blank"
                            rel="noreferrer"
                            className="non-stampare"
                            style={linkStyle}
                          >
                            Visita il sito web
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )
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
  margin: "14px 0 0",
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
  padding: "35px",
  textAlign: "center",
  background: "#fff8e8",
  border: "1px solid #e2c77e",
  borderRadius: "18px",
  color: "#5a4420",
  fontSize: "18px",
};

const erroreStyle = {
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

const datiStyle = {
  marginTop: "18px",
  color: "#364651",
  fontFamily: "Arial, sans-serif",
  lineHeight: 1.55,
};

const linkStyle = {
  display: "inline-block",
  marginTop: "14px",
  color: "#6d0909",
  fontWeight: "bold",
  textDecoration: "none",
  borderBottom: "1px solid #6d0909",
};
