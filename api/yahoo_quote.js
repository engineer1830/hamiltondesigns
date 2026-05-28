export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Yahoo returned:", response.status);
            return res.status(500).json({ error: "Yahoo returned " + response.status });
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result) {
            return res.status(200).json({ result: null });
        }

        const meta = result.meta;

        const name =
            meta.longName ||
            meta.shortName ||
            ticker;

        const price =
            meta.regularMarketPrice ||
            meta.previousClose ||
            0;

        const marketCap =
            meta.marketCap ||
            (meta.regularMarketPrice && meta.sharesOutstanding
                ? meta.regularMarketPrice * meta.sharesOutstanding
                : null);

        return res.status(200).json({
            symbol: meta.symbol,
            name: name,
            currency: meta.currency,
            exchange: meta.exchangeName,
            regularMarketPrice: price,
            marketCap: marketCap,
            sharesOutstanding: meta.sharesOutstanding || null
        });

    } catch (err) {
        console.error("Quote Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch quote data" });
    }
}
  