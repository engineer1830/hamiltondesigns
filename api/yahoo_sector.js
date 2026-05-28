export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url = "https://query2.finance.yahoo.com/v1/finance/screener";

    const body = {
        offset: 0,
        size: 1,
        quoteType: "EQUITY",
        symbols: [ticker]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error("Yahoo returned:", response.status);
            return res.status(500).json({ error: "Yahoo returned " + response.status });
        }

        const data = await response.json();
        const quote = data.finance?.result?.[0]?.quotes?.[0];

        if (!quote) {
            return res.status(200).json({
                symbol: ticker,
                name: ticker,
                sector: "Unknown",
                industry: "Unknown"
            });
        }

        return res.status(200).json({
            symbol: ticker,
            name: quote.shortName || quote.longName || ticker,
            sector: quote.sector || "Unknown",
            industry: quote.industry || "Unknown"
        });

    } catch (err) {
        console.error("Sector Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch sector data" });
    }
}
  