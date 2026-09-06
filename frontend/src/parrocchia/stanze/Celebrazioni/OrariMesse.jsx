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

const orarioIniziale = {
  giorno_settimana: "1",
  ora: "",
  tipologia: "feriale",
  celebrante_nome: "",
  valido_dal: "",
  valido_al: "",
  luogo_diverso: false,
  nome_luogo_altro: "",
  tipo_luogo_altro: "cappella",
  indirizzo_luogo_altro: "",
  note_pubbliche: "",
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
  const [mostraFormOrario, setMostraFormOrario] = useState(false);
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
          .order("predefinito", { ascending: false })
          .order("nome", { ascending: true }),

        supabase
          .from("orari_messe")
          .select(
            `
              *,
              luogo:luoghi_celebrazione (*)
            `
          )
          .eq("parrocchia_id", parrocchiaId)
          .order("giorno_settimana", { ascending: true })
          .order("ora", { ascending: true }),
      ]);

      if (risultatoLuoghi.error) throw risultatoLuoghi.error;
      if (risultatoOrari.error) throw risultatoOrari.error;

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

  const luogoPredefinito = useMemo(
    () =>
      luoghi.find((luogo) => luogo.predefinito) ||
      luoghi.find((luogo) => luogo.attivo) ||
      null,
    [luoghi]
  );

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
    return `Dal ${formattaData(orario.valido_dal)} al ${formattaData(
      orario.valido_al
    )}`;
  }

  function apriNuovoOrario() {
    pulisciMessaggi();
    setOrarioInModifica(null);
    setFormOrario(orarioIniziale);
    setMostraFormOrario(true);
  }

  function annullaForm() {
    pulisciMessaggi();
    setMostraFormOrario(false);
    setOrarioInModifica(null);
    setFormOrario(orarioIniziale);
  }

  function modificaOrario(orario) {
    pulisciMessaggi();

    const usaLuogoDiverso = !orario.luogo?.predefinito;

    setOrarioInModifica(orario.id);
    setFormOrario({
      giorno_settimana: String(orario.giorno_settimana),
      ora: formattaOra(orario.ora),
      tipologia: orario.tipologia,
      celebrante_nome: orario.celebrante_nome || "",
      valido_dal: orario.valido_dal || "",
      valido_al: orario.valido_al || "",
      luogo_diverso: usaLuogoDiverso,
      nome_luogo_altro: usaLuogoDiverso
        ? orario.luogo?.nome || ""
        : "",
      tipo_luogo_altro: usaLuogoDiverso
        ? orario.luogo?.tipo || "altro"
        : "cappella",
      indirizzo_luogo_altro: usaLuogoDiverso
        ? orario.luogo?.indirizzo || ""
        : "",
      note_pubbliche: orario.note_pubbliche || "",
    });

    setMostraFormOrario(true);
  }

  async function trovaOCreaLuogoAlternativo() {
    const nomeLuogo = formOrario.nome_luogo_altro.trim();

    const { data: luoghiEsistenti, error: erroreRicerca } = await supabase
      .from("luoghi_celebrazione")
      .select("id, attivo")
      .eq("parrocchia_id", parrocchiaId)
      .ilike("nome", nomeLuogo)
      .limit(1);

    if (erroreRicerca) throw erroreRicerca;

    if (luoghiEsistenti?.length) {
      const luogoEsistente = luoghiEsistenti[0];

      const { error: erroreAggiornamentoLuogo } = await supabase
        .from("luoghi_celebrazione")
        .update({
          attivo: true,
          tipo: formOrario.tipo_luogo_altro,
          indirizzo:
            formOrario.indirizzo_luogo_altro.trim() || null,
        })
        .eq("id", luogoEsistente.id)
        .eq("parrocchia_id", parrocchiaId);

      if (erroreAggiornamentoLuogo) throw erroreAggiornamentoLuogo;

      return luogoEsistente.id;
    }

    const { data: nuovoLuogo, error: erroreInserimento } = await supabase
      .from("luoghi_celebrazione")
      .insert({
        parrocchia_id: parrocchiaId,
        nome: nomeLuogo,
        tipo: formOrario.tipo_luogo_altro,
        indirizzo:
          formOrario.indirizzo_luogo_altro.trim() || null,
        predefinito: false,
        attivo: true,
      })
      .select("id")
      .single();

    if (erroreInserimento) throw erroreInserimento;

    return nuovoLuogo.id;
  }

  async function salvaOrario(event) {
    event.preventDefault();
    pulisciMessaggi();

    if (!formOrario.ora) {
      setErrore("Inserisci l’orario della Messa.");
      return;
    }

    if (!formOrario.valido_dal || !formOrario.valido_al) {
      setErrore("Inserisci la data iniziale e la data finale.");
      return;
    }

    if (formOrario.valido_al < formOrario.valido_dal) {
      setErrore("La data finale non può precedere la data iniziale.");
      return;
    }

    if (
      formOrario.luogo_diverso &&
      !formOrario.nome_luogo_altro.trim()
    ) {
      setErrore("Inserisci il nome del luogo della celebrazione.");
      return;
    }

    if (!formOrario.luogo_diverso && !luogoPredefinito) {
      setErrore("Il luogo principale della parrocchia non è disponibile.");
      return;
    }

    setSalvataggio(true);

    try {
      const luogoId = formOrario.luogo_diverso
        ? await trovaOCreaLuogoAlternativo()
        : luogoPredefinito.id;

      const datiOrario = {
        parrocchia_id: parrocchiaId,
        luogo_id: luogoId,
        giorno_settimana: Number(formOrario.giorno_settimana),
        ora: formOrario.ora,
        tipologia: formOrario.tipologia,
        celebrante_id: null,
        celebrante_nome: formOrario.celebrante_nome.trim() || null,
        valido_dal: formOrario.valido_dal,
        valido_al: formOrario.valido_al,
        note_pubbliche: formOrario.note_pubbliche.trim() || null,
        visibile_pubblico: true,
        attivo: true,
      };

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
          .insert(datiOrario);

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
        err?.message || "Non è stato possibile salvare l’orario."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  async function eliminaOrario(orario) {
    pulisciMessaggi();

    const conferma = window.confirm(
      `Vuoi eliminare l’orario di ${nomeGiorno(
        orario.giorno_settimana
      )} alle ${formattaOra(orario.ora)}?`
    );

    if (!conferma) return;

    try {
      const { error } = await supabase
        .from("orari_messe")
        .delete()
        .eq("id", orario.id)
        .eq("parrocchia_id", parrocchiaId);

      if (error) throw error;

      setMessaggio("Orario eliminato correttamente.");
      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        "L’orario non può essere eliminato perché è già collegato ad altre registrazioni."
      );
    }
  }

  async function riattivaOrario(orario) {
    pulisciMessaggi();

    try {
      const { error } = await supabase
        .from("orari_messe")
        .update({ attivo: true })
        .eq("id", orario.id)
        .eq("parrocchia_id", parrocchiaId);

      if (error) throw error;

      setMessaggio("Orario riattivato.");
      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message || "Non è stato possibile riattivare l’orario."
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
        Programma gli orari ordinari feriali, prefestivi e festivi della
        parrocchia.
      </p>

      <div className="orari-messe-toolbar">
        <button
          type="button"
          className="pulsante-azione-principale"
          onClick={apriNuovoOrario}
          disabled={!luogoPredefinito}
        >
          + Nuovo orario
        </button>
      </div>

      {errore && <div className="messaggio-errore">{errore}</div>}
      {messaggio && (
        <div className="messaggio-successo">{messaggio}</div>
      )}

      {mostraFormOrario && (
        <form className="pannello-form" onSubmit={salvaOrario}>
          <h3>{orarioInModifica ? "Modifica orario" : "Nuovo orario"}</h3>

          <div className="griglia-form">
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
                  <option key={giorno.valore} value={giorno.valore}>
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
                  setFormOrario({ ...formOrario, ora: event.target.value })
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
                  <option key={tipologia.valore} value={tipologia.valore}>
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
              <span>Valido dal *</span>
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
              <span>Valido fino al *</span>
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

            <div className="campo-form campo-form-largo">
              <span>Luogo della celebrazione</span>

              <div className="opzioni-form">
                <strong>
                  {luogoPredefinito?.nome || "Parrocchia non disponibile"}
                </strong>

                <label className="campo-checkbox">
                  <input
                    type="checkbox"
                    checked={formOrario.luogo_diverso}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        luogo_diverso: event.target.checked,
                        nome_luogo_altro: "",
                        indirizzo_luogo_altro: "",
                      })
                    }
                  />
                  <span>La Messa si svolge in un luogo diverso</span>
                </label>
              </div>
            </div>

            {formOrario.luogo_diverso && (
              <>
                <label className="campo-form">
                  <span>Nome del luogo *</span>
                  <input
                    type="text"
                    value={formOrario.nome_luogo_altro}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        nome_luogo_altro: event.target.value,
                      })
                    }
                    placeholder="Es. Cappella dell’ospedale"
                  />
                </label>

                <label className="campo-form">
                  <span>Tipo di luogo *</span>
                  <select
                    value={formOrario.tipo_luogo_altro}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        tipo_luogo_altro: event.target.value,
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
                  <span>Indirizzo del luogo</span>
                  <input
                    type="text"
                    value={formOrario.indirizzo_luogo_altro}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        indirizzo_luogo_altro: event.target.value,
                      })
                    }
                    placeholder="Facoltativo"
                  />
                </label>
              </>
            )}

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
                <div className="gruppo-orari" key={gruppo.valore}>
                  <h4>{gruppo.etichetta}</h4>

                  <div className="lista-orari">
                    {gruppo.orari.map((orario) => (
                      <article
                        className={`riga-orario ${
                          !orario.attivo ? "elemento-disattivato" : ""
                        }`}
                        key={orario.id}
                      >
                        <div className="orario-principale">
                          <span className="orario-ora">
                            {formattaOra(orario.ora)}
                          </span>

                          <div className="orario-dettagli">
                            <strong>
                              {nomeGiorno(orario.giorno_settimana)}
                            </strong>

                            <p>{orario.luogo?.nome || "Luogo non disponibile"}</p>
                            <p>{descrizionePeriodo(orario)}</p>

                            {orario.celebrante_nome && (
                              <p>Celebrante: {orario.celebrante_nome}</p>
                            )}

                            {orario.note_pubbliche && (
                              <p>{orario.note_pubbliche}</p>
                            )}
                          </div>
                        </div>

                        <div className="azioni-orario">
                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() => modificaOrario(orario)}
                          >
                            Modifica
                          </button>

                          {!orario.attivo && (
                            <button
                              type="button"
                              className="pulsante-azione-secondaria"
                              onClick={() => riattivaOrario(orario)}
                            >
                              Riattiva
                            </button>
                          )}

                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() => eliminaOrario(orario)}
                          >
                            Elimina
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
