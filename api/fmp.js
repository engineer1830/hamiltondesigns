export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const url = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=demo`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data[0]) {
            return res.status(200).json({ error: "No data" });
        }

        const q = data[0];

        return res.status(200).json({
            symbol: q.symbol,
            name: q.companyName,
            regularMarketPrice: q.price,
            marketCap: q.mktCap,
            sharesOutstanding: q.sharesOutstanding
        });

    } catch (err) {
        console.error("FMP quote error:", err);
        return res.status(500).json({ error: "Failed to fetch quote data" });
    }
}
  