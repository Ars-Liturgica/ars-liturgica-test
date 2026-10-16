
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

const TIPI = {
  ricevuta: "Ricevuta",
  uscita: "Documento di uscita",
  rimborso: "Rimborso",
  storno: "Storno",
  conversione_donazione: "Conversione in donazione",
};

const testo = (v) => String(v ?? "").trim();

const euro = (v, valuta = "EUR") => {
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: valuta || "EUR",
    }).format(Number(v || 0));
  } catch {
    return `${v} ${valuta}`;
  }
};

const dataIt = (v) =>
  v ? new Date(v).toLocaleDateString("it-IT") : "—";

const pulisci = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

function stampaDocumento(doc, nomeParrocchia) {
  const d = doc.dati_documento || {};
  const titolo = TIPI[doc.tipo_documento] || "Documento economico";
  const riferimento = `${doc.numero}/${doc.anno}`;
  const righe = [
    ["Iscritto", d.iscritto],
    ["Genitore", d.genitore],
    ["Donatore", d.donatore],
    ["Nominativo", doc.nominativo],
    ["Tipo pagamento", d.tipo_pagamento],
    ["Quota dovuta", d.quota_dovuta != null
      ? euro(d.quota_dovuta, doc.valuta) : null],
    ["Residuo", d.residuo != null
      ? euro(d.residuo, doc.valuta) : null],
  ].filter(([, valore]) =>
    valore != null &&
    testo(valore) !== "" &&
    valore !== "DA_DETERMINARE"
  );

  const finestra = window.open("", "_blank");
  if (!finestra) {
    throw new Error("Consenti l'apertura della finestra di stampa.");
  }

  finestra.opener = null;
  finestra.document.write(`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>${pulisci(titolo)} ${pulisci(riferimento)}</title>
<style>
body {
  font-family: Georgia, serif;
  color: #263747;
  max-width: 760px;
  margin: 40px auto;
  padding: 0 24px;
}
header { border-bottom: 2px solid #c69b4c; padding-bottom: 20px; }
h1 { font-size: 25px; margin-bottom: 6px; }
h2 { font-size: 20px; }
p { line-height: 1.6; }
table { width: 100%; border-collapse: collapse; margin-top: 24px; }
td { padding: 11px; border-bottom: 1px solid #ddd; }
td:first-child { font-weight: bold; width: 35%; }
.importo { font-size: 27px; font-weight: bold; margin-top: 28px; }
.nota { color: #666; font-size: 12px; margin-top: 35px; }
button {
  background: #f5ead5; border: 1px solid #c69b4c;
  border-radius: 8px; padding: 12px 20px; cursor: pointer;
}
@media print {
  button { display: none; }
  body { margin: 0 auto; }
}
</style>
</head>
<body>
<button onclick="window.print()">Stampa / Salva PDF</button>
<header>
<p>${pulisci(nomeParrocchia || "Parrocchia")}</p>
<h1>${pulisci(titolo)}</h1>
<p>N. ${pulisci(riferimento)} · ${pulisci(dataIt(doc.data_documento))}</p>
</header>
<h2>${pulisci(doc.causale || "Movimento economico")}</h2>
<table>
${righe.map(([etichetta, valore]) =>
  `<tr><td>${pulisci(etichetta)}</td><td>${pulisci(valore)}</td></tr>`
).join("")}
</table>
<p class="importo">Importo: ${pulisci(euro(doc.importo, doc.valuta))}</p>
<p class="nota">
Documento gestionale generato da Ars Liturgica.
La validità fiscale dipende dalla natura dell'operazione
e dai requisiti applicabili.
</p>
</body></html>`);
  finestra.document.close();
}

export default function ArchivioRicevute({
  parrocchiaId,
  nomeParrocchia = "",
  tornaIndietro,
}) {
  const [documenti, setDocumenti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [tipo, setTipo] = useState("");
  const [attivitaId, setAttivitaId] = useState("");
  const [revisione, setRevisione] = useState(0);

  useEffect(() => {
    let attivo = true;

    async function carica() {
      setCaricamento(true);
      setErrore("");

      try {
        if (!parrocchiaId) {
          throw new Error("Parrocchia non selezionata.");
        }

        const { data, error } = await supabase.rpc(
          "ars_elenco_documenti_economici",
          {
            p_parrocchia_id: parrocchiaId,
            p_attivita_id: null,
          }
        );

        if (error) throw error;
        if (!Array.isArray(data)) {
          throw new Error("Risposta dell'archivio non valida.");
        }

        if (attivo) setDocumenti(data);
      } catch (e) {
        if (attivo) setErrore(e.message || "Errore nel caricamento.");
      } finally {
        if (attivo) setCaricamento(false);
      }
    }

    carica();
    return () => { attivo = false; };
  }, [parrocchiaId, revisione]);

  const attivita = useMemo(() => {
    return [...new Set(
      documenti.map((d) => d.attivita_id).filter(Boolean)
    )];
  }, [documenti]);

  const filtrati = useMemo(() => {
    const q = ricerca.trim().toLocaleLowerCase("it-IT");

    return documenti.filter((d) => {
      if (tipo && d.tipo_documento !== tipo) return false;
      if (attivitaId && d.attivita_id !== attivitaId) return false;

      const dettagli = d.dati_documento || {};
      const contenuto = [
        d.numero,
        d.anno,
        d.causale,
        d.nominativo,
        dettagli.iscritto,
        dettagli.genitore,
        dettagli.donatore,
        d.importo,
      ].join(" ").toLocaleLowerCase("it-IT");

      return !q || contenuto.includes(q);
    });
  }, [documenti, ricerca, tipo, attivitaId]);

  function apri(doc) {
    try {
      stampaDocumento(doc, nomeParrocchia);
    } catch (e) {
      setErrore(e.message);
    }
  }

  return (
    <main className="ars-archivio-ricevute">
      <style>{`
        .ars-archivio-ricevute {
          color: #263747;
          padding: 20px;
        }
        .ars-archivio-ricevute h2 {
          color: #725521;
          margin-bottom: 8px;
        }
        .ar-filtri {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 20px 0;
        }
        .ar-filtri input, .ar-filtri select {
          padding: 11px;
          border: 1px solid #d9c9ae;
          border-radius: 9px;
          background: white;
          max-width: 100%;
        }
        .ars-archivio-ricevute button {
          padding: 10px 15px;
          background: #fff8eb;
          color: #263747;
          border: 1px solid #c69b4c;
          border-radius: 9px;
          cursor: pointer;
        }
        .ar-elenco {
          display: grid;
          gap: 13px;
        }
        .ar-documento {
          padding: 18px;
          background: #fffdf8;
          border: 1px solid #e7d9c2;
          border-radius: 13px;
        }
        .ar-documento h3 { margin: 0 0 9px; }
        .ar-documento p { margin: 6px 0; }
        .ar-documento strong { color: #725521; }
        .ar-errore { color: #a32626; }
      `}</style>

      {tornaIndietro && (
        <button type="button" onClick={tornaIndietro}>
          ← Torna indietro
        </button>
      )}

      <h2>Ricevute e documenti economici</h2>
      <p>
        Archivio dei documenti numerati relativi a incassi,
        spese, rimborsi e altre operazioni registrate.
      </p>

      <div className="ar-filtri">
        <input
          aria-label="Cerca documento"
          placeholder="Cerca nome, causale o numero"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
        />

        <select
          aria-label="Tipo documento"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Tutti i documenti</option>
          {Object.entries(TIPI).map(([id, nome]) => (
            <option key={id} value={id}>{nome}</option>
          ))}
        </select>

        <select
          aria-label="Filtra attività"
          value={attivitaId}
          onChange={(e) => setAttivitaId(e.target.value)}
        >
          <option value="">Tutte le attività</option>
          {attivita.map((id) => (
            <option key={id} value={id}>
              Attività {id.slice(0, 8)}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={caricamento}
          onClick={() => setRevisione((v) => v + 1)}
        >
          Aggiorna
        </button>
      </div>

      {errore && <p className="ar-errore" role="alert">{errore}</p>}
      {caricamento && <p>Caricamento documenti…</p>}

      {!caricamento && !errore && (
        <>
          <p><strong>{filtrati.length}</strong> documenti trovati</p>

          {!filtrati.length && (
            <p>Nessun documento corrisponde ai filtri selezionati.</p>
          )}

          <div className="ar-elenco">
            {filtrati.map((d) => {
              const dettagli = d.dati_documento || {};

              return (
                <article className="ar-documento" key={d.id}>
                  <h3>
                    {TIPI[d.tipo_documento] || d.tipo_documento}
                    {" "}n. {d.numero}/{d.anno}
                  </h3>

                  <p>Data: {dataIt(d.data_documento)}</p>
                  <p>Causale: {d.causale || "—"}</p>

                  {dettagli.iscritto && (
                    <p>Iscritto: {dettagli.iscritto}</p>
                  )}
                  {dettagli.genitore && (
                    <p>Genitore: {dettagli.genitore}</p>
                  )}
                  {dettagli.donatore && (
                    <p>Donatore: {dettagli.donatore}</p>
                  )}
                  {dettagli.tipo_pagamento &&
                    dettagli.tipo_pagamento !== "DA_DETERMINARE" && (
                      <p>Pagamento: {dettagli.tipo_pagamento}</p>
                    )}

                  <p>
                    <strong>
                      {euro(d.importo, d.valuta)}
                    </strong>
                  </p>

                  <button type="button" onClick={() => apri(d)}>
                    Stampa / Salva PDF
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
