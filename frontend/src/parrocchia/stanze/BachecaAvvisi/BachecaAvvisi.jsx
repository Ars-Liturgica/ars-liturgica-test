import React, { useState } from "react";
import "./BachecaAvvisi.css";
import NuovoAvviso from "./NuovoAvviso";

export default function BachecaAvvisi() {
  const [mostraNuovoAvviso, setMostraNuovoAvviso] = useState(false);

  if (mostraNuovoAvviso) {
    return (
      <NuovoAvviso
        tornaAllaBacheca={() => setMostraNuovoAvviso(false)}
      />
    );
  }

  return (
    <div className="bacheca-avvisi">
      <header className="bacheca-header">
        <div className="bacheca-intestazione">
          <h1>Bacheca Avvisi</h1>

          <p>
            Pubblica e gestisci gli avvisi destinati alla comunità
            parrocchiale.
          </p>
        </div>

        <button
          className="btn-nuovo-avviso"
          type="button"
          onClick={() => setMostraNuovoAvviso(true)}
        >
          <span className="simbolo-aggiungi">+</span>
          Nuovo Avviso
        </button>
      </header>

      <section className="cornice-legno">
        <div className="cornice-modanatura">
          <div className="cornice-bordo-interno">
            <div className="pannello-sughero">
              <div className="bacheca-vuota">
                <div className="puntina" aria-hidden="true"></div>

                <div className="foglio-avviso">
                  <div className="icona-avviso" aria-hidden="true">
                    📌
                  </div>

                  <h2>Nessun avviso presente</h2>

                  <p>
                    Gli avvisi pubblicati dal parroco compariranno qui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
