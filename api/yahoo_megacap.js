export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = "https://query2.finance.yahoo.com/v1/finance/trending/US";

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
        });

        if (!response.ok) {
            console.error("Yahoo returned status:", response.status);
            return res.status(500).json({ error: "Yahoo returned " + response.status });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error("Trending Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch trending tickers" });
    }
}
  

