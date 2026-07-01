import React from "react";
export default function AccessoRiservato() {
  return (
    <section
      style={{
        maxWidth: "920px",
        margin: "34px auto",
        padding: "10px",
        border: "2px solid #d6a23a",
        borderRadius: "18px",
        background: "linear-gradient(135deg, #fff6df 0%, #f8e8c5 100%)",
        boxShadow: "0 8px 22px rgba(90, 50, 0, 0.28)",
      }}
    >
      <div
        style={{
          border: "1px solid #e6c46d",
          borderRadius: "14px",
          display: "grid",
          gridTemplateColumns: "38% 62%",
          overflow: "hidden",
          background: "rgba(255, 250, 235, 0.75)",
        }}
      >
        <div
          style={{
            minHeight: "320px",
           backgroundImage: "url('/access-door.png')",
           backgroundColor: "#fffaeb",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        <div
          style={{
            padding: "30px 34px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#5b0b0b",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              border: "2px solid #d6a23a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b88318",
              fontSize: "26px",
              marginBottom: "14px",
            }}
          >
            ⛪
          </div>

          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "31px",
              lineHeight: "1.1",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#6b1111",
            }}
          >
            ACCESSO RISERVATO
          </h2>

          <div
            style={{
              width: "120px",
              height: "1px",
              background: "#d6a23a",
              marginBottom: "18px",
            }}
          />

          <p
            style={{
              margin: "0 0 24px 0",
              fontSize: "17px",
              lineHeight: "1.45",
              color: "#2d1b0b",
            }}
          >
            Entra nella tua area dedicata per gestire
            <br />
            la vita della tua comunità.
          </p>

          <button
            style={{
              background: "linear-gradient(180deg, #8b0000, #5a0000)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "13px 32px",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.4px",
              cursor: "pointer",
              boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
            }}
          >
            🔒 ENTRA NELLA TUA AREA
          </button>
        </div>
      </div>
    </section>
  );
}
