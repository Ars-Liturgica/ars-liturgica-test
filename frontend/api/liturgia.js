export default async function handler(req, res) {
  try {
    const oggi = new Date();

    const anno =
      req.query.anno ||
      oggi.toLocaleDateString("en-CA", {
        timeZone: "Europe/Rome",
        year: "numeric",
      });

    const url =
      `https://litcal.johnromanodorazio.com:443/api/v5/calendar/roman/nation/IT/${anno}` +
      `?locale=it_IT`;

    const risposta = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Ars Liturgica",
      },
    });

    if (!risposta.ok) {
      return res.status(502).json({
        errore: true,
        messaggio: "Calendario liturgico non raggiungibile",
        statusFonte: risposta.status,
        fonte: url,
      });
    }

    const calendario = await risposta.json();

    return res.status(200).json({
      errore: false,
      anno: Number(anno),
      fonte: "Liturgical Calendar API",
      calendario,
    });
  } catch (error) {
    return res.status(500).json({
      errore: true,
      messaggio: "Errore nel recupero del calendario liturgico",
      dettaglio: error.message,
    });
  }
}
