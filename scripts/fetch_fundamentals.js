const fs = require("fs");
const path = require("path");

// Node 26-compatible fetch wrapper
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const tickersPath = path.join("data", "tickers.json");
const tickers = JSON.parse(fs.readFileSync(tickersPath, "utf8"));

async function fetchNasdaqFundamentals(ticker) {
    const url = `https://api.nasdaq.com/api/company/${ticker}/info?assetclass=stocks`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Origin": "https://www.nasdaq.com",
            "Referer": "https://www.nasdaq.com/"
        }
    });

    const json = await res.json();

    const d = json?.data;

    if (!d || !d.companyName) {
        console.log(`⚠️  No data for ${ticker}`);
        return null;
    }

    return {
        name: d.companyName,
        marketCap: d.marketCap || null,
        sharesOutstanding: d.sharesOutstanding || null,
        sector: d.sector || null,
        industry: d.industry || null
    };
}

async function run() {
    const output = {};

    for (const ticker of tickers) {
        console.log(`Fetching ${ticker}...`);
        const fundamentals = await fetchNasdaqFundamentals(ticker);
        if (fundamentals) {
            output[ticker] = fundamentals;
        }
        await new Promise(r => setTimeout(r, 300)); // gentle pacing
    }

    const filePath = path.join("data", "fundamentals.json");
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log("Done! fundamentals.json updated.");
}

run();
