import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const AMBITI_COLLABORAZIONE = [
  { valore: "catechismo", etichetta: "Catechismo" },
  { valore: "caritas", etichetta: "Caritas" },
  { valore: "coro", etichetta: "Coro" },
  { valore: "ministranti", etichetta: "Ministranti" },
  { valore: "lettori", etichetta: "Lettori" },
  { valore: "segreteria", etichetta: "Segreteria" },
  { valore: "giovani_grest", etichetta: "Giovani e GREST" },
  {
    valore: "consigli_parrocchiali",
    etichetta: "Consigli parrocchiali",
  },
  {
    valore: "feste_volontariato",
    etichetta: "Feste e volontariato",
  },
  { valore: "altro", etichetta: "Altro" },
];

const etichettaRuolo = (ruolo) =>
  String(ruolo || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (lettera) => lettera.toUpperCase());

export default function PartecipazioneComunita({
  parrocchiaId,
  utenteId,
  tornaDashboard,
}) {
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [disponibileCollaborare, setDisponibileCollaborare] = useState(false);
  const [ambitiCollaborazione, setAmbitiCollaborazione] = useState([]);
  const [ruoli, setRuoli] = useState([]);
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [ruoloRinunciaId, setRuoloRinunciaId] = useState(null);
  const [motivoRinuncia, setMotivoRinuncia] = useState("");
  const [rinunciaInCorso, setRinunciaInCorso] = useState(false);

  const caricaPartecipazione = useCallback(async () => {
    if (!utenteId || !parrocchiaId) {
      setErrore("Non è stato possibile riconoscere la tua appartenenza alla comunità.");
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const { data, error } = await supabase.rpc(
      "ars_dettaglio_partecipazione_fedele",
      {
        p_utente_id: utenteId,
        p_parrocchia_id: parrocchiaId,
      },
    );

    if (error) {
      console.error("Errore caricamento partecipazione:", error);
      setErrore("Non è stato possibile caricare la tua partecipazione. Riprova tra poco.");
      setCaricamento(false);
      return;
    }

    const dettaglio = data || {};
    setDisponibileCollaborare(Boolean(dettaglio.disponibile_collaborare));
    setAmbitiCollaborazione(dettaglio.ambiti_collaborazione || []);
    setRuoli(dettaglio.ruoli || []);
    setCaricamento(false);
  }, [parrocchiaId, utenteId]);

  useEffect(() => {
    caricaPartecipazione();
  }, [caricaPartecipazione]);

  const ruoliConRinuncia = useMemo(
    () => new Set(ruoli.filter((ruolo) => ruolo.rinuncia_in_attesa).map((ruolo) => ruolo.id)),
    [ruoli],
  );

  const cambiaDisponibilita = (selezionata) => {
    setDisponibileCollaborare(selezionata);
    setMessaggio("");
    if (!selezionata) setAmbitiCollaborazione([]);
  };

  const cambiaAmbito = (valore) => {
    setMessaggio("");
    setAmbitiCollaborazione((attuali) =>
      attuali.includes(valore)
        ? attuali.filter((ambito) => ambito !== valore)
        : [...attuali, valore],
    );
  };

  const salvaDisponibilita = async () => {
    setSalvataggioInCorso(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc("ars_salva_partecipazione_fedele", {
      p_utente_id: utenteId,
      p_parrocchia_id: parrocchiaId,
      p_disponibile: disponibileCollaborare,
      p_ambiti: disponibileCollaborare ? ambitiCollaborazione : [],
    });

    if (error) {
      console.error("Errore salvataggio partecipazione:", error);
      setErrore("Non è stato possibile salvare la tua scelta. Riprova tra poco.");
      setSalvataggioInCorso(false);
      return;
    }

    setMessaggio(
      disponibileCollaborare
        ? "Grazie. La tua disponibilità è stata comunicata alla parrocchia."
        : "La tua disponibilità futura è stata aggiornata.",
    );
    setSalvataggioInCorso(false);
    await caricaPartecipazione();
  };

  const comunicaRinuncia = async (ruolo) => {
    const conferma = window.confirm(
      `Vuoi comunicare al parroco che non puoi più continuare l'incarico di ${etichettaRuolo(
        ruolo.ruolo,
      )}?`,
    );

    if (!conferma) return;

    setRinunciaInCorso(true);
    setErrore("");
    setMessaggio("");

    const { error } = await supabase.rpc("ars_comunica_rinuncia_incarico", {
      p_utente_id: utenteId,
      p_parrocchia_id: parrocchiaId,
      p_ruolo_persona_id: ruolo.id,
      p_motivo: motivoRinuncia.trim() || null,
    });

    if (error) {
      console.error("Errore comunicazione rinuncia:", error);
      setErrore("Non è stato possibile inviare la comunicazione. Riprova tra poco.");
      setRinunciaInCorso(false);
      return;
    }

    setMessaggio(
      "La tua comunicazione è stata inviata al parroco, che potrà organizzare la sostituzione.",
    );
    setRuoloRinunciaId(null);
    setMotivoRinuncia("");
    setRinunciaInCorso(false);
    await caricaPartecipazione();
  };

  const stileSezione = {
    background: "#fffdf9",
    border: "1px solid #e2d7ca",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 8px 24px rgba(68, 52, 35, 0.07)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3ed",
        padding: "32px 20px 50px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#49392c",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={tornaDashboard}
          style={{
            marginBottom: "24px",
            padding: "11px 18px",
            border: "1px solid #c99536",
            borderRadius: "10px",
            background: "#fffaf0",
            color: "#173955",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← Torna alla Dashboard
        </button>

        <header style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🤝</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "34px", fontWeight: "500" }}>
            Il tuo posto nella Comunità
          </h1>
          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              fontFamily: "Arial, sans-serif",
              fontSize: "17px",
              lineHeight: "1.7",
              color: "#6b5d4a",
            }}
          >
            La comunità cresce con il contributo di ciascuno. Qui puoi offrire il tuo
            tempo, le tue capacità e la tua presenza, oppure consultare gli incarichi
            che ti sono stati affidati.
          </p>
        </header>

        {errore && (
          <div style={{ ...stileSezione, borderColor: "#b35b63", color: "#8b1e2d" }}>
            {errore}
          </div>
        )}

        {messaggio && (
          <div style={{ ...stileSezione, borderColor: "#8fc49d", color: "#2f6f4e" }}>
            {messaggio}
          </div>
        )}

        {caricamento ? (
          <div style={stileSezione}>Caricamento in corso...</div>
        ) : (
          <>
            <section style={stileSezione}>
              <h2 style={{ marginTop: 0, fontSize: "25px", fontWeight: "500" }}>
                Partecipa alla vita della Comunità
              </h2>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: "1.55",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={disponibileCollaborare}
                  onChange={(evento) => cambiaDisponibilita(evento.target.checked)}
                  style={{ width: "20px", height: "20px", marginTop: "2px" }}
                />
                <span>
                  <strong>Desidero offrire la mia disponibilità alla parrocchia</strong>
                  <br />
                  <span style={{ color: "#6b5d4a", fontSize: "14px" }}>
                    Questa scelta non assegna automaticamente un incarico. Il parroco
                    potrà contattarti per conoscerti e valutare insieme come partecipare.
                  </span>
                </span>
              </label>

              {disponibileCollaborare && (
                <div style={{ marginTop: "24px" }}>
                  <div
                    style={{
                      marginBottom: "12px",
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "700",
                    }}
                  >
                    In quali attività ti piacerebbe partecipare?
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {AMBITI_COLLABORAZIONE.map((ambito) => (
                      <label
                        key={ambito.valore}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          padding: "11px",
                          border: ambitiCollaborazione.includes(ambito.valore)
                            ? "1px solid #2f6f4e"
                            : "1px solid #d8c9a5",
                          borderRadius: "10px",
                          background: "#fffaf0",
                          fontFamily: "Arial, sans-serif",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={ambitiCollaborazione.includes(ambito.valore)}
                          onChange={() => cambiaAmbito(ambito.valore)}
                        />
                        {ambito.etichetta}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <p
                style={{
                  margin: "22px 0 0",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: "#75695e",
                }}
              >
                La modifica della disponibilità futura non cambia gli incarichi già
                ricevuti, che trovi nella sezione seguente.
              </p>

              <button
                type="button"
                onClick={salvaDisponibilita}
                disabled={salvataggioInCorso}
                style={{
                  marginTop: "18px",
                  padding: "13px 20px",
                  border: "none",
                  borderRadius: "11px",
                  background: "#2f6f4e",
                  color: "white",
                  fontWeight: "700",
                  cursor: salvataggioInCorso ? "default" : "pointer",
                }}
              >
                {salvataggioInCorso ? "SALVATAGGIO..." : "SALVA LA MIA DISPONIBILITÀ"}
              </button>
            </section>

            <section style={stileSezione}>
              <h2 style={{ marginTop: 0, fontSize: "25px", fontWeight: "500" }}>
                Il mio impegno nella Comunità
              </h2>

              {ruoli.length === 0 ? (
                <p
                  style={{
                    marginBottom: 0,
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.6",
                    color: "#6b5d4a",
                  }}
                >
                  Al momento non ti è stato affidato alcun incarico. La tua eventuale
                  disponibilità sarà visibile al parroco.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {ruoli.map((ruolo) => {
                    const rinunciaInAttesa = ruoliConRinuncia.has(ruolo.id);
                    const moduloAperto = ruoloRinunciaId === ruolo.id;

                    return (
                      <div
                        key={ruolo.id}
                        style={{
                          padding: "18px",
                          border: "1px solid #d8c9a5",
                          borderRadius: "12px",
                          background: "#fffaf0",
                        }}
                      >
                        <div style={{ fontSize: "19px", fontWeight: "700" }}>
                          {etichettaRuolo(ruolo.ruolo)}
                        </div>

                        {rinunciaInAttesa ? (
                          <p
                            style={{
                              marginBottom: 0,
                              fontFamily: "Arial, sans-serif",
                              color: "#8a6d2f",
                              lineHeight: "1.5",
                            }}
                          >
                            Hai già comunicato che non puoi più continuare questo
                            incarico. Il parroco è stato avvisato.
                          </p>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRuoloRinunciaId(moduloAperto ? null : ruolo.id);
                                setMotivoRinuncia("");
                              }}
                              style={{
                                marginTop: "14px",
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                color: "#8b1e2d",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              Comunica che non puoi più continuare questo incarico
                            </button>

                            {moduloAperto && (
                              <div style={{ marginTop: "16px" }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "7px",
                                    fontFamily: "Arial, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  Se lo desideri, puoi aggiungere una breve spiegazione.
                                </label>
                                <textarea
                                  value={motivoRinuncia}
                                  onChange={(evento) => setMotivoRinuncia(evento.target.value)}
                                  maxLength={1000}
                                  rows={4}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "11px",
                                    border: "1px solid #c9b27c",
                                    borderRadius: "9px",
                                    resize: "vertical",
                                    fontFamily: "Arial, sans-serif",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => comunicaRinuncia(ruolo)}
                                  disabled={rinunciaInCorso}
                                  style={{
                                    marginTop: "11px",
                                    padding: "11px 16px",
                                    border: "none",
                                    borderRadius: "9px",
                                    background: "#8b1e2d",
                                    color: "white",
                                    fontWeight: "700",
                                    cursor: rinunciaInCorso ? "default" : "pointer",
                                  }}
                                >
                                  {rinunciaInCorso ? "INVIO..." : "INVIA LA COMUNICAZIONE"}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
