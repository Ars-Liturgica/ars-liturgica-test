import React, { useState } from "react";
import "./NuovoAvviso.css";

export default function NuovoAvviso({ tornaAllaBacheca }) {
  const [titolo, setTitolo] = useState("");
  const [testo, setTesto] = useState("");
  const [scadenza, setScadenza] = useState("");

  return (
    <div className="nuovo-avviso">
      <div className="foglio-ufficiale">
        <header className="carta-intestata">
          <div className="simbolo-chiesa-oro" aria-hidden="true">
            <svg viewBox="0 0 120 90">
              <path d="M60 7v16" />
              <path d="M52 15h16" />
              <path d="M18 78h84" />
              <path d="M24 78V43l36-24 36 24v35" />
              <path d="M34 78V50h16v28" />
              <path d="M70 78V50h16v28" />
              <path d="M52 78V52c0-8 16-8 16 0v26" />
              <path d="M24 43h72" />
            </svg>
          </div>

          <p className="nome-parrocchia-avviso">
            Parrocchia
          </p>

          <p className="diocesi-avviso">
            Diocesi
          </p>

          <div className="linea-intestata" />
        </header>

        <main className="corpo-avviso">
          <input
            className="titolo-avviso-input"
            type="text"
            placeholder="Titolo dell'avviso"
            value={titolo}
            onChange={(event) => setTitolo(event.target.value)}
          />

          <textarea
            className="testo-avviso-input"
            placeholder="Scrivi qui il testo dell'avviso..."
            value={testo}
            onChange={(event) => setTesto(event.target.value)}
          />
        </main>

        <footer className="piede-avviso">
          <div className="dati-avviso">
            <span>
              Pubblicato il {new Date().toLocaleDateString("it-IT")}
            </span>

            <label>
              Scadenza
              <input
                type="date"
                value={scadenza}
                onChange={(event) => setScadenza(event.target.value)}
              />
            </label>
          </div>

          <div className="azioni-avviso">
            <button
              type="button"
              className="btn-annulla-avviso"
              onClick={tornaAllaBacheca}
            >
              Annulla
            </button>

            <button
              type="button"
              className="btn-pubblica-avviso"
            >
              Pubblica
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
