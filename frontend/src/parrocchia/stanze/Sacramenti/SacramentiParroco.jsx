import React, { useState } from "react";

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

const sezioniComunione = [
  { id: "impostazioni", nome: "Impostazioni anno catechistico", descrizione: "Anno pastorale, durata e iscrizioni" },
  { id: "quote", nome: "Quote e pagamenti", descrizione: "Quote annuali, metodi e agevolazioni" },
  { id: "iscrizioni", nome: "Iscrizioni e rinnovi", descrizione: "Nuove iscrizioni e rinnovi annuali" },
  { id: "catechisti", nome: "Catechisti", descrizione: "Responsabili e assegnazioni" },
  { id: "gruppi", nome: "Gruppi di catechismo", descrizione: "Classi e organizzazione" },
  { id: "incontri", nome: "Calendario incontri", descrizione: "Date e appuntamenti" },
  { id: "presenze", nome: "Presenze", descrizione: "Registro degli incontri" },
  { id: "comunicazioni", nome: "Comunicazioni", descrizione: "Avvisi alle famiglie" },
  { id: "celebrazioni", nome: "Celebrazioni", descrizione: "Preparazione alla Prima Comunione" },
];

function Simbolo({ tipo }) {
  const comuni = { fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 96 96" width="80" height="80" aria-hidden="true" {...comuni}>
      {tipo === "battesimo" && <>
        <path d="M21 38Q48 8 75 38Q48 51 21 38Z" />
        <path d="M48 18v24M35 24l13 18 13-18M29 32l19 10 19-10" strokeWidth="1.7" />
        <path d="M48 45C42 55 37 62 37 69a11 11 0 0 0 22 0c0-7-5-14-11-24Z" fill="#d8eef0" />
        <path d="M21 81q13-7 27 0t27 0" />
      </>}
      {tipo === "comunione" && <>
        <circle cx="48" cy="21" r="15" fill="#fffaf0" />
        <path d="M48 11v20M40 19h16" strokeWidth="2.5" />
        <path d="M22 40h52c0 19-11 28-26 28S22 59 22 40Z" fill="#f5e3b6" />
        <path d="M48 68v12M33 82h30M42 80h12" strokeWidth="4" />
      </>}
      {tipo === "cresima" && <>
        <path d="M48 34 C44 28 38 26 34 29 C31 31 31 36 34 39 L28 40 C18 35 12 27 9 17 C22 19 33 23 43 32 L48 37 L53 32 C63 23 74 19 87 17 C84 27 78 35 68 40 L62 39 C65 36 65 31 62 29 C58 26 52 28 48 34Z" fill="#fffdf8" />
        <path d="M48 37 C42 44 39 52 42 60 L48 55 L54 60 C57 52 54 44 48 37Z" fill="#fffdf8" />
        <path d="M42 59 L34 72 L43 69 L48 79 L53 69 L62 72 L54 59" fill="#fffdf8" />
        <circle cx="45" cy="34" r="1.5" fill="#b98a31" stroke="none" />
        <path d="M42 36 L35 38 L42 40" fill="#dba94b" strokeWidth="1.5" />
        <path d="M48 6 C40 15 41 22 48 27 C55 22 56 15 48 6Z" fill="#f2c86a" />
      </>}
      {tipo === "matrimonio" && <>
        <circle cx="36" cy="55" r="20" fill="none" strokeWidth="6" />
        <circle cx="60" cy="55" r="20" fill="none" strokeWidth="6" />
        <path d="M48 13v19M38.5 22.5h19" />
        <path d="M28 32l-5-7M68 32l5-7" strokeWidth="1.5" />
      </>}
    </svg>
  );
}

const annoCorrente = new Date().getFullYear();
const impostazioniIniziali = {
  anno: `${annoCorrente}/${annoCorrente + 1}`,
  durata: "2",
  apertura: "",
  chiusura: "",
};

export default function SacramentiParroco({ tornaDashboard }) {
  const [scelto, setScelto] = useState(null);
  const [sezione, setSezione] = useState(null);
  const [impostazioni, setImpostazioni] = useState(impostazioniIniziali);
  const [messaggio, setMessaggio] = useState("");
  const sacramento = sacramenti.find((s) => s.id === scelto);
  const sezioneAttiva = sezioniComunione.find((s) => s.id === sezione);

  function indietro() {
    if (sezione) { setSezione(null); setMessaggio(""); }
    else if (sacramento) setScelto(null);
    else tornaDashboard?.();
  }

  function aggiorna(campo, valore) {
    setImpostazioni((precedenti) => ({ ...precedenti, [campo]: valore }));
    setMessaggio("");
  }

  function verificaImpostazioni(e) {
    e.preventDefault();
    if (!/^\d{4}\/\d{4}$/.test(impostazioni.anno)) {
      setMessaggio("Inserisci l'anno pastorale nel formato 2026/2027.");
      return;
    }
    const [inizio, fine] = impostazioni.anno.split("/").map(Number);
    if (fine !== inizio + 1) {
      setMessaggio("L'anno pastorale deve comprendere due anni consecutivi.");
      return;
    }
    if (impostazioni.apertura && impostazioni.chiusura && impostazioni.chiusura < impostazioni.apertura) {
      setMessaggio("La chiusura delle iscrizioni non può precedere l'apertura.");
      return;
    }
    setMessaggio("Impostazioni verificate. Il salvataggio definitivo sarà disponibile dopo il collegamento a Supabase.");
  }

  return (
    <main className="ars-sacramenti-parroco">
      <style>{STILE}</style>
      <button type="button" className="ars-sac-indietro" onClick={indietro}>
        ← {sezione ? "Prima Comunione" : sacramento ? "Tutti i Sacramenti" : "Torna alla dashboard"}
      </button>
      <header className="ars-sac-header">
        <h2>{sacramento ? sacramento.nome : "Sacramenti"}</h2>
        <p>{sacramento ? sacramento.descrizione : "Battesimo, Prima Comunione, Cresima e Matrimonio"}</p>
      </header>
      {!sacramento ? (
        <div className="ars-sac-griglia">
          {sacramenti.map((s) => (
            <button type="button" className="ars-sac-card" key={s.id}
              onClick={() => { setScelto(s.id); setSezione(null); }} aria-label={`${s.nome} — ${s.descrizione}`}>
              <span className="ars-sac-simbolo" aria-hidden="true"><Simbolo tipo={s.id} /></span>
              <strong>{s.nome}</strong>
              <span className="ars-sac-descrizione">{s.descrizione}</span>
            </button>
          ))}
        </div>
      ) : sacramento.id !== "comunione" ? (
        <section className="ars-sac-dettaglio">
          <span className="ars-sac-simbolo ars-sac-simbolo-grande" aria-hidden="true"><Simbolo tipo={sacramento.id} /></span>
          <h3>{sacramento.nome}</h3>
          <p>La gestione di questo Sacramento sarà disponibile prossimamente.</p>
        </section>
      ) : !sezioneAttiva ? (
        <div className="ars-sac-griglia ars-sac-griglia-sezioni">
          {sezioniComunione.map((s, i) => (
            <button type="button" key={s.id} className="ars-sac-card ars-sac-card-sezione"
              onClick={() => { setSezione(s.id); setMessaggio(""); }}>
              <span className="ars-sac-numero">{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.nome}</strong>
              <span className="ars-sac-descrizione">{s.descrizione}</span>
              {s.id === "impostazioni" && <span className="ars-sac-etichetta">Prima fase</span>}
            </button>
          ))}
        </div>
      ) : sezione === "impostazioni" ? (
        <section className="ars-sac-pannello">
          <h3>Impostazioni anno catechistico</h3>
          <p>Definisci l'anno pastorale, la durata del percorso e il periodo delle iscrizioni.</p>
          <form className="ars-sac-form" onSubmit={verificaImpostazioni}>
            <label>Anno pastorale
              <input type="text" value={impostazioni.anno} placeholder="2026/2027"
                onChange={(e) => aggiorna("anno", e.target.value)} required />
            </label>
            <label>Durata del percorso
              <select value={impostazioni.durata} onChange={(e) => aggiorna("durata", e.target.value)}>
                <option value="2">2 anni</option>
                <option value="3">3 anni</option>
              </select>
            </label>
            <label>Apertura iscrizioni
              <input type="date" value={impostazioni.apertura} onChange={(e) => aggiorna("apertura", e.target.value)} />
            </label>
            <label>Chiusura iscrizioni
              <input type="date" value={impostazioni.chiusura} onChange={(e) => aggiorna("chiusura", e.target.value)} />
            </label>
            <div className="ars-sac-form-footer">
              <button type="submit" className="ars-sac-conferma">Verifica impostazioni</button>
              <small>Anteprima: i dati non sono ancora salvati nel database.</small>
            </div>
          </form>
          {messaggio && <p className="ars-sac-messaggio" role="status">{messaggio}</p>}
        </section>
      ) : (
        <section className="ars-sac-dettaglio">
          <h3>{sezioneAttiva.nome}</h3>
          <p>Questa funzione sarà attivata nelle prossime fasi.</p>
        </section>
      )}
    </main>
  );
}

const STILE = `
.ars-sacramenti-parroco{max-width:960px;margin:0 auto;padding:18px;color:#243c40}
.ars-sac-header{text-align:center;margin:14px 0 25px}
.ars-sac-header h2{font-family:Georgia,serif;font-size:2rem;color:#243c40;margin:0 0 8px}
.ars-sac-header p{color:#5f6d70;margin:0}
.ars-sac-indietro{border:1px solid #d8c9a8;background:#fffdf8;color:#594c36;border-radius:9px;padding:10px 15px;cursor:pointer}
.ars-sac-griglia{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:680px;margin:0 auto}
.ars-sac-card{min-width:0;min-height:205px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:19px 12px;border:1px solid #ddc99f;border-top:3px solid #c69a45;border-radius:15px;background:linear-gradient(155deg,#fffefa 0%,#fff8ea 100%);color:#243c40;cursor:pointer;box-shadow:0 4px 13px #4b39151c;transition:transform .15s ease,box-shadow .15s ease}
.ars-sac-card:hover{transform:translateY(-2px);box-shadow:0 7px 20px #4b39152b}
.ars-sac-card strong{font:700 1.28rem Georgia,serif;text-align:center}
.ars-sac-descrizione{font-size:.9rem;color:#687477;text-align:center;line-height:1.4}
.ars-sac-simbolo{display:flex;align-items:center;justify-content:center;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,#fffdf7 35%,#f7ecd5 100%);border:1px solid #ead7ad;color:#b98a31}
.ars-sac-simbolo svg{width:72px;height:72px}
.ars-sac-dettaglio{max-width:560px;margin:0 auto;text-align:center;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px;padding:30px 20px}
.ars-sac-simbolo-grande{width:110px;height:110px;margin:0 auto 16px}
.ars-sac-simbolo-grande svg{width:90px;height:90px}
.ars-sac-dettaglio h3{font:700 1.5rem Georgia,serif;margin:0 0 12px}
.ars-sac-dettaglio p{color:#5f6d70;margin:0}
.ars-sac-card:focus-visible,.ars-sac-indietro:focus-visible,.ars-sac-conferma:focus-visible{outline:3px solid #c58928;outline-offset:3px}
.ars-sac-griglia-sezioni{max-width:850px;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.ars-sac-card-sezione{min-height:166px;padding:18px 12px;gap:9px}
.ars-sac-card-sezione strong{font-size:1.1rem}
.ars-sac-numero{font:700 1.1rem Georgia,serif;color:#b98a31}
.ars-sac-etichetta{font-size:.75rem;color:#866222;border:1px solid #e6d5b4;border-radius:30px;padding:3px 10px}
.ars-sac-pannello{max-width:700px;margin:0 auto;padding:26px;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px}
.ars-sac-pannello h3{font:700 1.5rem Georgia,serif;margin:0 0 8px}
.ars-sac-pannello>p{color:#5f6d70;margin:0 0 22px;line-height:1.5}
.ars-sac-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.ars-sac-form label{display:flex;flex-direction:column;gap:7px;font-weight:600;font-size:.95rem}
.ars-sac-form input,.ars-sac-form select{box-sizing:border-box;width:100%;min-height:44px;border:1px solid #d8c9a8;border-radius:9px;background:white;color:#243c40;padding:10px;font:inherit}
.ars-sac-form-footer{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.ars-sac-conferma{border:0;border-radius:9px;background:#a67a29;color:white;padding:12px 18px;font-weight:700;cursor:pointer}
.ars-sac-form-footer small{color:#687477}
.ars-sac-messaggio{margin-top:16px!important;color:#5c4825!important;font-weight:600}
@media(max-width:650px){.ars-sacramenti-parroco{padding:12px}.ars-sac-griglia{gap:12px}.ars-sac-card{min-height:185px;padding:15px 8px}.ars-sac-card strong{font-size:1.08rem}.ars-sac-descrizione{font-size:.83rem}.ars-sac-header h2{font-size:1.65rem}.ars-sac-simbolo{width:78px;height:78px}.ars-sac-simbolo svg{width:65px;height:65px}.ars-sac-griglia-sezioni{grid-template-columns:repeat(2,minmax(0,1fr))}.ars-sac-card-sezione{min-height:150px}.ars-sac-pannello{padding:18px}.ars-sac-form{grid-template-columns:1fr}}
@media(max-width:380px){.ars-sac-griglia{grid-template-columns:1fr}.ars-sac-card{min-height:165px}}
`;
