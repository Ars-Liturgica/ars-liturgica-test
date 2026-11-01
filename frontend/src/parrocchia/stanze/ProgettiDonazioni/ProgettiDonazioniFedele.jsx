import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n) || 0);
const card = { background: "#fffdf9", border: "1px solid #e5d9ca", borderRadius: 16, padding: "clamp(14px, 3vw, 24px)", boxShadow: "0 4px 16px rgba(60,42,27,.05)", minWidth: 0 };
const button = { border: "1px solid #cbb59c", borderRadius: 10, background: "#fffdf9", padding: "11px 16px", color: "#62452e", cursor: "pointer", fontSize: 16, minHeight: 44, maxWidth: "100%" };

function ContatoreOfferte({ iniziativa }) {
  if (!iniziativa?.mostra_contatore) return null;
  const incassato = Number(iniziativa.raccolto) || 0;
  const dichiaratoRaw = iniziativa.offerte_dichiarate ?? iniziativa.totale_dichiarato;
  const dichiarato = dichiaratoRaw == null ? null : Number(dichiaratoRaw);
  const obiettivo = Number(iniziativa.obiettivo) || 0;
  const percentuale = obiettivo > 0 ? Math.max(0, Math.min(100, incassato / obiettivo * 100)) : 0;
  const cifra = { fontSize: "clamp(1rem, 4vw, 1.35rem)", color: "#f2d28d", fontWeight: 700, overflowWrap: "anywhere" };
  return <section aria-label="Contatore delle offerte" style={{ background: "#101d35", color: "#fff", padding: "14px", borderRadius: 14, margin: "16px auto", width: "100%", maxWidth: 430, boxSizing: "border-box" }}>
    <div style={{ color: "#e7c57c", textAlign: "center", fontSize: 12, letterSpacing: ".04em", marginBottom: 10 }}>INSIEME PER IL NOSTRO PROGETTO</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      <div style={{ background: "#233653", padding: "10px 5px", borderRadius: 10, textAlign: "center", minWidth: 0 }}><div style={{ fontSize: 12 }}>Offerte dichiarate</div><div style={cifra}>{dichiarato != null && Number.isFinite(dichiarato) ? euro(dichiarato) : "Da collegare"}</div></div>
      <div style={{ background: "#233653", padding: "10px 5px", borderRadius: 10, textAlign: "center", minWidth: 0 }}><div style={{ fontSize: 12 }}>Somme incassate</div><div style={cifra}>{euro(incassato)}</div></div>
    </div>
    {obiettivo > 0 && <><div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 12, color: "#e7c57c", fontSize: 12 }}><span>Avanzamento effettivo</span><strong>{percentuale.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%</strong></div><div role="progressbar" aria-valuenow={percentuale} aria-valuemin={0} aria-valuemax={100} aria-label="Avanzamento incassi" style={{ background: "#33445e", borderRadius: 12, height: 8, marginTop: 6, overflow: "hidden" }}><div style={{ width: `${percentuale}%`, height: "100%", background: "#d6ac57" }} /></div><div style={{ marginTop: 7, fontSize: 12, color: "#c5d3ea" }}>Obiettivo: {euro(obiettivo)}</div></>}
    <p style={{ textAlign: "center", color: "#f2d28d", fontSize: 12, margin: "12px 0 0" }}>Anche il tuo contributo può fare la differenza</p>
  </section>;
}

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
    <main style={{ minHeight: "100vh", background: "#f7f3ed", padding: "clamp(14px, 3vw, 28px) 12px", fontFamily: 'Georgia, "Times New Roman", serif', color: "#3e3328", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0 }}>
        <button type="button" style={button} onClick={attivo ? () => setAttivo(null) : tornaDashboard}>← {attivo ? "Torna alle iniziative" : "Torna alla Dashboard"}</button>
        <h1 style={{ fontWeight: 500, fontSize: "clamp(1.65rem, 5vw, 2.6rem)", margin: "22px 0", overflowWrap: "anywhere" }}>Progetti, raccolte fondi e donazioni</h1>
        {!attivo && <nav aria-label="Sezioni iniziative" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {[["progetto", "Progetti"], ["raccolta", "Raccolte fondi"], ["donazione", "Donazioni"]].map(([valore, titolo]) => (
            <button key={valore} type="button" onClick={() => setSezione(valore)} style={{ ...button, background: sezione === valore ? "#79512d" : "#fffdf9", color: sezione === valore ? "white" : "#62452e" }}>{titolo}</button>
          ))}
        </nav>}
        {errore && <p role="alert">{errore}</p>}
        {caricamento && <p>Caricamento iniziative…</p>}
        {!caricamento && !attivo && sezione === "donazione" && <section style={card}><h2>Donazioni</h2><p>Le offerte libere alla parrocchia saranno disponibili in questa sezione.</p></section>}
        {!caricamento && !attivo && sezione !== "donazione" && (visibili.length === 0 ? <section style={card}><p>Nessuna iniziativa pubblicata in questa sezione.</p></section> : <div style={{ display: "grid", gap: 16 }}>
          {visibili.map(p => <article key={p.id} style={card}>
            <p style={{ color: "#79512d", letterSpacing: 1, fontSize: 12 }}>INIZIATIVA DELLA PARROCCHIA</p>
            <h2 style={{ fontSize: "clamp(1.3rem, 4vw, 2rem)", margin: "12px 0", overflowWrap: "anywhere" }}>{p.titolo}</h2>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{p.descrizione}</p>
            <ContatoreOfferte iniziativa={p} />
            <button type="button" style={button} onClick={() => setAttivo(p)}>{sezione === "raccolta" ? "Scopri la raccolta" : "Scopri il progetto"}</button>
          </article>) }
        </div>)}
        {attivo && <article style={card}>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", overflowWrap: "anywhere" }}>{attivo.titolo}</h2>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>{attivo.descrizione}</p>
          <ContatoreOfferte iniziativa={attivo} />
        </article>}
      </div>
    </main>
  );
}
