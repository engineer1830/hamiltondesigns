export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url =
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}` +
        `?modules=assetProfile`;

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
        const profile = data.quoteSummary?.result?.[0]?.assetProfile;

        if (!profile) {
            return res.status(200).json({
                symbol: ticker,
                name: ticker,
                sector: "Unknown",
                industry: "Unknown"
            });
        }

        return res.status(200).json({
            symbol: ticker,
            name: profile.longBusinessSummary ? ticker : ticker,
            sector: profile.sector || "Unknown",
            industry: profile.industry || "Unknown"
        });

    } catch (err) {
        console.error("Sector Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch sector data" });
    }
}
  
  