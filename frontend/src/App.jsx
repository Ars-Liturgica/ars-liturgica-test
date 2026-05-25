import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  CalendarDays,
  Church,
  Flame,
  Home,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Cross
} from "lucide-react";
import "./style.css";
const API_BASE = "https://ars-liturgica-test-k1tzaay1n-leonardo1-s-projects.vercel.app";
const oggi = new Date();

const dataLiturgica =
  oggi.getFullYear().toString() +
  String(oggi.getMonth() + 1).padStart(2, "0") +
  String(oggi.getDate()).padStart(2, "0");

const CEI_URL =
  `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${dataLiturgica}`;

function testoBreve(testo, max = 520) {
  if (!testo) return "Dato non ancora disponibile.";
  return testo.length > max ? testo.slice(0, max).trim() + "..." : testo;
}

function Header() {
  return (
    <div className="header">
      <Menu />
      <div className="brand">
        <div className="brand-title">✠ ARS LITURGICA</div>
        <div className="brand-subtitle">Al servizio della celebrazione</div>
      </div>
      <div className="header-icons">
        <Search />
        <ShoppingBag />
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={"card " + className}>{children}</div>;
}

function App() {
  const [dataTest, setDataTest] = useState("");
  const [dati, setDati] = useState(null);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function caricaLiturgia(data = "") {
    setCaricamento(true);
    setErrore("");
    try {
      const endpoint = data
        ? `${API_BASE}/api/liturgia?data=${encodeURIComponent(data)}`
        : `${API_BASE}/api/liturgia-oggi`;
      const response = await fetch(endpoint);
      const json = await response.json();
      if (!response.ok) throw new Error(json.dettaglio || json.messaggio || "Errore");
      setDati(json);
    } catch (e) {
     setErrore("");
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    caricaLiturgia();
  }, []);

  const liturgia = dati?.liturgia || {};
  const ars = dati?.arsLiturgica || {};
  const fonte = dati?.fonte || {};

  const strumenti = [
    { nome: "Preghiera", Icon: BookOpen },
    { nome: "Celebrazione", Icon: Church },
    { nome: "Formazione", Icon: Cross },
    { nome: "Meditazione", Icon: Flame },
    { nome: "Carità", Icon: Sparkles }
  ];
  const tempoLiturgico = liturgia.tempo || "Tempo Ordinario";

const pulsanteProdotti =
  tempoLiturgico === "Quaresima"
    ? "Prodotti per la Quaresima"
    : tempoLiturgico === "Avvento"
    ? "Prodotti per l’Avvento"
    : tempoLiturgico === "Pasqua"
    ? "Prodotti per il Tempo Pasquale"
    : "Prodotti per il Tempo Ordinario";

  return (
    <div className="page">
      <div className="app-shell">
        <Header />

        <div className="test-panel">
          <strong>Modalità test privata</strong>
          <span>Inserisci una data CEI in formato AAAAMMGG oppure usa la liturgia di oggi.</span>
          <input
            value={dataTest}
            onChange={(e) => setDataTest(e.target.value)}
            placeholder="Esempio: 20260521"
          />
          <button onClick={() => caricaLiturgia(dataTest)}>Prova data</button>
          <button onClick={() => { setDataTest(""); caricaLiturgia(""); }}>Oggi</button>
        </div>

        {caricamento && <div className="status">Caricamento liturgia CEI...</div>}
        

        <main className="hero">
          <section className="left-ambience">
            <div className="candle" />
            <div className="ambience-text">Candela • Parola • Celebrazione</div>
          </section>

          <section className="content">
            <div className="title-block">
              <h1>Liturgia del Giorno</h1>
              <div className="gold-line" />
              <div className="date-row">
                <CalendarDays />
                <span>{liturgia.data || "Data liturgica"}</span>
                <div className="liturgical-info">
  <p>{liturgia.tempo || "Tempo Ordinario"}</p>
  <p>Colore liturgico: {liturgia.colore || "Verde"}</p>
  <p>{liturgia.memoria || "Memoria del giorno"}</p>
</div>
              </div>
              <div className="season">• {liturgia.titolo || "Periodo liturgico"}</div>
            </div>

            <Card className="gospel-card">
              <div className="icon-round"><BookOpen /></div>
              <div>
                <h2>Vangelo del giorno</h2>
                <p className="reference">Fonte CEI</p>
                <p className="gospel-text">{testoBreve(liturgia.vangelo)}</p>
                <a className="dark-button" href={CEI_URL} target="_blank" rel="noreferrer">
                  Leggi il Vangelo completo ›
                </a>
                <p className="source-note">{fonte.nota}</p>
              </div>
            </Card>

            <Card className="tools-card">
              <div className="tools-header">
                <h2>Strumenti per vivere questo tempo</h2>
                <span>Scopri tutti</span>
              </div>
              <div className="tools-grid">
                {strumenti.map(({ nome, Icon }) => (
                  <div className="tool" key={nome}>
                    <Icon />
                    <span>{nome}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <aside className="side">
            <Card>
              <div className="side-title"><Flame /> Una luce sulla Parola</div>
              <p>{ars.unaLuceSullaParola || "Breve spunto meditativo."}</p>
              <span className="linkish">Approfondisci ›</span>
            </Card>

            <Card>
              <h3>Memoria del giorno</h3>
              <p>Da integrare dal blocco CEI quando disponibile in modo stabile.</p>
              <span className="linkish">Scopri di più ›</span>
            </Card>

            <Card>
              <h3>Celebrazione</h3>
              <ul>
                <li>Colore liturgico: {liturgia.coloreLiturgico || "-"}</li>
                <li>Periodo: {liturgia.periodoNome || "-"}</li>
                <li>Fonte: CEI</li>
              </ul>
            </Card>

            <Card className="shop-card">
              <ShoppingBag />
              <div>
                <h3>Prodotti</h3>
                <p>Selezione Ars Liturgica</p>
                <a href={ars.pulsanteProdotti?.url || "https://www.genesiartesacra.it/shop/"} target="_blank" rel="noreferrer">
                  Vai allo shop ›
                </a>
              </div>
            </Card>
          </aside>
        </main>

        <nav className="bottom-nav">
          <div><Home />Home</div>
          <div><BookOpen />Liturgia del giorno</div>
          <div><Flame />Luce e incenso</div>
          <div><Church />Sacramenti</div>
          <div><ShoppingBag />La mia sacrestia</div>
        </nav>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
