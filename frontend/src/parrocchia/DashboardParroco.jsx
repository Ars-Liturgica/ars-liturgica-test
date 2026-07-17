import React from "react";
export default function DashboardParroco() {
  const sezioniGestione = [
    {
      icona: (
 <i className="fa-solid fa-users icona-dashboard"></i>
),
      titolo: "Comunità",
      descrizione: "Fedeli iscritti, ruoli e autorizzazioni alle stanze riservate.",
    },
    {
      icona: (
  <i className="fa-solid fa-church icona-dashboard"></i>
),
      titolo: "Stanze",
      descrizione: "Attivazione, visibilità e gestione delle stanze parrocchiali.",
    },
   {
  icona: (
    <i className="fa-solid fa-thumbtack icona-dashboard"></i>
  ),
  titolo: "Bacheca Avvisi",
  descrizione: "Avvisi ufficiali e informazioni pratiche rivolte alla comunità.",
},
{
  icona: (
    <i className="fa-solid fa-pen-nib icona-dashboard"></i>
  ),
  titolo: "Comunicazioni del Parroco",
  descrizione: "Messaggi, riflessioni e comunicazioni rivolte alla comunità.",
},
    {
      icona: (
  <i className="fa-solid fa-calendar-days icona-dashboard"></i>
),
      titolo: "Calendari",
      descrizione: "Calendario della parrocchia e calendari personali dei sacerdoti.",
    },
    {
      icona: (
  <i className="fa-solid fa-folder-open icona-dashboard"></i>
),
      titolo: "Documenti",
      descrizione: "Archivio, modulistica, verbali e materiali utili.",
    },
    {
      icona: (
  <i className="fa-solid fa-hand-holding-heart icona-dashboard"></i>
),
      titolo: "Progetti e Donazioni",
      descrizione: "Progetti, stanziamenti, raccolte fondi e donazioni online.",
    },
    {
     icona: (
  <i className="fa-solid fa-user-group icona-dashboard"></i>
),
      titolo: "Collaboratori",
      descrizione: "Viceparroco, sacerdoti, diaconi e responsabili autorizzati.",
    },
    {
     icona: (
  <i className="fa-solid fa-gear icona-dashboard"></i>
),
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
