import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

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
  informazioni: "",
  date: { 1: { apertura: "", chiusura: "" }, 2: { apertura: "", chiusura: "" }, 3: { apertura: "", chiusura: "" } },
};

export default function SacramentiParroco({ tornaDashboard, nomeParrocchia = "", parrocchiaId }) {
  const [scelto, setScelto] = useState(null);
  const [sezione, setSezione] = useState(null);
  const [impostazioni, setImpostazioni] = useState(impostazioniIniziali);
  const [messaggio, setMessaggio] = useState("");
  const [salvato, setSalvato] = useState(false);
  const [modifica, setModifica] = useState(true);
  const [anteprima, setAnteprima] = useState(false);
  const [caricamento, setCaricamento] = useState(false);
  const [operazione, setOperazione] = useState(false);

  useEffect(() => {
    let attivo = true;
    setSalvato(false);
    setModifica(true);
    setAnteprima(false);
    setImpostazioni({ ...impostazioniIniziali, date: { 1: { apertura: "", chiusura: "" }, 2: { apertura: "", chiusura: "" }, 3: { apertura: "", chiusura: "" } } });
    if (!parrocchiaId) return;
    async function carica() {
      setCaricamento(true);
      const { data, error } = await supabase.from("ars_comunione_impostazioni")
        .select("anno_pastorale, durata, date_iscrizioni, informazioni")
        .eq("parrocchia_id", parrocchiaId).maybeSingle();
      if (!attivo) return;
      setCaricamento(false);
      if (error) { setMessaggio("Impossibile caricare le impostazioni: " + error.message); return; }
      if (data) {
        setImpostazioni({ anno: data.anno_pastorale, durata: String(data.durata),
          informazioni: data.informazioni || "",
          date: { 1: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[1] || {}) },
            2: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[2] || {}) },
            3: { apertura: "", chiusura: "", ...(data.date_iscrizioni?.[3] || {}) } } });
        setSalvato(true);
        setModifica(false);
      }
    }
    carica();
    return () => { attivo = false; };
  }, [parrocchiaId]);
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

  function aggiornaData(anno, campo, valore) {
    setImpostazioni((precedenti) => ({
      ...precedenti,
      date: { ...precedenti.date, [anno]: { ...precedenti.date[anno], [campo]: valore } },
    }));
    setMessaggio("");
  }

  function controllaImpostazioni() {
    if (!/^\d{4}\/\d{4}$/.test(impostazioni.anno)) return "Inserisci l'anno pastorale nel formato 2026/2027.";
    const [inizio, fine] = impostazioni.anno.split("/").map(Number);
    if (fine !== inizio + 1) return "L'anno pastorale deve comprendere due anni consecutivi.";
    for (let anno = 1; anno <= Number(impostazioni.durata); anno++) {
      const { apertura, chiusura } = impostazioni.date[anno];
      if (apertura && chiusura && chiusura < apertura) return `Per il ${anno}° anno la chiusura precede l'apertura.`;
    }
    return "";
  }

  async function salvaImpostazioni(e) {
    e.preventDefault();
    if (!modifica || operazione) return;
    const errore = controllaImpostazioni();
    if (errore) { setMessaggio(errore); return; }
    if (!parrocchiaId) { setMessaggio("Parrocchia non disponibile: torna alla dashboard e riprova."); return; }
    setOperazione(true);
    const { error } = await supabase.from("ars_comunione_impostazioni").upsert({
      parrocchia_id: parrocchiaId,
      anno_pastorale: impostazioni.anno,
      durata: Number(impostazioni.durata),
      date_iscrizioni: impostazioni.date,
      informazioni: impostazioni.informazioni,
      aggiornato_il: new Date().toISOString(),
    }, { onConflict: "parrocchia_id" });
    setOperazione(false);
    if (error) { setMessaggio("Salvataggio non riuscito: " + error.message); return; }
    setSalvato(true);
    setModifica(false);
    setMessaggio("Impostazioni salvate correttamente.");
  }

  function stampaVolantino() {
    const errore = controllaImpostazioni();
    if (errore) { setMessaggio(errore); return; }
    if (!nomeParrocchia.trim()) {
      setMessaggio("Nome della parrocchia non disponibile. Riprova dalla dashboard.");
      return;
    }
    setAnteprima(true);
    setMessaggio("");
    window.setTimeout(() => window.print(), 50);
  }

  function formattaData(valore) {
    if (!valore) return "Da definire";
    const [anno, mese, giorno] = valore.split("-");
    return `${giorno}/${mese}/${anno}`;
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
          <p>Definisci l'anno pastorale e le date delle iscrizioni per ciascun anno di catechismo.</p>
          <form className="ars-sac-form" onSubmit={salvaImpostazioni}>
            <fieldset className="ars-sac-campi" disabled={!modifica || caricamento || operazione}>
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
            {[1, 2, 3].map((anno) => (
              <fieldset className="ars-sac-anno" key={anno} disabled={anno > Number(impostazioni.durata)}>
                <legend>{anno}° anno {anno > Number(impostazioni.durata) ? "(non previsto)" : ""}</legend>
                <div className="ars-sac-date">
                  <label>Apertura iscrizioni
                    <input type="date" value={impostazioni.date[anno].apertura}
                      onChange={(e) => aggiornaData(anno, "apertura", e.target.value)} />
                  </label>
                  <label>Chiusura iscrizioni
                    <input type="date" value={impostazioni.date[anno].chiusura}
                      onChange={(e) => aggiornaData(anno, "chiusura", e.target.value)} />
                  </label>
                </div>
              </fieldset>
            ))}
            <label className="ars-sac-intera">Informazioni e istruzioni per le famiglie
              <textarea rows="6" value={impostazioni.informazioni}
                placeholder="Orari, documenti necessari, incontri informativi e altre comunicazioni..."
                onChange={(e) => aggiorna("informazioni", e.target.value)} />
            </label>
            </fieldset>
            <div className="ars-sac-form-footer">
              <div className="ars-sac-azioni">
                {modifica ? <button type="submit" className="ars-sac-conferma" disabled={caricamento || operazione}>{operazione ? "Salvataggio..." : salvato ? "Salva modifiche" : "Salva impostazioni"}</button>
                  : <button type="button" className="ars-sac-conferma" onClick={() => { setModifica(true); setMessaggio(""); }}>Modifica impostazioni</button>}
                <button type="button" className="ars-sac-stampa" onClick={() => setAnteprima((v) => !v)}>{anteprima ? "Chiudi anteprima" : "Anteprima volantino"}</button>
                {anteprima && <button type="button" className="ars-sac-stampa" onClick={stampaVolantino}>Stampa volantino</button>}
              </div>
            </div>
          </form>
          {messaggio && <p className="ars-sac-messaggio" role="status">{messaggio}</p>}
          <div className={`ars-sac-volantino ${anteprima ? "" : "ars-sac-volantino-nascosto"}`} aria-label="Volantino per le famiglie">
            <div className="ars-sac-volantino-interno">
              <div className="ars-sac-volantino-parrocchia">{nomeParrocchia ? `Parrocchia ${nomeParrocchia.replace(/^parrocchia\s+/i, "")}` : "Parrocchia"}</div>
              <div className="ars-sac-volantino-simbolo"><Simbolo tipo="comunione" /></div>
              <h1>Prima Comunione</h1>
              <h2>Anno catechistico {impostazioni.anno}</h2>
              <div className="ars-sac-volantino-linea" />
              <h3>Iscrizioni al catechismo</h3>
              {[1, 2, 3].filter((anno) => anno <= Number(impostazioni.durata)).map((anno) => (
                <div className="ars-sac-volantino-anno" key={anno}>
                  <strong>{anno}° anno</strong>
                  <span>Apertura: {formattaData(impostazioni.date[anno].apertura)}</span>
                  <span>Chiusura: {formattaData(impostazioni.date[anno].chiusura)}</span>
                </div>
              ))}
              {impostazioni.informazioni.trim() && <div className="ars-sac-volantino-info">
                <h3>Informazioni per le famiglie</h3>
                <p>{impostazioni.informazioni}</p>
              </div>}
              <div className="ars-sac-volantino-fine">La comunità parrocchiale vi aspetta</div>
            </div>
          </div>
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
.ars-sac-campi{display:contents;border:0;padding:0;margin:0;min-width:0}
.ars-sac-campi:disabled input,.ars-sac-campi:disabled select,.ars-sac-campi:disabled textarea{background:#f7f6f2;color:#35494b;opacity:1}
.ars-sac-form label{display:flex;flex-direction:column;gap:7px;font-weight:600;font-size:.95rem}
.ars-sac-form input,.ars-sac-form select,.ars-sac-form textarea{box-sizing:border-box;width:100%;min-height:44px;border:1px solid #d8c9a8;border-radius:9px;background:white;color:#243c40;padding:10px;font:inherit}
.ars-sac-form textarea{resize:vertical;line-height:1.5}
.ars-sac-intera{grid-column:1/-1}
.ars-sac-anno{grid-column:1/-1;min-width:0;border:1px solid #e2d2b3;border-radius:11px;padding:14px;margin:0}
.ars-sac-anno legend{font-weight:700;color:#594c36;padding:0 7px}
.ars-sac-anno:disabled{opacity:.48}
.ars-sac-date{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.ars-sac-azioni{display:flex;gap:10px;flex-wrap:wrap}
.ars-sac-stampa{border:1px solid #a67a29;border-radius:9px;background:white;color:#795a24;padding:12px 18px;font-weight:700;cursor:pointer}
.ars-sac-volantino{margin:28px auto 0;max-width:560px;background:#fff;color:#111;padding:12px;box-shadow:0 2px 12px #00000016}
.ars-sac-volantino-nascosto{display:none}
.ars-sac-volantino-interno{border:1px solid #777;padding:26px 30px;text-align:center;font-family:Georgia,serif;background:#fff}
.ars-sac-volantino-parrocchia{font-size:1.35rem;font-weight:bold;margin:4px 0 12px;overflow-wrap:anywhere}
.ars-sac-volantino-simbolo{color:#222;display:flex;justify-content:center}
.ars-sac-volantino-simbolo svg{width:75px;height:75px}
.ars-sac-volantino h1{font-size:2rem;margin:7px 0;color:#111}
.ars-sac-volantino h2{font-size:1.12rem;margin:0 0 16px;color:#222}
.ars-sac-volantino h3{font-size:1.15rem;margin:14px 0;color:#111}
.ars-sac-volantino-linea{height:1px;background:#999;margin:12px 0}
.ars-sac-volantino-anno{display:grid;grid-template-columns:90px 1fr 1fr;gap:6px;text-align:left;border-bottom:1px solid #ddd;padding:10px 0;font:14px Arial,sans-serif}
.ars-sac-volantino-info{text-align:left;margin-top:20px;overflow-wrap:anywhere}
.ars-sac-volantino-info p{white-space:pre-wrap;line-height:1.5;font:14px/1.5 Arial,sans-serif;color:#111}
.ars-sac-volantino-fine{margin-top:25px;font-style:italic;font-size:13px}
.ars-sac-form-footer{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.ars-sac-conferma{border:0;border-radius:9px;background:#a67a29;color:white;padding:12px 18px;font-weight:700;cursor:pointer}
.ars-sac-form-footer small{color:#687477}
.ars-sac-messaggio{margin-top:16px!important;color:#5c4825!important;font-weight:600}
@media print{
  @page{size:A4;margin:12mm}
  body *{visibility:hidden!important}
  .ars-sac-volantino,.ars-sac-volantino *{visibility:visible!important}
  .ars-sac-volantino-nascosto{display:none!important}
  .ars-sac-volantino{position:absolute;left:0;top:0;width:100%;max-width:none;box-sizing:border-box;margin:0;padding:0;box-shadow:none!important;background:#fff!important;color:#111!important}
  .ars-sac-volantino-interno{min-height:255mm;box-sizing:border-box;border:1px solid #777;padding:18mm 15mm;break-inside:avoid}
  .ars-sac-volantino-anno,.ars-sac-volantino-info{break-inside:avoid}
}
@media(max-width:650px){.ars-sacramenti-parroco{padding:12px}.ars-sac-griglia{gap:12px}.ars-sac-card{min-height:185px;padding:15px 8px}.ars-sac-card strong{font-size:1.08rem}.ars-sac-descrizione{font-size:.83rem}.ars-sac-header h2{font-size:1.65rem}.ars-sac-simbolo{width:78px;height:78px}.ars-sac-simbolo svg{width:65px;height:65px}.ars-sac-griglia-sezioni{grid-template-columns:repeat(2,minmax(0,1fr))}.ars-sac-card-sezione{min-height:150px}.ars-sac-pannello{padding:18px}.ars-sac-form{grid-template-columns:1fr}.ars-sac-date{grid-template-columns:1fr}.ars-sac-volantino-interno{padding:15px}.ars-sac-volantino-anno{grid-template-columns:1fr;gap:4px}}
@media(max-width:380px){.ars-sac-griglia{grid-template-columns:1fr}.ars-sac-card{min-height:165px}}
`;
