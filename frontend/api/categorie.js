export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      principale: "",
      consigliate: ["", "", "", "", ""]
    });
  }

  if (req.method === "POST") {
    const dati = req.body;

    return res.status(200).json({
      success: true,
      messaggio: "Categorie salvate",
      dati
    });
  }

  return res.status(405).json({
    success: false,
    messaggio: "Metodo non consentito"
  });
}
