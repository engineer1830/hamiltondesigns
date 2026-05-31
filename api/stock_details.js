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

    // ⭐ Use Yahoo's public quote API (no crumb required)
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`;

    try {
        const yahooRes = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const yahooData = await yahooRes.json();
        const quote = yahooData?.quoteResponse?.result?.[0];

        const f = fundamentals[ticker] || {
            name: ticker,
            sharesOutstanding: 0,
            marketCap: 0
        };

        if (!quote) {
            console.error("Yahoo returned no data for", ticker);
            return res.status(200).json({
                symbol: ticker,
                name: f.name,
                regularMarketPrice: 0,
                regularMarketChangePercent: 0,
                marketCap: f.marketCap,
                sharesOutstanding: f.sharesOutstanding
            });
        }

        const price = quote.regularMarketPrice ?? 0;
        const shares = quote.sharesOutstanding ?? f.sharesOutstanding ?? 0;

        const computedCap =
            price && shares ? price * shares : (quote.marketCap || f.marketCap);

        return res.status(200).json({
            symbol: ticker,
            name: quote.shortName || f.name,
            regularMarketPrice: price,
            regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
            marketCap: computedCap,
            sharesOutstanding: shares
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}




  