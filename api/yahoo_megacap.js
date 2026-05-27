export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = "https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved/mega_cap_stocks";

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Yahoo returned " + response.status);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (err) {
        console.error("MegaCap Proxy Error:", err);
        res.status(500).json({ error: "Failed to fetch mega cap tickers" });
    }
}

