import React from "react";
import datiLiturgia from "./data/liturgia.json";
import "./style.css";

export default function App() {

  const oggi = "2026-05-26";

  const liturgia = datiLiturgia[oggi];

  if (!liturgia) {
    return (
      <div
        style={{
          background: "#2b0000",
          minHeight: "100vh",
          color: "#f5e6c8",
          padding: "40px",
          fontFamily: "serif"
        }}
      >
        <h1>Ars Liturgica</h1>
        <p>Dati liturgici non disponibili.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#2b0000",
        minHeight: "100vh",
        color: "#f5e6c8",
        padding: "30px",
        fontFamily: "serif"
      }}
    >

      <h1
        style={{
          color: "#d4a017",
          fontSize: "42px",
          marginBottom: "10px"
        }}
      >
        Ars Liturgica
      </h1>

      <h2 style={{ marginBottom: "20px" }}>
        Liturgia del Giorno
      </h2>

      <div
        style={{
          background: "#f5e6c8",
          color: "#2b0000",
          padding: "25px",
          borderRadius: "18px",
          marginBottom: "25px"
        }}
      >

        <p><strong>Tempo Liturgico:</strong> {liturgia.tempoLiturgico}</p>

        <p><strong>Colore:</strong> {liturgia.coloreLiturgico}</p>

        <p><strong>Memoria:</strong> {liturgia.memoria}</p>

        <p><strong>Vangelo:</strong> {liturgia.vangelo}</p>

        <p><strong>Titolo:</strong> {liturgia.titoloVangelo}</p>

        <hr />

        <p>
          <strong>Una luce sulla Parola:</strong>
        </p>

        <p>{liturgia.spunto}</p>

        <a
          href={liturgia.linkCEI}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: "15px",
            background: "#7a0000",
            color: "#f5e6c8",
            padding: "12px 20px",
            borderRadius: "10px",
            textDecoration: "none"
          }}
        >
          Per approfondire sul sito CEI
        </a>

      </div>

      <h2
        style={{
          marginBottom: "20px",
          color: "#d4a017"
        }}
      >
        Prodotti del Tempo Liturgico
      </h2>

      <div
        style={{
          display: "grid",
          gap: "20px"
        }}
      >

        {liturgia.prodottiTempoLiturgico.map((prodotto, index) => (

          <div
            key={index}
            style={{
              background: "#f5e6c8",
              color: "#2b0000",
              padding: "20px",
              borderRadius: "16px"
            }}
          >

            <h3>{prodotto.nome}</h3>

            <a
              href={prodotto.link}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#7a0000",
                fontWeight: "bold"
              }}
            >
              Vai al prodotto
            </a>

          </div>

        ))}

      </div>

    </div>
  );
}


   

 
  

