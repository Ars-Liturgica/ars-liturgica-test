import React, { useState } from "react";

// Ars Liturgica — Sacramenti lato fedele.
// Struttura delle sottocard della Prima Comunione approvata il 6 novembre 2026.
// Questo file prepara la navigazione e i testi, senza simulare invii a Supabase.

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

const sottocardComunione = [
  { id: "iscrizioni", nome: "Iscrizioni e rinnovi", descrizione: "Domande, rinnovi e documenti", simbolo: "✎" },
  { id: "gruppo", nome: "Il mio gruppo", descrizione: "Dialogo con catechisti e parroco", simbolo: "☏" },
  { id: "calendario", nome: "Calendario del Catechismo", descrizione: "Incontri e scadenze del percorso", simbolo: "▦" },
  { id: "comunicazioni", nome: "Comunicazioni", descrizione: "Avvisi e informazioni", simbolo: "✉" },
  { id: "pagamenti", nome: "Quote e pagamenti", descrizione: "Situazione e ricevute", simbolo: "€" },
  { id: "celebrazioni", nome: "Celebrazioni", descrizione: "Preparazione e Prima Comunione", simbolo: "✝" },
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

function DettaglioSottocard({ sezione }) {
  switch (sezione) {
    case "iscrizioni":
      return (
        <>
          <p>Da qui le famiglie potranno presentare la domanda del primo anno, rinnovarla annualmente e consultare le proprie iscrizioni.</p>
          <div className="ars-sac-nota">
            <h4>Un account Ars Liturgica anche per tuo figlio</h4>
            <p>Durante l'iscrizione potrai autorizzare la creazione automatica di un account personale per tuo figlio, senza compilare altri moduli.</p>
            <p>L'account del ragazzo consentirà di <strong>consultare le sezioni dell'app a lui accessibili</strong> e di <strong>scrivere soltanto nello spazio di dialogo del proprio gruppo di Catechismo</strong>.</p>
            <h4>Uno spazio di dialogo seguito dalla parrocchia</h4>
            <p>Le conversazioni di gruppo si svolgeranno alla presenza dei catechisti autorizzati e del parroco. <strong>Non saranno possibili conversazioni private fra ragazzi.</strong> Le eventuali comunicazioni individuali dei responsabili con un minore saranno visibili anche al genitore o tutore.</p>
            <p>I dati personali riservati, i documenti e le informazioni familiari resteranno nell'area riservata del genitore e non saranno mostrati nell'account del ragazzo.</p>
          </div>
          <div className="ars-sac-consenso-preview">
            <label>
              <input type="checkbox" disabled />
              <span>Autorizzo la creazione dell'account Ars Liturgica per mio figlio, con le funzionalità limitate sopra descritte, e dichiaro di aver preso visione dell'informativa.</span>
            </label>
            <small>La spunta sarà attivata nel modulo definitivo. Il consenso alla creazione dell'account sarà distinto dalla presa visione dell'informativa privacy del Catechismo.</small>
          </div>
          <p className="ars-sac-prossimamente">Il modulo e l'elenco delle domande saranno disponibili dopo il collegamento sicuro a Supabase.</p>
        </>
      );
    case "gruppo":
      return <><p>Qui troverai il gruppo di Catechismo assegnato e lo spazio di dialogo condiviso con i catechisti e il parroco.</p><p>Ai ragazzi sarà consentito scrivere nel gruppo, ma non inviare messaggi privati ad altri ragazzi.</p><p className="ars-sac-prossimamente">Le conversazioni saranno attivate dopo la predisposizione dei gruppi e delle autorizzazioni.</p></>;
    case "calendario":
      return <><p>Un calendario dedicato <strong>esclusivamente al Catechismo</strong>: incontri, scadenze, riunioni con i genitori, ritiri e prove.</p><p>Gli appuntamenti saranno gestiti dal parroco e dai catechisti autorizzati. Genitori e ragazzi vedranno quelli del proprio gruppo.</p><p>Questo calendario è separato dal Calendario generale del fedele, che resta invariato.</p><p className="ars-sac-prossimamente">Gli appuntamenti saranno visualizzati qui non appena disponibili.</p></>;
    case "comunicazioni":
      return <><p>Avvisi e informazioni del Catechismo per le famiglie e i ragazzi del gruppo, pubblicati dai responsabili autorizzati.</p><p className="ars-sac-prossimamente">Le comunicazioni saranno visualizzate qui non appena disponibili.</p></>;
    case "pagamenti":
      return <><p>Qui il genitore potrà consultare le eventuali quote del Catechismo, lo stato dei pagamenti e le relative ricevute.</p><p>I ragazzi non avranno accesso alle funzioni di pagamento.</p><p className="ars-sac-prossimamente">La sezione sarà collegata al sistema dei pagamenti già esistente, senza duplicarlo.</p></>;
    case "celebrazioni":
      return <><p>Informazioni sulla preparazione alla Prima Comunione, le celebrazioni e gli appuntamenti collegati.</p><p className="ars-sac-prossimamente">Le informazioni saranno pubblicate dalla parrocchia.</p></>;
    default:
      return null;
  }
}

export default function SacramentiFedele({ tornaDashboard }) {
  const [scelto, setScelto] = useState(null);
  const [sottocardScelta, setSottocardScelta] = useState(null);
  const sacramento = sacramenti.find((s) => s.id === scelto);
  const sottocard = sottocardComunione.find((s) => s.id === sottocardScelta);

  const tornaIndietro = () => {
    if (sottocardScelta) { setSottocardScelta(null); return; }
    if (sacramento) { setScelto(null); return; }
    tornaDashboard?.();
  };

  return (
    <main className="ars-sacramenti-fedele" style={{ boxSizing: "border-box", width: "100%", minHeight: "100vh", backgroundColor: "#f7f3ed", color: "#243c40", isolation: "isolate" }}>
      <style>{STILE}</style>
      <button type="button" className="ars-sac-indietro" onClick={tornaIndietro}>
        ← {sottocardScelta ? "Prima Comunione" : sacramento ? "Tutti i Sacramenti" : "Torna alla dashboard"}
      </button>
      <header className="ars-sac-header">
        <h2>{sottocard ? sottocard.nome : sacramento ? sacramento.nome : "Sacramenti"}</h2>
        <p>{sottocard ? sottocard.descrizione : sacramento ? sacramento.descrizione : "Battesimo, Prima Comunione, Cresima e Matrimonio"}</p>
      </header>

      {!sacramento ? (
        <div className="ars-sac-griglia">
          {sacramenti.map((s) => (
            <button type="button" className="ars-sac-card" key={s.id} onClick={() => { setScelto(s.id); setSottocardScelta(null); }} aria-label={`${s.nome} — ${s.descrizione}`}>
              <span className="ars-sac-simbolo" aria-hidden="true"><Simbolo tipo={s.id} /></span>
              <strong>{s.nome}</strong>
              <span className="ars-sac-descrizione">{s.descrizione}</span>
            </button>
          ))}
        </div>
      ) : sacramento.id === "comunione" && !sottocard ? (
        <section aria-label="Funzioni Prima Comunione">
          <div className="ars-sac-griglia ars-sac-griglia-sottocard">
            {sottocardComunione.map((s) => (
              <button type="button" className="ars-sac-card ars-sac-card-sezione" key={s.id} onClick={() => setSottocardScelta(s.id)}>
                <span className="ars-sac-mini-simbolo" aria-hidden="true">{s.simbolo}</span>
                <strong>{s.nome}</strong>
                <span className="ars-sac-descrizione">{s.descrizione}</span>
              </button>
            ))}
          </div>
        </section>
      ) : sacramento.id === "comunione" && sottocard ? (
        <section className="ars-sac-pannello" aria-label={sottocard.nome}>
          <h3>{sottocard.nome}</h3>
          <DettaglioSottocard sezione={sottocard.id} />
        </section>
      ) : (
        <section className="ars-sac-dettaglio">
          <span className="ars-sac-simbolo ars-sac-simbolo-grande" aria-hidden="true"><Simbolo tipo={sacramento.id} /></span>
          <h3>{sacramento.nome}</h3>
          <p>Le informazioni su questo Sacramento saranno disponibili prossimamente.</p>
        </section>
      )}
    </main>
  );
}

const STILE = `
.ars-sacramenti-fedele{box-sizing:border-box;width:100%;min-height:100vh;max-width:none;margin:0;padding:32px max(18px,calc((100% - 960px)/2));background:#f7f3ed;color:#243c40}
.ars-sacramenti-fedele *{box-sizing:border-box}
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
.ars-sac-griglia-sottocard{max-width:760px;grid-template-columns:repeat(2,minmax(0,1fr))}
.ars-sac-card-sezione{min-height:170px;padding:20px 12px}
.ars-sac-mini-simbolo{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;font:700 1.7rem Georgia,serif;color:#b98a31;border:1px solid #ead7ad;background:#fff8e8}
.ars-sac-card-sezione strong{font-size:1.16rem}
.ars-sac-pannello{max-width:760px;margin:0 auto;padding:27px;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px;box-shadow:0 4px 13px #4b39110d}
.ars-sac-pannello h3{font:700 1.45rem Georgia,serif;color:#243c40;margin:0 0 15px}
.ars-sac-pannello p{color:#43585b;line-height:1.65;margin:0 0 14px}
.ars-sac-nota{padding:18px;background:#fbf5e9;border:1px solid #ead7ad;border-radius:12px;margin:18px 0}
.ars-sac-nota h4{font:700 1.14rem Georgia,serif;color:#72561e;margin:0 0 11px}
.ars-sac-nota h4:not(:first-child){margin-top:18px}
.ars-sac-consenso-preview{margin:18px 0;padding:16px;border:1px solid #dfcfac;border-radius:11px;background:#fffefa}
.ars-sac-consenso-preview label{display:flex;align-items:flex-start;gap:11px;line-height:1.55;color:#243c40}
.ars-sac-consenso-preview input{margin-top:5px;accent-color:#b98a31;flex:0 0 auto}
.ars-sac-consenso-preview small{display:block;color:#687477;margin:12px 0 0;line-height:1.5}
.ars-sac-pannello .ars-sac-prossimamente{padding:13px 15px;background:#f4f0e8;border-radius:9px;color:#647072;font-size:.94rem;margin-top:18px}
.ars-sac-card:focus-visible,.ars-sac-indietro:focus-visible{outline:3px solid #c58928;outline-offset:3px}
@media(max-width:650px){.ars-sacramenti-fedele{padding:12px}.ars-sac-griglia{gap:12px}.ars-sac-card{min-height:185px;padding:15px 8px}.ars-sac-card strong{font-size:1.08rem}.ars-sac-descrizione{font-size:.83rem}.ars-sac-header h2{font-size:1.65rem}.ars-sac-simbolo{width:78px;height:78px}.ars-sac-simbolo svg{width:65px;height:65px}.ars-sac-card-sezione{min-height:160px}.ars-sac-card-sezione strong{font-size:1rem}.ars-sac-pannello{padding:18px}}
@media(max-width:380px){.ars-sac-griglia{grid-template-columns:1fr}.ars-sac-card{min-height:165px}.ars-sac-card-sezione{min-height:145px}}
`;
