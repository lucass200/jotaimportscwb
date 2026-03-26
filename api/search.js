// api/search.js — Vercel Serverless Function
// Faz a chamada pro Mercado Livre pelo servidor (sem CORS)

export default async function handler(req, res) {
  // Permite requisições do próprio site
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { q, sort = "relevance", limit = 48 } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Parâmetro 'q' obrigatório" });
  }

  const sortMap = {
    relevance: "relevance",
    price_asc: "price_asc",
    price_desc: "price_desc",
  };
  const mlSort = sortMap[sort] || "relevance";

  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}&sort=${mlSort}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TechOfertas/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`ML API retornou ${response.status}`);
    }

    const data = await response.json();

    // Cache por 5 minutos na Vercel CDN
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ results: data.results || [] });

  } catch (err) {
    console.error("Erro ao buscar no ML:", err.message);
    return res.status(500).json({ error: "Falha ao buscar produtos", details: err.message });
  }
}
