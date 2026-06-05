import fundamentals from "../data/fundamentals.json";

// This API pulls from yahoo finance spark API

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

    // Spark API — best for daily movement
    const sparkUrl = `https://query2.finance.yahoo.com/v7/finance/spark?symbols=${ticker}&range=5d&interval=1d`;

    try {
        const sparkRes = await fetch(sparkUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const sparkData = await sparkRes.json();
        const spark = sparkData?.spark?.result?.[0]?.response?.[0];

        // ⭐ Fundamentals fallback
        const f = fundamentals[ticker] || {
            name: ticker,
            sharesOutstanding: 0,
            marketCap: 0,
            changePercent: 0
        };

        // If Spark API fails entirely
        if (!spark) {
            return res.status(200).json({
                symbol: ticker,
                name: f.name,
                regularMarketPrice: 0,
                regularMarketChangePercent: f.changePercent,
                marketCap: f.marketCap,
                sharesOutstanding: f.sharesOutstanding
            });
        }

        // Extract price
        const price = spark.meta?.regularMarketPrice ?? 0;

        // Extract previous close (Spark always provides this)
        const prevClose = spark.meta?.chartPreviousClose ?? 0;

        // Compute change percent
        const changePercent =
            prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        // Compute market cap
        const shares = f.sharesOutstanding ?? 0;
        const marketCap = price && shares ? price * shares : f.marketCap;

        return res.status(200).json({
            symbol: ticker,
            name: spark.meta?.longName || f.name,
            regularMarketPrice: price,
            regularMarketChangePercent: changePercent,
            marketCap,
            sharesOutstanding: shares
        });

    } catch (err) {
        console.error("Spark API error:", err);

        return res.status(200).json({
            symbol: ticker,
            name: ticker,
            regularMarketPrice: 0,
            regularMarketChangePercent: 0,
            marketCap: 0,
            sharesOutstanding: 0
        });
    }
}









  