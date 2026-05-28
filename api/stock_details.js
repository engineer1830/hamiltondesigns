import fundamentals from "../../data/fundamentals.json";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker?.toUpperCase();
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    // Yahoo price (live)
    const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    try {
        const yahooRes = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const yahooData = await yahooRes.json();
        const yahooResult = yahooData.chart?.result?.[0];
        const price = yahooResult?.meta?.regularMarketPrice || 0;

        // Fundamentals from JSON file
        const f = fundamentals[ticker] || {
            name: ticker,
            marketCap: 0,
            sharesOutstanding: 0
        };

        const computedCap =
            price && f.sharesOutstanding
                ? price * f.sharesOutstanding
                : f.marketCap;

        return res.status(200).json({
            symbol: ticker,
            name: f.name,
            regularMarketPrice: price,
            marketCap: computedCap,
            sharesOutstanding: f.sharesOutstanding
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}
  