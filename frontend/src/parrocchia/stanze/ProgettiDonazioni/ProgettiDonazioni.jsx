import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const TIPI = {
  bonifico: "Bonifico",
  paypal: "PayPal",
  link_pagamento: "Link di pagamento",
  consegna_diretta: "Consegna diretta in parrocchia",
};
const nuovoMetodo = (tipo = "bonifico") => ({
  id: null, tipo, titolo: TIPI[tipo], intestatario: "", iban: "",
  bic_swift: "", email_paypal: "", link_pagamento: "", istruzioni: "",
  attivo: true, ordine: 0,
});
const stileCampo = { display: "block", width: "100%", boxSizing: "border-box", padding: "10px", marginTop: "5px" };
const stileScheda = { border: "1px solid #ddc89d", borderRadius: "12px", padding: "20px", margin: "16px 0" };

export default function ProgettiDonazioni({ parrocchiaId, tornaDashboard }) {
  const [metodiIncasso, setMetodiIncasso] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [modulo, setModulo] = useState(null);
  const [erroreModulo, setErroreModulo] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);
  const [messaggio, setMessaggio] = useState("");

  const caricaDati = useCallback(async () => {
    if (!parrocchiaId) {
      setMetodiIncasso([]); setProgetti([]); setCaricamento(false);
      setErrore("Seleziona una parrocchia per gestire i metodi di incasso.");
      return;
    }
    setCaricamento(true); setErrore("");
    try {
      const [metodi, raccolte] = await Promise.all([
        supabase.rpc("ars_elenco_metodi_incasso_parroco", { p_parrocchia_id: parrocchiaId }),
        supabase.rpc("ars_elenco_progetti_donazioni_parroco", { p_parrocchia_id: parrocchiaId }),
      ]);
      if (metodi.error) throw metodi.error;
      setMetodiIncasso(Array.isArray(metodi.data) ? metodi.data : []);
      if (raccolte.error) {
        setProgetti([]);
        setErrore("Metodi caricati. Impossibile caricare i progetti: " + raccolte.error.message);
      } else setProgetti(Array.isArray(raccolte.data) ? raccolte.data : []);
    } catch (err) {
      setMetodiIncasso([]); setProgetti([]);
      setErrore(err.message || "Impossibile caricare Donazioni e Progetti.");
    } finally { setCaricamento(false); }
  }, [parrocchiaId]);

  useEffect(() => {
    setModulo(null); setErroreModulo(""); setMessaggio("");
    caricaDati();
  }, [caricaDati]);

  function apriMetodo(metodo) {
    setModulo({ ...nuovoMetodo(metodo.tipo), ...metodo });
    setErroreModulo(""); setMessaggio("");
  }
  function scegliTipo(tipo) {
    const esistente = metodiIncasso.find((m) => m.tipo === tipo);
    apriMetodo(esistente || nuovoMetodo(tipo));
  }
  function aggiorna(campo, valore) {
    setModulo((precedente) => ({ ...precedente, [campo]: valore }));
  }
  async function salvaMetodo(event) {
    event.preventDefault();
    if (salvataggio || !modulo || !parrocchiaId) return;
    setErroreModulo(""); setMessaggio("");
    const link = (modulo.link_pagamento || "").trim();
    if (link) {
      try {
        const indirizzo = new URL(link);
        if (indirizzo.protocol !== "https:") throw new Error();
      } catch {
        setErroreModulo("Inserisci un link completo che inizi con https://.");
        return;
      }
    }
    if (modulo.tipo === "paypal" && !(modulo.email_paypal || "").trim() && !link) {
      setErroreModulo("Per PayPal inserisci un’email oppure un link di pagamento."); return;
    }
    setSalvataggio(true);
    try {
      const { data, error } = await supabase.rpc("ars_salva_metodo_incasso", {
        p_parrocchia_id: parrocchiaId,
        p_id: modulo.id || null,
        p_tipo: modulo.tipo,
        p_titolo: modulo.titolo.trim(),
        p_intestatario: modulo.intestatario || null,
        p_iban: modulo.tipo === "bonifico" ? modulo.iban : null,
        p_bic_swift: modulo.tipo === "bonifico" ? modulo.bic_swift : null,
        p_email_paypal: modulo.tipo === "paypal" ? modulo.email_paypal : null,
        p_link_pagamento: ["paypal", "link_pagamento"].includes(modulo.tipo) ? link || null : null,
        p_istruzioni: modulo.istruzioni || null,
        p_attivo: Boolean(modulo.attivo),
        p_ordine: Number(modulo.ordine) || 0,
      });
      if (error) throw error;
      if (!data?.id) throw new Error("Il server non ha restituito il metodo salvato. Ricarica la pagina per verificarlo.");
      setMetodiIncasso((precedenti) => [...precedenti.filter((m) => m.id !== data.id && m.tipo !== data.tipo), data]
        .sort((a, b) => Number(a.ordine || 0) - Number(b.ordine || 0)));
      setModulo(null); setMessaggio("Metodo di incasso salvato.");
    } catch (err) { setErroreModulo(err.message || "Impossibile salvare il metodo."); }
    finally { setSalvataggio(false); }
  }

  function campo(nome, etichetta, { tipo = "text", obbligatorio = false } = {}) {
    return <label style={{ display: "block", margin: "12px 0" }}>
      {etichetta}{obbligatorio ? " *" : ""}
      <input style={stileCampo} type={tipo} value={modulo[nome] ?? ""}
        required={obbligatorio} onChange={(e) => aggiorna(nome, e.target.value)} />
    </label>;
  }

  return <div className="progetti-donazioni">
    <button type="button" className="pulsante-torna-dashboard" onClick={tornaDashboard} disabled={salvataggio}>← Torna alla dashboard</button>
    <div className="progetti-donazioni-intestazione">
      <h2>Progetti e Donazioni</h2>
      <p>Gestisci i metodi con cui la parrocchia riceve offerte e quote delle attività e presenta alla comunità i progetti da sostenere.</p>
    </div>
    {errore && <div role="alert" className="messaggio-errore">{errore}</div>}
    {messaggio && <p role="status">{messaggio}</p>}
    {caricamento ? <p>Caricamento in corso...</p> : <>
      <section className="sezione-metodi-incasso">
        <div className="intestazione-sezione-donazioni">
          <h3>Metodi di incasso</h3>
          <p>Bonifico, PayPal, link di pagamento e consegna diretta alla parrocchia.</p>
          <button type="button" className="pulsante-primario" disabled={!parrocchiaId || salvataggio}
            onClick={() => scegliTipo(Object.keys(TIPI).find((tipo) => !metodiIncasso.some((m) => m.tipo === tipo)) || "bonifico")}>
            Aggiungi metodo
          </button>
        </div>
        {modulo && <form onSubmit={salvaMetodo} style={stileScheda}>
          <h4>{modulo.id ? "Modifica metodo" : "Nuovo metodo"}</h4>
          {erroreModulo && <p role="alert">{erroreModulo}</p>}
          <fieldset disabled={salvataggio} style={{ border: 0, padding: 0, margin: 0 }}>
            <label>Metodo di incasso
              <select style={stileCampo} value={modulo.tipo} onChange={(e) => scegliTipo(e.target.value)} disabled={Boolean(modulo.id)}>
                {Object.entries(TIPI).map(([tipo, titolo]) => <option key={tipo} value={tipo}>{titolo}</option>)}
              </select>
            </label>
            <p>Puoi configurare un metodo per ciascun tipo. Per aggiornare un metodo già presente usa «Modifica».</p>
            {campo("titolo", "Nome da mostrare", { obbligatorio: true })}
            {modulo.tipo !== "consegna_diretta" && campo("intestatario", "Intestatario")}
            {modulo.tipo === "bonifico" && <>
              {campo("iban", "IBAN", { obbligatorio: true })}
              {campo("bic_swift", "BIC / SWIFT (facoltativo)")}
            </>}
            {modulo.tipo === "paypal" && campo("email_paypal", "Email PayPal", { tipo: "email" })}
            {["paypal", "link_pagamento"].includes(modulo.tipo) && campo("link_pagamento", "Link di pagamento", { tipo: "url", obbligatorio: modulo.tipo === "link_pagamento" })}
            <label style={{ display: "block", margin: "12px 0" }}>Istruzioni per chi paga
              <textarea style={stileCampo} rows={3} value={modulo.istruzioni || ""} onChange={(e) => aggiorna("istruzioni", e.target.value)} />
            </label>
            <label style={{ display: "block", margin: "12px 0" }}>
              <input type="checkbox" checked={Boolean(modulo.attivo)} onChange={(e) => aggiorna("attivo", e.target.checked)} /> Metodo attivo
            </label>
            <button type="submit" className="pulsante-primario">{salvataggio ? "Salvataggio..." : "Salva metodo"}</button>{" "}
            <button type="button" onClick={() => { setModulo(null); setErroreModulo(""); }}>Annulla</button>
          </fieldset>
        </form>}
        {metodiIncasso.length === 0 ? <p>Nessun metodo di incasso è stato ancora configurato.</p> :
          metodiIncasso.map((metodo) => <article key={metodo.id} style={stileScheda}>
            <h4>{metodo.titolo}</h4>
            <p>{TIPI[metodo.tipo] || metodo.tipo} · {metodo.attivo ? "Attivo" : "Non attivo"}</p>
            {metodo.intestatario && <p>Intestatario: {metodo.intestatario}</p>}
            {metodo.tipo === "bonifico" && <>
              <p>IBAN: {metodo.iban}</p>
              {metodo.bic_swift && <p>BIC / SWIFT: {metodo.bic_swift}</p>}
            </>}
            {metodo.tipo === "paypal" && metodo.email_paypal && <p>Email PayPal: {metodo.email_paypal}</p>}
            {metodo.link_pagamento && <p style={{ overflowWrap: "anywhere" }}>Link: {metodo.link_pagamento}</p>}
            {metodo.istruzioni && <p style={{ whiteSpace: "pre-wrap" }}>{metodo.istruzioni}</p>}
            <button type="button" disabled={salvataggio || !parrocchiaId} onClick={() => apriMetodo(metodo)}>Modifica</button>
          </article>)}
      </section>
      <section className="sezione-progetti-donazioni">
        <div className="intestazione-sezione-donazioni">
          <h3>Progetti della parrocchia</h3>
          <p>Raccolte e iniziative che la comunità può sostenere.</p>
          <button type="button" className="pulsante-primario" disabled title="La funzione sarà attivata nel prossimo passaggio">Nuovo progetto</button>
        </div>
        {progetti.length === 0 ? <p>Nessun progetto è stato ancora creato.</p> :
          progetti.map((progetto) => <article key={progetto.id}>
            <h4>{progetto.titolo}</h4>
            <p>{progetto.stato} · Raccolto {Number(progetto.raccolto || 0).toLocaleString("it-IT", { style: "currency", currency: progetto.valuta || "EUR" })}</p>
          </article>)}
      </section>
    </>}
  </div>;
}
