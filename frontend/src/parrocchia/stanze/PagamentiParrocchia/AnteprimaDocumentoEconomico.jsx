import React, { useRef } from "react";

const ETICHETTE = {
  ricevuta: "Ricevuta",
  uscita: "Documento di uscita",
  rimborso: "Rimborso",
  storno: "Storno",
  conversione_donazione: "Conversione in donazione",
};

function dataIt(valore) {
  if (!valore) return "—";
  const d = new Date(valore);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("it-IT");
}

function importoIt(valore, valuta = "EUR") {
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency", currency: valuta || "EUR",
    }).format(Number(valore || 0));
  } catch {
    return `${Number(valore || 0).toFixed(2)} ${valuta || "EUR"}`;
  }
}

// Disegno vettoriale incorporato: nessuna immagine esterna o dipendenza.
function Chiesa({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#222" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 106H108M22 106V51L60 27L98 51V106" />
        <path d="M17 53L60 24L103 53M31 106V56L60 38L89 56V106" />
        <path d="M49 106V80C49 65 71 65 71 80V106" />
        <path d="M60 11V29M52 18H68" />
        <path d="M37 65H44V76H37zM76 65H83V76H76z" />
        <path d="M59 85H61" />
        <path d="M8 111H112" />
      </g>
    </svg>
  );
}

const STILI_DOCUMENTO = `
  .ars-doc-a4 { box-sizing:border-box; width:100%; color:#222; background:#fff;
    font-family:Georgia,"Times New Roman",serif; font-size:12pt; line-height:1.35; }
  .ars-doc-testata { display:flex; align-items:center; gap:18px;
    padding-bottom:16px; border-bottom:1.5px solid #333; }
  .ars-doc-testata svg { flex-shrink:0; }
  .ars-doc-parrocchia { font-size:17pt; font-weight:700; margin:0 0 5px; overflow-wrap:anywhere; }
  .ars-doc-titolo { font-size:20pt; font-weight:700; margin:24px 0 4px; }
  .ars-doc-numero { margin:0 0 22px; font-size:11pt; }
  .ars-doc-riga { display:flex; justify-content:space-between; align-items:baseline;
    gap:18px; padding:8px 0; border-bottom:1px solid #ddd; break-inside:avoid; }
  .ars-doc-riga strong { flex:0 0 35%; }
  .ars-doc-riga span { text-align:right; overflow-wrap:anywhere; min-width:0; }
  .ars-doc-importo { font-size:21pt; font-weight:700; margin:28px 0; }
  .ars-doc-legenda { font-size:9pt; margin-top:25px; }
  @page { size:A4 portrait; margin:17mm; }
`;

export default function AnteprimaDocumentoEconomico({
  documento, nomeParrocchia = "", onChiudi,
}) {
  const documentoRef = useRef(null);
  if (!documento) return null;

  const dati = documento.dati_documento || {};
  const titolo = ETICHETTE[documento.tipo_documento] || "Documento economico";
  const righe = [
    ["Iscritto", dati.iscritto],
    ["Genitore", dati.genitore],
    ["Donatore", dati.donatore],
    ["Nominativo", documento.nominativo],
    ["Causale", documento.causale],
    ["Tipo pagamento", dati.tipo_pagamento],
    ["Quota dovuta", dati.quota_dovuta != null ? importoIt(dati.quota_dovuta, documento.valuta) : null],
    ["Residuo", dati.residuo != null ? importoIt(dati.residuo, documento.valuta) : null],
  ].filter(([, valore]) => valore != null && String(valore).trim() !== "" && valore !== "DA_DETERMINARE");

  function stampa() {
    if (!documentoRef.current) return;
    // Una finestra con SOLO il documento, senza gli elementi della dashboard.
    const finestra = window.open("", "_blank");
    if (!finestra) {
      window.alert("Consenti le finestre popup per stampare o salvare il PDF.");
      return;
    }
    const contenuto = documentoRef.current.outerHTML;
    finestra.document.open();
    finestra.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${titolo.replace(/&/g,"&amp;").replace(/</g,"&lt;")} ${String(documento.numero ?? "").replace(/[^0-9A-Za-z-]/g, "")}/${String(documento.anno ?? "").replace(/[^0-9A-Za-z-]/g, "")}</title>
      <style>${STILI_DOCUMENTO}body{margin:0;padding:17mm;box-sizing:border-box}
      @media print{body{padding:0} .ars-doc-a4{width:100%}}</style></head><body>${contenuto}</body></html>`);
    finestra.document.close();
    finestra.focus();
    // La finestra resta aperta: l'utente può stampare o salvare come PDF.
    finestra.setTimeout(() => finestra.print(), 250);
  }

  return (
    <div className="ars-anteprima-overlay" role="presentation">
      <style>{`
        ${STILI_DOCUMENTO}
        .ars-anteprima-overlay { position:fixed; inset:0; z-index:9999;
          background:rgba(30,35,40,.65); overflow-y:auto; padding:22px 12px;
          display:flex; justify-content:center; align-items:flex-start; box-sizing:border-box; }
        .ars-anteprima-contenitore { width:min(100%,740px); background:white;
          border-radius:12px; padding:28px; box-sizing:border-box; box-shadow:0 8px 35px #0003; }
        .ars-anteprima-avviso { font:14px Arial,sans-serif; background:#f2f4f1;
          padding:12px; border-radius:7px; margin-bottom:20px; color:#243746; }
        .ars-anteprima-azioni { display:flex; flex-wrap:wrap; gap:12px; margin-top:24px; }
        .ars-anteprima-azioni button { font:inherit; cursor:pointer; border-radius:8px;
          border:1px solid #b68b43; padding:11px 16px; background:#fff8ec; color:#243746; }
        @media print { .ars-anteprima-overlay { display:none!important; } }
      `}</style>
      <section className="ars-anteprima-contenitore" role="dialog" aria-modal="true"
        aria-label={`${titolo} già archiviato`}>
        <div className="ars-anteprima-avviso" role="status">
          Documento archiviato · Consultazione e ristampa dell'originale.
        </div>
        <article className="ars-doc-a4" ref={documentoRef}>
          <header className="ars-doc-testata">
            <Chiesa size={100} />
            <p className="ars-doc-parrocchia">{nomeParrocchia || "Parrocchia"}</p>
          </header>
          <h2 className="ars-doc-titolo">{titolo}</h2>
          <p className="ars-doc-numero">N. {documento.numero}/{documento.anno} · {dataIt(documento.data_documento)}</p>
          {righe.map(([etichetta, valore]) => (
            <div className="ars-doc-riga" key={etichetta}>
              <strong>{etichetta}</strong><span>{valore}</span>
            </div>
          ))}
          <p className="ars-doc-importo">{importoIt(documento.importo, documento.valuta)}</p>
          <p className="ars-doc-legenda">
            Documento gestionale. L'eventuale validità fiscale dipende dalla natura dell'operazione.
          </p>
        </article>
        <div className="ars-anteprima-azioni">
          <button type="button" onClick={stampa}>Stampa / Salva PDF</button>
          <button type="button" onClick={onChiudi}>Chiudi</button>
        </div>
      </section>
    </div>
  );
}
