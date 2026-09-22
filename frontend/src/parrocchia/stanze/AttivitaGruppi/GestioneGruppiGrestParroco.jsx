import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const bucket = "ars-grest-gruppi";
const bottone = { border: "1px solid #765c3e", borderRadius: 8, padding: "9px 14px", background: "#fff", color: "#503b28", cursor: "pointer", font: "inherit" };
const campo = { border: "1px solid #b8aa99", borderRadius: 8, padding: 9, font: "inherit", maxWidth: "100%" };
const scatola = { border: "1px solid #ded5c6", borderRadius: 12, padding: 18, marginBottom: 16, background: "#fffdf8" };
const pagina = { maxWidth: 1120, margin: "0 auto", padding: "24px 16px", color: "#132e45" };
const nomeIntero = (persona) => `${persona.cognome || ""} ${persona.nome || ""}`.trim();
const nomeRagazzo = (ragazzo) => `${ragazzo.cognome_partecipante || ""} ${ragazzo.nome_partecipante || ""}`.trim();

export default function GestioneGruppiGrestParroco({ attivita, parrocchiaId, onIndietro }) {
  const [gruppi, setGruppi] = useState([]);
  const [volontari, setVolontari] = useState([]);
  const [ragazzi, setRagazzi] = useState([]);
  const [immagini, setImmagini] = useState({});
  const [modifica, setModifica] = useState(null);
  const [nome, setNome] = useState("");
  const [scelti, setScelti] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [paginaRagazzi, setPaginaRagazzi] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [operazione, setOperazione] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const carica = useCallback(async () => {
    setCaricamento(true);
    setErrore("");
    const risultati = await Promise.all([
      supabase.rpc("ars_elenco_gruppi_grest_parroco", { p_attivita_id: attivita.id }),
      supabase.rpc("ars_elenco_volontari_grest_parroco", { p_attivita_id: attivita.id }),
      supabase.rpc("ars_elenco_iscrizioni_grest_parroco", { p_attivita_id: attivita.id }),
    ]);
    const problema = risultati.find((risultato) => risultato.error)?.error;
    if (problema) {
      setErrore(problema.message || "Impossibile caricare i gruppi.");
    } else if (!risultati.every((risultato) => Array.isArray(risultato.data))) {
      setErrore("Il formato dell'elenco non è riconosciuto.");
    } else {
      setGruppi(risultati[0].data);
      setVolontari(risultati[1].data);
      setRagazzi(risultati[2].data);
      const coppie = await Promise.all(risultati[0].data.filter((g) => g.immagine_path).map(async (g) => {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(g.immagine_path, 3600);
        return [g.id, data?.signedUrl || null];
      }));
      setImmagini(Object.fromEntries(coppie));
    }
    setCaricamento(false);
  }, [attivita.id]);

  useEffect(() => { carica(); }, [carica]);

  function apri(gruppo) {
    setModifica(gruppo?.id || "nuovo");
    setNome(gruppo?.nome || "");
    setScelti(gruppo?.volontari || []);
    setErrore(""); setMessaggio("");
  }

  async function salva(evento) {
    evento.preventDefault();
    if (!nome.trim()) return setErrore("Inserisci il nome del gruppo.");
    setOperazione(true); setErrore(""); setMessaggio("");
    const { error } = await supabase.rpc("ars_salva_gruppo_grest_parroco", {
      p_attivita_id: attivita.id,
      p_gruppo_id: modifica === "nuovo" ? null : modifica,
      p_nome: nome.trim(), p_volontari: scelti,
    });
    setOperazione(false);
    if (error) return setErrore(error.message || "Non è stato possibile salvare il gruppo.");
    setModifica(null); setMessaggio("Gruppo salvato."); await carica();
  }

  async function assegna(iscrizioneId, gruppoId) {
    setOperazione(true); setErrore(""); setMessaggio("");
    const { error } = await supabase.rpc("ars_assegna_ragazzo_gruppo_grest_parroco", {
      p_iscrizione_id: iscrizioneId, p_gruppo_id: gruppoId || null,
    });
    setOperazione(false);
    if (error) return setErrore(error.message || "Impossibile cambiare il gruppo.");
    setMessaggio("Assegnazione aggiornata."); await carica();
  }

  async function cambiaImmagine(gruppo, file) {
    if (!file) return;
    const estensione = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    if (!estensione || file.size === 0 || file.size > 2 * 1024 * 1024) {
      setErrore("Scegli un'immagine JPG, PNG o WebP di massimo 2 MB."); return;
    }
    const firma = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const valida = estensione === "jpg" ? firma[0] === 0xff && firma[1] === 0xd8 && firma[2] === 0xff
      : estensione === "png" ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => firma[i] === byte)
      : String.fromCharCode(...firma.slice(0, 4)) === "RIFF" && String.fromCharCode(...firma.slice(8, 12)) === "WEBP";
    if (!valida) { setErrore("Il file selezionato non è un'immagine valida."); return; }
    setOperazione(true); setErrore(""); setMessaggio("");
    const percorso = `${parrocchiaId}/${attivita.id}/${gruppo.id}.${estensione}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(percorso, file, {
      contentType: file.type, upsert: true, cacheControl: "0",
    });
    if (uploadError) { setOperazione(false); return setErrore(uploadError.message); }
    const { error } = await supabase.rpc("ars_salva_immagine_gruppo_grest_parroco", {
      p_gruppo_id: gruppo.id, p_percorso: percorso,
    });
    if (error) {
      if (gruppo.immagine_path !== percorso) await supabase.storage.from(bucket).remove([percorso]);
      setOperazione(false); return setErrore(error.message);
    }
    if (gruppo.immagine_path && gruppo.immagine_path !== percorso) {
      await supabase.storage.from(bucket).remove([gruppo.immagine_path]);
    }
    setOperazione(false); setMessaggio("Immagine aggiornata."); await carica();
  }

  async function rimuoviImmagine(gruppo) {
    setOperazione(true); setErrore("");
    const { error } = await supabase.rpc("ars_salva_immagine_gruppo_grest_parroco", {
      p_gruppo_id: gruppo.id, p_percorso: null,
    });
    if (error) { setOperazione(false); return setErrore(error.message); }
    if (gruppo.immagine_path) await supabase.storage.from(bucket).remove([gruppo.immagine_path]);
    setOperazione(false); setMessaggio("Immagine rimossa."); await carica();
  }

  const assegnazioni = Object.fromEntries(gruppi.flatMap((g) => (g.ragazzi || []).map((id) => [id, g.id])));
  const attivi = ragazzi.filter((r) => !["annullata", "ritirata"].includes(r.stato));
  const filtrati = attivi.filter((r) => nomeRagazzo(r).toLocaleLowerCase("it").includes(ricerca.trim().toLocaleLowerCase("it")))
    .sort((a, b) => nomeRagazzo(a).localeCompare(nomeRagazzo(b), "it"));
  const visibili = filtrati.slice(paginaRagazzi * 25, (paginaRagazzi + 1) * 25);

  return <main style={pagina}>
    <button type="button" style={bottone} onClick={onIndietro}>← Torna alle attività</button>
    <h1>Gruppi · {attivita.titolo}</h1>
    <p>La parrocchia crea i gruppi, assegna i ragazzi e sceglie i collaboratori.</p>
    <button type="button" style={bottone} onClick={() => apri(null)} disabled={operazione}>+ Crea gruppo</button>{" "}
    <button type="button" style={bottone} onClick={carica} disabled={caricamento || operazione}>Aggiorna</button>
    {errore && <p role="alert" style={{ color: "#a12222" }}>{errore}</p>}
    {messaggio && <p role="status">{messaggio}</p>}
    {caricamento && <p role="status">Caricamento…</p>}
    {modifica && <form onSubmit={salva} style={{ ...scatola, marginTop: 20 }}>
      <h2>{modifica === "nuovo" ? "Nuovo gruppo" : "Modifica gruppo"}</h2>
      <label>Nome del gruppo<br /><input style={campo} maxLength={100} required value={nome} onChange={(e) => setNome(e.target.value)} /></label>
      <fieldset style={{ border: "1px solid #ded5c6", margin: "16px 0" }}>
        <legend>Collaboratori assegnati</legend>
        {volontari.length === 0 && <p>Nessuna persona attiva nell'elenco della parrocchia.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 8 }}>
          {volontari.map((v) => <label key={v.id}><input type="checkbox" checked={scelti.includes(v.id)} onChange={(e) => setScelti(e.target.checked ? [...scelti, v.id] : scelti.filter((id) => id !== v.id))} /> {nomeIntero(v)}</label>)}
        </div>
      </fieldset>
      <button type="submit" style={bottone} disabled={operazione}>{operazione ? "Salvataggio…" : "Salva gruppo"}</button>{" "}
      <button type="button" style={bottone} onClick={() => setModifica(null)} disabled={operazione}>Chiudi</button>
    </form>}
    {!caricamento && <section aria-label="Gruppi" style={{ marginTop: 24 }}>
      <h2>Gruppi ({gruppi.length})</h2>
      {gruppi.length === 0 && <p>Crea il primo gruppo per iniziare le assegnazioni.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 14 }}>
        {gruppi.map((g) => <article key={g.id} style={scatola}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {immagini[g.id] && <img src={immagini[g.id]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />}
            <h3 style={{ margin: 0 }}>{g.nome}</h3>
          </div>
          <p>{(g.ragazzi || []).length} ragazzi assegnati</p>
          <p>Collaboratori: {(g.volontari || []).map((id) => volontari.find((v) => v.id === id)).filter(Boolean).map(nomeIntero).join(", ") || "nessuno"}</p>
          <button type="button" style={bottone} onClick={() => apri(g)} disabled={operazione}>Modifica</button>
          <div style={{ marginTop: 12 }}><label>Immagine del gruppo (facoltativa, massimo 2 MB)<br />
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={operazione} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; cambiaImmagine(g, file); }} />
          </label></div>
          {g.immagine_path && <button type="button" style={{ ...bottone, marginTop: 8 }} onClick={() => rimuoviImmagine(g)} disabled={operazione}>Rimuovi immagine</button>}
        </article>)}
      </div>
    </section>}
    {!caricamento && <section style={{ marginTop: 24 }} aria-label="Assegnazioni ragazzi">
      <h2>Assegna i ragazzi ({attivi.length})</h2>
      <label>Cerca per nome o cognome<br /><input style={{ ...campo, width: "min(100%, 460px)" }} value={ricerca} onChange={(e) => { setRicerca(e.target.value); setPaginaRagazzi(0); }} placeholder="Nome o cognome" /></label>
      {visibili.length === 0 && <p>Nessun ragazzo trovato.</p>}
      <div style={{ marginTop: 12 }}>
        {visibili.map((r) => <div key={r.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #ded5c6" }}>
          <span>{nomeRagazzo(r)}</span>
          <label>Gruppo {" "}<select style={campo} value={assegnazioni[r.id] || ""} disabled={operazione} onChange={(e) => assegna(r.id, e.target.value)}>
            <option value="">Da assegnare</option>
            {gruppi.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select></label>
        </div>)}
      </div>
      {filtrati.length > 25 && <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
        <button type="button" style={bottone} disabled={paginaRagazzi === 0} onClick={() => setPaginaRagazzi((p) => p - 1)}>Precedenti</button>
        <span>{paginaRagazzi * 25 + 1}–{Math.min((paginaRagazzi + 1) * 25, filtrati.length)} di {filtrati.length}</span>
        <button type="button" style={bottone} disabled={(paginaRagazzi + 1) * 25 >= filtrati.length} onClick={() => setPaginaRagazzi((p) => p + 1)}>Successivi</button>
      </div>}
    </section>}
  </main>;
}
