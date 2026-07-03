import React from "react";
import RegistrazioneParroco from "./RegistrazioneParroco";

export default function AreaParrocchiale({ tornaHome }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff8e8 0%, #f6ead2 100%)",
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
          <h1 style={{ margin: 0, fontSize: "34px" }}>Ars Liturgica</h1>
          <p style={{ margin: 0, color: "#d6a23a", fontSize: "16px" }}>
            Al servizio della celebrazione
          </p>
        </div>

        <button
          onClick={tornaHome}
          style={{
            background: "transparent",
            color: "#fff8e8",
            border: "1px solid #d6a23a",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          ← Torna alla Home
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
          <RegistrazioneParroco />
        </div>
      </main>
    </div>
  );
}
