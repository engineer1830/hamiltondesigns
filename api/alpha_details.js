export async function getStockDetail(ticker) {
    try {
        // Fetch Alpha fundamentals
        const alphaRes = await fetch(
            `https://hamiltondesigns.vercel.app/api/alpha_details?ticker=${ticker}`
        );
        const alpha = await alphaRes.json();

        if (alpha.error) {
            console.warn(`Alpha details missing for ${ticker}:`, alpha.error);
            return { symbol: ticker };
        }

        // Fetch Yahoo price
        const yahooRes = await fetch(
            `https://hamiltondesigns.vercel.app/api/yahoo_quote?ticker=${ticker}`
        );
        const yahoo = await yahooRes.json();

        return {
            symbol: ticker,
            name: alpha.name,
            description: alpha.description,
            sector: alpha.sector,
            industry: alpha.industry,

            // Price from YAHOO
            price: yahoo.regularMarketPrice,
            change: yahoo.regularMarketChange,
            changePercent: yahoo.regularMarketChangePercent,

            // Fundamentals from ALPHA
            marketCapAlpha: alpha.marketCap,
            peRatio: alpha.peRatio,
            eps: alpha.eps,
            dividendYield: alpha.dividendYield,
            profitMargin: alpha.profitMargin,
            returnOnEquity: alpha.returnOnEquity,
            returnOnAssets: alpha.returnOnAssets,
            revenueTTM: alpha.revenueTTM,
            fiftyTwoWeekHigh: alpha.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: alpha.fiftyTwoWeekLow
        };

    } catch (err) {
        console.error("Stock detail fetch failed for", ticker, err);
        return { symbol: ticker };
    }
}

