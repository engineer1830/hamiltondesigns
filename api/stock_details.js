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

// Simple in-memory cache (persists for the lifetime of the serverless instance)
let fundamentalsCache = {};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const ticker = req.query.ticker?.toUpperCase();
    if (!ticker) {
        return res.status(400).json({ error: "Ticker is required" });
    }

    const ALPHA_KEY = process.env.ALPHA_KEY;

    // Yahoo price endpoint (always works)
    const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    // Alpha Vantage fundamentals (rate-limited, so we cache)
    const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`;

    try {
        // --- 1. PRICE FROM YAHOO ---
        const yahooRes = await fetch(yahooUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const yahooData = await yahooRes.json();
        const yahooResult = yahooData.chart?.result?.[0];
        const price = yahooResult?.meta?.regularMarketPrice || 0;

        // --- 2. FUNDAMENTALS FROM CACHE OR ALPHA ---
        let fundamentals = fundamentalsCache[ticker];

        if (!fundamentals) {
            // Fetch from Alpha Vantage only if not cached
            const alphaRes = await fetch(alphaUrl);
            const alphaData = await alphaRes.json();

            // If Alpha returns valid fundamentals, store them
            if (alphaData && alphaData.MarketCapitalization) {
                fundamentals = {
                    name: alphaData.Name || ticker,
                    marketCap: Number(alphaData.MarketCapitalization) || 0,
                    sharesOutstanding: Number(alphaData.SharesOutstanding) || 0
                };

                // Save to cache
                fundamentalsCache[ticker] = fundamentals;
            } else {
                // If Alpha fails (rate limit), fallback to empty fundamentals
                fundamentals = {
                    name: ticker,
                    marketCap: 0,
                    sharesOutstanding: 0
                };
            }
        }

        // --- 3. COMPUTE FALLBACK MARKET CAP ---
        const computedCap =
            price && fundamentals.sharesOutstanding
                ? price * fundamentals.sharesOutstanding
                : fundamentals.marketCap;

        // --- 4. RETURN MERGED RESULT ---
        return res.status(200).json({
            symbol: ticker,
            name: fundamentals.name,
            regularMarketPrice: price,
            marketCap: computedCap || 0,
            sharesOutstanding: fundamentals.sharesOutstanding || 0
        });

    } catch (err) {
        console.error("Stock details error:", err);
        return res.status(500).json({ error: "Failed to fetch stock details" });
    }
}

  