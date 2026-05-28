export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const ALPHA_KEY = process.env.ALPHA_KEY;

    const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`;

    try {
        const [yahooRes, alphaRes] = await Promise.all([
            fetch(yahooUrl),
            fetch(alphaUrl)
        ]);

        const yahooData = await yahooRes.json();
        const alphaData = await alphaRes.json();

        const yahooResult = yahooData.chart?.result?.[0];
        const price = yahooResult?.meta?.regularMarketPrice || 0;

        const name = alphaData.Name || ticker;
        const marketCap = Number(alphaData.MarketCapitalization) || null;
        const sharesOutstanding = Number(alphaData.SharesOutstanding) || null;

        // Compute fallback market cap if needed
        const computedCap =
            price && sharesOutstanding ? price * sharesOutstanding : null;

        return res.status(200).json({
            symbol: ticker,
            name: name,
            regularMarketPrice: price,
            marketCap: marketCap || computedCap || 0,
            sharesOutstanding: sharesOutstanding
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}
  