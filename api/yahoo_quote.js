export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${ticker}`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        const data = await response.json();
        const q = data.quoteResponse?.result?.[0];

        if (!q) {
            return res.status(200).json({ error: "No data" });
        }

        return res.status(200).json({
            symbol: q.symbol,
            name: q.longName || q.shortName || q.symbol,
            regularMarketPrice: q.regularMarketPrice || 0,
            marketCap: q.marketCap || null,
            sharesOutstanding: q.sharesOutstanding || null
        });

    } catch (err) {
        console.error("Yahoo quote error:", err);
        return res.status(500).json({ error: "Failed to fetch quote data" });
    }
}
  

  