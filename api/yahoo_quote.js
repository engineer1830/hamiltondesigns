export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const { ticker } = req.query;

    if (!ticker) {
        return res.status(400).json({ error: "Ticker required" });
    }

    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile,price`;

    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const data = await response.json();
        res.status(200).json(data);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch quote summary" });
    }
}

