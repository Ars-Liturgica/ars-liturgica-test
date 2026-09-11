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
  nome_periodo: "",
  giorni_settimana: [],
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
  accetta_intenzioni: true,
  numero_massimo_intenzioni: "",
  consenti_offerte: false,
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
  const [gruppoInModifica, setGruppoInModifica] = useState(null);

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

  const programmazioni = useMemo(() => {
    const gruppi = new Map();

    orari.forEach((orario) => {
      const chiave = orario.gruppo_orario_id || orario.id;

      if (!gruppi.has(chiave)) {
        gruppi.set(chiave, {
          gruppo_orario_id: chiave,
          righe: [],
        });
      }

      gruppi.get(chiave).righe.push(orario);
    });

    return Array.from(gruppi.values())
      .map((gruppo) => {
        const righe = [...gruppo.righe].sort(
          (a, b) => Number(a.giorno_settimana) - Number(b.giorno_settimana)
        );
        const riferimento = righe[0];

        return {
          ...riferimento,
          gruppo_orario_id: gruppo.gruppo_orario_id,
          righe,
          giorni_settimana: righe.map((riga) =>
            Number(riga.giorno_settimana)
          ),
          attivo: righe.every((riga) => riga.attivo),
        };
      })
      .sort((a, b) => {
        const primoGiornoA = Math.min(...a.giorni_settimana);
        const primoGiornoB = Math.min(...b.giorni_settimana);

        if (primoGiornoA !== primoGiornoB) {
          return primoGiornoA - primoGiornoB;
        }

        return String(a.ora).localeCompare(String(b.ora));
      });
  }, [orari]);

  const orariRaggruppati = useMemo(() => {
    return tipologieMessa.map((tipologia) => ({
      ...tipologia,
      orari: programmazioni.filter(
        (programmazione) => programmazione.tipologia === tipologia.valore
      ),
    }));
  }, [programmazioni]);

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

  function descrizioneGiorni(giorni) {
    const giorniOrdinati = [...new Set(giorni.map(Number))].sort(
      (a, b) => a - b
    );

    if (
      giorniOrdinati.length === 7 &&
      giorniOrdinati.every((giorno, indice) => giorno === indice + 1)
    ) {
      return "Tutti i giorni";
    }

    if (
      giorniOrdinati.length === 6 &&
      giorniOrdinati.every((giorno, indice) => giorno === indice + 1)
    ) {
      return "Lunedì–Sabato";
    }

    const sonoConsecutivi = giorniOrdinati.every(
      (giorno, indice) =>
        indice === 0 || giorno === giorniOrdinati[indice - 1] + 1
    );

    if (giorniOrdinati.length >= 3 && sonoConsecutivi) {
      return `${nomeGiorno(giorniOrdinati[0])}–${nomeGiorno(
        giorniOrdinati[giorniOrdinati.length - 1]
      )}`;
    }

    return giorniOrdinati.map(nomeGiorno).join(", ");
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
    setGruppoInModifica(null);
    setFormOrario(orarioIniziale);
    setMostraFormOrario(true);
  }

  function annullaForm() {
    pulisciMessaggi();
    setMostraFormOrario(false);
    setGruppoInModifica(null);
    setFormOrario(orarioIniziale);
  }

  function selezionaGiorno(numeroGiorno) {
    setFormOrario((formAttuale) => {
      const giaSelezionato = formAttuale.giorni_settimana.includes(
        numeroGiorno
      );

      const nuoviGiorni = giaSelezionato
        ? formAttuale.giorni_settimana.filter(
            (giorno) => giorno !== numeroGiorno
          )
        : [...formAttuale.giorni_settimana, numeroGiorno];

      return {
        ...formAttuale,
        giorni_settimana: nuoviGiorni.sort((a, b) => a - b),
      };
    });
  }

  function selezionaGiorniRapidi(giorni) {
    setFormOrario((formAttuale) => ({
      ...formAttuale,
      giorni_settimana: [...giorni],
    }));
  }

  function modificaOrario(programmazione) {
    pulisciMessaggi();

    const riferimento = programmazione.righe[0];
    const usaLuogoDiverso = !riferimento.luogo?.predefinito;

    setGruppoInModifica(programmazione.gruppo_orario_id);
    setFormOrario({
      nome_periodo: riferimento.nome_periodo || "Orario abituale",
      giorni_settimana: [...programmazione.giorni_settimana].sort(
        (a, b) => a - b
      ),
      ora: formattaOra(riferimento.ora),
      tipologia: riferimento.tipologia,
      celebrante_nome: riferimento.celebrante_nome || "",
      valido_dal: riferimento.valido_dal || "",
      valido_al: riferimento.valido_al || "",
      luogo_diverso: usaLuogoDiverso,
      nome_luogo_altro: usaLuogoDiverso
        ? riferimento.luogo?.nome || ""
        : "",
      tipo_luogo_altro: usaLuogoDiverso
        ? riferimento.luogo?.tipo || "altro"
        : "cappella",
      indirizzo_luogo_altro: usaLuogoDiverso
        ? riferimento.luogo?.indirizzo || ""
        : "",
      note_pubbliche: riferimento.note_pubbliche || "",
      accetta_intenzioni: riferimento.accetta_intenzioni !== false,
      numero_massimo_intenzioni:
        riferimento.numero_massimo_intenzioni ?? "",
      consenti_offerte: Boolean(riferimento.consenti_offerte),
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
          indirizzo: formOrario.indirizzo_luogo_altro.trim() || null,
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
        indirizzo: formOrario.indirizzo_luogo_altro.trim() || null,
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

    if (!formOrario.nome_periodo.trim()) {
      setErrore("Inserisci il nome del periodo.");
      return;
    }

    if (formOrario.giorni_settimana.length === 0) {
      setErrore("Seleziona almeno un giorno della settimana.");
      return;
    }

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

    const numeroMassimoIntenzioni =
      formOrario.numero_massimo_intenzioni === ""
        ? null
        : Number(formOrario.numero_massimo_intenzioni);

    if (
      formOrario.accetta_intenzioni &&
      numeroMassimoIntenzioni !== null &&
      (!Number.isInteger(numeroMassimoIntenzioni) ||
        numeroMassimoIntenzioni < 1)
    ) {
      setErrore(
        "Il numero massimo di intenzioni deve essere un numero intero maggiore di zero."
      );
      return;
    }

    setSalvataggio(true);

    try {
      const luogoId = formOrario.luogo_diverso
        ? await trovaOCreaLuogoAlternativo()
        : luogoPredefinito.id;

      const eraModifica = Boolean(gruppoInModifica);

      const { error: erroreSalvataggio } = await supabase.rpc(
        "ars_salva_programmazione_messe_completa",
        {
          p_parrocchia_id: parrocchiaId,
          p_gruppo_orario_id: gruppoInModifica || null,
          p_luogo_id: luogoId,
          p_nome_periodo: formOrario.nome_periodo.trim(),
          p_giorni: formOrario.giorni_settimana.map(Number),
          p_ora: formOrario.ora,
          p_tipologia: formOrario.tipologia,
          p_celebrante_nome:
            formOrario.celebrante_nome.trim() || null,
          p_valido_dal: formOrario.valido_dal,
          p_valido_al: formOrario.valido_al,
          p_note_pubbliche:
            formOrario.note_pubbliche.trim() || null,
          p_visibile_pubblico: true,
          p_accetta_intenzioni: formOrario.accetta_intenzioni,
          p_numero_massimo_intenzioni: formOrario.accetta_intenzioni
            ? numeroMassimoIntenzioni
            : null,
          p_consenti_offerte:
            formOrario.accetta_intenzioni &&
            formOrario.consenti_offerte,
        }
      );

      if (erroreSalvataggio) throw erroreSalvataggio;

      setMessaggio(
        eraModifica
          ? "Programmazione, calendario e notifica aggiornati correttamente."
          : "Programmazione aggiunta al calendario e notifica pubblicata."
      );

      setMostraFormOrario(false);
      setGruppoInModifica(null);
      setFormOrario(orarioIniziale);
      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message || "Non è stato possibile salvare la programmazione."
      );
      await caricaDati();
    } finally {
      setSalvataggio(false);
    }
  }

  async function eliminaOrario(programmazione) {
    pulisciMessaggi();

    const conferma = window.confirm(
      `Vuoi eliminare l’intera programmazione “${
        programmazione.nome_periodo || "Orario abituale"
      }” (${descrizioneGiorni(programmazione.giorni_settimana)} alle ${formattaOra(
        programmazione.ora
      )})?`
    );

    if (!conferma) return;

    try {
      const { error } = await supabase.rpc(
        "ars_elimina_programmazione_messe_completa",
        {
          p_parrocchia_id: parrocchiaId,
          p_gruppo_orario_id: programmazione.gruppo_orario_id,
        }
      );

      if (error) throw error;

      setMessaggio(
        "Programmazione eliminata, calendario aggiornato e notifica pubblicata."
      );
      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message || "Non è stato possibile eliminare la programmazione."
      );
    }
  }

  async function riattivaOrario(programmazione) {
    pulisciMessaggi();

    try {
      const { error } = await supabase.rpc(
        "ars_salva_programmazione_messe_completa",
        {
          p_parrocchia_id: parrocchiaId,
          p_gruppo_orario_id: programmazione.gruppo_orario_id,
          p_luogo_id: programmazione.luogo_id,
          p_nome_periodo:
            programmazione.nome_periodo || "Orario abituale",
          p_giorni: programmazione.giorni_settimana.map(Number),
          p_ora: formattaOra(programmazione.ora),
          p_tipologia: programmazione.tipologia,
          p_celebrante_nome: programmazione.celebrante_nome || null,
          p_valido_dal: programmazione.valido_dal,
          p_valido_al: programmazione.valido_al,
          p_note_pubbliche: programmazione.note_pubbliche || null,
          p_visibile_pubblico:
            programmazione.visibile_pubblico !== false,
          p_accetta_intenzioni:
            programmazione.accetta_intenzioni !== false,
          p_numero_massimo_intenzioni:
            programmazione.accetta_intenzioni !== false
              ? programmazione.numero_massimo_intenzioni ?? null
              : null,
          p_consenti_offerte:
            programmazione.accetta_intenzioni !== false &&
            Boolean(programmazione.consenti_offerte),
        }
      );

      if (error) throw error;

      setMessaggio(
        "Programmazione riattivata, calendario aggiornato e notifica pubblicata."
      );
      await caricaDati();
    } catch (err) {
      console.error(err);
      setErrore(
        err?.message || "Non è stato possibile riattivare la programmazione."
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
      {messaggio && <div className="messaggio-successo">{messaggio}</div>}

      {mostraFormOrario && (
        <form className="pannello-form" onSubmit={salvaOrario}>
          <h3>
            {gruppoInModifica ? "Modifica programmazione" : "Nuovo orario"}
          </h3>

          <div className="griglia-form">
            <label className="campo-form campo-form-largo">
              <span>Nome del periodo *</span>
              <input
                type="text"
                value={formOrario.nome_periodo}
                onChange={(event) =>
                  setFormOrario({
                    ...formOrario,
                    nome_periodo: event.target.value,
                  })
                }
                placeholder="Es. Periodo invernale"
              />
            </label>

            <div className="campo-form campo-form-largo">
              <span>Giorni della settimana *</span>

              <div className="azioni-form">
                <button
                  type="button"
                  className="pulsante-azione-secondaria"
                  onClick={() => selezionaGiorniRapidi([1, 2, 3, 4, 5, 6])}
                >
                  Lunedì–Sabato
                </button>

                <button
                  type="button"
                  className="pulsante-azione-secondaria"
                  onClick={() =>
                    selezionaGiorniRapidi([1, 2, 3, 4, 5, 6, 7])
                  }
                >
                  Tutti i giorni
                </button>

                <button
                  type="button"
                  className="pulsante-azione-secondaria"
                  onClick={() => selezionaGiorniRapidi([])}
                >
                  Deseleziona
                </button>
              </div>

              <div className="opzioni-form">
                {giorniSettimana.map((giorno) => (
                  <label className="campo-checkbox" key={giorno.valore}>
                    <input
                      type="checkbox"
                      checked={formOrario.giorni_settimana.includes(
                        giorno.valore
                      )}
                      onChange={() => selezionaGiorno(giorno.valore)}
                    />
                    <span>{giorno.etichetta}</span>
                  </label>
                ))}
              </div>
            </div>

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
              <span>Intenzioni per questa Messa</span>

              <div className="opzioni-form">
                <label className="campo-checkbox">
                  <input
                    type="checkbox"
                    checked={formOrario.accetta_intenzioni}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        accetta_intenzioni: event.target.checked,
                        numero_massimo_intenzioni: event.target.checked
                          ? formOrario.numero_massimo_intenzioni
                          : "",
                        consenti_offerte: event.target.checked
                          ? formOrario.consenti_offerte
                          : false,
                      })
                    }
                  />
                  <span>Questa Messa accetta intenzioni</span>
                </label>
              </div>
            </div>

            {formOrario.accetta_intenzioni && (
              <>
                <label className="campo-form">
                  <span>Numero massimo di intenzioni</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formOrario.numero_massimo_intenzioni}
                    onChange={(event) =>
                      setFormOrario({
                        ...formOrario,
                        numero_massimo_intenzioni: event.target.value,
                      })
                    }
                    placeholder="Illimitato"
                  />
                  <small>Lascia vuoto per non impostare alcun limite.</small>
                </label>

                <div className="campo-form">
                  <span>Offerte collegate</span>

                  <label className="campo-checkbox">
                    <input
                      type="checkbox"
                      checked={formOrario.consenti_offerte}
                      onChange={(event) =>
                        setFormOrario({
                          ...formOrario,
                          consenti_offerte: event.target.checked,
                        })
                      }
                    />
                    <span>Consenti offerte per le intenzioni</span>
                  </label>
                </div>
              </>
            )}

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
                : gruppoInModifica
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
        ) : programmazioni.length === 0 ? (
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
                    {gruppo.orari.map((programmazione) => (
                      <article
                        className={`riga-orario ${
                          !programmazione.attivo ? "elemento-disattivato" : ""
                        }`}
                        key={programmazione.gruppo_orario_id}
                      >
                        <div className="orario-principale">
                          <span className="orario-ora">
                            {formattaOra(programmazione.ora)}
                          </span>

                          <div className="orario-dettagli">
                            <strong>
                              {descrizioneGiorni(
                                programmazione.giorni_settimana
                              )}
                            </strong>

                            <p>
                              Periodo: {programmazione.nome_periodo || "Orario abituale"}
                            </p>
                            <p>
                              {programmazione.luogo?.nome ||
                                "Luogo non disponibile"}
                            </p>
                            <p>{descrizionePeriodo(programmazione)}</p>

                            {programmazione.celebrante_nome && (
                              <p>
                                Celebrante: {programmazione.celebrante_nome}
                              </p>
                            )}

                            {programmazione.note_pubbliche && (
                              <p>{programmazione.note_pubbliche}</p>
                            )}

                            <p>
                              Intenzioni:{" "}
                              {programmazione.accetta_intenzioni !== false
                                ? programmazione.numero_massimo_intenzioni ==
                                  null
                                  ? "Illimitate"
                                  : `massimo ${programmazione.numero_massimo_intenzioni}`
                                : "Non accettate"}
                            </p>

                            {programmazione.accetta_intenzioni !== false &&
                              programmazione.consenti_offerte && (
                                <p>Offerte collegate: consentite</p>
                              )}
                          </div>
                        </div>

                        <div className="azioni-orario">
                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() => modificaOrario(programmazione)}
                          >
                            Modifica
                          </button>

                          {!programmazione.attivo && (
                            <button
                              type="button"
                              className="pulsante-azione-secondaria"
                              onClick={() => riattivaOrario(programmazione)}
                            >
                              Riattiva
                            </button>
                          )}

                          <button
                            type="button"
                            className="pulsante-azione-secondaria"
                            onClick={() => eliminaOrario(programmazione)}
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
