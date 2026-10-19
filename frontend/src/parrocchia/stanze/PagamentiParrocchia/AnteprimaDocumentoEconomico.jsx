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
function Chiesa({ size = 170 }) {
  return (
    <svg width={size} height={Math.round(size * 0.82)} viewBox="0 0 220 180"
      fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Facciata di chiesa classica con campanile">
      <g stroke="#242424" strokeWidth="1.65" strokeLinejoin="round" strokeLinecap="round">
        {/* Basilica: timpano, colonne, rosone, portale */}
        <path d="M45 162V69L116 30L187 69V162 M39 70L116 24L193 70"/>
        <path d="M52 70H180M62 78V160M170 78V160M45 160H189"/>
        <path d="M71 84V147M80 84V147M151 84V147M160 84V147"/>
        <path d="M66 83H85M146 83H165M66 149H85M146 149H165"/>
        <circle cx="116" cy="82" r="18"/><circle cx="116" cy="82" r="13"/>
        <path d="M98 82H134M116 64V100M103 69L129 95M129 69L103 95" strokeWidth="1"/>
        <path d="M97 162V127A19 19 0 0 1 135 127V162Z"/>
        <path d="M116 109V161M99 160H133M91 162H141"/>
        <path d="M105 42H127M111 35H121M116 14V31M110 20H122"/>
        {/* Campanile sul lato sinistro, più alto della facciata */}
        <path d="M9 162V51H40V162M5 51H44L39 43H10Z"/>
        <path d="M9 43L24 21L40 43M24 8V21M18 14H30"/>
        <path d="M16 63H33V87H16ZM16 99H33V124H16Z"/>
        <path d="M24.5 63V87M24.5 99V124M9 133H40M5 162H44"/>
        {/* Gradini e pietra architettonica */}
        <path d="M2 168H202M0 174H211M53 110H64M168 110H181"/>
      </g>
    </svg>
  );
}

const STILI_DOCUMENTO = `
  .ars-doc-a4 { box-sizing:border-box; width:100%; color:#222; background:#fff;
    font-family:Georgia,"Times New Roman",serif; font-size:12pt; line-height:1.35; }
  .ars-doc-testata { display:flex; align-items:center; gap:25px; min-height:150px;
    padding-bottom:20px; border-bottom:1.5px solid #333; }
  .ars-doc-testata svg { flex-shrink:0; }
  .ars-doc-parrocchia { font-size:19pt; font-weight:700; margin:0 0 5px; overflow-wrap:anywhere; }
  .ars-doc-titolo { font-size:23pt; font-weight:700; margin:34px 0 7px; }
  .ars-doc-numero { margin:0 0 30px; font-size:11pt; }
  .ars-doc-riga { display:flex; justify-content:space-between; align-items:baseline;
    gap:18px; padding:12px 0; border-bottom:1px solid #ddd; break-inside:avoid; }
  .ars-doc-riga strong { flex:0 0 35%; }
  .ars-doc-riga span { text-align:right; overflow-wrap:anywhere; min-width:0; }
  .ars-doc-importo { font-size:25pt; font-weight:700; margin:38px 0; }
  .ars-doc-contatti { font-size:10pt; margin:4px 0; line-height:1.45; overflow-wrap:anywhere; }
  .ars-doc-intestazione { min-width:0; }
  .ars-doc-riga span:empty::after { content:"\\00a0"; }
  .ars-doc-firma { margin-top:48px; margin-left:auto; width:48%; text-align:center; break-inside:avoid; }
  .ars-doc-firma-titolo { font-size:12pt; font-weight:bold; margin:0 0 8px; }
  .ars-doc-firma-nome { font-size:12pt; margin:0 0 30px; overflow-wrap:anywhere; }
  .ars-doc-firma-linea { border-top:1px solid #777; width:85%; margin:0 auto; }
  .ars-doc-legenda { font-size:9pt; margin-top:30px; }
  @page { size:A4 portrait; margin:17mm; }
`;

export default function AnteprimaDocumentoEconomico({
  documento, nomeParrocchia = "", indirizzoParrocchia = "",
  telefonoParrocchia = "", emailParrocchia = "",
  codiceFiscaleParrocchia = "", partitaIvaParrocchia = "",
  parrocchia = null, onChiudi,
}) {
  const documentoRef = useRef(null);
  if (!documento) return null;

  const dati = documento.dati_documento || {};
  const titolo = ETICHETTE[documento.tipo_documento] || "Documento economico";
  // Si usano soltanto dati effettivamente presenti nel documento archiviato.
  const primo = (...valori) => valori.find(v =>
    v != null && String(v).trim() !== "" && String(v) !== "DA_DETERMINARE"
  );
  const nomeParrocchiaEffettivo = primo(nomeParrocchia, parrocchia?.nome, dati.nome_parrocchia, dati.parrocchia_nome) || "";
  const indirizzoEffettivo = primo(indirizzoParrocchia, parrocchia?.indirizzo, dati.indirizzo_parrocchia) || "";
  const telefonoEffettivo = primo(telefonoParrocchia, parrocchia?.telefono, dati.telefono_parrocchia) || "";
  const emailEffettiva = primo(emailParrocchia, parrocchia?.email, dati.email_parrocchia) || "";
  const cfEffettivo = primo(codiceFiscaleParrocchia, parrocchia?.codice_fiscale, dati.codice_fiscale_parrocchia) || "";
  const pivaEffettiva = primo(partitaIvaParrocchia, parrocchia?.partita_iva, dati.partita_iva_parrocchia) || "";
  const iscritto = primo(dati.iscritto, dati.partecipante, dati.nome_iscritto);
  const pagante = primo(dati.pagante, dati.nome_pagante, dati.genitore, dati.donatore,
    !iscritto ? documento.nominativo : null);
  const righe = [
    ["Pagante", pagante],
    ["Persona iscritta", iscritto],
    ["Intestatario documento", iscritto && documento.nominativo && documento.nominativo !== pagante
      && documento.nominativo !== iscritto ? documento.nominativo : null],
    ["Attività", primo(dati.attivita, dati.nome_attivita, dati.titolo_attivita)],
    ["Causale", documento.causale],
    ["Metodo di pagamento", primo(dati.metodo_pagamento, dati.tipo_pagamento)],
    ["Quota dovuta", dati.quota_dovuta != null ? importoIt(dati.quota_dovuta, documento.valuta) : null],
    ["Residuo", dati.residuo != null ? importoIt(dati.residuo, documento.valuta) : null],
  ];

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
            <Chiesa size={170} />
            <div className="ars-doc-intestazione">
              <p className="ars-doc-parrocchia">{nomeParrocchiaEffettivo || "Parrocchia"}</p>
              {indirizzoEffettivo && <p className="ars-doc-contatti">{indirizzoEffettivo}</p>}
              {telefonoEffettivo && <p className="ars-doc-contatti">Tel. {telefonoEffettivo}</p>}
              {emailEffettiva && <p className="ars-doc-contatti">Email: {emailEffettiva}</p>}
              {cfEffettivo && <p className="ars-doc-contatti">C.F. {cfEffettivo}</p>}
              {pivaEffettiva && <p className="ars-doc-contatti">P. IVA {pivaEffettiva}</p>}
            </div>
          </header>
          <h2 className="ars-doc-titolo">{titolo}</h2>
          <p className="ars-doc-numero">N. {documento.numero}/{documento.anno} · {dataIt(documento.data_documento)}</p>
          {righe.map(([etichetta, valore]) => (
            <div className="ars-doc-riga" key={etichetta}>
              <strong>{etichetta}</strong><span>{valore ?? ""}</span>
            </div>
          ))}
          <p className="ars-doc-importo">{importoIt(documento.importo, documento.valuta)}</p>
          <footer className="ars-doc-firma">
            <p className="ars-doc-firma-titolo">La Parrocchia</p>
            <p className="ars-doc-firma-nome">{nomeParrocchiaEffettivo}</p>
            <div className="ars-doc-firma-linea" aria-hidden="true" />
          </footer>
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
