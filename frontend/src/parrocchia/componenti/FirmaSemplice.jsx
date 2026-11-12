
import React from "react";

/**
 * Ars Liturgica · componente comune per presa visione / sottoscrizione semplice.
 * Riutilizzabile in Catechismo, GREST, deleghe e altre attività.
 * La persistenza NON avviene in questo componente: ogni attività salva la
 * dichiarazione con la propria RPC, tramite le tabelle ars_firme_*.
 * Non si tratta di firma digitale qualificata.
 */
export default function FirmaSemplice({
  modalitaDisponibili = "cartacea",
  modalita = "cartacea",
  onModalitaChange,
  conferma = false,
  onConfermaChange,
  nominativo = "",
  onNominativoChange,
  documento = "domanda",
  disabilitato = false,
}) {
  const consenteApp = modalitaDisponibili === "app" || modalitaDisponibili === "entrambe";
  const consenteCarta = modalitaDisponibili === "cartacea" || modalitaDisponibili === "entrambe";
  const opzioni = [
    ...(consenteApp ? [{ id: "app", testo: "Conferma nell'app" }] : []),
    ...(consenteCarta ? [{ id: "cartacea", testo: "Firma su carta" }] : []),
  ];
  return <fieldset className="ars-firme-semplice" disabled={disabilitato}>
    <legend>Firma della {documento}</legend>
    <p>Scegli come sottoscrivere la domanda. La modalità viene stabilita dalla parrocchia.</p>
    {opzioni.length > 1 ? <label className="ars-sac-campo">
      <span>Modalità di firma</span>
      <select value={modalita} onChange={e => {
        onModalitaChange?.(e.target.value);
        onConfermaChange?.(false);
      }}>
        {opzioni.map(o => <option value={o.id} key={o.id}>{o.testo}</option>)}
      </select>
    </label> : <p><strong>{opzioni[0]?.testo || "Firma su carta"}</strong></p>}
    {modalita === "app" ? <>
      <p>Leggi la domanda compilata prima dell'invio. Confermando nell'app,
        registriamo il tuo nominativo, la data e il contenuto della domanda.</p>
      <label className="ars-sac-campo">
        <span>Nome e cognome di chi sottoscrive</span>
        <input type="text" value={nominativo} onChange={e => onNominativoChange?.(e.target.value)}
          placeholder="Nome e cognome del genitore o tutore" autoComplete="name" />
      </label>
      <label className="ars-sac-spunta">
        <input type="checkbox" checked={conferma} onChange={e => onConfermaChange?.(e.target.checked)} />
        <span>Ho letto la domanda e confermo i dati e la richiesta di iscrizione.</span>
      </label>
      <p className="ars-sac-avvertenza">Questa è una conferma semplice nell'app, non una firma digitale certificata.</p>
    </> : <p className="ars-sac-avvertenza">Potrai inviare subito la domanda anche senza fotografie.
      Stampa, firma e successivamente carica una foto dei fogli firmati, oppure consegnali in parrocchia.</p>}
  </fieldset>;
}
