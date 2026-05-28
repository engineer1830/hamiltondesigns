export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });

        if (!response.ok) {
            console.error("Yahoo returned:", response.status);
            return res.status(500).json({ error: "Yahoo returned " + response.status });
        }

        const data = await response.json();

        const match = data.quotes?.find(q => q.symbol === ticker);

        if (!match) {
            return res.status(200).json({
                symbol: ticker,
                name: ticker,
                sector: null,
                industry: null
            });
        }

        return res.status(200).json({
            symbol: match.symbol,
            name: match.shortname || match.longname || ticker,
            sector: match.sector || null,
            industry: match.industry || null
        });

    } catch (err) {
        console.error("Sector Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch sector data" });
    }
}
  