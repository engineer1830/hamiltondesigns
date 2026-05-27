export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const primaryUrl = "https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved/mega_cap_stocks";
    const fallbackUrl = "https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved/most_actives";

    try {
        const response = await fetch(primaryUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
        });

        // ✅ If Yahoo returns 502, automatically retry with fallback
        if (response.status === 502) {
            console.warn("Yahoo mega_cap returned 502 — switching to fallback screener.");
            const fallback = await fetch(fallbackUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json"
                }
            });
            const data = await fallback.json();
            return res.status(200).json(data);
        }

        if (!response.ok) {
            throw new Error("Yahoo returned " + response.status);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error("MegaCap Proxy Error:", err);
        return res.status(500).json({ error: "Failed to fetch mega cap tickers" });
    }
}



