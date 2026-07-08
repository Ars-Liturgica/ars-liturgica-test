import React, { useState } from "react";

function AccessoComunita({ tornaHome }) {
 const [messaggio, setMessaggio] = useState("");
const [parrocchiaTrovata, setParrocchiaTrovata] = useState(false);

  const handleRicercaParrocchia = (e) => {
    e.preventDefault();

setParrocchiaTrovata(true);
setMessaggio("Abbiamo trovato una parrocchia compatibile con i dati inseriti.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f1e6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#fffaf0",
          border: "2px solid #8b1e2d",
          borderRadius: "22px",
          padding: "34px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#8b1e2d", marginBottom: "6px" }}>
          Ars Liturgica
        </h1>

        <p style={{ color: "#8a6d2f", marginTop: 0, marginBottom: "28px" }}>
          Al servizio della celebrazione
        </p>

     <h2 style={{ color: "#2f3a4a", marginBottom: "12px" }}>
  Unisciti alla tua Comunità Parrocchiale
</h2>

        <p style={{ color: "#4a4a4a", lineHeight: "1.5", marginBottom: "26px" }}>
       Compila i dati richiesti per individuare la tua parrocchia e iniziare il percorso di accesso alla comunità.
        </p>
<p
  style={{
    fontStyle: "italic",
    color: "#6b5d4a",
    fontSize: "15px",
    marginBottom: "24px",
  }}
>
  Ti accompagneremo passo dopo passo fino all'ingresso nella tua comunità.
</p>
        <form onSubmit={handleRicercaParrocchia}>
          {["Nome", "Cognome", "Email", "Cellulare", "Città", "CAP"].map(
            (campo) => (
              <input
                key={campo}
                type={campo === "Email" ? "email" : "text"}
                placeholder={`${campo} *`}
                required
                style={{
                  width: "100%",
                  padding: "13px",
                  marginBottom: "14px",
                  borderRadius: "10px",
                  border: "1px solid #c9b27c",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            )
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "8px",
              background: "#2f6f4e",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            CERCA LA TUA PARROCCHIA
          </button>
        </form>

        <p
          style={{
            fontSize: "13px",
            color: "#6b6b6b",
            marginTop: "18px",
            lineHeight: "1.4",
          }}
        >
          Città e CAP saranno utilizzati per individuare la tua parrocchia.
        </p>

        {messaggio && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#eef7f0",
              color: "#2f6f4e",
              border: "1px solid #8fc49d",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            ✅ {messaggio}
          </div>
        )}
{parrocchiaTrovata && (
  <div
    style={{
      marginTop: "18px",
      padding: "18px",
      borderRadius: "14px",
      background: "#fffaf0",
      border: "1px solid #d6b56d",
      color: "#2f3a4a",
      lineHeight: "1.5",
    }}
  >
    <strong>Parrocchia trovata:</strong>
    <br />
    Parrocchia San Marcellino

    <button
      type="button"
      style={{
        width: "100%",
        padding: "13px",
        marginTop: "16px",
        background: "#8b1e2d",
        color: "white",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      ENTRA NELLA MIA PARROCCHIA
    </button>
  </div>
)}
        <button
          onClick={tornaHome}
          style={{
            marginTop: "26px",
            background: "transparent",
            border: "none",
            color: "#8b1e2d",
            cursor: "pointer",
            fontSize: "15px",
            textDecoration: "underline",
          }}
        >
          ← Torna alla Home
        </button>
      </div>
    </div>
  );
}

export default AccessoComunita;
