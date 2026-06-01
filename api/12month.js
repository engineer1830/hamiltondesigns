import topstocks from "../data/topstocks.json";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const sectorEntries = Object.entries(topstocks);

        const sectorResults = await Promise.all(
            sectorEntries.map(async ([sectorName, tickers]) => {
                const symbols = tickers.join(",");
                const sparkUrl =
                    `https://query2.finance.yahoo.com/v7/finance/spark?` +
                    `symbols=${symbols}&range=1y&interval=1d`;

                const sparkRes = await fetch(sparkUrl, {
                    headers: { "User-Agent": "Mozilla/5.0" }
                });

                const sparkData = await sparkRes.json();
                const results = sparkData?.spark?.result || [];

                if (!results.length) {
                    return [sectorName, []];
                }

                const baseResponse = results[0]?.response?.[0];
                const timestamps = baseResponse?.timestamp || [];
                const n = timestamps.length;

                if (!n) {
                    return [sectorName, []];
                }

                const tickerSeries = results
                    .map(r => r?.response?.[0])
                    .filter(Boolean)
                    .map(r => {
                        const closes = r?.indicators?.quote?.[0]?.close || [];
                        if (!closes.length) return null;

                        const base = closes[0];
                        if (!base) return null;

                        return closes.map(c =>
                            c ? c / base - 1 : 0
                        );
                    })
                    .filter(Boolean);

                if (!tickerSeries.length) {
                    return [sectorName, []];
                }

                const sectorSeries = [];
                for (let i = 0; i < n; i++) {
                    let sum = 0;
                    let count = 0;
                    for (const series of tickerSeries) {
                        if (series[i] != null) {
                            sum += series[i];
                            count++;
                        }
                    }
                    const avg = count ? sum / count : 0;
                    sectorSeries.push({
                        date: timestamps[i],
                        value: avg
                    });
                }

                return [sectorName, sectorSeries];
            })
        );

        const response = {};
        for (const [sectorName, series] of sectorResults) {
            response[sectorName] = series;
        }

        return res.status(200).json(response);

    } catch (err) {
        console.error("Sector history error:", err);
        return res.status(500).json({ error: "Failed to fetch sector history" });
    }
}
