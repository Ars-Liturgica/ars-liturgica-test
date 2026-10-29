import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

/** Pagina pubblica: nessun dato personale o singolo pagamento viene richiesto. */
export default function IniziativaPubblica() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("ars_iniziativa");
  const parrocchiaId = params.get("ars_parrocchia");
  const [item, setItem] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!id || !parrocchiaId || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(parrocchiaId)) throw new Error("Collegamento non valido.");
        const { data, error: rpcError } = await supabase.rpc("ars_elenco_progetti_donazioni_pubblici", { p_parrocchia_id: parrocchiaId });
        if (rpcError) throw rpcError;
        const list = Array.isArray(data) ? data : typeof data === "string" ? JSON.parse(data) : [];
        const selected = list.find(p => p.id === id);
        if (!selected) throw new Error("Iniziativa non pubblicata o non disponibile.");
        const { data: allegati, error: filesError } = await supabase.from("ars_allegati_iniziative")
          .select("id,nome_file,percorso,tipo_mime,principale")
          .eq("parrocchia_id", parrocchiaId).eq("iniziativa_id", id).order("creato_at");
        if (filesError) throw filesError;
        if (active) { setItem(selected); setFiles(allegati || []); }
      } catch (e) { if (active) setError(e.message || "Impossibile caricare l'iniziativa."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id, parrocchiaId]);
  const url = path => supabase.storage.from("ars-progetti").getPublicUrl(path).data.publicUrl;
  const euro = (n, currency="EUR") => Number(n||0).toLocaleString("it-IT", { style: "currency", currency });
  return <main style={{ maxWidth: 850, margin: "30px auto", padding: 24, color: "#24394a", fontFamily: "Georgia,serif" }}>
    {loading && <p>Caricamento...</p>}
    {error && <p role="alert">{error}</p>}
    {item && <>
      <p style={{ letterSpacing: 2 }}>ARS LITURGICA · {item.tipo_iniziativa === "raccolta" ? "RACCOLTA FONDI" : "PROGETTO"}</p>
      <h1>{item.titolo}</h1>
      <p style={{ whiteSpace: "pre-wrap", fontSize: 18 }}>{item.descrizione}</p>
      {item.mostra_contatore && <p><strong>Obiettivo:</strong> {item.obiettivo ? euro(item.obiettivo,item.valuta) : "Libero"} · <strong>Raccolto:</strong> {euro(item.raccolto,item.valuta)}</p>}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {files.filter(f=>f.tipo_mime.startsWith("image/")).map(f=><a key={f.id} href={url(f.percorso)} target="_blank" rel="noreferrer"><img src={url(f.percorso)} alt={f.nome_file} style={{width:"100%",maxHeight:350,objectFit:"contain"}} /></a>)}
      </section>
      {files.some(f=>f.tipo_mime==="application/pdf") && <h2>Documenti</h2>}
      {files.filter(f=>f.tipo_mime==="application/pdf").map(f=><p key={f.id}><a href={url(f.percorso)} target="_blank" rel="noreferrer">📄 {f.nome_file}</a></p>)}
    </>}
  </main>;
}
