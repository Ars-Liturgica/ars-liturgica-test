import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SHOP_URL = "https://www.genesiartesacra.it/shop/";

const regiaProdotti = {
  avvento: {
    nome: "Avvento",
    colore: "viola",
    prodotti: []
  },
  natale: {
    nome: "Natale",
    colore: "bianco-oro",
    prodotti: []
  },
  quaresima: {
    nome: "Quaresima",
    colore: "viola",
    prodotti: []
  },
  pasqua: {
    nome: "Pasqua",
    colore: "bianco-oro",
    prodotti: []
  },
  tempo_ordinario: {
    nome: "Tempo Ordinario",
    colore: "verde",
    prodotti: []
  },
  martiri: {
    nome: "Martiri",
    colore: "rosso",
    prodotti: []
  }
};

function normalizzaTesto(testo) {
  return testo.replace(/\s+/g, " ").trim();
}

function estraiTra(testo, inizio, fine) {
  const start = testo.indexOf(inizio);
  if (start === -1) return "";
  const from = start + inizio.length;
  const end = testo.indexOf(fine, from);
  if (end === -1) return testo.slice(from).trim();
  return testo.slice(from, end).trim();
}

function riconosciPeriodoLiturgico(titolo) {
  const t = (titolo || "").toLowerCase();

  if (t.includes("avvento")) return "avvento";
  if (t.includes("natale")) return "natale";
  if (t.includes("quaresima")) return "quaresima";
  if (t.includes("pasqua")) return "pasqua";
  if (t.includes("martire") || t.includes("martiri")) return "martiri";
  if (t.includes("tempo ordinario")) return "tempo_ordinario";

  return "tempo_ordinario";
}

function luceSullaParola() {
  return "La Parola del giorno accompagna la celebrazione e apre uno spazio di meditazione, senza sostituire l'omelia del sacerdote.";
}

async function leggiLiturgiaCEI(dataLiturgia = null) {
  const baseUrl = "https://www.chiesacattolica.it/liturgia-del-giorno/";
  const url = dataLiturgia ? `${baseUrl}?data-liturgia=${encodeURIComponent(dataLiturgia)}` : baseUrl;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ArsLiturgica-Test/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Errore CEI: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const testoPagina = normalizzaTesto($("body").text());

  const data = estraiTra(testoPagina, "Messa del Giorno", "Grandezza Testo");
  const titolo = estraiTra(testoPagina, "Grandezza Testo A A A", "Colore Liturgico");
  const coloreRaw = estraiTra(testoPagina, "Colore Liturgico", "Antifona");
  const coloreLiturgico = coloreRaw.split(" ")[0] || "";

  const primaLettura = estraiTra(testoPagina, "Prima Lettura", "Salmo Responsoriale");
  const salmoResponsoriale = estraiTra(testoPagina, "Salmo Responsoriale", "Acclamazione al Vangelo");
  const acclamazioneVangelo = estraiTra(testoPagina, "Acclamazione al Vangelo", "Vangelo");
  const vangelo = estraiTra(testoPagina, "Vangelo", "Sulle offerte");

  const periodoKey = riconosciPeriodoLiturgico(titolo);
  const regia = regiaProdotti[periodoKey] || regiaProdotti.tempo_ordinario;

  return {
    stato: "ok",
    fonte: {
      nome: "CEI — Chiesa Cattolica Italiana",
      url,
      nota: "Fonte liturgica: CEI — Chiesa Cattolica Italiana"
    },
    liturgia: {
      data,
      titolo,
      periodoKey,
      periodoNome: regia.nome,
      coloreLiturgico,
      primaLettura,
      salmoResponsoriale,
      acclamazioneVangelo,
      vangelo
    },
    arsLiturgica: {
      unaLuceSullaParola: luceSullaParola(),
      prodottiDelPeriodoSceltiDaLeonardo: regia.prodotti,
      pulsanteProdotti: {
        testo: "Prodotti",
        url: SHOP_URL
      }
    }
  };
}

app.get("/api/liturgia-oggi", async (req, res) => {
  try {
    const dati = await leggiLiturgiaCEI();
    res.json(dati);
  } catch (error) {
    res.status(500).json({
      stato: "errore",
      messaggio: "Impossibile leggere la liturgia CEI",
      dettaglio: error.message
    });
  }
});

app.get("/api/liturgia", async (req, res) => {
  try {
    const dati = await leggiLiturgiaCEI(req.query.data || null);
    res.json(dati);
  } catch (error) {
    res.status(500).json({
      stato: "errore",
      messaggio: "Impossibile leggere la liturgia CEI",
      dettaglio: error.message
    });
  }
});

app.get("/api/regia-prodotti", (req, res) => {
  res.json(regiaProdotti);
});

app.listen(PORT, () => {
  console.log(`Ars Liturgica backend test attivo su http://localhost:${PORT}`);
});