import React from "react";

export default function AccessoRiservato({
  onAttivaParrocchia,
  onAccediGestione,
  onEntraComunita,
  onEntraFedele,
  onEntraSuperAdmin,
}) {
  const stilePulsante = {
    width: "100%",
    minHeight: "54px",
    borderRadius: "10px",
    padding: "10px 12px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "0.25px",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
  };

  return (
    <section
      style={{
        maxWidth: "920px",
        margin: "34px auto",
        padding: "10px",
        border: "2px solid #d6a23a",
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, #fff6df 0%, #f8e8c5 100%)",
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
        {/* PORTA - INVARIATA */}
        <div
          style={{
            minHeight: "390px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          }}
        >
          <img
            src="/access-door.png"
            alt="Ingresso Ars Liturgica"
            style={{
              width: "520px",
              maxWidth: "none",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* AREA ACCESSI */}
        <div
          style={{
            padding: "24px 26px",
            color: "#5b0b0b",
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              textAlign: "center",
              fontSize: "28px",
              lineHeight: "1.15",
              color: "#8b1e2d",
              letterSpacing: "0.4px",
            }}
          >
            ENTRA IN ARS LITURGICA
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontSize: "16px",
              color: "#6b5a45",
            }}
          >
            Scegli semplicemente il percorso che ti riguarda
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* PARROCO */}
            <div
              style={{
                border: "2px solid #d6a23a",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#fffaf0",
                boxShadow: "0 5px 14px rgba(90,50,0,0.10)",
              }}
            >
              <div
                style={{
                  padding: "13px 10px",
                  textAlign: "center",
                  color: "#ffffff",
                  background: "#8b1e2d",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  ⛪ Parroco e collaboratori
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                  }}
                >
                  Gestione della comunità
                </div>
              </div>

              <div style={{ padding: "15px" }}>
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#6b5a45",
                    marginBottom: "7px",
                  }}
                >
                  Per iniziare
                </div>

                <button
                  type="button"
                  onClick={onAttivaParrocchia}
                  style={{
                    ...stilePulsante,
                    background:
                      "linear-gradient(180deg, #8b1e2d, #68131d)",
                    border: "1px solid #68131d",
                  }}
                >
                  ATTIVA UNA PARROCCHIA
                </button>

                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#6b5a45",
                    marginTop: "15px",
                    marginBottom: "7px",
                  }}
                >
                  Se Ars è già attiva
                </div>

                <button
                  type="button"
                  onClick={onAccediGestione}
                  style={{
                    ...stilePulsante,
                    background:
                      "linear-gradient(180deg, #0b2f55, #061d35)",
                    border: "1px solid #d6a23a",
                  }}
                >
                  ACCEDI ALLA GESTIONE
                </button>
              </div>
            </div>

            {/* FEDELI */}
            <div
              style={{
                border: "2px solid #d6a23a",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#fffaf0",
                boxShadow: "0 5px 14px rgba(90,50,0,0.10)",
              }}
            >
              <div
                style={{
                  padding: "13px 10px",
                  textAlign: "center",
                  color: "#ffffff",
                  background: "#2f6f4e",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  👥 Fedeli
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                  }}
                >
                  Ingresso nella propria parrocchia
                </div>
              </div>

              <div style={{ padding: "15px" }}>
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#6b5a45",
                    marginBottom: "7px",
                  }}
                >
                  Per unirti alla comunità
                </div>

                <button
                  type="button"
                  onClick={onEntraComunita}
                  style={{
                    ...stilePulsante,
                    background:
                      "linear-gradient(180deg, #2f8f55, #246d43)",
                    border: "1px solid #24593e",
                  }}
                >
                  UNISCITI ALLA TUA COMUNITÀ PARROCCHIALE
                </button>

                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#6b5a45",
                    marginTop: "15px",
                    marginBottom: "7px",
                  }}
                >
                  Se sei già registrato
                </div>

                <button
                  type="button"
                  onClick={onEntraFedele}
                  style={{
                    ...stilePulsante,
                    background:
                      "linear-gradient(180deg, #8b1e2d, #68131d)",
                    border: "1px solid #d6a23a",
                  }}
                >
                  ENTRA NELLA TUA PARROCCHIA
                </button>
              </div>
            </div>
          </div>

          {/* SUPERADMIN */}
          <div
            style={{
              textAlign: "center",
              marginTop: "18px",
              paddingTop: "14px",
              borderTop: "1px solid #d8c59a",
            }}
          >
            <button
              type="button"
              onClick={onEntraSuperAdmin}
              style={{
                background: "transparent",
                border: "none",
                color: "#8b0000",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline",
              }}
            >
              Console SuperAdmin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
