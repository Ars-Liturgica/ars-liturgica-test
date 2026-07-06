import React from "react";
import LaMiaParrocchia from "./LaMiaParrocchia";

function AccessoComunita() {
  const ruolo = localStorage.getItem("ars_ruolo");
  const parrocchiaId = localStorage.getItem("ars_parrocchia_id");

  if (ruolo === "fedele" && parrocchiaId) {
    return <LaMiaParrocchia />;
  }

  return (
    <div className="accesso-comunita">
      <h2>Benvenuto nella tua Parrocchia</h2>
      <p>
        Inserisci i tuoi dati per entrare nello spazio pubblico della tua comunità.
      </p>

      <form>
        <input type="text" placeholder="Nome *" />
        <input type="text" placeholder="Cognome *" />
        <input type="email" placeholder="Email *" />
        <input type="tel" placeholder="Cellulare" />
        <input type="text" placeholder="Cerca la tua Parrocchia *" />

        <button type="button">
          Entra nella tua Parrocchia
        </button>
      </form>
    </div>
  );
}

export default AccessoComunita;
