export default async function handler(req, res) {
  const { data } = req.query;

  const giorno =
    data || new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const url = `https://www.chiesacattolica.it/la-liturgia-del-giorno/?data-liturgia=${giorno}`;

  try {
    const risposta = await fetch(url, {
      headers: {
        "User-Agent": "Ars Liturgica App",
      },
    });

    if (!risposta.ok) {
      return res.status(500).json({
        errore: true,
        messaggio: "Fonte CEI non raggiungibile",
        link: url,
      });
    }

    const html = await risposta.text();

    return res.status(200).json({
      errore: false,
      data: giorno,
      fonte: "Chiesa Cattolica / CEI",
      link: url,
      html,
    });
  } catch (error) {
    return res.status(500).json({
      errore: true,
      messaggio: "Errore nel collegamento alla fonte CEI",
      dettaglio: error.message,
      link: url,
    });
  }
}
