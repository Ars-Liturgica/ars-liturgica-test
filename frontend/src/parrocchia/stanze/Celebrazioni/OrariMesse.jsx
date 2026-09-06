import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const giorniSettimana = [
  { valore: 1, etichetta: "Lunedì" },
  { valore: 2, etichetta: "Martedì" },
  { valore: 3, etichetta: "Mercoledì" },
  { valore: 4, etichetta: "Giovedì" },
  { valore: 5, etichetta: "Venerdì" },
  { valore: 6, etichetta: "Sabato" },
  { valore: 7, etichetta: "Domenica" },
];

const tipologieMessa = [
  { valore: "feriale", etichetta: "Feriale" },
  { valore: "prefestiva", etichetta: "Prefestiva" },
  { valore: "festiva", etichetta: "Festiva" },
];

const luogoIniziale = {
  nome: "",
  tipo: "chiesa",
  indirizzo: "",
  note_pubbliche: "",
};

const orarioIniziale = {
  luogo_id: "",
  giorno_settimana: "1",
  ora: "",
  tipologia: "feriale",
  celebrante_nome: "",
  valido_dal: "",
  valido_al: "",
  accetta_intenzioni: true,
  numero_massimo_intenzioni: "1",
  note_pubbliche: "",
  visibile_pubblico: true,
};

export default function OrariMesse({
  parrocchiaId,
  tornaCelebrazioni,
}) {
  const [luoghi, setLuoghi] = useState([]);
  const [orari, setOrari] = useState([]);

  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);

  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const [mostraFormLuogo, setMostraFormLuogo] = useState(false);
  const [mostraFormOrario, setMostraFormOrario] = useState(false);

  const [formLuogo, setFormLuogo] = useState(luogoIniziale);
  const [formOrario, setFormOrario] = useState(orarioIniziale);

  const [orarioInModifica, setOrarioInModifica] = useState(null);

  const caricaDati = useCallback(async () => {
    if (!parrocchiaId) {
      setCaricamento(false);
      setErrore("Parrocchia non disponibile.");
      return;
    }

    setCaricamento(true);
    setErrore("");

    try {
      const [risultatoLuoghi, risultatoOrari] = await Promise.all([
        supabase
          .from("luoghi_celebrazione")
          .select("*")
          .eq("parrocchia_id", parrocchiaId)
          .order("nome", { ascending: true }),

        supabase
          .from("orari_messe")
          .select(
            `
              *,
              luogo:luoghi_celebrazione (
                id,
                nome,
                tipo
              )
            `
          )
          .eq("parrocchia_id", parrocchiaId)
          .order("giorno_settimana", { ascending: true })
          .order("ora", { ascending: true }),
      ]);

      if (risultatoLuoghi.error) {
        throw risultatoLuoghi.error;
      }

      if (risultatoOrari.error) {
        throw risultatoOrari.error;
      }

      setLuoghi(risultatoLuoghi.data || []);
      setOrari(risultatoOrari.data || []);
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message ||
          "Non è stato possibile caricare gli orari delle Messe."
      );
    } finally {
      setCaricamento(false);
    }
  }, [parrocchiaId]);

  useEffect(() => {
    caricaDati();
  }, [caricaDati]);

  const orariRaggruppati = useMemo(() => {
    return tipologieMessa.map((tipologia) => ({
      ...tipologia,
      orari: orari.filter(
        (orario) => orario.tipologia === tipologia.valore
      ),
    }));
  }, [orari]);

  function pulisciMessaggi() {
    setErrore("");
    setMessaggio("");
  }

  function nomeGiorno(numeroGiorno) {
    return (
      giorniSettimana.find(
        (giorno) => giorno.valore === Number(numeroGiorno)
      )?.etichetta || ""
    );
  }

  function formattaOra(ora) {
    return ora ? ora.slice(0, 5) : "";
  }

  function formattaData(data) {
    if (!data) return "";

    return new Intl.DateTimeFormat("it-IT").format(
      new Date(`${data}T12:00:00`)
    );
  }

  function descrizionePeriodo(orario) {
    if (orario.valido_dal && orario.valido_al) {
      return `Dal ${formattaData(orario.valido_dal)} al ${formattaData(
        orario.valido_al
      )}`;
    }

    if (orario.valido_dal) {
      return `Dal ${formattaData(orario.valido_dal)}`;
    }

    if (orario.valido_al) {
      return `Fino al ${formattaData(orario.valido_al)}`;
    }

    return "Valido tutto l’anno";
  }

  function apriNuovoLuogo() {
    pulisciMessaggi();
    setFormLuogo(luogoIniziale);
    setMostraFormLuogo(true);
    setMostraFormOrario(false);
  }

  function apriNuovoOrario() {
    pulisciMessaggi();

    setOrarioInModifica(null);
    setFormOrario({
      ...orarioIniziale,
      luogo_id:
        luoghi.find((luogo) => luogo.attivo)?.id || "",
    });

    setMostraFormOrario(true);
    setMostraFormLuogo(false);
  }

  function annullaForm() {
    pulisciMessaggi();
    setMostraFormLuogo(false);
    setMostraFormOrario(false);
    setOrarioInModifica(null);
    setFormLuogo(luogoIniziale);
    setFormOrario(orarioIniziale);
  }

  async function salvaLuogo(event) {
    event.preventDefault();
    pulisciMessaggi();

    if (!formLuogo.nome.trim()) {
      setErrore("Inserisci il nome della chiesa o del luogo.");
      return;
    }

    setSalvataggio(true);

    try {
      const { error } = await supabase
        .from("luoghi_celebrazione")
        .insert({
          parrocchia_id: parrocchiaId,
          nome: formLuogo.nome.trim(),
          tipo: formLuogo.tipo,
          indirizzo: formLuogo.indirizzo.trim() || null,
          note_pubbliche:
            formLuogo.note_pubbliche.trim() || null,
          attivo: true,
        });

      if (error) throw error;

      setFormLuogo(luogoIniziale);
      setMostraFormLuogo(false);
      setMessaggio("Luogo aggiunto correttamente.");

      await caricaDati();
    } catch (err) {
      console.error(err);

      if (err?.code === "23505") {
        setErrore(
          "Esiste già un luogo con questo nome nella parrocchia."
        );
      } else {
        setErrore(
          err?.message ||
            "Non è stato possibile aggiungere il luogo."
        );
      }
    } finally {
      setSalvataggio(false);
    }
  }

  async function cambiaStatoLuogo(luogo) {
    pulisciMessaggi();

    try {
      const { error } = await supabase
        .from("luoghi_celebrazione")
        .update({ attivo: !luogo.attivo })
        .eq("id", luogo.id)
        .eq("parrocchia_id", parrocchiaId);

      if (error) throw error;

      setMessaggio(
        luogo.attivo
          ? "Luogo disattivato."
          : "Luogo riattivato."
      );

      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message ||
          "Non è stato possibile modificare il luogo."
      );
    }
  }

  function modificaOrario(orario) {
    pulisciMessaggi();

    setOrarioInModifica(orario.id);

    setFormOrario({
      luogo_id: orario.luogo_id || "",
      giorno_settimana: String(orario.giorno_settimana),
      ora: formattaOra(orario.ora),
      tipologia: orario.tipologia,
      celebrante_nome: orario.celebrante_nome || "",
      valido_dal: orario.valido_dal || "",
      valido_al: orario.valido_al || "",
      accetta_intenzioni: orario.accetta_intenzioni,
      numero_massimo_intenzioni:
        orario.numero_massimo_intenzioni === null
          ? ""
          : String(orario.numero_massimo_intenzioni),
      note_pubbliche: orario.note_pubbliche || "",
      visibile_pubblico: orario.visibile_pubblico,
    });

    setMostraFormOrario(true);
    setMostraFormLuogo(false);
  }

  async function salvaOrario(event) {
    event.preventDefault();
    pulisciMessaggi();

    if (!formOrario.luogo_id) {
      setErrore("Seleziona la chiesa o il luogo.");
      return;
    }

    if (!formOrario.ora) {
      setErrore("Inserisci l’orario della Messa.");
      return;
    }

    if (
      formOrario.valido_dal &&
      formOrario.valido_al &&
      formOrario.valido_al < formOrario.valido_dal
    ) {
      setErrore(
        "La data finale non può precedere la data iniziale."
      );
      return;
    }

    const numeroMassimo =
      formOrario.accetta_intenzioni &&
      formOrario.numero_massimo_intenzioni !== ""
        ? Number(formOrario.numero_massimo_intenzioni)
        : null;

    if (
      formOrario.accetta_intenzioni &&
      numeroMassimo !== null &&
      numeroMassimo < 1
    ) {
      setErrore(
        "Il numero massimo di intenzioni deve essere almeno 1."
      );
      return;
    }

    const datiOrario = {
      parrocchia_id: parrocchiaId,
      luogo_id: formOrario.luogo_id,
      giorno_settimana: Number(
        formOrario.giorno_settimana
      ),
      ora: formOrario.ora,
      tipologia: formOrario.tipologia,
      celebrante_id: null,
      celebrante_nome:
        formOrario.celebrante_nome.trim() || null,
      valido_dal: formOrario.valido_dal || null,
      valido_al: formOrario.valido_al || null,
      accetta_intenzioni:
        formOrario.accetta_intenzioni,
      numero_massimo_intenzioni: numeroMassimo,
      note_pubbliche:
        formOrario.note_pubbliche.trim() || null,
      visibile_pubblico:
        formOrario.visibile_pubblico,
    };

    setSalvataggio(true);

    try {
      if (orarioInModifica) {
        const { error } = await supabase
          .from("orari_messe")
          .update(datiOrario)
          .eq("id", orarioInModifica)
          .eq("parrocchia_id", parrocchiaId);

        if (error) throw error;

        setMessaggio("Orario aggiornato correttamente.");
      } else {
        const { error } = await supabase
          .from("orari_messe")
          .insert({
            ...datiOrario,
            attivo: true,
          });

        if (error) throw error;

        setMessaggio("Orario aggiunto correttamente.");
      }

      setMostraFormOrario(false);
      setOrarioInModifica(null);
      setFormOrario(orarioIniziale);

      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message ||
          "Non è stato possibile salvare l’orario."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  async function cambiaStatoOrario(orario) {
    pulisciMessaggi();

    try {
      const { error } = await supabase
        .from("orari_messe")
        .update({ attivo: !orario.attivo })
        .eq("id", orario.id)
        .eq("parrocchia_id", parrocchiaId);

      if (error) throw error;

      setMessaggio(
        orario.attivo
          ? "Orario disattivato."
          : "Orario riattivato."
      );

      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message ||
          "Non è stato possibile modificare l’orario."
      );
    }
  }

  return (
    <div className="dashboard-parroco">
      <button
        type="button"
        className="pulsante-torna-dashboard"
        onClick={tornaCelebrazioni}
      >
        ← Torna a Celebrazioni
      </button>

      <h2>Orari Messe</h2>

      <p>
        Gestisci gli orari ordinari feriali, prefestivi e
        festivi della parrocchia.
      </p>

      <div className="orari-messe-toolbar">
        <button
          type="button"
          className="pulsante-azione-principale"
          onClick={apriNuovoOrario}
          disabled={luoghi.length === 0}
        >
          + Nuovo orario
        </button>

        <button
          type="button"
          className="pulsante-azione-secondaria"
          onClick={apriNuovoLuogo}
        >
          + Nuovo luogo
        </button>
      </div>

      {luoghi.length === 0 && !caricamento && (
        <div className="sezione-in-preparazione">
          <p>
            Prima di inserire un orario, aggiungi almeno una
            chiesa o un luogo di celebrazione.
          </p>
        </div>
      )}

      {errore && (
        <div className="messaggio-errore">{errore}</div>
      )}

      {messaggio && (
        <div className="messaggio-successo">{messaggio}</div>
      )}

      {mostraFormLuogo && (
        <form
          className="pannello-form"
          onSubmit={salvaLuogo}
        >
          <h3>Nuovo luogo di celebrazione</h3>

          <div className="griglia-form">
            <label className="campo-form">
              <span>Nome del luogo *</span>
              <input
                type="text"
                value={formLuogo.nome}
                onChange={(event) =>
                  setFormLuogo({
                    ...formLuogo,
                    nome: event.target.value,
                  })
                }
                placeholder="Es. Chiesa di San Giuseppe"
              />
            </label>

            <label className="campo-form">
              <span>Tipologia *</span>
              <select
                value={formLuogo.tipo}
                onChange={(event) =>
                  setFormLuogo({
                    ...formLuogo,
                    tipo: event.target.value,
                  })
                }
              >
                <option value="chiesa">Chiesa</option>
                <option value="cappella">Cappella</option>
                <option value="oratorio">Oratorio</option>
                <option value="santuario">Santuario</option>
                <option value="altro">Altro</option>
              </select>
            </label>

            <label className="campo-form campo-form-largo">
              <span>Indirizzo</span>
              <input
                type="text"
                value={formLuogo.indirizzo}
                onChange={(event) =>
                  setFormLuogo({
                    ...formLuogo,
                    indirizzo: event.target.value,
                  })
                }
                placeholder="Indirizzo facoltativo"
              />
            </label>

            <label className="campo-form campo-form-largo">
              <span>Nota pubblica</span>
              <textarea
                value={formLuogo.note_pubbliche}
                onChange={(event) =>
                  setFormLuogo({
                    ...formLuogo,
                    note_pubbliche: event.target.value,
                  })
                }
                placeholder="Informazioni utili per i fedeli"
                rows="3"
              />
            </label>
          </div>

          <div className="azioni-form">
            <button
              type="submit"
              className="pulsante-azione-principale"
              disabled={salvataggio}
            >
              {salvataggio ? "Salvataggio..." : "Salva luogo"}
            </button>

            <button
              type="button"
              className="pulsante-azione-secondaria"
              onClick={annullaForm}
              disabled={salvataggio}
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {mostraFormOrario && (
        <form
          className="pannello-form"
          onSubmit={salvaOrario}
        >
          <h3>
            {orarioInModifica
              ? "Modifica orario"
              : "Nuovo orario"}
          </h3>

          <div className="griglia-form">
            <label className="campo-form">
              <span>Luogo *</span>
              <select
                value={formOrario.luogo_id}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    luogo_id: event.target.value,
                  })
                }
              >
                <option value="">Seleziona il luogo</option>

                {luoghi.map((luogo) => (
                  <option
                    key={luogo.id}
                    value={luogo.id}
                  >
                    {luogo.nome}
                    {!luogo.attivo ? " — non attivo" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo-form">
              <span>Giorno *</span>
              <select
                value={formOrario.giorno_settimana}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    giorno_settimana: event.target.value,
                  })
                }
              >
                {giorniSettimana.map((giorno) => (
                  <option
                    key={giorno.valore}
                    value={giorno.valore}
                  >
                    {giorno.etichetta}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo-form">
              <span>Ora *</span>
              <input
                type="time"
                value={formOrario.ora}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    ora: event.target.value,
                  })
                }
              />
            </label>

            <label className="campo-form">
              <span>Tipologia *</span>
              <select
                value={formOrario.tipologia}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    tipologia: event.target.value,
                  })
                }
              >
                {tipologieMessa.map((tipologia) => (
                  <option
                    key={tipologia.valore}
                    value={tipologia.valore}
                  >
                    {tipologia.etichetta}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo-form">
              <span>Sacerdote celebrante</span>
              <input
                type="text"
                value={formOrario.celebrante_nome}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    celebrante_nome: event.target.value,
                  })
                }
                placeholder="Facoltativo"
              />
            </label>

            <label className="campo-form">
              <span>Valido dal</span>
              <input
                type="date"
                value={formOrario.valido_dal}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    valido_dal: event.target.value,
                  })
                }
              />
            </label>

            <label className="campo-form">
              <span>Valido fino al</span>
              <input
                type="date"
                value={formOrario.valido_al}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    valido_al: event.target.value,
                  })
                }
              />
            </label>

            <label className="campo-form">
              <span>Numero massimo di intenzioni</span>
              <input
                type="number"
                min="1"
                value={
                  formOrario.numero_massimo_intenzioni
                }
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    numero_massimo_intenzioni:
                      event.target.value,
                  })
                }
                disabled={!formOrario.accetta_intenzioni}
                placeholder="Vuoto = senza limite"
              />
            </label>

            <label className="campo-form campo-form-largo">
              <span>Nota pubblica</span>
              <textarea
                value={formOrario.note_pubbliche}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    note_pubbliche: event.target.value,
                  })
                }
                placeholder="Informazioni visibili ai fedeli"
                rows="3"
              />
            </label>
          </div>

          <div className="opzioni-form">
            <label className="campo-checkbox">
              <input
                type="checkbox"
                checked={formOrario.accetta_intenzioni}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    accetta_intenzioni:
                      event.target.checked,
                    numero_massimo_intenzioni:
                      event.target.checked ? "1" : "",
                  })
                }
              />
              <span>Accetta richieste di intenzioni</span>
            </label>

            <label className="campo-checkbox">
              <input
                type="checkbox"
                checked={formOrario.visibile_pubblico}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    visibile_pubblico:
                      event.target.checked,
                  })
                }
              />
              <span>Visibile ai fedeli</span>
            </label>
          </div>

          <div className="azioni-form">
            <button
              type="submit"
              className="pulsante-azione-principale"
              disabled={salvataggio}
            >
              {salvataggio
                ? "Salvataggio..."
                : orarioInModifica
                ? "Salva modifiche"
                : "Salva orario"}
            </button>

            <button
              type="button"
              className="pulsante-azione-secondaria"
              onClick={annullaForm}
              disabled={salvataggio}
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {luoghi.length > 0 && (
        <section className="sezione-luoghi">
          <h3>Luoghi delle celebrazioni</h3>

          <div className="lista-luoghi">
            {luoghi.map((luogo) => (
              <div
                className={`riga-luogo ${
                  !luogo.attivo ? "elemento-disattivato" : ""
                }`}
                key={luogo.id}
              >
                <div>
                  <strong>{luogo.nome}</strong>
                  <p>
                    {luogo.tipo}
                    {luogo.indirizzo
                      ? ` · ${luogo.indirizzo}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="pulsante-azione-secondaria"
                  onClick={() => cambiaStatoLuogo(luogo)}
                >
                  {luogo.attivo ? "Disattiva" : "Riattiva"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="sezione-elenco-orari">
        <h3>Orari inseriti</h3>

        {caricamento ? (
          <p>Caricamento degli orari...</p>
        ) : orari.length === 0 ? (
          <div className="sezione-in-preparazione">
            <p>Non è stato ancora inserito alcun orario.</p>
          </div>
        ) : (
          orariRaggruppati.map(
            (gruppo) =>
              gruppo.orari.length > 0 && (
                <div
                  className="gruppo-orari"
                  key={gruppo.valore}
                >
                  <h4>{gruppo.etichetta}</h4>

                  <div className="lista-orari">
                    {gruppo.orari.map((orario) => (
                      <article
                        className={`riga-orario ${
                          !orario.attivo
                            ? "elemento-disattivato"
                            : ""
                        }`}
                        key={orario.id}
                      >
                        <div className="orario-principale">
                          <span className="orario-ora">
                            {formattaOra(orario.ora)}
                          </span>

                          <div className="orario-dettagli">
                            <strong>
                              {nomeGiorno(
                                orario.giorno_settimana
                              )}
                            </strong>

                            <p>
                              {orario.luogo?.nome ||
                                "Luogo non disponibile"}
                            </p>

                            <p>
                              {descrizionePeriodo(orario)}
                            </p>

                            {orario.celebrante_nome && (
                              <p>
                                Celebrante:{" "}
                                {orario.celebrante_nome}
                              </p>
                            )}

                            {orario.note_pubbliche && (
                              <p>{orario.note_pubbliche}</p>
                            )}

                            <p>
                              Intenzioni:{" "}
                              {orario.accetta_intenzioni
                                ? orario.numero_massimo_intenzioni
                                  ? `massimo ${orario.numero_massimo_intenzioni}`
                                  : "senza limite prestabilito"
                                : "non disponibili"}
                            </p>

                            <p>
                              Visibilità:{" "}
                              {orario.visibile_pubblico
                                ? "pubblica"
                                : "riservata"}
                            </p>
                          </div>
                        </div>

                        <div className="azioni-orario">
                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() =>
                              modificaOrario(orario)
                            }
                          >
                            Modifica
                          </button>

                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() =>
                              cambiaStatoOrario(orario)
                            }
                          >
                            {orario.attivo
                              ? "Disattiva"
                              : "Riattiva"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )
          )
        )}
      </section>
    </div>
  );
}
