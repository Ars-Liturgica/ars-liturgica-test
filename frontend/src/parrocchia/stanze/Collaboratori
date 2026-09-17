import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const RUOLI = [
  ["viceparroco", "Viceparroco"],
  ["sacerdote_collaboratore", "Sacerdote collaboratore"],
  ["diacono", "Diacono"],
  ["segreteria", "Segreteria"],
  ["catechista", "Catechista"],
  ["sacrestano", "Sacrestano"],
  ["lettore", "Lettore"],
  ["ministro_straordinario", "Ministro straordinario"],
  ["responsabile_caritas", "Responsabile Caritas"],
  ["responsabile_coro", "Responsabile Coro"],
  ["responsabile_ministranti", "Responsabile Ministranti"],
  ["responsabile_giovani", "Responsabile Gruppo giovani"],
  ["responsabile_grest", "Responsabile GREST"],
  ["membro_consiglio_pastorale", "Consiglio pastorale"],
  ["membro_consiglio_affari_economici", "Consiglio affari economici"],
  ["volontario_festa", "Volontario festa patronale"],
  ["collaboratore", "Collaboratore"],
];

const PERMESSI = [
  ["gestione_avvisi", "Gestione avvisi"],
  ["gestione_intenzioni_messe", "Gestione intenzioni Messe"],
  ["gestione_registro_messe", "Gestione Registro Messe"],
  ["gestione_albo_defunti", "Gestione albo defunti"],
  ["gestione_bollettino", "Gestione bollettino"],
  ["gestione_comunicazioni", "Gestione comunicazioni"],
  ["gestione_impostazioni", "Gestione impostazioni"],
  ["gestione_persone_permessi", "Gestione collaboratori e permessi"],
  ["gestione_progetti_donazioni", "Gestione progetti e donazioni"],
];

const AMBITI = {
  catechismo: "Catechismo",
  caritas: "Caritas",
  coro: "Coro",
  ministranti: "Ministranti",
  lettori: "Lettori",
  segreteria: "Segreteria",
  giovani_grest: "Giovani e GREST",
  consigli_parrocchiali: "Consigli parrocchiali",
  feste_volontariato: "Feste e volontariato",
  altro: "Altro",
};

const pagina = {
  minHeight: "100vh",
  background: "#f7f3ed",
  padding: "32px 20px 50px",
  color: "#3e3328",
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const pulsantePrincipale = {
  border: 0,
  borderRadius: "11px",
  padding: "11px 17px",
  background: "#173955",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const pulsanteSecondario = {
  border: "1px solid #c99536",
  borderRadius: "11px",
  padding: "10px 16px",
  background: "#fffaf0",
  color: "#173955",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const scheda = {
  background: "#fff",
  border: "1px solid #e2d7ca",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 6px 18px rgba(68, 52, 35, 0.06)",
};

function etichettaRuolo(valore) {
  return RUOLI.find(([codice]) => codice === valore)?.[1] || valore;
}

function toggleScelta(valore, elenco, setElenco) {
  setElenco(
    elenco.includes(valore)
      ? elenco.filter((voce) => voce !== valore)
      : [...elenco, valore],
  );
}

export default function CollaboratoriParrocchia({
  parrocchiaId,
  tornaDashboard,
}) {
  const [persone, setPersone] = useState([]);
  const [filtro, setFiltro] = useState("disponibili");
  const [personaAperta, setPersonaAperta] = useState(null);
  const [ruoliSelezionati, setRuoliSelezionati] = useState([]);
  const [permessiSelezionati, setPermessiSelezionati] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const caricaPersone = useCallback(async () => {
    if (!parrocchiaId) {
      setErrore("Non è stato possibile riconoscere la parrocchia.");
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const { data, error } = await supabase.rpc(
      "ars_elenco_collaboratori_parroco",
      { p_parrocchia_id: parrocchiaId },
    );

    if (error) {
      console.error("Errore caricamento collaboratori:", error);
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    setPersone(Array.isArray(data) ? data : []);
    setCaricamento(false);
  }, [parrocchiaId]);

  useEffect(() => {
    caricaPersone();
  }, [caricaPersone]);

  const comunita = useMemo(
    () => persone.filter((persona) => persona.ruolo_base !== "parroco"),
    [persone],
  );

  const disponibili = useMemo(
    () =>
      comunita.filter(
        (persona) =>
          persona.disponibile_collaborare && (persona.ruoli || []).length === 0,
      ),
    [comunita],
  );

  const attivi = useMemo(
    () => comunita.filter((persona) => (persona.ruoli || []).length > 0),
    [comunita],
  );

  const elenco = useMemo(() => {
    if (filtro === "disponibili") return disponibili;
    if (filtro === "attivi") return attivi;
    return comunita;
  }, [filtro, disponibili, attivi, comunita]);

  function apriGestione(persona) {
    setPersonaAperta(persona);
    setRuoliSelezionati(Array.isArray(persona.ruoli) ? persona.ruoli : []);
    setPermessiSelezionati(
      Array.isArray(persona.permessi) ? persona.permessi : [],
    );
    setErrore("");
    setMessaggio("");
  }

  function chiudiGestione() {
    setPersonaAperta(null);
    setRuoliSelezionati([]);
    setPermessiSelezionati([]);
    setErrore("");
  }

  async function impostaDaContattare(persona) {
    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const nuovoValore = !persona.da_contattare;
    const { error } = await supabase.rpc("ars_imposta_da_contattare_parroco", {
      p_parrocchia_id: parrocchiaId,
      p_persona_id: persona.persona_id,
      p_da_contattare: nuovoValore,
    });

    if (error) {
      console.error("Errore aggiornamento contatto:", error);
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    await caricaPersone();
    setMessaggio(
      nuovoValore
        ? persona.nome +
            " " +
            persona.cognome +
            " è stato segnato da contattare."
        : "L’indicazione da contattare è stata rimossa.",
    );
    setSalvataggio(false);
  }

  async function salvaCollaboratore(
    ruoli = ruoliSelezionati,
    permessi = permessiSelezionati,
  ) {
    if (!personaAperta) return;

    if (ruoli.length === 0 && permessi.length > 0) {
      setErrore("Per assegnare permessi devi scegliere almeno un ruolo.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc("ars_salva_collaboratore_parroco", {
      p_parrocchia_id: parrocchiaId,
      p_persona_id: personaAperta.persona_id,
      p_ruoli: ruoli,
      p_permessi: ruoli.length > 0 ? permessi : [],
    });

    if (error) {
      console.error("Errore salvataggio collaboratore:", error);
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    const nome = personaAperta.nome + " " + personaAperta.cognome;

    await caricaPersone();
    chiudiGestione();
    setMessaggio(
      ruoli.length > 0
        ? "Ruoli e permessi di " + nome + " sono stati aggiornati."
        : "Tutti i ruoli di " + nome + " sono stati revocati.",
    );
    setSalvataggio(false);
  }

  async function revocaTutto() {
    if (!personaAperta) return;

    const conferma = window.confirm(
      "Vuoi revocare tutti i ruoli e i permessi di " +
        personaAperta.nome +
        " " +
        personaAperta.cognome +
        "? La persona resterà nella Comunità.",
    );

    if (conferma) await salvaCollaboratore([], []);
  }

  if (personaAperta) {
    return (
      <div style={pagina}>
        <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
          <button
            type="button"
            onClick={chiudiGestione}
            disabled={salvataggio}
            style={{
              ...pulsanteSecondario,
              marginBottom: "26px",
            }}
          >
            ← Torna ai Collaboratori
          </button>

          <div style={{ ...scheda, padding: "28px" }}>
            <div
              style={{
                color: "#8a7258",
                fontFamily: "Arial, sans-serif",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Ruoli e autorizzazioni
            </div>

            <h1 style={{ margin: "8px 0", fontWeight: "500" }}>
              {personaAperta.nome} {personaAperta.cognome}
            </h1>

            <p
              style={{
                color: "#6e6257",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.6",
                marginBottom: "26px",
              }}
            >
              Il ruolo descrive l’incarico. I permessi stabiliscono quali
              funzioni può utilizzare.
            </p>

            {errore && (
              <div
                style={{
                  padding: "13px",
                  borderRadius: "10px",
                  background: "#fff0ee",
                  color: "#8a2f25",
                  marginBottom: "18px",
                }}
              >
                {errore}
              </div>
            )}

            <h2>Ruoli</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              {RUOLI.map(([valore, etichetta]) => (
                <label
                  key={valore}
                  style={{
                    padding: "11px",
                    borderRadius: "10px",
                    border: ruoliSelezionati.includes(valore)
                      ? "1px solid #6da47a"
                      : "1px solid #dfd0b7",
                    background: ruoliSelezionati.includes(valore)
                      ? "#eef7f0"
                      : "#fffaf0",
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ruoliSelezionati.includes(valore)}
                    onChange={() =>
                      toggleScelta(
                        valore,
                        ruoliSelezionati,
                        setRuoliSelezionati,
                      )
                    }
                    style={{ marginRight: "9px" }}
                  />
                  {etichetta}
                </label>
              ))}
            </div>

            <h2>Permessi</h2>
            <p
              style={{
                color: "#6e6257",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Nessun permesso viene assegnato automaticamente.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "10px",
                marginBottom: "28px",
              }}
            >
              {PERMESSI.map(([valore, etichetta]) => (
                <label
                  key={valore}
                  style={{
                    padding: "11px",
                    borderRadius: "10px",
                    border: permessiSelezionati.includes(valore)
                      ? "1px solid #6da47a"
                      : "1px solid #dfd0b7",
                    background: permessiSelezionati.includes(valore)
                      ? "#eef7f0"
                      : "#fffaf0",
                    fontFamily: "Arial, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={permessiSelezionati.includes(valore)}
                    onChange={() =>
                      toggleScelta(
                        valore,
                        permessiSelezionati,
                        setPermessiSelezionati,
                      )
                    }
                    style={{ marginRight: "9px" }}
                  />
                  {etichetta}
                </label>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => salvaCollaboratore()}
                disabled={salvataggio}
                style={pulsantePrincipale}
              >
                {salvataggio ? "Salvataggio..." : "Salva ruoli e permessi"}
              </button>

              {(personaAperta.ruoli || []).length > 0 && (
                <button
                  type="button"
                  onClick={revocaTutto}
                  disabled={salvataggio}
                  style={{
                    ...pulsanteSecondario,
                    borderColor: "#b85c52",
                    color: "#8a2f25",
                  }}
                >
                  Revoca tutti i ruoli
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtri = [
    ["disponibili", "Disponibili (" + disponibili.length + ")"],
    ["attivi", "Collaboratori attivi (" + attivi.length + ")"],
    ["comunita", "Comunità (" + comunita.length + ")"],
  ];

  return (
    <div style={pagina}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={tornaDashboard}
          style={{
            ...pulsanteSecondario,
            marginBottom: "28px",
          }}
        >
          ← Torna alla Gestione Parrocchia
        </button>

        <div style={{ marginBottom: "26px" }}>
          <div
            style={{
              color: "#8a7258",
              fontSize: "13px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
            }}
          >
            Gestione Parrocchia
          </div>
          <h1
            style={{
              margin: "8px 0",
              fontSize: "36px",
              fontWeight: "500",
            }}
          >
            Collaboratori
          </h1>
          <p
            style={{
              color: "#6e6257",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.6",
            }}
          >
            Consulta la Comunità, contatta chi ha dato la propria disponibilità
            e assegna ruoli e permessi.
          </p>
        </div>

        {errore && (
          <div
            style={{
              padding: "13px",
              borderRadius: "10px",
              background: "#fff0ee",
              color: "#8a2f25",
              marginBottom: "18px",
            }}
          >
            {errore}
          </div>
        )}

        {messaggio && (
          <div
            style={{
              padding: "13px",
              borderRadius: "10px",
              background: "#edf7ef",
              color: "#285f31",
              marginBottom: "18px",
            }}
          >
            {messaggio}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "22px",
          }}
        >
          {filtri.map(([valore, etichetta]) => (
            <button
              key={valore}
              type="button"
              onClick={() => setFiltro(valore)}
              style={{
                ...pulsanteSecondario,
                background: filtro === valore ? "#173955" : "#fffaf0",
                color: filtro === valore ? "#fff" : "#173955",
              }}
            >
              {etichetta}
            </button>
          ))}
        </div>

        {caricamento ? (
          <div style={scheda}>Caricamento...</div>
        ) : elenco.length === 0 ? (
          <div style={{ ...scheda, textAlign: "center" }}>
            Nessuna persona presente in questo elenco.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {elenco.map((persona) => {
              const ruoli = Array.isArray(persona.ruoli) ? persona.ruoli : [];
              const ambiti = Array.isArray(persona.ambiti_collaborazione)
                ? persona.ambiti_collaborazione
                : [];

              return (
                <div key={persona.persona_id} style={scheda}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "18px",
                    }}
                  >
                    <div style={{ flex: "1 1 500px" }}>
                      <h2
                        style={{
                          margin: "0 0 8px",
                          fontWeight: "500",
                        }}
                      >
                        {persona.nome} {persona.cognome}
                      </h2>

                      <div
                        style={{
                          color: "#675b50",
                          fontFamily: "Arial, sans-serif",
                          lineHeight: "1.6",
                          fontSize: "14px",
                        }}
                      >
                        {(persona.email || persona.telefono) && (
                          <div>
                            {[persona.email, persona.telefono]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                        <div>
                          Account App:{" "}
                          <strong>
                            {persona.account_app_attivo
                              ? "attivo"
                              : "da attivare"}
                          </strong>
                        </div>
                      </div>

                      {persona.disponibile_collaborare && (
                        <div style={{ marginTop: "12px" }}>
                          <strong
                            style={{
                              fontFamily: "Arial, sans-serif",
                              fontSize: "13px",
                              color: "#8a7258",
                            }}
                          >
                            DISPONIBILITÀ ESPRESSA
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "7px",
                              marginTop: "7px",
                            }}
                          >
                            {(ambiti.length > 0
                              ? ambiti
                              : ["ambito_da_concordare"]
                            ).map((ambito) => (
                              <span
                                key={ambito}
                                style={{
                                  background: "#fff4dc",
                                  border: "1px solid #dfbd73",
                                  borderRadius: "999px",
                                  padding: "5px 9px",
                                  fontFamily: "Arial, sans-serif",
                                  fontSize: "13px",
                                }}
                              >
                                {ambito === "ambito_da_concordare"
                                  ? "Ambito da concordare"
                                  : AMBITI[ambito] || ambito}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ruoli.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <strong
                            style={{
                              fontFamily: "Arial, sans-serif",
                              fontSize: "13px",
                              color: "#40634a",
                            }}
                          >
                            RUOLI ATTIVI
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "7px",
                              marginTop: "7px",
                            }}
                          >
                            {ruoli.map((ruolo) => (
                              <span
                                key={ruolo}
                                style={{
                                  background: "#edf7ef",
                                  border: "1px solid #a8cfad",
                                  borderRadius: "999px",
                                  padding: "5px 9px",
                                  fontFamily: "Arial, sans-serif",
                                  fontSize: "13px",
                                }}
                              >
                                {etichettaRuolo(ruolo)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {persona.da_contattare && (
                        <div
                          style={{
                            marginTop: "12px",
                            color: "#8a2f25",
                            fontWeight: "700",
                          }}
                        >
                          Da contattare
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "9px",
                        alignContent: "flex-start",
                      }}
                    >
                      {ruoli.length === 0 && (
                        <button
                          type="button"
                          onClick={() => impostaDaContattare(persona)}
                          disabled={salvataggio}
                          style={pulsanteSecondario}
                        >
                          {persona.da_contattare
                            ? "Rimuovi da contattare"
                            : "Da contattare"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => apriGestione(persona)}
                        style={pulsantePrincipale}
                      >
                        {ruoli.length > 0
                          ? "Modifica ruolo e permessi"
                          : "Assegna ruolo"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
