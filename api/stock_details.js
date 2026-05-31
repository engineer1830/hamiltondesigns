import fundamentals from "../data/fundamentals.json";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const ticker = req.query.ticker?.toUpperCase();
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    try {
        const yahooRes = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const yahooData = await yahooRes.json();
        const result = yahooData?.chart?.result?.[0];

        const f = fundamentals[ticker] || {
            name: ticker,
            sharesOutstanding: 0,
            marketCap: 0
        };

        if (!result) {
            return res.status(200).json({
                symbol: ticker,
                name: f.name,
                regularMarketPrice: 0,
                regularMarketChangePercent: 0,
                marketCap: f.marketCap,
                sharesOutstanding: f.sharesOutstanding
            });
        }

        const price = result.meta?.regularMarketPrice ?? 0;
        const prevClose = result.meta?.previousClose ?? 0;

        // ⭐ Compute change percent manually
        const changePercent =
            prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        // ⭐ Compute market cap manually
        const shares = f.sharesOutstanding ?? 0;
        const marketCap = price && shares ? price * shares : f.marketCap;

        return res.status(200).json({
            symbol: ticker,
            name: f.name,
            regularMarketPrice: price,
            regularMarketChangePercent: changePercent,
            marketCap,
            sharesOutstanding: shares
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}




  