export default async function handler(req, res) {
  try {
    const risposta = await fetch(
      "https://parolaviva.art/api/v1/letture/oggi",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Ars Liturgica",
        },
      }
    );

    if (!risposta.ok) {
      return res.status(502).json({
        errore: true,
        messaggio: "Fonte liturgica non raggiungibile",
        statusFonte: risposta.status,
      });
    }

    const dati = await risposta.json();

    return res.status(200).json({
      errore: false,
      fonte: "Parola Viva",
      data: dati.data,
      celebrazione: dati.celebrazione,
      colore: dati.colore,
      vangelo: dati.letture?.vangelo?.riferimento || "",
      testoVangelo: dati.letture?.vangelo?.testo || "",
      datiCompleti: dati,
    });
  } catch (error) {
    return res.status(500).json({
      errore: true,
      messaggio: "Errore nel recupero della liturgia",
      dettaglio: error.message,
    });
  }
}
