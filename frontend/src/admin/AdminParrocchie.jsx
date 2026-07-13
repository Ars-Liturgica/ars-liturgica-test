import React from "react";

export default function AdminParrocchie() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Area Admin</h1>

      <h2>Gestione Parrocchie</h2>

      <p>
        Da questa pagina l'Amministratore potrà:
      </p>

      <ul>
        <li>Visualizzare tutte le parrocchie registrate</li>
        <li>Ricercare una parrocchia</li>
        <li>Filtrare per diocesi</li>
        <li>Aprire la scheda della parrocchia</li>
        <li>Modificare i dati</li>
        <li>Disattivare la parrocchia</li>
        <li>Eliminare definitivamente una parrocchia</li>
        <li>Stampare l'elenco</li>
        <li>Esportare PDF ed Excel</li>
      </ul>

      <hr />

      <p>
        (In costruzione)
      </p>
    </div>
  );
}
