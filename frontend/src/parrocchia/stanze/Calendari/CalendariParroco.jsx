import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

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

        <button type="button" className="pulsante-nuovo-evento">
          + Nuovo evento
        </button>
      </div>

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
