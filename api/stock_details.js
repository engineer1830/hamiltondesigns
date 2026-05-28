// export default async function handler(req, res) {
//     res.setHeader("Access-Control-Allow-Origin", "*");

//     const ticker = req.query.ticker;
//     if (!ticker) {
//         return res.status(400).json({ error: "Ticker is required" });
//     }

//     const ALPHA_KEY = process.env.ALPHA_KEY;

//     const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

//     const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`;

//     try {
//         const [yahooRes, alphaRes] = await Promise.all([
//             fetch(yahooUrl),
//             fetch(alphaUrl)
//         ]);

//         const yahooData = await yahooRes.json();
//         const alphaData = await alphaRes.json();

//         const yahooResult = yahooData.chart?.result?.[0];
//         const price = yahooResult?.meta?.regularMarketPrice || 0;

//         const name = alphaData.Name || ticker;
//         const marketCap = Number(alphaData.MarketCapitalization) || null;
//         const sharesOutstanding = Number(alphaData.SharesOutstanding) || null;

//         // Compute fallback market cap if needed
//         const computedCap =
//             price && sharesOutstanding ? price * sharesOutstanding : null;

//         return res.status(200).json({
//             symbol: ticker,
//             name: name,
//             regularMarketPrice: price,
//             marketCap: marketCap || computedCap || 0,
//             sharesOutstanding: sharesOutstanding
//         });

//     } catch (err) {
//         console.error("Stock details error:", err);
//         return res.status(500).json({ error: "Failed to fetch stock details" });
//     }
// }

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker;
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const priceUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const statsUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,defaultKeyStatistics`;

    try {
        const [priceRes, statsRes] = await Promise.all([
            fetch(priceUrl, { headers: { "User-Agent": "Mozilla/5.0" } }),
            fetch(statsUrl, { headers: { "User-Agent": "Mozilla/5.0" } })
        ]);

        const priceData = await priceRes.json();
        const statsData = await statsRes.json();

        const priceResult = priceData.chart?.result?.[0];
        const statsResult = statsData.quoteSummary?.result?.[0];

        const price = priceResult?.meta?.regularMarketPrice || 0;
        const name = statsResult?.price?.longName || ticker;
        const marketCap = statsResult?.defaultKeyStatistics?.marketCap?.raw || 0;
        const sharesOutstanding = statsResult?.defaultKeyStatistics?.sharesOutstanding?.raw || 0;

        return res.status(200).json({
            symbol: ticker,
            name,
            regularMarketPrice: price,
            marketCap,
            sharesOutstanding
        });

    } catch (err) {
        console.error("Yahoo stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}
  
  
  