
import React from "react";

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
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("it-IT");
}

function importoIt(valore, valuta = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: valuta || "EUR",
  }).format(Number(valore || 0));
}

export default function AnteprimaDocumentoEconomico({
  documento,
  nomeParrocchia = "",
  onChiudi,
}) {
  if (!documento) return null;

  const dati = documento.dati_documento || {};
  const titolo =
    ETICHETTE[documento.tipo_documento] ||
    "Documento economico";

  const righe = [
    ["Iscritto", dati.iscritto],
    ["Genitore", dati.genitore],
    ["Donatore", dati.donatore],
    ["Nominativo", documento.nominativo],
    ["Causale", documento.causale],
    ["Tipo pagamento", dati.tipo_pagamento],
    [
      "Quota dovuta",
      dati.quota_dovuta != null
        ? importoIt(dati.quota_dovuta, documento.valuta)
        : null,
    ],
    [
      "Residuo",
      dati.residuo != null
        ? importoIt(dati.residuo, documento.valuta)
        : null,
    ],
  ].filter(([, valore]) =>
    valore != null &&
    String(valore).trim() !== "" &&
    valore !== "DA_DETERMINARE"
  );

  function stampa() {
    window.print();
  }

  return (
    <div className="ars-anteprima-overlay">
      <style>{`
        .ars-anteprima-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(30, 35, 40, .65);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow-y: auto;
          padding: 25px 12px;
        }
        .ars-anteprima-foglio {
          width: min(100%, 680px);
          box-sizing: border-box;
          background: #fffdf8;
          border-radius: 14px;
          padding: 30px;
          color: #263747;
          box-shadow: 0 8px 35px rgba(0,0,0,.18);
        }
        .ars-anteprima-foglio h2 {
          color: #806026;
          margin: 10px 0;
        }
        .ars-anteprima-conferma {
          background: #edf5ec;
          border-radius: 9px;
          padding: 13px;
          margin-bottom: 22px;
        }
        .ars-anteprima-riga {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px solid #e8dfd0;
        }
        .ars-anteprima-riga span:last-child {
          text-align: right;
          overflow-wrap: anywhere;
        }
        .ars-anteprima-importo {
          font-size: 27px;
          font-weight: bold;
          margin: 24px 0;
        }
        .ars-anteprima-azioni {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .ars-anteprima-azioni button {
          background: #fff5e3;
          border: 1px solid #c69b4c;
          border-radius: 9px;
          padding: 12px 16px;
          cursor: pointer;
          color: #263747;
          font: inherit;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .ars-anteprima-foglio,
          .ars-anteprima-foglio * {
            visibility: visible !important;
          }
          .ars-anteprima-overlay {
            position: absolute;
            inset: 0;
            display: block;
            padding: 0;
            overflow: visible;
            background: white;
          }
          .ars-anteprima-foglio {
            width: 100%;
            box-shadow: none;
            padding: 0;
          }
          .ars-anteprima-azioni,
          .ars-anteprima-conferma,
          .ars-anteprima-nota {
            display: none !important;
          }
        }
      `}</style>

      <section
        className="ars-anteprima-foglio"
        role="dialog"
        aria-modal="true"
        aria-label="Documento economico generato"
      >
        <div
          className="ars-anteprima-conferma"
          role="status"
        >
          <strong>✓ Documento generato correttamente</strong>
          <p>
            Il documento è stato salvato automaticamente
            nell'archivio.
          </p>
        </div>

        <header>
          <p>{nomeParrocchia || "Parrocchia"}</p>
          <h2>{titolo}</h2>
          <p>
            N. {documento.numero}/{documento.anno}
            {" · "}
            {dataIt(documento.data_documento)}
          </p>
        </header>

        {righe.map(([etichetta, valore]) => (
          <div className="ars-anteprima-riga" key={etichetta}>
            <strong>{etichetta}</strong>
            <span>{valore}</span>
          </div>
        ))}

        <p className="ars-anteprima-importo">
          {importoIt(documento.importo, documento.valuta)}
        </p>

        <p style={{ fontSize: 12 }}>
          Documento gestionale. L'eventuale validità fiscale
          dipende dalla natura dell'operazione.
        </p>

        <p className="ars-anteprima-nota">
          Potrai consultare e ristampare questo documento
          in qualsiasi momento dall'Archivio Documenti.
        </p>

        <div className="ars-anteprima-azioni">
          <button type="button" onClick={stampa}>
            🖨 Stampa / Salva PDF
          </button>

          <button type="button" onClick={onChiudi}>
            ✓ Chiudi e archivia
          </button>
        </div>
      </section>
    </div>
  );
}
