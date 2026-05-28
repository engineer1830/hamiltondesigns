export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    // This endpoint returns marketCap + sharesOutstanding reliably
    const url = `https://query2.finance.yahoo.com/v11/finance/quoteSummary/${ticker}?modules=price,summaryDetail,defaultKeyStatistics`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        const data = await response.json();
        const result = data.quoteSummary?.result?.[0];

        if (!result) {
            return res.status(200).json({ error: "No data" });
        }

        const price = result.price || {};
        const stats = result.defaultKeyStatistics || {};
        const summary = result.summaryDetail || {};

        return res.status(200).json({
            symbol: price.symbol || ticker,
            name: price.longName || price.shortName || ticker,
            regularMarketPrice: price.regularMarketPrice?.raw || 0,
            marketCap: price.marketCap?.raw ||
                summary.marketCap?.raw ||
                null,
            sharesOutstanding: stats.sharesOutstanding?.raw || null
        });

    } catch (err) {
        console.error("Yahoo quote error:", err);
        return res.status(500).json({ error: "Failed to fetch quote data" });
    }
}

  
  