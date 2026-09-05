import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./CalendariParroco.css";
export default function CalendariParroco({
  parrocchiaId,
  tornaDashboard,
}) {
  const [eventi, setEventi] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [dataCorrente, setDataCorrente] = useState(new Date());
  const [giornoSelezionato, setGiornoSelezionato] = useState(new Date());
  const [filtroCategoria, setFiltroCategoria] = useState("tutto");
  const [mostraNuovoEvento, setMostraNuovoEvento] = useState(false);
const [nuovoEvento, setNuovoEvento] = useState({
  titolo: "",
  descrizione: "",
  data: "",
  ora: "",
  luogo: "",
  origine: "calendario",
  visibilita: "privato",
  pubblicaInBacheca: false,
});
  useEffect(() => {
    async function caricaEventi() {
      if (!parrocchiaId) {
        setCaricamento(false);
        return;
      }

      setCaricamento(true);
      setErrore("");

      const inizioMese = new Date(
        dataCorrente.getFullYear(),
        dataCorrente.getMonth(),
        1
      );

      const fineMese = new Date(
        dataCorrente.getFullYear(),
        dataCorrente.getMonth() + 1,
        1
      );

      const { data, error } = await supabase
        .from("eventi_calendario")
        .select("*")
        .eq("parrocchia_id", parrocchiaId)
        .gte("data_ora_inizio", inizioMese.toISOString())
        .lt("data_ora_inizio", fineMese.toISOString())
        .order("data_ora_inizio", { ascending: true });

      if (error) {
        setErrore(error.message);
        setEventi([]);
      } else {
        setEventi(data || []);
      }

      setCaricamento(false);
    }

    caricaEventi();
  }, [parrocchiaId, dataCorrente]);

  const nomeMese = useMemo(() => {
    return new Intl.DateTimeFormat("it-IT", {
      month: "long",
      year: "numeric",
    }).format(dataCorrente);
  }, [dataCorrente]);

  const giorniCalendario = useMemo(() => {
    const anno = dataCorrente.getFullYear();
    const mese = dataCorrente.getMonth();

    const primoGiornoMese = new Date(anno, mese, 1);
    const ultimoGiornoMese = new Date(anno, mese + 1, 0);

    let giornoSettimana = primoGiornoMese.getDay();
    if (giornoSettimana === 0) giornoSettimana = 7;

    const giorniPrima = giornoSettimana - 1;

    const giorni = [];

    for (let i = giorniPrima; i > 0; i--) {
      giorni.push(new Date(anno, mese, 1 - i));
    }

    for (let giorno = 1; giorno <= ultimoGiornoMese.getDate(); giorno++) {
      giorni.push(new Date(anno, mese, giorno));
    }

    while (giorni.length % 7 !== 0) {
      const ultimo = giorni[giorni.length - 1];
      giorni.push(
        new Date(
          ultimo.getFullYear(),
          ultimo.getMonth(),
          ultimo.getDate() + 1
        )
      );
    }

    return giorni;
  }, [dataCorrente]);

  function categoriaEvento(evento) {
    const origine = (evento.origine || "").toLowerCase();

    if (
      origine.includes("celebrazione") ||
      origine.includes("messa") ||
      origine.includes("liturgia")
    ) {
      return "celebrazioni";
    }

    if (
      origine.includes("battesimo") ||
      origine.includes("matrimonio") ||
      origine.includes("cresima") ||
      origine.includes("sacramento")
    ) {
      return "sacramenti";
    }

    if (origine.includes("catechismo")) {
      return "catechismo";
    }

    if (
      origine.includes("gruppo") ||
      origine.includes("coro") ||
      origine.includes("grest") ||
      origine.includes("attivita")
    ) {
      return "attivita";
    }

    return "altro";
  }

  const eventiFiltrati = useMemo(() => {
    if (filtroCategoria === "tutto") return eventi;

    return eventi.filter(
      (evento) => categoriaEvento(evento) === filtroCategoria
    );
  }, [eventi, filtroCategoria]);

  function stessoGiorno(data1, data2) {
    return (
      data1.getFullYear() === data2.getFullYear() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getDate() === data2.getDate()
    );
  }

  function eventiDelGiorno(giorno) {
    return eventiFiltrati.filter((evento) =>
      stessoGiorno(new Date(evento.data_ora_inizio), giorno)
    );
  }

  const eventiGiornoSelezionato = eventiDelGiorno(giornoSelezionato);

  function mesePrecedente() {
    const nuovaData = new Date(
      dataCorrente.getFullYear(),
      dataCorrente.getMonth() - 1,
      1
    );

    setDataCorrente(nuovaData);
    setGiornoSelezionato(nuovaData);
  }

  function meseSuccessivo() {
    const nuovaData = new Date(
      dataCorrente.getFullYear(),
      dataCorrente.getMonth() + 1,
      1
    );

    setDataCorrente(nuovaData);
    setGiornoSelezionato(nuovaData);
  }

  function vaiAOggi() {
    const oggi = new Date();
    setDataCorrente(oggi);
    setGiornoSelezionato(oggi);
  }

  function formattaOra(data) {
    return new Date(data).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formattaGiornoCompleto(data) {
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(data);
  }
function aggiornaNuovoEvento(campo, valore) {
  setNuovoEvento((precedente) => ({
    ...precedente,
    [campo]: valore,
  }));
}
  function chiudiNuovoEvento() {
  setMostraNuovoEvento(false);
}
  async function salvaNuovoEvento() {
  if (!nuovoEvento.titolo || !nuovoEvento.data || !nuovoEvento.ora) {
    alert("Compila almeno Titolo, Data e Ora.");
    return;
  }

  const dataOraInizio = new Date(
    `${nuovoEvento.data}T${nuovoEvento.ora}`
  );

  const { data, error } = await supabase
    .from("eventi_calendario")
    .insert({
      parrocchia_id: parrocchiaId,
      titolo: nuovoEvento.titolo,
      descrizione: nuovoEvento.descrizione || null,
      data_ora_inizio: dataOraInizio.toISOString(),
      luogo: nuovoEvento.luogo || null,
      origine: nuovoEvento.origine,
      visibilita: nuovoEvento.visibilita,
      mostra_calendario_parroco: true,
    })
    .select()
    .single();

  if (error) {
    alert(`Errore nel salvataggio: ${error.message}`);
    return;
  }

  setEventi((precedenti) => [...precedenti, data]);

  setNuovoEvento({
    titolo: "",
    descrizione: "",
    data: "",
    ora: "",
    luogo: "",
    origine: "calendario",
    visibilita: "privato",
    pubblicaInBacheca: false,
  });

  setMostraNuovoEvento(false);
}
  return (
    <div className="calendari-parroco">
      <button
        type="button"
        onClick={tornaDashboard}
        className="pulsante-torna-dashboard"
      >
        ← Torna a Gestione Parrocchia
      </button>

      <div className="calendari-header">
        <div>
          <h1>Calendari</h1>
          <p>Agenda della parrocchia e dei sacerdoti.</p>
        </div>

       <button
  type="button"
  className="pulsante-nuovo-evento"
  onClick={() => setMostraNuovoEvento(true)}
>
          + Nuovo evento
        </button>
      </div>
{mostraNuovoEvento && (
  <div className="nuovo-evento-box">
    <div className="nuovo-evento-header">
      <h2>NUOVO EVENTO</h2>

      <button
        type="button"
        className="chiudi-nuovo-evento"
        onClick={chiudiNuovoEvento}
        aria-label="Chiudi"
      >
        ×
      </button>
    </div>

    <div className="nuovo-evento-form">
      <div className="campo-evento campo-titolo">
        <label htmlFor="evento-titolo">Titolo</label>
        <input
          id="evento-titolo"
          type="text"
          value={nuovoEvento.titolo}
          onChange={(e) =>
            aggiornaNuovoEvento("titolo", e.target.value)
          }
          placeholder="Titolo dell'evento"
        />
      </div>

      <div className="nuovo-evento-riga">
        <div className="campo-evento">
          <label htmlFor="evento-data">Data</label>
          <input
            id="evento-data"
            type="date"
            value={nuovoEvento.data}
            onChange={(e) =>
              aggiornaNuovoEvento("data", e.target.value)
            }
          />
        </div>

        <div className="campo-evento">
          <label htmlFor="evento-ora">Ora</label>
          <input
            id="evento-ora"
            type="time"
            value={nuovoEvento.ora}
            onChange={(e) =>
              aggiornaNuovoEvento("ora", e.target.value)
            }
          />
        </div>

        <div className="campo-evento campo-luogo">
          <label htmlFor="evento-luogo">Luogo</label>
          <input
            id="evento-luogo"
            type="text"
            value={nuovoEvento.luogo}
            onChange={(e) =>
              aggiornaNuovoEvento("luogo", e.target.value)
            }
            placeholder="Es. Chiesa parrocchiale"
          />
        </div>
      </div>

      <div className="nuovo-evento-riga due-colonne">
        <div className="campo-evento">
          <label htmlFor="evento-origine">Categoria</label>
          <select
            id="evento-origine"
            value={nuovoEvento.origine}
            onChange={(e) =>
              aggiornaNuovoEvento("origine", e.target.value)
            }
          >
            <option value="calendario">Altro evento</option>
            <option value="celebrazione">Celebrazione</option>
            <option value="sacramento">Sacramento</option>
            <option value="catechismo">Catechismo</option>
            <option value="attivita">Attività e gruppi</option>
          </select>
        </div>

      <div className="campo-evento">
  <label htmlFor="evento-visibilita">Visibilità</label>

  <select
    id="evento-visibilita"
    value={nuovoEvento.visibilita}
    onChange={(e) => {
      const nuovaVisibilita = e.target.value;

      setNuovoEvento((precedente) => ({
        ...precedente,
        visibilita: nuovaVisibilita,
        pubblicaInBacheca:
          nuovaVisibilita === "pubblico"
            ? precedente.pubblicaInBacheca
            : false,
      }));
    }}
  >
    <option value="privato">Privato</option>
    <option value="riservato">Riservato</option>
    <option value="pubblico">Pubblico</option>
  </select>

  {nuovoEvento.visibilita === "privato" && (
    <small className="info-visibilita">
      Visibile solo al parroco e agli eventuali delegati
      autorizzati al suo calendario. Non è visibile alla
      comunità e non può essere pubblicato in Bacheca.
    </small>
  )}

 {nuovoEvento.visibilita === "riservato" && (
  <small className="info-visibilita">
    Visibile esclusivamente ai gruppi della parrocchia
    selezionati dal parroco. L'evento sarà disponibile nei
    calendari dei gruppi selezionati e non sarà visibile
    all'intera comunità né pubblicato nella Bacheca pubblica.
  </small>
)}
 {nuovoEvento.visibilita === "pubblico" && (
  <small className="info-visibilita">
    Visibile a tutta la comunità nel calendario pubblico
    della parrocchia. Se selezioni "Pubblica anche in Bacheca",
    l'evento verrà pubblicato anche nella Bacheca della stessa
    parrocchia.
  </small>
)}
      </div>
{nuovoEvento.visibilita === "pubblico" && (
  <div className="campo-pubblica-bacheca">
    <label>
      <input
        type="checkbox"
        checked={nuovoEvento.pubblicaInBacheca}
        onChange={(e) =>
          aggiornaNuovoEvento(
            "pubblicaInBacheca",
            e.target.checked
          )
        }
      />
      <span>Pubblica anche in Bacheca</span>
    </label>

    <small>
      L'avviso sarà pubblicato nella Bacheca della stessa
      parrocchia a cui appartiene questo evento.
    </small>
  </div>
)}
      <div className="campo-evento campo-descrizione">
        <label htmlFor="evento-descrizione">Descrizione</label>
        <textarea
          id="evento-descrizione"
          value={nuovoEvento.descrizione}
          onChange={(e) =>
            aggiornaNuovoEvento("descrizione", e.target.value)
          }
          placeholder="Note o informazioni sull'evento"
          rows="4"
        />
      </div>

      <div className="nuovo-evento-azioni">
        <button
          type="button"
          className="pulsante-annulla-evento"
          onClick={chiudiNuovoEvento}
        >
          Annulla
        </button>

        <button
          type="button"
          className="pulsante-salva-evento"
          onClick={salvaNuovoEvento}
        >
          Salva evento
        </button>
      </div>
    </div>
  </div>
)}
      <div className="calendari-toolbar">
        <button type="button" onClick={mesePrecedente}>
          ‹
        </button>

        <h2>{nomeMese}</h2>

        <button type="button" onClick={meseSuccessivo}>
          ›
        </button>

        <button type="button" onClick={vaiAOggi}>
          Oggi
        </button>

        <div className="calendari-viste">
          <button type="button" className="attivo">
            Mese
          </button>
          <button type="button">Settimana</button>
          <button type="button">Agenda</button>
        </div>
      </div>

      <div className="calendari-filtri">
        <span>Filtra per categoria:</span>

        <button
          type="button"
          className={filtroCategoria === "tutto" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("tutto")}
        >
          Tutto
        </button>

        <button
          type="button"
          className={filtroCategoria === "celebrazioni" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("celebrazioni")}
        >
          Celebrazioni
        </button>

        <button
          type="button"
          className={filtroCategoria === "sacramenti" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("sacramenti")}
        >
          Sacramenti
        </button>

        <button
          type="button"
          className={filtroCategoria === "catechismo" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("catechismo")}
        >
          Catechismo
        </button>

        <button
          type="button"
          className={filtroCategoria === "attivita" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("attivita")}
        >
          Attività e gruppi
        </button>

        <button
          type="button"
          className={filtroCategoria === "altro" ? "attivo" : ""}
          onClick={() => setFiltroCategoria("altro")}
        >
          Altri eventi
        </button>
      </div>

      {caricamento && <p>Caricamento calendario...</p>}

      {errore && (
        <p className="errore-calendario">
          Errore nel caricamento: {errore}
        </p>
      )}

      {!caricamento && !errore && (
        <div className="calendario-contenitore">
          <div className="calendario-mese">
            <div className="calendario-settimana-titoli">
              <div>LUN</div>
              <div>MAR</div>
              <div>MER</div>
              <div>GIO</div>
              <div>VEN</div>
              <div>SAB</div>
              <div>DOM</div>
            </div>

            <div className="calendario-griglia">
              {giorniCalendario.map((giorno) => {
                const eventiGiorno = eventiDelGiorno(giorno);

                const fuoriMese =
                  giorno.getMonth() !== dataCorrente.getMonth();

                const selezionato = stessoGiorno(
                  giorno,
                  giornoSelezionato
                );

                return (
                  <button
                    type="button"
                    key={giorno.toISOString()}
                    className={`calendario-giorno ${
                      fuoriMese ? "fuori-mese" : ""
                    } ${selezionato ? "selezionato" : ""}`}
                    onClick={() => setGiornoSelezionato(giorno)}
                  >
                    <span className="numero-giorno">
                      {giorno.getDate()}
                    </span>

                    <div className="eventi-giorno">
                      {eventiGiorno.slice(0, 4).map((evento) => (
                        <div
                          key={evento.id}
                          className={`evento-calendario categoria-${categoriaEvento(
                            evento
                          )}`}
                        >
                          <span>
                            {formattaOra(evento.data_ora_inizio)}
                          </span>

                          <strong>{evento.titolo}</strong>
                        </div>
                      ))}

                      {eventiGiorno.length > 4 && (
                        <div className="altri-eventi">
                          + {eventiGiorno.length - 4} altri
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="calendario-dettaglio">
            <h3>
              {formattaGiornoCompleto(giornoSelezionato)}
            </h3>

            {eventiGiornoSelezionato.length === 0 ? (
              <p>Nessun evento previsto per questo giorno.</p>
            ) : (
              eventiGiornoSelezionato.map((evento) => (
                <div key={evento.id} className="dettaglio-evento">
                  <div className="dettaglio-orario">
                    {formattaOra(evento.data_ora_inizio)}
                  </div>

                  <div>
                    <strong>{evento.titolo}</strong>

                    {evento.luogo && <p>{evento.luogo}</p>}

                    {evento.descrizione && (
                      <p>{evento.descrizione}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
