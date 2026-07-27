import React, { useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import {
  STATI_DOCUMENTO,
  aggiornaDocumento,
  cambiaStatoDocumento,
} from "./Documento";
function pulisciNomeFile(testo = "documento") {
  return testo
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "documento";
}

function creaNomeFilePdf(documento) {
  const titolo = pulisciNomeFile(documento?.titolo);
  const data = new Date().toISOString().split("T")[0];

  return `${titolo}-${data}.pdf`;
}

function controllaElementoDocumento(elementoDom) {
  if (!(elementoDom instanceof HTMLElement)) {
    throw new Error(
      "La pagina grafica del documento non è disponibile."
    );
  }
}

function opzioniPdf(documento) {
  return {
    margin: 0,

    filename: creaNomeFilePdf(documento),

    image: {
      type: "jpeg",
      quality: 0.98,
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };
}

export async function generaPdfDocumento({
  documento,
  elementoDom,
}) {
  controllaDocumentoPerPubblicazione(documento);
  controllaElementoDocumento(elementoDom);

  const lavorazione = html2pdf()
    .set(opzioniPdf(documento))
    .from(elementoDom)
    .toPdf();

  const pdf = await lavorazione.get("pdf");
  const blob = pdf.output("blob");

  return {
    blob,
    nomeFile: creaNomeFilePdf(documento),
  };
}

export async function scaricaPdfDocumento({
  documento,
  elementoDom,
}) {
  controllaDocumentoPerPubblicazione(documento);
  controllaElementoDocumento(elementoDom);

  await html2pdf()
    .set(opzioniPdf(documento))
    .from(elementoDom)
    .save();
}

export async function preparaStampaDocumento({
  documento,
  elementoDom,
}) {
  const finestraPdf = window.open("", "_blank");

  if (!finestraPdf) {
    throw new Error(
      "Il browser ha bloccato l'apertura del PDF. Consenti l'apertura delle finestre per Ars Liturgica."
    );
  }

  try {
    finestraPdf.document.write(`
      <!doctype html>
      <html lang="it">
        <head>
          <title>Preparazione del documento</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 30px;">
          Preparazione del PDF in corso...
        </body>
      </html>
    `);

    const { blob } = await generaPdfDocumento({
      documento,
      elementoDom,
    });

    const urlPdf = URL.createObjectURL(blob);

    finestraPdf.location.replace(urlPdf);

    window.setTimeout(() => {
      URL.revokeObjectURL(urlPdf);
    }, 60000);
  } catch (error) {
    finestraPdf.close();
    throw error;
  }
}
/*
=========================================================
MOTORE DOCUMENTALE
Infrastruttura condivisa di Ars Liturgica.

Il Motore riceve un Documento creato da una Stanza e
gestisce tutte le operazioni comuni:

- salvataggio in bozza;
- anteprima;
- stampa;
- creazione PDF;
- affissione in bacheca;
- invio tramite email;
- condivisione tramite WhatsApp;
- archiviazione;
- eliminazione.

Le singole Stanze non devono duplicare queste funzioni.
=========================================================
*/

const AZIONI_DOCUMENTO = {
  SALVA_BOZZA: "salva_bozza",
  ANTEPRIMA: "anteprima",
  STAMPA: "stampa",
  CREA_PDF: "crea_pdf",
  AFFIGGI: "affiggi",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  SEGNA_SCADUTO: "segna_scaduto",
  ELIMINA: "elimina",
};

function etichettaStato(stato) {
  switch (stato) {
    case STATI_DOCUMENTO.BOZZA:
      return "Bozza";

    case STATI_DOCUMENTO.IN_ESSERE:
      return "In essere";

    case STATI_DOCUMENTO.SCADUTO:
      return "Scaduto";

    default:
      return "Stato sconosciuto";
  }
}

function controllaDocumentoPerPubblicazione(documento) {
  if (!documento) {
    throw new Error("Nessun documento disponibile.");
  }

  if (!documento.titolo?.trim()) {
    throw new Error(
      "Inserire il titolo prima di procedere."
    );
  }

  if (!documento.contenuto?.trim()) {
    throw new Error(
      "Inserire il contenuto prima di procedere."
    );
  }
}

export default function MotoreDocumentale({
  documento,

  onDocumentoAggiornato,
  onSalvaBozza,
  onAnteprima,
  onStampa,
  onCreaPdf,
  onAffiggiInBacheca,
  onInviaEmail,
  onCondividiWhatsApp,
  onSegnaScaduto,
  onElimina,
}) {
  const [azioneInCorso, setAzioneInCorso] =
    useState(null);

  const [messaggio, setMessaggio] =
    useState("");

  const [errore, setErrore] =
    useState("");

  const statoDocumento = useMemo(() => {
    return etichettaStato(documento?.stato);
  }, [documento?.stato]);

  function comunicaAggiornamento(documentoAggiornato) {
    if (typeof onDocumentoAggiornato === "function") {
      onDocumentoAggiornato(documentoAggiornato);
    }

    return documentoAggiornato;
  }

  async function eseguiAzione(nomeAzione, operazione) {
    setAzioneInCorso(nomeAzione);
    setMessaggio("");
    setErrore("");

    try {
      await operazione();
    } catch (error) {
      console.error(
        `Errore durante l'azione ${nomeAzione}:`,
        error
      );

      setErrore(
        error?.message ||
          "Si è verificato un errore imprevisto."
      );
    } finally {
      setAzioneInCorso(null);
    }
  }

  function azioneNonConfigurata(nomeAzione) {
    throw new Error(
      `La funzione "${nomeAzione}" non è ancora configurata.`
    );
  }

  async function salvaBozza() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.SALVA_BOZZA,
      async () => {
        if (!documento) {
          throw new Error(
            "Nessun documento da salvare."
          );
        }

        const documentoBozza =
          cambiaStatoDocumento(
            documento,
            STATI_DOCUMENTO.BOZZA
          );

        const documentoAggiornato =
          aggiornaDocumento(documentoBozza, {
            dataPubblicazione: null,
          });

        comunicaAggiornamento(
          documentoAggiornato
        );

        if (typeof onSalvaBozza === "function") {
          await onSalvaBozza(
            documentoAggiornato
          );
        }

        setMessaggio(
          "Documento salvato nella cartella Bozze."
        );
      }
    );
  }

  async function mostraAnteprima() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.ANTEPRIMA,
      async () => {
        controllaDocumentoPerPubblicazione(
          documento
        );

        if (typeof onAnteprima !== "function") {
          azioneNonConfigurata("Anteprima");
        }

        await onAnteprima(documento);
      }
    );
  }

 async function stampaDocumento() {
  await eseguiAzione(
    AZIONI_DOCUMENTO.STAMPA,
    async () => {
      controllaDocumentoPerPubblicazione(
        documento
      );

      if (typeof onStampa !== "function") {
        azioneNonConfigurata("Stampa");
      }

      await onStampa(documento);

      setMessaggio(
        "Documento preparato per la stampa."
      );
    }
  );
}

  async function creaPdf() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.CREA_PDF,
      async () => {
        controllaDocumentoPerPubblicazione(
          documento
        );

        if (typeof onCreaPdf !== "function") {
          azioneNonConfigurata(
            "Creazione PDF"
          );
        }

        await onCreaPdf(documento);

        setMessaggio(
          "PDF del documento creato."
        );
      }
    );
  }

  async function affiggiInBacheca() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.AFFIGGI,
      async () => {
        controllaDocumentoPerPubblicazione(
          documento
        );

        const documentoPubblicato =
          aggiornaDocumento(documento, {
            stato:
              STATI_DOCUMENTO.IN_ESSERE,

            dataPubblicazione:
              new Date().toISOString(),
          });

        comunicaAggiornamento(
          documentoPubblicato
        );

        if (
          typeof onAffiggiInBacheca ===
          "function"
        ) {
          await onAffiggiInBacheca(
            documentoPubblicato
          );
        }

        setMessaggio(
          "Documento affisso in bacheca."
        );
      }
    );
  }

  async function inviaEmail() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.EMAIL,
      async () => {
        controllaDocumentoPerPubblicazione(
          documento
        );

        if (
          typeof onInviaEmail !== "function"
        ) {
          azioneNonConfigurata(
            "Invio email"
          );
        }

        await onInviaEmail(documento);

        setMessaggio(
          "Documento preparato per l'invio email."
        );
      }
    );
  }

  async function condividiWhatsApp() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.WHATSAPP,
      async () => {
        controllaDocumentoPerPubblicazione(
          documento
        );

        if (
          typeof onCondividiWhatsApp !==
          "function"
        ) {
          azioneNonConfigurata(
            "Condivisione WhatsApp"
          );
        }

        await onCondividiWhatsApp(documento);

        setMessaggio(
          "Documento preparato per WhatsApp."
        );
      }
    );
  }

  async function segnaScaduto() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.SEGNA_SCADUTO,
      async () => {
        const documentoScaduto =
          cambiaStatoDocumento(
            documento,
            STATI_DOCUMENTO.SCADUTO
          );

        comunicaAggiornamento(
          documentoScaduto
        );

        if (
          typeof onSegnaScaduto ===
          "function"
        ) {
          await onSegnaScaduto(
            documentoScaduto
          );
        }

        setMessaggio(
          "Documento spostato tra gli scaduti."
        );
      }
    );
  }

  async function eliminaDocumento() {
    await eseguiAzione(
      AZIONI_DOCUMENTO.ELIMINA,
      async () => {
        const conferma = window.confirm(
          "Vuoi eliminare definitivamente questo documento?"
        );

        if (!conferma) {
          return;
        }

        if (typeof onElimina !== "function") {
          azioneNonConfigurata(
            "Eliminazione"
          );
        }

        await onElimina(documento);

        setMessaggio(
          "Documento eliminato."
        );
      }
    );
  }

  const disabilitato = Boolean(
    azioneInCorso
  );

  return (
    <section className="motore-documentale">
      <header className="motore-documentale__header">
        <div>
          <h2>Gestione del documento</h2>

          <p>
            Stato attuale:{" "}
            <strong>{statoDocumento}</strong>
          </p>
        </div>
      </header>

      <div className="motore-documentale__azioni">
        <button
          type="button"
          onClick={salvaBozza}
          disabled={disabilitato}
        >
          Salva come bozza
        </button>

        <button
          type="button"
          onClick={mostraAnteprima}
          disabled={disabilitato}
        >
          Anteprima
        </button>

        <button
          type="button"
          onClick={stampaDocumento}
          disabled={disabilitato}
        >
          Stampa
        </button>

        <button
          type="button"
          onClick={creaPdf}
          disabled={disabilitato}
        >
          Crea PDF
        </button>

        <button
          type="button"
          onClick={affiggiInBacheca}
          disabled={disabilitato}
        >
          Affiggi in bacheca
        </button>

        <button
          type="button"
          onClick={inviaEmail}
          disabled={disabilitato}
        >
          Invia per email
        </button>

        <button
          type="button"
          onClick={condividiWhatsApp}
          disabled={disabilitato}
        >
          Condividi su WhatsApp
        </button>

        {documento?.stato ===
          STATI_DOCUMENTO.IN_ESSERE && (
          <button
            type="button"
            onClick={segnaScaduto}
            disabled={disabilitato}
          >
            Sposta negli scaduti
          </button>
        )}

        <button
          type="button"
          onClick={eliminaDocumento}
          disabled={disabilitato}
        >
          Elimina documento
        </button>
      </div>

      {azioneInCorso && (
        <p className="motore-documentale__attesa">
          Operazione in corso...
        </p>
      )}

      {messaggio && (
        <p className="motore-documentale__successo">
          {messaggio}
        </p>
      )}

      {errore && (
        <p
          className="motore-documentale__errore"
          role="alert"
        >
          {errore}
        </p>
      )}
    </section>
  );
}
