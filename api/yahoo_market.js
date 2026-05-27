export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        // ⭐ Manually read the raw body (Vercel does NOT parse JSON automatically)
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString();
        const parsedBody = rawBody ? JSON.parse(rawBody) : {};

        const response = await fetch("https://query2.finance.yahoo.com/v1/finance/screener", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify(parsedBody)
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error("Yahoo Screener API error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


