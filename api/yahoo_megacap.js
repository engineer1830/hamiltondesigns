async function getTickerDetails(ticker) {
    const res = await fetch(`https://hamiltondesigns.vercel.app/api/yahoo_quote?ticker=${ticker}`);
    const data = await res.json();

    const profile = data.quoteSummary?.result?.[0];
    if (!profile) {
        return {
            symbol: ticker,
            sector: null,
            marketCap: 0,
            name: ticker
        };
    }

    return {
        symbol: ticker,
        sector: profile.assetProfile?.sector || null,
        marketCap: profile.price?.marketCap?.raw || 0,
        name: profile.price?.shortName || ticker
    };
}


