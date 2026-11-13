import React from "react";

/**
 * Ars Liturgica — conferma di presa visione riutilizzabile.
 * Questo componente mostra soltanto la scelta; il salvataggio compete alla RPC
 * dell'attività (iscrizione, comunicazioni, ecc.).
 */
export default function FirmaSemplice({
  modalitaDisponibili = "cartacea",
  modalita = "cartacea",
  onModalitaChange,
  conferma = false,
  onConfermaChange,
  nominativo = "",
  documento = "domanda",
  disabilitato = false,
}) {
  const consenteApp = ["app", "entrambe"].includes(modalitaDisponibili);
  const consenteCarta = ["cartacea", "entrambe"].includes(modalitaDisponibili);
  const opzioni = [
    ...(consenteApp ? [{id:"app",titolo:"Conferma nell'app",nota:"Leggi la domanda e confermala direttamente online."}] : []),
    ...(consenteCarta ? [{id:"cartacea",titolo:"Firma su carta",nota:"Stampa la domanda, firmala e consegnala in parrocchia."}] : []),
  ];
  const scelta = opzioni.some(o => o.id === modalita) ? modalita : opzioni[0]?.id;

  return <fieldset className="ars-firme-semplice" disabled={disabilitato}>
    <legend>Conferma della {documento}</legend>
    {opzioni.length > 1 && <p>Scegli come confermare la domanda:</p>}
    {opzioni.length > 1 ? <div role="radiogroup" aria-label="Come confermare la domanda"
      style={{display:"grid",gap:10,margin:"12px 0"}}>
      {opzioni.map(o => <label key={o.id} style={{display:"flex",gap:12,alignItems:"flex-start",
        padding:"13px 15px",border:`2px solid ${scelta===o.id ? "#a67a29" : "#e2d2b3"}`,
        background:scelta===o.id ? "#fff8eb" : "#fffefa",borderRadius:10,cursor:"pointer"}}>
        <input type="radio" name="modalita-conferma-comunione" value={o.id}
          checked={scelta===o.id} onChange={() => {
            onModalitaChange?.(o.id);
            onConfermaChange?.(false);
          }} style={{marginTop:5,accentColor:"#a67a29"}} />
        <span><strong style={{display:"block"}}>{o.titolo}</strong>
          <span style={{display:"block",fontSize:".93rem",marginTop:4}}>{o.nota}</span></span>
      </label>)}
    </div> : <p><strong>{opzioni[0]?.titolo || "Modalità non disponibile"}</strong></p>}

    {scelta === "app" ? <div className="ars-firme-conferma-app">
      {nominativo?.trim() && <p>Genitore o tutore: <strong>{nominativo.trim()}</strong></p>}
      <label className="ars-sac-spunta">
        <input type="checkbox" checked={conferma}
          onChange={e => onConfermaChange?.(e.target.checked)} />
        <span>Dichiaro di aver preso visione della domanda di iscrizione e di confermarne il contenuto.</span>
      </label>
    </div> : scelta === "cartacea" ? <p>Puoi inviare la domanda online e consegnare la copia firmata in parrocchia.</p>
      : <p role="alert">La modalità di conferma non è disponibile.</p>}
  </fieldset>;
}
