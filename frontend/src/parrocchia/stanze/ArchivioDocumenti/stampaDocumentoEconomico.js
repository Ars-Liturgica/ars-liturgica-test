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

export function stampaDocumento(doc, nomeParrocchia) {
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
