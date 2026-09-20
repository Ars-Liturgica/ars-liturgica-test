import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function ProgettiDonazioni({
  parrocchiaId,
  tornaDashboard,
}) {
  const [metodiIncasso, setMetodiIncasso] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  const caricaDati = useCallback(async () => {
    if (!parrocchiaId) {
      setMetodiIncasso([]);
      setProgetti([]);
      setCaricamento(false);
      return;
    }

    setCaricamento(true);
    setErrore("");

    const [
      { data: datiMetodi, error: erroreMetodi },
      { data: datiProgetti, error: erroreProgetti },
    ] = await Promise.all([
      supabase.rpc("ars_elenco_metodi_incasso_parroco", {
        p_parrocchia_id: parrocchiaId,
      }),
      supabase.rpc("ars_elenco_progetti_donazioni_parroco", {
        p_parrocchia_id: parrocchiaId,
      }),
    ]);

    if (erroreMetodi || erroreProgetti) {
      console.error(
        "Errore caricamento Donazioni e Progetti:",
        erroreMetodi || erroreProgetti,
      );

      setErrore(
        erroreMetodi?.message ||
          erroreProgetti?.message ||
          "Impossibile caricare Donazioni e Progetti.",
      );

      setCaricamento(false);
      return;
    }

    setMetodiIncasso(
      Array.isArray(datiMetodi) ? datiMetodi : [],
    );

    setProgetti(
      Array.isArray(datiProgetti) ? datiProgetti : [],
    );

    setCaricamento(false);
  }, [parrocchiaId]);

  useEffect(() => {
    caricaDati();
  }, [caricaDati]);

  return (
    <div className="progetti-donazioni">
      <button
        type="button"
        className="pulsante-torna-dashboard"
        onClick={tornaDashboard}
      >
        ← Torna alla dashboard
      </button>

      <div className="progetti-donazioni-intestazione">
        <h2>Progetti e Donazioni</h2>

        <p>
          Gestisci i metodi con cui la parrocchia riceve le
          offerte e presenta alla comunità i progetti da
          sostenere.
        </p>
      </div>

      {errore && (
        <div role="alert" className="messaggio-errore">
          {errore}
        </div>
      )}

      {caricamento ? (
        <p>Caricamento in corso...</p>
      ) : (
        <>
          <section className="sezione-metodi-incasso">
            <div className="intestazione-sezione-donazioni">
              <div>
                <h3>Metodi di incasso</h3>

                <p>
                  Bonifico, PayPal e altre modalità utilizzate
                  direttamente dalla parrocchia.
                </p>
              </div>

              <button
                type="button"
                className="pulsante-primario"
                disabled
                title="La funzione sarà attivata nel prossimo passaggio"
              >
                Aggiungi metodo
              </button>
            </div>

            {metodiIncasso.length === 0 ? (
              <p>
                Nessun metodo di incasso è stato ancora
                configurato.
              </p>
            ) : (
              <div>
                {metodiIncasso.map((metodo) => (
                  <article key={metodo.id}>
                    <h4>{metodo.titolo}</h4>

                    <p>
                      {metodo.tipo}
                      {metodo.attivo ? " · Attivo" : " · Non attivo"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="sezione-progetti-donazioni">
            <div className="intestazione-sezione-donazioni">
              <div>
                <h3>Progetti della parrocchia</h3>

                <p>
                  Raccolte e iniziative che la comunità può
                  sostenere.
                </p>
              </div>

              <button
                type="button"
                className="pulsante-primario"
                disabled
                title="La funzione sarà attivata nel prossimo passaggio"
              >
                Nuovo progetto
              </button>
            </div>

            {progetti.length === 0 ? (
              <p>
                Nessun progetto è stato ancora creato.
              </p>
            ) : (
              <div>
                {progetti.map((progetto) => (
                  <article key={progetto.id}>
                    <h4>{progetto.titolo}</h4>

                    <p>
                      {progetto.stato} · Raccolto{" "}
                      {Number(
                        progetto.raccolto || 0,
                      ).toLocaleString("it-IT", {
                        style: "currency",
                        currency: progetto.valuta || "EUR",
                      })}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
