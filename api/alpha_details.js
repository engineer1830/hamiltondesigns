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

    const ALPHA_KEY = process.env.ALPHA_KEY;
    const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`;

    try {
        const alphaRes = await fetch(alphaUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const alphaData = await alphaRes.json();

        if (!alphaData || Object.keys(alphaData).length === 0) {
            return res.status(200).json({
                symbol: ticker,
                error: "No Alpha Vantage data returned"
            });
        }

        return res.status(200).json({
            symbol: ticker,
            name: alphaData.Name,
            description: alphaData.Description,
            sector: alphaData.Sector,
            industry: alphaData.Industry,
            marketCap: Number(alphaData.MarketCapitalization),
            peRatio: Number(alphaData.PERatio),
            eps: Number(alphaData.EPS),
            dividendYield: Number(alphaData.DividendYield),
            profitMargin: Number(alphaData.ProfitMargin),
            returnOnEquity: Number(alphaData.ReturnOnEquityTTM),
            returnOnAssets: Number(alphaData.ReturnOnAssetsTTM),
            revenueTTM: Number(alphaData.RevenueTTM),
            fiftyTwoWeekHigh: Number(alphaData["52WeekHigh"]),
            fiftyTwoWeekLow: Number(alphaData["52WeekLow"])
        });

    } catch (err) {
        console.error("Alpha details error:", err);

        return res.status(500).json({
            error: "Failed to fetch Alpha Vantage details"
        });
    }
}
