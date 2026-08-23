import React, { useState } from "react";
import BachecaAvvisi from "./stanze/BachecaAvvisi/BachecaAvvisi";

export default function DashboardFedele() {
  const [stanzaAperta, setStanzaAperta] = useState(null);

  const parrocchia = {
    id: localStorage.getItem("ars_parrocchia_id"),
    nome:
      localStorage.getItem("ars_nome_parrocchia") ||
      "La tua Parrocchia",
  };

  const messaggioBenvenuto =
    localStorage.getItem("ars_messaggio_benvenuto") ||
    "Siamo lieti di accoglierti in questo spazio dedicato alla nostra comunità. Qui potrai trovare avvisi, informazioni e partecipare alla vita della Parrocchia attraverso gli spazi a tua disposizione.";

  if (stanzaAperta === "bacheca-avvisi") {
    return (
      <BachecaAvvisi
        parrocchia={parrocchia}
        solaLettura={true}
        onTorna={() => setStanzaAperta(null)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f3ed",
        padding: "40px 20px",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "28px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "13px 22px",
              border: "1px solid #c99536",
              borderRadius: "12px",
              background: "#fffaf0",
              color: "#173955",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Torna alla Home
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#8a7258",
              marginBottom: "8px",
            }}
          >
            La mia Parrocchia
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: "500",
              color: "#3e3328",
            }}
          >
            {parrocchia.nome}
          </h1>
        </div>

        <div
          style={{
            background: "#fffdf9",
            border: "1px solid #e5d9ca",
            borderRadius: "18px",
            padding: "28px 32px",
            marginBottom: "38px",
            boxShadow: "0 6px 20px rgba(68, 52, 35, 0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "24px",
              fontWeight: "500",
              color: "#49392c",
            }}
          >
            Benvenuto nella tua Parrocchia
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "17px",
              lineHeight: "1.75",
              color: "#66584c",
            }}
          >
            {messaggioBenvenuto}
          </p>
        </div>

        <div
          style={{
            marginBottom: "18px",
            color: "#6e5d4d",
            fontSize: "15px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Gli spazi della tua comunità
        </div>

        <div
          onClick={() => setStanzaAperta("bacheca-avvisi")}
          style={{
            width: "100%",
            maxWidth: "360px",
            background: "#ffffff",
            border: "1px solid #e2d7ca",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 8px 24px rgba(68, 52, 35, 0.08)",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "34px",
              marginBottom: "16px",
            }}
          >
            📌
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "22px",
              fontWeight: "500",
              color: "#49392c",
            }}
          >
            Bacheca Avvisi
          </h2>

          <p
            style={{
              margin: 0,
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#75695e",
            }}
          >
            Consulta gli avvisi e le informazioni della tua comunità
            parrocchiale.
          </p>
        </div>
      </div>
    </div>
  );
}
