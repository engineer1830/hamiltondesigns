import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const ALPHA_KEY = process.env.ALPHA_KEY;

import tickers from "../data/tickers.json" assert { type: "json" };

async function fetchFundamentals(ticker) {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.MarketCapitalization) {
        console.log(`⚠️  No data for ${ticker}`);
        return null;
    }

    return {
        name: data.Name || ticker,
        marketCap: Number(data.MarketCapitalization),
        sharesOutstanding: Number(data.SharesOutstanding)
    };
}

async function run() {
    const output = {};
    for (const ticker of tickers) {
        console.log(`Fetching ${ticker}...`);
        const fundamentals = await fetchFundamentals(ticker);
        if (fundamentals) {
            output[ticker] = fundamentals;
        }
        await new Promise(r => setTimeout(r, 12000));
    }

    const filePath = path.join("data", "fundamentals.json");
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log("Done! fundamentals.json updated.");
}

run();
