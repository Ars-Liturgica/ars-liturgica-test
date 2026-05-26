import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import datiLiturgia from "./data/liturgia.json";
import "./style.css";

function App() {
  const isAdmin = window.location.hash === "#admin";
  return isAdmin ? <AdminPage /> : <PublicPage />;
}

function PublicPage() {
  const oggi = "2026-05-26";
  const liturgia = datiLiturgia[oggi];

  if (!liturgia) {
    return <Page><h1>Ars Liturgica</h1><p>Dati liturgici non disponibili.</p></Page>;
  }

  return (
    <Page>
      <h1>✠ ARS LITURGICA</h1>
      <p>Al servizio della celebrazione</p>

      <section className="card">
        <h2>Liturgia del Giorno</h2>
        <p><b>Tempo liturgico:</b> {liturgia.tempoLiturgico}</p>
        <p><b>Colore:</b> {liturgia.coloreLiturgico}</p>
        <p><b>Memoria:</b> {liturgia.memoria}</p>
        <p><b>Vangelo:</b> {liturgia.vangelo}</p>
        <p><b>{liturgia.titoloVangelo}</b></p>
        <p>{liturgia.spunto}</p>

        <a className="button" href={liturgia.linkCEI} target="_blank" rel="noreferrer">
          Per approfondire sul sito CEI
        </a>
      </section>

      <h2>Prodotti del Tempo Liturgico</h2>
      {liturgia.prodottiTempoLiturgico.map((p, i) => (
        <section className="card" key={i}>
          <h3>{p.nome}</h3>
          <a href={p.link} target="_blank" rel="noreferrer">Vai al prodotto</a>
        </section>
      ))}
    </Page>
  );
}

function AdminPage() {
  const [data, setData] = useState("2026-05-27");
  const [memoria, setMemoria] = useState("");
  const [vangelo, setVangelo] = useState("");
  const [spunto, setSpunto] = useState("");

  const json = `"${data}": {
  "tempoLiturgico": "Tempo Ordinario",
  "coloreLiturgico": "Verde",
  "memoria": "${memoria}",
  "vangelo": "${vangelo}",
  "titoloVangelo": "",
  "spunto": "${spunto}",
  "linkCEI": "https://www.chiesacattolica.it/liturgia-del-giorno/",
  "prodottiTempoLiturgico": []
}`;

  return (
    <Page>
      <h1>Regia Liturgica Privata</h1>
      <section className="card">
        <p>Data</p><input value={data} onChange={e => setData(e.target.value)} />
        <p>Memoria / Santo</p><input value={memoria} onChange={e => setMemoria(e.target.value)} />
        <p>Vangelo</p><input value={vangelo} onChange={e => setVangelo(e.target.value)} />
        <p>Una luce sulla Parola</p><textarea value={spunto} onChange={e => setSpunto(e.target.value)} />

        <h3>Blocco da copiare nel database</h3>
        <pre>{json}</pre>
      </section>
    </Page>
  );
}

function Page({ children }) {
  return (
    <div style={{
      background: "#2b0000",
      minHeight: "100vh",
      color: "#f5e6c8",
      padding: "30px",
      fontFamily: "serif"
    }}>
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

