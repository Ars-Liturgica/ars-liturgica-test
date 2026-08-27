import BachecaAvvisi from "./stanze/BachecaAvvisi/BachecaAvvisi";
import ArchivioDocumenti from "./stanze/ArchivioDocumenti/ArchivioDocumenti/ArchivioDocumenti";
import ComunitaParrocchia from "./stanze/Comunita/ComunitaParrocchia";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
export default function DashboardParroco({ onCambioVista }) {
 const [parrocchia, setParrocchia] = useState(null);
const [stanzaAperta, setStanzaAperta] = useState(null);
 useEffect(() => {
  if (typeof onCambioVista === "function") {
    onCambioVista(Boolean(stanzaAperta));
  }
}, [stanzaAperta, onCambioVista]);
useEffect(() => {
  async function caricaParrocchia() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    const { data: collegamento } = await supabase
      .from("utenti_parrocchie")
      .select("parrocchia_id")
      .eq("utente_id", session.user.id)
      .single();

    if (!collegamento) return;

  const { data: parrocchiaCaricata } = await supabase
  .from("parrocchie")
  .select("id, nome")
  .eq("id", collegamento.parrocchia_id)
  .single();

if (parrocchiaCaricata) {
  setParrocchia(parrocchiaCaricata);
}
  }

  caricaParrocchia();
}, []);
  const sezioniGestione = [
    {
      icona: (
 <i className="fa-solid fa-users icona-dashboard"></i>
),
      titolo: "Comunità",
      descrizione: "Fedeli iscritti, ruoli e autorizzazioni alle stanze riservate.",
     stanza: "comunita",
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
     stanza: "bacheca-avvisi",
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
     stanza: "archivio-documenti",
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
 if (stanzaAperta === "comunita") {
  return (
    <ComunitaParrocchia
      parrocchiaId={parrocchia?.id}
      tornaDashboard={() => setStanzaAperta(null)}
    />
  );
}
if (stanzaAperta === "bacheca-avvisi") {
  return (
    <BachecaAvvisi
      parrocchia={parrocchia}
      onTorna={() => setStanzaAperta(null)}
    />
  );
}
 if (stanzaAperta === "archivio-documenti") {
  return (
    <ArchivioDocumenti
      parrocchiaId={parrocchia?.id}
      tornaDashboard={() => setStanzaAperta(null)}
    />
  );
}
  return (
    <div className="dashboard-parroco">
     <h2>{parrocchia?.nome || "Area di Gestione"}</h2>
      <p>Strumenti riservati alla gestione della parrocchia.</p>
     
      <div className="griglia-gestione">
        {sezioniGestione.map((sezione) => (
          <button
  className="card-gestione"
  key={sezione.titolo}
 onClick={() => sezione.stanza && setStanzaAperta(sezione.stanza)}
>
            <span className="icona-gestione">{sezione.icona}</span>
            <h3>{sezione.titolo}</h3>
            <p>{sezione.descrizione}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
