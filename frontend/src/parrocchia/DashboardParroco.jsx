import React from "react";
export default function DashboardParroco() {
  const sezioniGestione = [
    {
      icona: "👥",
      titolo: "Comunità",
      descrizione: "Fedeli iscritti, ruoli e autorizzazioni alle stanze riservate.",
    },
    {
      icona: "🏠",
      titolo: "Stanze",
      descrizione: "Attivazione, visibilità e gestione delle stanze parrocchiali.",
    },
    {
      icona: "📢",
      titolo: "Avvisi e Comunicazioni",
      descrizione: "Messaggi ai fedeli, notifiche e allegati.",
    },
    {
      icona: "📅",
      titolo: "Calendari",
      descrizione: "Calendario della parrocchia e calendari personali dei sacerdoti.",
    },
    {
      icona: "📂",
      titolo: "Documenti",
      descrizione: "Archivio, modulistica, verbali e materiali utili.",
    },
    {
      icona: "💰",
      titolo: "Progetti e Donazioni",
      descrizione: "Progetti, stanziamenti, raccolte fondi e donazioni online.",
    },
    {
      icona: "🤝",
      titolo: "Collaboratori",
      descrizione: "Viceparroco, sacerdoti, diaconi e responsabili autorizzati.",
    },
    {
      icona: "⚙️",
      titolo: "Impostazioni",
      descrizione: "Dati della parrocchia, configurazioni e servizi attivi.",
    },
  ];

  return (
    <div className="dashboard-parroco">
      <h2>Area di Gestione</h2>
      <p>Strumenti riservati alla gestione della parrocchia.</p>

      <div className="griglia-gestione">
        {sezioniGestione.map((sezione) => (
          <button className="card-gestione" key={sezione.titolo}>
            <span className="icona-gestione">{sezione.icona}</span>
            <h3>{sezione.titolo}</h3>
            <p>{sezione.descrizione}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
