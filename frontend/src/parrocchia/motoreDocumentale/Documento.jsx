/*
=========================================================
DOCUMENTO
Modello unico utilizzato da tutto Ars Liturgica.

Le Stanze preparano i dati.
Il Motore Documentale gestisce:
- bozze;
- anteprima;
- stampa;
- PDF;
- affissione in bacheca;
- invio email;
- condivisione WhatsApp;
- archiviazione.
=========================================================
*/

export const STATI_DOCUMENTO = {
  BOZZA: "bozza",
  IN_ESSERE: "in_essere",
  SCADUTO: "scaduto",
};

export function creaDocumento({
  id = null,
  tipo,
  parrocchiaId,
  titolo = "",
  contenuto = "",
  firma = "",
  stato = STATI_DOCUMENTO.BOZZA,
  dataCreazione = new Date().toISOString(),
  dataAggiornamento = new Date().toISOString(),
  dataPubblicazione = null,
  dataScadenza = null,
  senzaScadenza = false,
  affissoInBacheca = false,
  pdfUrl = null,
} = {}) {
  if (!tipo) {
    throw new Error("Il tipo del documento è obbligatorio.");
  }

  if (!parrocchiaId) {
    throw new Error("La parrocchia del documento è obbligatoria.");
  }

  return {
    id,
    tipo,
    parrocchiaId,
    titolo,
    contenuto,
    firma,
    stato,
    dataCreazione,
    dataAggiornamento,
    dataPubblicazione,
    dataScadenza,
    senzaScadenza,
    affissoInBacheca,
    pdfUrl,
  };
}

export function aggiornaDocumento(documento, modifiche = {}) {
  return {
    ...documento,
    ...modifiche,
    dataAggiornamento: new Date().toISOString(),
  };
}

export function salvaComeBozza(documento) {
  return aggiornaDocumento(documento, {
    stato: STATI_DOCUMENTO.BOZZA,
    affissoInBacheca: false,
    dataPubblicazione: null,
  });
}

export function affiggiInBacheca(documento) {
  if (!documento.titolo.trim()) {
    throw new Error("Inserire il titolo prima di affiggere il documento.");
  }

  if (!documento.contenuto.trim()) {
    throw new Error("Inserire il contenuto prima di affiggere il documento.");
  }

  return aggiornaDocumento(documento, {
    stato: STATI_DOCUMENTO.IN_ESSERE,
    affissoInBacheca: true,
    dataPubblicazione: new Date().toISOString(),
  });
}

export function ritiraDallaBacheca(documento) {
  return aggiornaDocumento(documento, {
    affissoInBacheca: false,
  });
}

export function segnaComeScaduto(documento) {
  return aggiornaDocumento(documento, {
    stato: STATI_DOCUMENTO.SCADUTO,
    affissoInBacheca: false,
  });
}

export function documentoScaduto(documento, dataCorrente = new Date()) {
  if (documento.senzaScadenza || !documento.dataScadenza) {
    return false;
  }

  return new Date(documento.dataScadenza) < dataCorrente;
}

export function azioniDisponibili(documento) {
  const azioniComuni = [
    "anteprima",
    "stampa",
    "crea_pdf",
    "invia_email",
    "condividi_whatsapp",
  ];

  if (documento.stato === STATI_DOCUMENTO.BOZZA) {
    return [
      "salva_bozza",
      ...azioniComuni,
      "affiggi_in_bacheca",
      "elimina",
    ];
  }

  if (documento.stato === STATI_DOCUMENTO.IN_ESSERE) {
    return [
      "modifica",
      ...azioniComuni,
      "ritira_dalla_bacheca",
      "segna_scaduto",
    ];
  }

  return [
    "visualizza",
    ...azioniComuni,
    "duplica",
    "ripubblica",
    "elimina",
  ];
}

export default creaDocumento;
