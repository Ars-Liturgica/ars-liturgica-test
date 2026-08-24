import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import DashboardFedele from "./DashboardFedele";

export default function AccessoFedele({ tornaHome }) {
  const [identificativo, setIdentificativo] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const [accessoCompletato, setAccessoCompletato] = useState(false);

  async function entraNellaParrocchia() {
    const idScelto = identificativo.trim();

    if (!idScelto) {
      setMessaggio("Inserisci il nome con cui ti sei registrato.");
      return;
    }

    setCaricamento(true);
    setMessaggio("");

    try {
  const { data, error } = await supabase.rpc("entra_fedele", {
    p_identificativo: idScelto,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    setMessaggio(
      "Non troviamo questo nome. Controlla di averlo scritto come al momento della registrazione."
    );
    return;
  }

  localStorage.setItem("ars_utente_id", data.utente_id);
  localStorage.setItem("ars_parrocchia_id", data.parrocchia_id);
  localStorage.setItem("ars_nome_parrocchia", data.nome_parrocchia);
  localStorage.setItem("ars_identificativo", data.identificativo);

  setAccessoCompletato(true);
    } catch (error) {
      console.error("Errore accesso fedele:", error);
      setMessaggio(
        "Non è stato possibile entrare nella tua Parrocchia. Riprova."
      );
    } finally {
      setCaricamento(false);
    }
  }

  if (accessoCompletato) {
    return <DashboardFedele />;
  }

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "40px auto",
        padding: "32px",
        background: "#fffaf0",
        border: "1px solid #d6a23a",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(68, 52, 35, 0.10)",
      }}
    >
      <h2
        style={{
          margin: "0 0 12px",
          color: "#7a0000",
          fontSize: "30px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        Entra nella tua Parrocchia
      </h2>

      <p
        style={{
          margin: "0 0 26px",
          color: "#5f5145",
          fontSize: "17px",
          lineHeight: "1.6",
        }}
      >
        Inserisci il nome con cui ti sei registrato.
      </p>

      <input
        type="text"
        value={identificativo}
        onChange={(e) => setIdentificativo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") entraNellaParrocchia();
        }}
        placeholder="Il nome con cui ti sei registrato"
        autoComplete="off"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 16px",
          border: "1px solid #c9b58e",
          borderRadius: "10px",
          fontSize: "17px",
          marginBottom: "18px",
        }}
      />

      <button
        type="button"
        onClick={entraNellaParrocchia}
        disabled={caricamento}
        style={{
          width: "100%",
          padding: "14px 20px",
          border: "none",
          borderRadius: "10px",
          background: "#7a0000",
          color: "#ffffff",
          fontSize: "17px",
          fontWeight: "700",
          cursor: caricamento ? "default" : "pointer",
        }}
      >
        {caricamento ? "ACCESSO..." : "ENTRA"}
      </button>

      {messaggio && (
        <p
          style={{
            margin: "18px 0 0",
            color: "#8b0000",
            fontSize: "15px",
            lineHeight: "1.5",
          }}
        >
          {messaggio}
        </p>
      )}

      {tornaHome && (
        <button
          type="button"
          onClick={tornaHome}
          style={{
            marginTop: "22px",
            border: "none",
            background: "transparent",
            color: "#0b2f55",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          Torna alla Home
        </button>
      )}
    </div>
  );
}
