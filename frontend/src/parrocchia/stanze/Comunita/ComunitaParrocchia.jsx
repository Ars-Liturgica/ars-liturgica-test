import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function ComunitaParrocchia({
  parrocchiaId,
  tornaDashboard,
}) {
  const [persone, setPersone] = useState([]);
  const [ricerca, setRicerca] = useState("");
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    async function caricaComunita() {
      if (!parrocchiaId) {
        setCaricamento(false);
        return;
      }

      setCaricamento(true);
      setErrore("");

      try {
        // FEDeli / UTENTI collegati alla parrocchia
        const { data: collegamenti, error: erroreUtenti } = await supabase
          .from("utenti_parrocchie")
          .select(`
            utente_id,
            ruolo,
            utenti (
              id,
              nome,
              cognome,
              email,
              telefono,
              citta,
              cap,
              identificativo
            )
          `)
          .eq("parrocchia_id", parrocchiaId);

        if (erroreUtenti) throw erroreUtenti;

        const utentiComunita = (collegamenti || [])
          .filter((record) => record.utenti)
          .map((record) => ({
            chiave: `utente-${record.utente_id}`,
            utenteId: record.utente_id,
            nome: record.utenti.nome || "",
            cognome: record.utenti.cognome || "",
            ruolo: record.ruolo || "fedele",
            telefono: record.utenti.telefono || "",
            email: record.utenti.email || "",
            citta: record.utenti.citta || "",
            cap: record.utenti.cap || "",
          }));

        // SACERDOTI / COLLABORATORI della parrocchia
        const { data: personeParrocchia, error: errorePersone } =
          await supabase
            .from("persone_parrocchia")
            .select("*")
            .eq("parrocchia_id", parrocchiaId);

        if (errorePersone) throw errorePersone;

        // Evita di inserire due volte chi è già presente come utente
        const utentiGiaPresenti = new Set(
          utentiComunita
            .map((persona) => persona.utenteId)
            .filter(Boolean)
        );

        const sacerdotiECollaboratori = (personeParrocchia || [])
          .filter(
            (persona) =>
              !persona.utente_id ||
              !utentiGiaPresenti.has(persona.utente_id)
          )
          .map((persona) => ({
            chiave: `persona-${persona.id}`,
            utenteId: persona.utente_id || null,
            nome: persona.nome || "",
            cognome: persona.cognome || "",
            ruolo: persona.ruolo_base || "collaboratore",
            telefono: persona.telefono || "",
            email: persona.email || "",
            citta: persona.citta || "",
            cap: persona.cap || "",
          }));

        const elencoCompleto = [
          ...utentiComunita,
          ...sacerdotiECollaboratori,
        ].sort((a, b) => {
          const cognomeA = (a.cognome || "").toLowerCase();
          const cognomeB = (b.cognome || "").toLowerCase();

          if (cognomeA !== cognomeB) {
            return cognomeA.localeCompare(cognomeB);
          }

          return (a.nome || "").localeCompare(b.nome || "");
        });

        setPersone(elencoCompleto);
      } catch (error) {
        console.error("Errore caricamento Comunità:", error);
        setErrore(
          "Non è stato possibile caricare l'elenco della Comunità."
        );
      } finally {
        setCaricamento(false);
      }
    }

    caricaComunita();
  }, [parrocchiaId]);

  const personeFiltrate = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    if (!testo) return persone;

    return persone.filter((persona) => {
      return [
        persona.nome,
        persona.cognome,
        persona.ruolo,
        persona.telefono,
        persona.email,
        persona.citta,
        persona.cap,
      ]
        .filter(Boolean)
        .some((valore) =>
          String(valore).toLowerCase().includes(testo)
        );
    });
  }, [persone, ricerca]);

  function formattaRuolo(ruolo) {
    if (!ruolo) return "—";

    return ruolo
      .replaceAll("_", " ")
      .replace(/\b\w/g, (lettera) => lettera.toUpperCase());
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      <button
        type="button"
        onClick={tornaDashboard}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        ← Torna alla Dashboard
      </button>

      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ marginBottom: "8px" }}>Comunità</h2>

        <p style={{ margin: 0 }}>
          Fedeli, sacerdoti e collaboratori della parrocchia.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <input
          type="search"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          placeholder="Cerca per nome, ruolo, telefono o email..."
          style={{
            flex: "1 1 360px",
            padding: "12px 14px",
            border: "1px solid #d4d4d4",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />

        <strong>
          {personeFiltrate.length}{" "}
          {personeFiltrate.length === 1 ? "persona" : "persone"}
        </strong>
      </div>

      {caricamento && <p>Caricamento Comunità...</p>}

      {errore && (
        <p style={{ fontWeight: "600" }}>
          {errore}
        </p>
      )}

      {!caricamento && !errore && personeFiltrate.length === 0 && (
        <p>Nessun nominativo trovato.</p>
      )}

      {!caricamento && !errore && personeFiltrate.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#ffffff",
            }}
          >
            <thead>
              <tr>
                {[
                  "Nome",
                  "Cognome",
                  "Ruolo",
                  "Telefono",
                  "Email",
                  "Città",
                  "CAP",
                ].map((titolo) => (
                  <th
                    key={titolo}
                    style={{
                      textAlign: "left",
                      padding: "13px 12px",
                      borderBottom: "2px solid #dddddd",
                      color: "#7a1f3d",
fontWeight: "700",
                    }}
                  >
                    {titolo}
                  </th>
                ))}
              </tr>
            </thead>

         <tbody style={{ color: "#222222" }}>
              {personeFiltrate.map((persona) => (
                <tr key={persona.chiave}>
                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.nome || "—"}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.cognome || "—"}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {formattaRuolo(persona.ruolo)}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.telefono || "—"}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.email || "—"}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.citta || "—"}
                  </td>

                  <td
                    style={{
                      padding: "13px 12px",
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    {persona.cap || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
