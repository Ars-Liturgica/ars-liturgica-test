import React from "react";
import "./BachecaAvvisi.css";

export default function BachecaAvvisi() {
  return (
    <div className="bacheca-avvisi">

      <header className="bacheca-header">
        <div>
          <h1>Bacheca Avvisi</h1>
          <p>
            Pubblica e gestisci gli avvisi destinati alla comunità
            parrocchiale.
          </p>
        </div>

        <button className="btn-nuovo-avviso">
          + Nuovo Avviso
        </button>
      </header>

      <section className="bacheca-contenuto">

        <div className="bacheca-vuota">
          <h2>Nessun avviso presente</h2>

          <p>
            Gli avvisi pubblicati dal parroco compariranno qui.
          </p>

        </div>

      </section>

    </div>
  );
}
