import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import RegistrazioneParroco from "./RegistrazioneParroco";
import RegistrazioneParrocchia from "./RegistrazioneParrocchia";
import AttivazioneParrocchia from "./AttivazioneParrocchia";
import DashboardParroco from "./DashboardParroco";
import AccessoParroco from "./AccessoParroco";
export default function AreaParrocchiale({ tornaHome }) {
 const [fase, setFase] = useState("accessoParroco");


const [datiParrocchia, setDatiParrocchia] = useState(null);
const [nomeParrocchiaAttiva, setNomeParrocchiaAttiva] = useState(
  localStorage.getItem("ars_nome_parrocchia") || ""
);
useEffect(() => {
  async function controllaSessione() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return;
    }

    const { data } = await supabase
      .from("utenti_parrocchie")
      .select("parrocchia_id, ruolo")
      .eq("utente_id", session.user.id)
      .eq("stato", "attivo")
      .single();

    if (data) {
      localStorage.setItem("ars_parrocchia_id", data.parrocchia_id);
      localStorage.setItem("ars_ruolo", data.ruolo);

      setFase("dashboard");
    }
  }

  controllaSessione();
}, []);
  function vaiARegistrazioneParrocchia() {
    setFase("registrazioneParrocchia");
  }

  function richiediAttivazione(dati) {
    setDatiParrocchia(dati);
    setFase("attivazione");
  }

  function completaAttivazione() {
  setNomeParrocchiaAttiva(localStorage.getItem("ars_nome_parrocchia") || "");
  setFase("dashboard");
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff8e8 0%, #f6ead2 100%)",
        color: "#102a43",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <header
        style={{
          background: "linear-gradient(90deg, #061d35, #0b2f55)",
          color: "#fff8e8",
          padding: "22px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #d6a23a",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "36px" }}>Ars Liturgica</h1>
          <p style={{ margin: "4px 0 0", color: "#d6a23a" }}>
            Al servizio della celebrazione
          </p>

         {nomeParrocchiaAttiva && (
  <p
    style={{
      margin: "10px 0 0",
      fontSize: "18px",
      color: "#fff8e8",
      fontWeight: "bold",
    }}
  >
    {nomeParrocchiaAttiva}
  </p>
)}
        </div>

        <button
          onClick={tornaHome}
          style={{
            background: "#fff8e8",
            color: "#0b2f55",
            border: "1px solid #d6a23a",
            borderRadius: "8px",
            padding: "10px 16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Torna alla Home
        </button>
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 20px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.82)",
            border: "1px solid #d6a23a",
            borderRadius: "18px",
            padding: "34px",
            boxShadow: "0 14px 36px rgba(80, 45, 10, 0.16)",
          }}
        >
          
            {fase === "accessoParroco" && (
  <AccessoParroco
    onAccessoCompletato={() => window.location.reload()}
  />
)}
          {fase === "registrazioneParrocchia" && (
            <RegistrazioneParrocchia
              onRichiediAttivazione={richiediAttivazione}
            />
          )}

          {fase === "attivazione" && datiParrocchia && (
            <AttivazioneParrocchia
              idParrocchia={datiParrocchia.idParrocchia}
              nomeParrocchia={datiParrocchia.nomeParrocchia}
              emailParroco={datiParrocchia.emailParroco}
              onAttivazioneCompletata={completaAttivazione}
            />
          )}

          {fase === "dashboard" && (
  <DashboardParroco nomeParrocchia={nomeParrocchiaAttiva} />
)}
        </div>
      </main>
    </div>
  );
}
