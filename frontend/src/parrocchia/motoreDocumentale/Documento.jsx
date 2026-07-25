/*
=========================================================
DOCUMENTO
Modello unico utilizzato da tutto Ars Liturgica.

Il Documento contiene esclusivamente dati e stato.

Non gestisce:
- pulsanti;
- anteprima;
- impaginazione;
- stampa;
- PDF;
- bacheca;
- email;
- WhatsApp;
- archiviazione.

Queste operazioni appartengono al Motore Documentale.
=========================================================
*/

export const STATI_DOCUMENTO = {
  BOZZA: "bozza",
  IN_ESSERE: "in_essere",
  SCADUTO: "scaduto",
};

const STATI_CONSENTITI = Object.values(STATI_DOCUMENTO);

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
  metadati = {},
} = {}) {
  if (!tipo) {
    throw new Error("Il tipo del documento è obbligatorio.");
  }

  if (!parrocchiaId) {
    throw new Error("La parrocchia del documento è obbligatoria.");
  }

  if (!STATI_CONSENTITI.includes(stato)) {
    throw new Error(`Stato del documento non valido: ${stato}`);
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
    metadati,
  };
}

export function aggiornaDocumento(documento, modifiche = {}) {
  if (!documento) {
    throw new Error("Il documento da aggiornare non è stato fornito.");
  }

  const nuovoStato = modifiche.stato ?? documento.stato;

  if (!STATI_CONSENTITI.includes(nuovoStato)) {
    throw new Error(`Stato del documento non valido: ${nuovoStato}`);
  }

  return {
    ...documento,
    ...modifiche,
    dataAggiornamento: new Date().toISOString(),
  };
}

export function cambiaStatoDocumento(documento, nuovoStato) {
  if (!STATI_CONSENTITI.includes(nuovoStato)) {
    throw new Error(`Stato del documento non valido: ${nuovoStato}`);
  }

  return aggiornaDocumento(documento, {
    stato: nuovoStato,
  });
}

export function documentoScaduto(documento, dataCorrente = new Date()) {
  if (!documento) {
    return false;
  }

  if (documento.senzaScadenza || !documento.dataScadenza) {
    return false;
  }

  const scadenza = new Date(documento.dataScadenza);

  if (Number.isNaN(scadenza.getTime())) {
    return false;
  }

  return scadenza < dataCorrente;
}

export function aggiornaStatoPerScadenza(
  documento,
  dataCorrente = new Date()
) {
  if (!documentoScaduto(documento, dataCorrente)) {
    return documento;
  }

  return cambiaStatoDocumento(
    documento,
    STATI_DOCUMENTO.SCADUTO
  );
}

export default creaDocumento;
