export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url =
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}` +
        `?modules=price,assetProfile`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            }
        });

        if (!response.ok) {
            console.error("Yahoo returned:", response.status);
            return res.status(500).json({ error: "Yahoo returned " + response.status });
        }

        const data = await response.json();

        if (!data.quoteSummary || !data.quoteSummary.result) {
            console.warn("Yahoo returned empty quoteSummary for", ticker);
            return res.status(200).json({
                quoteSummary: { result: null }
            });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error("Quote Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch quote data" });
    }
}
  
  