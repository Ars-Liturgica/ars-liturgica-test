import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const card = { background: "#fffdf9", border: "1px solid #e5d9ca", borderRadius: 16, padding: 24, boxShadow: "0 4px 16px rgba(60,42,27,.05)" };
const button = { border: "1px solid #cbb59c", borderRadius: 10, background: "#fffdf9", padding: "11px 16px", color: "#62452e", cursor: "pointer", fontSize: 16 };

export default function ProgettiDonazioniFedele({ parrocchiaId, tornaDashboard }) {
  const [sezione, setSezione] = useState("progetto");
  const [progetti, setProgetti] = useState([]);
  const [attivo, setAttivo] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    let vivo = true;
    async function carica() {
      setCaricamento(true);
      setErrore("");
      if (!parrocchiaId) {
        if (vivo) { setErrore("Parrocchia non selezionata."); setCaricamento(false); }
        return;
      }
      const { data, error } = await supabase.rpc("ars_elenco_progetti_donazioni_pubblici", { p_parrocchia_id: parrocchiaId });
      if (!vivo) return;
      if (error) setErrore("Impossibile caricare le iniziative pubblicate.");
      else setProgetti(Array.isArray(data) ? data : []);
      setCaricamento(false);
    }
    carica();
    return () => { vivo = false; };
  }, [parrocchiaId]);

  const visibili = progetti.filter((p) => p.tipo_iniziativa === sezione);
  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ed", padding: "28px 16px", fontFamily: 'Georgia, "Times New Roman", serif', color: "#3e3328" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button type="button" style={button} onClick={attivo ? () => setAttivo(null) : tornaDashboard}>← {attivo ? "Torna alle iniziative" : "Torna alla Dashboard"}</button>
        <h1 style={{ fontWeight: 500, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "26px 0" }}>Progetti, raccolte fondi e donazioni</h1>
        {!attivo && <nav aria-label="Sezioni iniziative" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 26 }}>
          {[["progetto", "Progetti"], ["raccolta", "Raccolte fondi"], ["donazione", "Donazioni"]].map(([valore, titolo]) => (
            <button key={valore} type="button" onClick={() => setSezione(valore)} style={{ ...button, background: sezione === valore ? "#79512d" : "#fffdf9", color: sezione === valore ? "white" : "#62452e" }}>{titolo}</button>
          ))}
        </nav>}
        {errore && <p role="alert">{errore}</p>}
        {caricamento && <p>Caricamento iniziative…</p>}
        {!caricamento && !attivo && sezione === "donazione" && <section style={card}><h2>Donazioni</h2><p>Le donazioni libere saranno disponibili quando il collegamento ai pagamenti sarà completato.</p></section>}
        {!caricamento && !attivo && sezione !== "donazione" && (visibili.length === 0 ? <section style={card}><p>Nessuna iniziativa pubblicata in questa sezione.</p></section> : <div style={{ display: "grid", gap: 18 }}>
          {visibili.map(p => <article key={p.id} style={card}>
            <p style={{ color: "#79512d", letterSpacing: 1, fontSize: 13 }}>INIZIATIVA DELLA PARROCCHIA</p>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", margin: "12px 0" }}>{p.titolo}</h2>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{p.descrizione}</p>
            {p.mostra_contatore && <p>Offerte raccolte: <strong>{euro(p.raccolto)}</strong> · Obiettivo: {euro(p.obiettivo)}</p>}
            <button type="button" style={button} onClick={() => setAttivo(p)}>Scopri il progetto</button>
          </article>)}
        </div>)}
        {attivo && <article style={card}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", overflowWrap: "anywhere" }}>{attivo.titolo}</h2>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>{attivo.descrizione}</p>
          {attivo.mostra_contatore && <div style={{ padding: 18, border: "1px solid #e5d9ca", borderRadius: 12 }}>
            <strong>Offerte raccolte: {euro(attivo.raccolto)}</strong><p>Obiettivo: {euro(attivo.obiettivo)}</p>
            <progress value={Math.max(0, Math.min(100, Number(attivo.percentuale) || 0))} max="100" style={{ width: "100%" }} />
          </div>}
          <p style={{ marginTop: 22, color: "#79512d" }}>Per consultare fotografie e documenti, apri questo progetto dalla Bacheca Avvisi. La funzione di pagamento sarà collegata dopo la verifica del sistema condiviso.</p>
        </article>}
      </div>
    </main>
  );
}
