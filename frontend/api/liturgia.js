export default async function handler(req, res) {
  try {
    // =========================================================
    // 1. PAROLA VIVA
    // Manteniamo ciò che già funziona:
    // data, giorno liturgico, Vangelo e testo del Vangelo
    // =========================================================
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

    // Quello che oggi Parola Viva ci restituisce, ad esempio:
    // "Sabato della XX settimana del Tempo Ordinario"
    const giornoLiturgico = dati.celebrazione || "";

    // Valori di sicurezza:
    // se la seconda fonte non risponde, Ars continua a funzionare
    let memoria = giornoLiturgico;
    let colore = dati.colore || "";
    let tempo = "";

    // =========================================================
    // 2. DATA ODIERNA IN ITALIA
    // =========================================================
    const oggiItalia = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const anno = oggiItalia.slice(0, 4);

    // =========================================================
    // 3. LITURGICAL CALENDAR API
    // Tempo liturgico, memoria/festa/solennità e colore
    // =========================================================
    try {
      const rispostaCalendario = await fetch(
        `https://litcal.johnromanodorazio.com/api/v5/calendar/nation/IT/${anno}?locale=it_IT`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "Ars Liturgica",
          },
        }
      );

      if (rispostaCalendario.ok) {
        const calendario = await rispostaCalendario.json();

        const eventi = calendario.litcal || [];

        const eventiOggi = eventi.filter((evento) => {
          if (!evento.date) return false;

          return evento.date.slice(0, 10) === oggiItalia;
        });

        // =====================================================
        // 4. TEMPO LITURGICO
        // =====================================================
        const eventoConTempo = eventiOggi.find(
          (evento) => evento.liturgical_season_lcl
        );

        if (eventoConTempo?.liturgical_season_lcl) {
          tempo = eventoConTempo.liturgical_season_lcl;
        }

        // =====================================================
        // 5. MEMORIA / FESTA / SOLENNITÀ DEL GIORNO
        // Evitiamo la Messa della vigilia
        // =====================================================
        const celebrazioneDelGiorno = eventiOggi.find((evento) => {
          const grado = (evento.grade_lcl || "").toLowerCase();
          const nome = (evento.name || "").toLowerCase();

          const gradoRilevante =
            grado.includes("memoria") ||
            grado.includes("festa") ||
            grado.includes("solenn");

          const nonEVigilia = !nome.includes("vigilia");

          return gradoRilevante && nonEVigilia;
        });

        if (celebrazioneDelGiorno) {
          memoria =
            celebrazioneDelGiorno.name || memoria;

          const coloreLocale =
            celebrazioneDelGiorno.color_lcl;

          if (Array.isArray(coloreLocale)) {
            colore = coloreLocale[0] || colore;
          } else if (coloreLocale) {
            colore = coloreLocale;
          }
        }
      }
    } catch (erroreCalendario) {
      console.error(
        "Errore Liturgical Calendar API:",
        erroreCalendario
      );
    }

    // =========================================================
    // 6. RISPOSTA FINALE PER ARS
    // =========================================================
    return res.status(200).json({
      errore: false,
      fonte: "Parola Viva + Liturgical Calendar API",

      data: dati.data,

      tempo: tempo,

      giornoLiturgico: giornoLiturgico,

      celebrazione: memoria,

      colore: colore,

      vangelo:
        dati.letture?.vangelo?.riferimento || "",

      testoVangelo:
        dati.letture?.vangelo?.testo || "",
    });
  } catch (error) {
    return res.status(500).json({
      errore: true,
      messaggio: "Errore nel recupero della liturgia",
      dettaglio: error.message,
    });
  }
}
