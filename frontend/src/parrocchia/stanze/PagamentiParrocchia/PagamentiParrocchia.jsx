import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "../../../supabaseClient";

const FILTRI_INIZIALI = {
  attivitaId: "",
  dataDa: "",
  dataA: "",
  metodo: "",
  stato: "",
  ricerca: "",
};

const RIEPILOGO_VUOTO = {
  numero_movimenti: 0,
  totale_completato: 0,
  totale_in_attesa: 0,
  numero_rimborsi: 0,
};

function formattaImporto(importo, valuta = "EUR") {
  return Number(importo || 0).toLocaleString("it-IT", {
    style: "currency",
    currency: valuta || "EUR",
  });
}

function formattaData(data) {
  if (!data) {
    return "—";
  }

  return new Date(data).toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function etichettaMetodo(metodo) {
  const etichette = {
    consegna_diretta: "Pagamento in parrocchia",
    bonifico: "Bonifico",
    online: "Pagamento online",
  };

  return etichette[metodo] || metodo || "—";
}

function etichettaStato(stato) {
  const etichette = {
    in_attesa: "In attesa",
    completata: "Completato",
    fallita: "Fallito",
    annullata: "Annullato",
    rimborsata: "Rimborsato",
  };

  return etichette[stato] || stato || "—";
}

export default function PagamentiParrocchia({
  parrocchiaId,
  tornaDashboard,
}) {
  const [attivita, setAttivita] = useState([]);
  const [movimenti, setMovimenti] = useState([]);
  const [riepilogo, setRiepilogo] = useState(
    RIEPILOGO_VUOTO,
  );

  const [filtri, setFiltri] = useState({
    ...FILTRI_INIZIALI,
  });

  const [filtriApplicati, setFiltriApplicati] = useState({
    ...FILTRI_INIZIALI,
  });

  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  const caricaDati = useCallback(async () => {
    if (!parrocchiaId) {
      setAttivita([]);
      setMovimenti([]);
      setRiepilogo(RIEPILOGO_VUOTO);
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const [
      { data: datiRegistro, error: erroreRegistro },
      { data: datiAttivita, error: erroreAttivita },
    ] = await Promise.all([
      supabase.rpc("ars_registro_pagamenti_parrocchia", {
        p_parrocchia_id: parrocchiaId,
        p_attivita_id:
          filtriApplicati.attivitaId || null,
        p_data_da:
          filtriApplicati.dataDa || null,
        p_data_a:
          filtriApplicati.dataA || null,
        p_metodo:
          filtriApplicati.metodo || null,
        p_stato:
          filtriApplicati.stato || null,
        p_ricerca:
          filtriApplicati.ricerca.trim() || null,
      }),

      supabase.rpc("ars_elenco_attivita_parroco", {
        p_parrocchia_id: parrocchiaId,
      }),
    ]);

    if (erroreRegistro || erroreAttivita) {
      console.error(
        "Errore caricamento Pagamenti:",
        erroreRegistro || erroreAttivita,
      );

      setErrore(
        erroreRegistro?.message ||
          erroreAttivita?.message ||
          "Impossibile caricare i pagamenti.",
      );

      setCaricamento(false);
      return;
    }

    const registroValido =
      datiRegistro &&
      typeof datiRegistro === "object" &&
      !Array.isArray(datiRegistro)
        ? datiRegistro
        : {};

    setMovimenti(
      Array.isArray(registroValido.movimenti)
        ? registroValido.movimenti
        : [],
    );

    setRiepilogo({
      ...RIEPILOGO_VUOTO,
      ...(registroValido.riepilogo || {}),
    });

    setAttivita(
      Array.isArray(datiAttivita)
        ? datiAttivita
        : [],
    );

    setCaricamento(false);
  }, [parrocchiaId, filtriApplicati]);

  useEffect(() => {
    caricaDati();
  }, [caricaDati]);

  function aggiornaFiltro(event) {
    const { name, value } = event.target;

    setFiltri((precedenti) => ({
      ...precedenti,
      [name]: value,
    }));
  }

  function applicaFiltri(event) {
    event.preventDefault();

    setFiltriApplicati({
      ...filtri,
      ricerca: filtri.ricerca.trim(),
    });
  }

  function azzeraFiltri() {
    setFiltri({
      ...FILTRI_INIZIALI,
    });

    setFiltriApplicati({
      ...FILTRI_INIZIALI,
    });
  }

  function stampaRegistro() {
    window.print();
  }

  const valutaRegistro =
    movimenti.find((movimento) => movimento.valuta)
      ?.valuta || "EUR";

  return (
    <div className="pagamenti-parrocchia">
      <div className="azioni-non-stampabili">
        <button
          type="button"
          className="pulsante-torna-dashboard"
          onClick={tornaDashboard}
        >
          ← Torna alla dashboard
        </button>
      </div>

      <div className="pagamenti-intestazione">
        <div>
          <h2>Pagamenti della parrocchia</h2>

          <p>
            Consulta gli incassi, controlla le quote delle
            attività e individua rapidamente le posizioni
            ancora da saldare.
          </p>
        </div>

        <button
          type="button"
          className="pulsante-primario azioni-non-stampabili"
          onClick={stampaRegistro}
          disabled={caricamento}
        >
          Stampa registro
        </button>
      </div>

      {errore && (
        <div role="alert" className="messaggio-errore">
          {errore}
        </div>
      )}

      <form
        className="filtri-pagamenti azioni-non-stampabili"
        onSubmit={applicaFiltri}
      >
        <div className="campo-filtro-pagamenti">
          <label htmlFor="filtro-attivita">
            Attività
          </label>

          <select
            id="filtro-attivita"
            name="attivitaId"
            value={filtri.attivitaId}
            onChange={aggiornaFiltro}
          >
            <option value="">Tutte le attività</option>

            {attivita.map((elemento) => (
              <option
                key={elemento.id}
                value={elemento.id}
              >
                {elemento.titolo}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-filtro-pagamenti">
          <label htmlFor="filtro-data-da">
            Dal
          </label>

          <input
            id="filtro-data-da"
            type="date"
            name="dataDa"
            value={filtri.dataDa}
            onChange={aggiornaFiltro}
          />
        </div>

        <div className="campo-filtro-pagamenti">
          <label htmlFor="filtro-data-a">
            Al
          </label>

          <input
            id="filtro-data-a"
            type="date"
            name="dataA"
            value={filtri.dataA}
            onChange={aggiornaFiltro}
          />
        </div>

        <div className="campo-filtro-pagamenti">
          <label htmlFor="filtro-metodo">
            Metodo
          </label>

          <select
            id="filtro-metodo"
            name="metodo"
            value={filtri.metodo}
            onChange={aggiornaFiltro}
          >
            <option value="">Tutti</option>
            <option value="consegna_diretta">
              Pagamento in parrocchia
            </option>
            <option value="bonifico">
              Bonifico
            </option>
            <option value="online">
              Pagamento online
            </option>
          </select>
        </div>

        <div className="campo-filtro-pagamenti">
          <label htmlFor="filtro-stato">
            Stato
          </label>

          <select
            id="filtro-stato"
            name="stato"
            value={filtri.stato}
            onChange={aggiornaFiltro}
          >
            <option value="">Tutti</option>
            <option value="in_attesa">
              In attesa
            </option>
            <option value="completata">
              Completato
            </option>
            <option value="fallita">
              Fallito
            </option>
            <option value="annullata">
              Annullato
            </option>
            <option value="rimborsata">
              Rimborsato
            </option>
          </select>
        </div>

        <div className="campo-filtro-pagamenti campo-ricerca-pagamenti">
          <label htmlFor="filtro-ricerca">
            Nome o causale
          </label>

          <input
            id="filtro-ricerca"
            type="search"
            name="ricerca"
            value={filtri.ricerca}
            onChange={aggiornaFiltro}
            placeholder="Cerca..."
          />
        </div>

        <div className="azioni-filtri-pagamenti">
          <button
            type="submit"
            className="pulsante-primario"
          >
            Applica filtri
          </button>

          <button
            type="button"
            className="pulsante-secondario"
            onClick={azzeraFiltri}
          >
            Azzera
          </button>
        </div>
      </form>

      {caricamento ? (
        <p>Caricamento in corso...</p>
      ) : (
        <>
          <section className="riepilogo-pagamenti">
            <article>
              <span>Movimenti</span>
              <strong>
                {Number(
                  riepilogo.numero_movimenti || 0,
                )}
              </strong>
            </article>

            <article>
              <span>Incassato</span>
              <strong>
                {formattaImporto(
                  riepilogo.totale_completato,
                  valutaRegistro,
                )}
              </strong>
            </article>

            <article>
              <span>In attesa</span>
              <strong>
                {formattaImporto(
                  riepilogo.totale_in_attesa,
                  valutaRegistro,
                )}
              </strong>
            </article>

            <article>
              <span>Rimborsi</span>
              <strong>
                {Number(
                  riepilogo.numero_rimborsi || 0,
                )}
              </strong>
            </article>
          </section>

          <section className="registro-pagamenti">
            <div className="intestazione-registro-pagamenti">
              <div>
                <h3>Registro dei movimenti</h3>

                <p>
                  La stampa rispetta i filtri applicati.
                </p>
              </div>
            </div>

            {movimenti.length === 0 ? (
              <p>
                Nessun pagamento corrisponde ai criteri
                selezionati.
              </p>
            ) : (
              <div className="tabella-pagamenti-contenitore">
                <table className="tabella-pagamenti">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Pagante</th>
                      <th>Partecipante</th>
                      <th>Causale</th>
                      <th>Attività</th>
                      <th>Metodo</th>
                      <th>Stato</th>
                      <th>Importo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimenti.map((movimento) => (
                      <tr key={movimento.id}>
                        <td>
                          {formattaData(movimento.data)}
                        </td>

                        <td>
                          {movimento.pagante || "—"}
                        </td>

                        <td>
                          {movimento.partecipante || "—"}
                        </td>

                        <td>
                          {movimento.causale || "—"}
                        </td>

                        <td>
                          {movimento.attivita?.titolo || "—"}
                        </td>

                        <td>
                          {etichettaMetodo(
                            movimento.metodo,
                          )}
                        </td>

                        <td>
                          {etichettaStato(
                            movimento.stato,
                          )}
                        </td>

                        <td>
                          {formattaImporto(
                            movimento.importo,
                            movimento.valuta,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
