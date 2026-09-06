import React, { useState } from "react";

export default function Celebrazioni({ tornaDashboard }) {
  const [sezioneAperta, setSezioneAperta] = useState(null);

  const sezioniCelebrazioni = [
    {
      id: "orari-messe",
      icona: <i className="fa-solid fa-clock icona-dashboard"></i>,
      titolo: "Orari Messe",
      descrizione:
        "Orari ordinari feriali, prefestivi e festivi della parrocchia.",
    },
    {
      id: "solennita-feste",
      icona: <i className="fa-solid fa-star icona-dashboard"></i>,
      titolo: "Solennità e feste liturgiche",
      descrizione:
        "Natale, Pasqua, festa patronale e altre ricorrenze liturgiche.",
    },
    {
      id: "celebrazioni-straordinarie",
      icona: <i className="fa-solid fa-bell icona-dashboard"></i>,
      titolo: "Celebrazioni straordinarie",
      descrizione:
        "Messe e celebrazioni che non rientrano nell’orario ordinario.",
    },
    {
      id: "confessioni",
      icona: <i className="fa-solid fa-hands-praying icona-dashboard"></i>,
      titolo: "Confessioni",
      descrizione:
        "Orari ordinari e disponibilità particolari nei tempi forti.",
    },
    {
      id: "adorazione-liturgie",
      icona: <i className="fa-solid fa-cross icona-dashboard"></i>,
      titolo: "Adorazione e altre liturgie",
      descrizione:
        "Adorazione eucaristica, Via Crucis, veglie e liturgie penitenziali.",
    },
    {
      id: "calendario-celebrazioni",
      icona: <i className="fa-solid fa-calendar-days icona-dashboard"></i>,
      titolo: "Calendario delle celebrazioni",
      descrizione:
        "Messe, liturgie e celebrazioni provenienti dal calendario centrale.",
    },
  ];

  const sezioneSelezionata = sezioniCelebrazioni.find(
    (sezione) => sezione.id === sezioneAperta
  );

  if (sezioneSelezionata) {
    return (
      <div className="dashboard-parroco">
        <button
          type="button"
          className="pulsante-torna-dashboard"
          onClick={() => setSezioneAperta(null)}
        >
          ← Torna a Celebrazioni
        </button>

        <h2>{sezioneSelezionata.titolo}</h2>
        <p>{sezioneSelezionata.descrizione}</p>

        <div className="sezione-in-preparazione">
          <p>Questa funzione sarà sviluppata nella prossima fase del cantiere.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-parroco">
      <button
        type="button"
        className="pulsante-torna-dashboard"
        onClick={tornaDashboard}
      >
        ← Torna a Gestione Parrocchia
      </button>

      <h2>Celebrazioni</h2>
      <p>
        Gestione delle Messe, delle liturgie e delle celebrazioni della vita
        parrocchiale.
      </p>

      <div className="griglia-gestione">
        {sezioniCelebrazioni.map((sezione) => (
          <button
            type="button"
            className="card-gestione"
            key={sezione.id}
            onClick={() => setSezioneAperta(sezione.id)}
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
