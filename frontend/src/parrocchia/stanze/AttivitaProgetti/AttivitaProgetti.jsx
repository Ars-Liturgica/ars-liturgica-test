import React, { useState } from "react";
import AttivitaGruppiParroco from "../AttivitaGruppi/AttivitaGruppiParroco";
import ProgettiDonazioni from "../ProgettiDonazioni/ProgettiDonazioni";
import PagamentiParrocchia from "../PagamentiParrocchia/PagamentiParrocchia";

const voci = [
  { id: "attivita", icona: "fa-calendar-days", titolo: "Attività parrocchiali", descrizione: "Crea GREST, gite, catechismo e incontri. Gestisci iscrizioni, gruppi e partecipanti.", sfondo: "#e0effa" },
  { id: "progetti", icona: "fa-hand-holding-heart", titolo: "Progetti e raccolte fondi", descrizione: "Consulta progetti per restauri, solidarietà e acquisti. La creazione di nuovi progetti è in preparazione.", sfondo: "#e3efdf" },
  { id: "metodi", icona: "fa-wallet", titolo: "Impostazioni pagamenti", descrizione: "Configura PayPal, bonifici, link esterni e consegna diretta. SumUp in attesa di definizione.", sfondo: "#f9ebc9" },
  { id: "quote", icona: "fa-receipt", titolo: "Quote, incassi e rimborsi", descrizione: "Consulta registrazioni e versamenti; per i rimborsi delle attività cancellate usa il relativo fascicolo.", sfondo: "#eee2f7" },
];

export default function AttivitaProgetti({ parrocchiaId, tornaDashboard }) {
  const [sezione, setSezione] = useState(null);
  const tornaIndice = () => setSezione(null);
  if (sezione === "attivita") return <AttivitaGruppiParroco parrocchiaId={parrocchiaId} tornaDashboard={tornaIndice} />;
  if (sezione === "progetti" || sezione === "metodi") return <ProgettiDonazioni parrocchiaId={parrocchiaId} tornaDashboard={tornaIndice} sezioneIniziale={sezione} />;
  if (sezione === "quote") return <PagamentiParrocchia parrocchiaId={parrocchiaId} tornaDashboard={tornaIndice} />;
  return <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px", color: "#302b28" }}>
    <button type="button" onClick={tornaDashboard} style={pulsante}>← Torna alla dashboard</button>
    <h1 style={{ margin: "24px 0 8px" }}>Attività e Progetti</h1>
    <p style={{ marginBottom: 24 }}>Scegli cosa desideri gestire nella tua parrocchia.</p>
    <nav aria-label="Sezioni attività e progetti" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
      {voci.map(voce => <button key={voce.id} type="button" onClick={() => setSezione(voce.id)} style={{ ...pulsante, background: voce.sfondo, color: "#302b28", textAlign: "left", minHeight: 150, padding: 20, border: "1px solid #d9cdbd" }}>
        <i className={`fa-solid ${voce.icona}`} aria-hidden="true" style={{ fontSize: 25, display: "block", marginBottom: 10 }} />
        <strong style={{ display: "block", fontSize: 20, lineHeight: 1.3, marginBottom: 8 }}>{voce.titolo}</strong>
        <span style={{ display: "block", fontSize: 15, lineHeight: 1.5, fontWeight: 400 }}>{voce.descrizione}</span>
      </button>)}
    </nav>
  </main>;
}
const pulsante = { background: "#fffaf1", border: "1px solid #ddc89d", borderRadius: 10, padding: "11px 16px", font: "inherit", fontWeight: 700, cursor: "pointer" };
