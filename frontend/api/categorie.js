export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const response = await fetch(
        "https://www.genesiartesacra.it/wp-json/wc/store/v1/products/categories"
      );

      const categorie = await response.json();

      return res.status(200).json(categorie);
    } catch (error) {
      return res.status(500).json({
        success: false,
        messaggio: "Errore nel caricamento categorie WooCommerce",
        errore: error.message,
      });
    }
  }

  if (req.method === "POST") {
    const dati = req.body;

    return res.status(200).json({
      success: true,
      messaggio: "Categorie salvate",
      dati,
    });
  }

  return res.status(405).json({
    success: false,
    messaggio: "Metodo non consentito",
  });
}
