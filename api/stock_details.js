import fundamentals from "../data/fundamentals.json";

// This API pulls from yahoo finance quote API and chart API for various elements of the data using the free API data

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

    const chartUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
    const quoteUrl = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`;

    try {
        // ⭐ Fetch chart data (always works)
        const chartRes = await fetch(chartUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const chartData = await chartRes.json();
        const chart = chartData?.chart?.result?.[0];

        // ⭐ Fundamentals fallback
        const f = fundamentals[ticker] || {
            name: ticker,
            sharesOutstanding: 0,
            marketCap: 0,
            changePercent: 0
        };

        // ⭐ If chart fails entirely
        if (!chart) {
            return res.status(200).json({
                symbol: ticker,
                name: f.name,
                regularMarketPrice: 0,
                regularMarketChangePercent: f.changePercent,
                marketCap: f.marketCap,
                sharesOutstanding: f.sharesOutstanding
            });
        }

        // ⭐ Extract price
        const price = chart.meta?.regularMarketPrice ?? 0;

        // ⭐ Extract previous close (bulletproof)
        let prevClose = chart.meta?.previousClose;
        if (!prevClose) {
            const closes = chart.indicators?.quote?.[0]?.close || [];
            prevClose = closes.slice().reverse().find(c => c != null) ?? 0;
        }

        // ⭐ Compute changePercent manually
        let changePercent =
            prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        // ⭐ Compute market cap
        const shares = f.sharesOutstanding ?? 0;
        let marketCap = price && shares ? price * shares : f.marketCap;

        // ⭐ Try Quote API ONLY as a fallback (no cookies needed)
        try {
            const quoteRes = await fetch(quoteUrl, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            const quoteData = await quoteRes.json();
            const quote = quoteData?.quoteResponse?.result?.[0];

            if (quote?.regularMarketChangePercent != null) {
                changePercent = quote.regularMarketChangePercent;
            }
        } catch (e) {
            console.log("Quote fallback failed, using chart data only");
        }

        return res.status(200).json({
            symbol: ticker,
            name: f.name,
            regularMarketPrice: price,
            regularMarketChangePercent: changePercent,
            marketCap,
            sharesOutstanding: shares
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}




// Commented out is API that pulls from yahoo finance chart API

// export default async function handler(req, res) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//     if (req.method === "OPTIONS") {
//         return res.status(200).end();
//     }

//     const ticker = req.query.ticker?.toUpperCase();
//     if (!ticker) {
//         return res.status(400).json({ error: "Ticker is required" });
//     }

//     const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

//     try {
//         const yahooRes = await fetch(yahooUrl, {
//             headers: { "User-Agent": "Mozilla/5.0" }
//         });

//         const yahooData = await yahooRes.json();
//         const result = yahooData?.chart?.result?.[0];

//         const f = fundamentals[ticker] || {
//             name: ticker,
//             sharesOutstanding: 0,
//             marketCap: 0,
//             changePercent: 0
//         };

//         // If Yahoo fails, return fundamentals fallback
//         if (!result) {
//             return res.status(200).json({
//                 symbol: ticker,
//                 name: f.name,
//                 regularMarketPrice: 0,
//                 regularMarketChangePercent: f.changePercent ?? 0,
//                 marketCap: f.marketCap ?? 0,
//                 sharesOutstanding: f.sharesOutstanding ?? 0
//             });
//         }

//         const price = result.meta?.regularMarketPrice ?? 0;

//         // Previous Close can be prevClose or result.indicators.quote[0].close
//         let prevClose = result.meta?.previousClose;
//         if (!prevClose) {
//             const closes = result.indicators?.quote?.[0]?.close || [];
//             prevClose = closes.reverse().find(c => c != null) ?? 0;
//         }

//         let changePercent =
//             prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

//         const shares = f.sharesOutstanding ?? 0;
//         let marketCap = price && shares ? price * shares : f.marketCap;

//         // One additional layer of fallback protection for API call issues
//         if (!price && f.price) price = f.price;
//         if (!changePercent && f.changePercent) changePercent = f.changePercent;
//         if (!marketCap && f.marketCap) marketCap = f.marketCap;

//         return res.status(200).json({
//             symbol: ticker,
//             name: f.name,
//             regularMarketPrice: price,
//             regularMarketChangePercent: changePercent,
//             marketCap,
//             sharesOutstanding: shares
//         });

//     } catch (err) {
//         console.error("Stock details error:", err);
//         return res.status(500).json({ error: "Failed to fetch stock details" });
//     }
// }







  