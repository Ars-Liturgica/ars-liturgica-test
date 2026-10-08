import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./CalendariParroco.css";

export default function CalendariParroco({
  parrocchiaId,
  tornaDashboard,
}) {
  const [vista, setVista] = useState("mese");
  const [salvataggio, setSalvataggio] = useState(false);
  const salvataggioInCorso = useRef(false);
  const [aggiornamento, setAggiornamento] = useState(0);
  const [erroreSalvataggio, setErroreSalvataggio] = useState("");
  const [eventi, setEventi] = useState([]);
  const [intenzioni, setIntenzioni] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [erroreIntenzioni, setErroreIntenzioni] = useState("");
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
  const giorniCalendario = useMemo(() => {
    if (vista === "settimana") {
      const lunedi = new Date(dataCorrente.getFullYear(), dataCorrente.getMonth(), dataCorrente.getDate());
      lunedi.setDate(lunedi.getDate() - ((lunedi.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, i) => new Date(lunedi.getFullYear(), lunedi.getMonth(), lunedi.getDate() + i));
    }
    const primo = new Date(dataCorrente.getFullYear(), dataCorrente.getMonth(), 1);
    const ultimo = new Date(dataCorrente.getFullYear(), dataCorrente.getMonth() + 1, 0);
    const inizio = new Date(primo);
    inizio.setDate(1 - ((primo.getDay() + 6) % 7));
    const fine = new Date(ultimo);
    fine.setDate(ultimo.getDate() + (6 - ((ultimo.getDay() + 6) % 7)));
    const giorni = [];
    for (let d = new Date(inizio); d <= fine; d.setDate(d.getDate() + 1)) giorni.push(new Date(d));
    return giorni;
  }, [dataCorrente, vista]);

  const intervallo = useMemo(() => {
    const inizio = vista === "agenda"
      ? new Date(dataCorrente.getFullYear(), dataCorrente.getMonth(), 1)
      : giorniCalendario[0];
    const fine = vista === "agenda"
      ? new Date(dataCorrente.getFullYear(), dataCorrente.getMonth() + 1, 1)
      : new Date(giorniCalendario.at(-1).getFullYear(), giorniCalendario.at(-1).getMonth(), giorniCalendario.at(-1).getDate() + 1);
    return { inizio, fine };
  }, [dataCorrente, vista, giorniCalendario]);

  useEffect(() => {
    let attivo = true;
    async function caricaEventi() {
      if (!parrocchiaId) { setCaricamento(false); return; }
      setCaricamento(true);
      setErrore("");
      setErroreIntenzioni("");
      try {
        const { data: datiEventi, error: erroreEventi } = await supabase
          .from("eventi_calendario").select("*")
          .eq("parrocchia_id", parrocchiaId).neq("stato", "annullato")
          .eq("mostra_calendario_parroco", true)
          .lt("data_ora_inizio", intervallo.fine.toISOString())
          .or(`data_ora_inizio.gte.${intervallo.inizio.toISOString()},data_ora_fine.gt.${intervallo.inizio.toISOString()}`)
          .order("data_ora_inizio", { ascending: true });
        if (erroreEventi) throw erroreEventi;
        if (!attivo) return;
        setEventi(datiEventi || []);
        const ultimo = new Date(intervallo.fine);
        ultimo.setDate(ultimo.getDate() - 1);
        const { data: datiIntenzioni, error: erroreI } = await supabase.rpc("ars_elenco_intenzioni_parroco", {
          p_parrocchia_id: parrocchiaId,
          p_data_dal: dataDatabase(intervallo.inizio), p_data_al: dataDatabase(ultimo),
        });
        if (!attivo) return;
        setIntenzioni(erroreI ? [] : (datiIntenzioni || []));
        if (erroreI) setErroreIntenzioni("Le intenzioni non sono momentaneamente disponibili.");
      } catch (error) {
        if (attivo) { setErrore(error.message || "Calendario non disponibile"); setEventi([]); setIntenzioni([]); }
      } finally {
        if (attivo) setCaricamento(false);
      }
    }
    caricaEventi();
    return () => { attivo = false; };
  }, [parrocchiaId, intervallo, aggiornamento]);

  const nomeMese = useMemo(() => {
    return new Intl.DateTimeFormat("it-IT", {
      month: "long",
      year: "numeric",
    }).format(dataCorrente);
  }, [dataCorrente]);

  function categoriaEvento(evento) {
    const origine = (evento.origine || "").toLowerCase();

    if (
      origine === "orari_messe" ||
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
    const inizio = new Date(giorno.getFullYear(), giorno.getMonth(), giorno.getDate());
    const fine = new Date(giorno.getFullYear(), giorno.getMonth(), giorno.getDate() + 1);
    return eventiFiltrati.filter(evento => {
      const avvio = new Date(evento.data_ora_inizio);
      return avvio < fine && (avvio >= inizio || (evento.data_ora_fine && new Date(evento.data_ora_fine) > inizio));
    }).sort((a, b) => new Date(a.data_ora_inizio) - new Date(b.data_ora_inizio));
  }

  function intenzioniDellEvento(eventoId) {
    return intenzioni.filter(
      (intenzione) => intenzione.evento_id === eventoId
    );
  }

  function etichettaTipoIntenzione(tipo) {
    const etichette = {
      defunto: "Per un defunto",
      persona_vivente: "Per una persona vivente",
      ringraziamento: "In ringraziamento",
      altra: "Altra intenzione",
    };

    return etichette[tipo] || "Intenzione";
  }

  const eventiGiornoSelezionato = eventiDelGiorno(giornoSelezionato);

  function spostaPeriodo(direzione) {
    const nuovaData = vista === "settimana"
      ? new Date(dataCorrente.getFullYear(), dataCorrente.getMonth(), dataCorrente.getDate() + direzione * 7)
      : new Date(dataCorrente.getFullYear(), dataCorrente.getMonth() + direzione, 1);
    setDataCorrente(nuovaData);
    setGiornoSelezionato(nuovaData);
  }
  function mesePrecedente() { spostaPeriodo(-1); }
  function meseSuccessivo() { spostaPeriodo(1); }
  function cambiaVista(nuovaVista) {
    setDataCorrente(giornoSelezionato);
    setVista(nuovaVista);
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
    if (salvataggioInCorso.current) return;
    setErroreSalvataggio("");
    if (!nuovoEvento.titolo.trim() || !nuovoEvento.data || !nuovoEvento.ora) {
      setErroreSalvataggio("Compila almeno Titolo, Data e Ora."); return;
    }
    salvataggioInCorso.current = true;
    setSalvataggio(true);
    try {
      const { data, error } = await supabase.rpc("ars_salva_evento_calendario_parroco", {
        p_parrocchia_id: parrocchiaId, p_titolo: nuovoEvento.titolo.trim(),
        p_data: nuovoEvento.data, p_ora: nuovoEvento.ora,
        p_descrizione: nuovoEvento.descrizione || null, p_luogo: nuovoEvento.luogo || null,
        p_origine: nuovoEvento.origine, p_visibilita: nuovoEvento.visibilita,
      });
      if (error) throw error;
      if (!data?.id) throw new Error("Il salvataggio non ha restituito l’evento. Verifica il calendario prima di riprovare.");
      const giorno = new Date(nuovoEvento.data + "T12:00:00");
      setDataCorrente(giorno);
      setGiornoSelezionato(giorno);
      setFiltroCategoria("tutto");
      setAggiornamento(n => n + 1);
      setNuovoEvento({ titolo: "", descrizione: "", data: "", ora: "", luogo: "", origine: "calendario", visibilita: "privato", pubblicaInBacheca: false });
      setMostraNuovoEvento(false);
    } catch (error) {
      setErroreSalvataggio(error.message || "Salvataggio non riuscito. Verifica il calendario prima di riprovare.");
    } finally {
      salvataggioInCorso.current = false;
      setSalvataggio(false);
    }
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
  onClick={() => { setErroreSalvataggio(""); setMostraNuovoEvento(true); }}
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
        disabled={salvataggio}
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
      Visibile al parroco che lo ha creato. Non è visibile alla comunità.
    </small>
  )}

 {nuovoEvento.visibilita === "riservato" && (
  <small className="info-visibilita">
    L’evento resta visibile al creatore. La scelta dei gruppi autorizzati sarà attivata in un passaggio successivo.
  </small>
)}
 {nuovoEvento.visibilita === "pubblico" && (
  <small className="info-visibilita">
    Visibile a tutta la comunità nel calendario pubblico della parrocchia.
  </small>
)}
      </div>
            </div>
{nuovoEvento.visibilita === "pubblico" && <p className="avviso-intenzioni-calendario">La pubblicazione anche in Bacheca è ancora da attivare.</p>}
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

      {erroreSalvataggio && <p role="alert" className="errore-calendario">{erroreSalvataggio}</p>}
      <div className="nuovo-evento-azioni">
        <button
          type="button"
          className="pulsante-annulla-evento"
          onClick={chiudiNuovoEvento}
          disabled={salvataggio}
        >
          Annulla
        </button>

        <button
          type="button"
          className="pulsante-salva-evento"
          onClick={salvaNuovoEvento}
          disabled={salvataggio}
        >
          {salvataggio ? "Salvataggio…" : "Salva evento"}
        </button>
      </div>
    </div>
  </div>
)}
      <div className="calendari-toolbar">
        <button type="button" onClick={mesePrecedente}>
          ‹
        </button>

        <h2>{vista === "settimana" ? `${giorniCalendario[0].toLocaleDateString("it-IT")} – ${giorniCalendario.at(-1).toLocaleDateString("it-IT")}` : nomeMese}</h2>

        <button type="button" onClick={meseSuccessivo}>
          ›
        </button>

        <button type="button" onClick={vaiAOggi}>
          Oggi
        </button>

        <div className="calendari-viste">
          {[ ["mese", "Mese"], ["settimana", "Settimana"], ["agenda", "Agenda"] ].map(([id, etichetta]) =>
            <button key={id} type="button" className={vista === id ? "attivo" : ""}
              aria-pressed={vista === id} onClick={() => cambiaVista(id)}>{etichetta}</button>
          )}
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

      {erroreIntenzioni && !errore && (
        <p className="avviso-intenzioni-calendario">
          {erroreIntenzioni}
        </p>
      )}

      {!caricamento && !errore && (
        <div className="calendario-contenitore">
          <div className="calendario-mese">
            {vista === "agenda" ? <div className="calendario-agenda">
              <h3>Agenda di {nomeMese}</h3>
              {eventiFiltrati.length === 0 ? <p>Nessun evento per questo periodo e filtro.</p> :
                giorniCalendario.filter(giorno => giorno.getMonth() === dataCorrente.getMonth()).map(giorno => {
                  const appuntamenti = eventiDelGiorno(giorno);
                  if (!appuntamenti.length) return null;
                  return <section key={dataDatabase(giorno)}>
                    <h4>{formattaGiornoCompleto(giorno)}</h4>
                    {appuntamenti.map(evento => <button type="button" key={evento.id}
                      className={`agenda-evento categoria-${categoriaEvento(evento)}`}
                      onClick={() => setGiornoSelezionato(giorno)}>
                      <span>{evento.tutto_il_giorno ? "Tutto il giorno" : formattaOra(evento.data_ora_inizio)}</span>
                      <div><strong>{evento.titolo}</strong>{evento.luogo && <small>{evento.luogo}</small>}</div>
                      {intenzioniDellEvento(evento.id).length > 0 && <small>{intenzioniDellEvento(evento.id).length} intenzioni</small>}
                    </button>)}
                  </section>;
                })}
            </div> : <>
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
                    aria-label={formattaGiornoCompleto(giorno)}
                    aria-pressed={selezionato}
                    className={`calendario-giorno ${
                      fuoriMese ? "fuori-mese" : ""
                    } ${selezionato ? "selezionato" : ""}`}
                    onClick={() => setGiornoSelezionato(giorno)}
                  >
                    <span className="numero-giorno">
                      {vista === "settimana" ? giorno.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }) : giorno.getDate()}
                    </span>

                    <div className="eventi-giorno">
                      {eventiGiorno.slice(0, 4).map((evento) => {
                        const numeroIntenzioni =
                          intenzioniDellEvento(evento.id).length;

                        return (
                          <div
                            key={evento.id}
                            className={`evento-calendario categoria-${categoriaEvento(
                              evento
                            )}`}
                          >
                            <span>
                              {evento.tutto_il_giorno ? "Tutto il giorno" : formattaOra(evento.data_ora_inizio)}
                            </span>

                            <strong>{evento.titolo}</strong>

                            {numeroIntenzioni > 0 && (
                              <span
                                className="conteggio-intenzioni-calendario"
                                title={`${numeroIntenzioni} intenzion${
                                  numeroIntenzioni === 1 ? "e" : "i"
                                }`}
                              >
                                {numeroIntenzioni}
                              </span>
                            )}
                          </div>
                        );
                      })}

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
            </>}
          </div>

          <aside className="calendario-dettaglio">
            <h3>
              {formattaGiornoCompleto(giornoSelezionato)}
            </h3>

            {eventiGiornoSelezionato.length === 0 ? (
              <p>Nessun evento previsto per questo giorno.</p>
            ) : (
              eventiGiornoSelezionato.map((evento) => {
                const intenzioniEvento = intenzioniDellEvento(evento.id);

                return (
                  <div key={evento.id} className="dettaglio-evento">
                    <div className="dettaglio-orario">
                      {evento.tutto_il_giorno ? "Tutto il giorno" : formattaOra(evento.data_ora_inizio)}
                    </div>

                    <div className="contenuto-dettaglio-evento">
                      <strong>{evento.titolo}</strong>

                      {evento.luogo && <p>{evento.luogo}</p>}

                      {evento.descrizione && (
                        <p>{evento.descrizione}</p>
                      )}

                      {intenzioniEvento.length > 0 && (
                        <div className="intenzioni-calendario-parroco">
                          <div className="intenzioni-calendario-titolo">
                            {intenzioniEvento.length}{" "}
                            {intenzioniEvento.length === 1
                              ? "intenzione"
                              : "intenzioni"}
                          </div>

                          {intenzioniEvento.map((intenzione) => (
                            <div
                              key={intenzione.intenzione_id}
                              className="intenzione-calendario-parroco"
                            >
                              <strong>
                                {intenzione.testo_intenzione}
                              </strong>

                              <p>
                                {etichettaTipoIntenzione(
                                  intenzione.tipo_intenzione
                                )}
                                {" · "}
                                {intenzione.pubblicabile
                                  ? "Pubblica"
                                  : "Riservata"}
                                {" · "}
                                {intenzione.stato === "da_regolarizzare"
                                  ? "Da regolarizzare"
                                  : "Prenotata"}
                              </p>

                              <p>
                                Richiedente:{" "}
                                <strong>
                                  {intenzione.nome_richiedente}
                                </strong>
                              </p>

                              {intenzione.contatto_richiedente && (
                                <p>
                                  Contatto:{" "}
                                  {intenzione.contatto_richiedente}
                                </p>
                              )}

                              {Number(intenzione.numero_spostamenti) > 0 && (
                                <p>
                                  Spostamenti registrati:{" "}
                                  {intenzione.numero_spostamenti}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function dataDatabase(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}
