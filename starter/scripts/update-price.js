// Reads the petrol price from the Italian "Osservaprezzi" service and the POL price
// from CoinGecko, then writes both to the oracle.
const { ethers } = require("hardhat");
const deployment = require("../deployment.json");

const ZONE_URL = "https://carburanti.mise.gov.it/ospzApi/search/zone";
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=eur";
// Arezzo (Italy). Change these two numbers to use another city.
const LAT = 43.4636;
const LNG = 11.8748;

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Public services expect a clear User-Agent and Accept header (some answer HTTP 403 without them).
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; educational-demo)",
  Accept: "application/json",
};

// Calls a JSON service with a timeout and turns failures into readable messages.
async function getJson(url, options, label) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...HEADERS, ...(options && options.headers) },
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    const why = e.name === "TimeoutError" ? "no answer within 30 seconds" : e.message;
    throw new Error(label + ": cannot connect (" + why + ")");
  }
  if (res.status === 403) throw new Error(label + ": access refused (HTTP 403), check the User-Agent header");
  if (res.status === 429) throw new Error(label + ": too many requests (HTTP 429), wait a minute and retry");
  if (!res.ok) throw new Error(label + ": HTTP " + res.status);
  return res.json();
}

async function fetchFuelPrice() {
  const data = await getJson(
    ZONE_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [{ lat: LAT, lng: LNG }],
        radius: 30,
        fuelType: "1-x",
        priceOrder: "asc",
      }),
    },
    "Osservaprezzi"
  );
  const prices = [];
  for (const station of data.results ?? []) {
    for (const f of station.fuels ?? []) {
      // fuelId 1 = unleaded petrol, isSelf = self-service price
      if (f.fuelId === 1 && f.isSelf === true && Number(f.price) > 0) prices.push(Number(f.price));
    }
  }
  if (prices.length === 0) throw new Error("Osservaprezzi: no petrol prices found around this point");
  return { eur: median(prices), stations: prices.length };
}

async function fetchPolPrice() {
  if (process.env.POL_EUR) return Number(process.env.POL_EUR); // manual override
  const data = await getJson(COINGECKO_URL, {}, "CoinGecko (or set POL_EUR=0.10 in .env)");
  const eur = data["polygon-ecosystem-token"]?.eur;
  if (!(eur > 0)) throw new Error("CoinGecko: missing price");
  return eur;
}

async function main() {
  const fuel = await fetchFuelPrice();
  const pol = await fetchPolPrice();
  console.log(`Petrol: ${fuel.eur} EUR/L (median of ${fuel.stations} stations)`);
  console.log(`POL:    ${pol} EUR`);

  const toUnits = (x) => BigInt(Math.round(x * 1e6)); // 6 decimals
  const oracle = await ethers.getContractAt("SimpleFuelOracle", deployment.oracle);
  const tx = await oracle.setPrices(toUnits(fuel.eur), toUnits(pol));
  await tx.wait();

  const [stored] = await oracle.fuelPrice();
  console.log("On-chain petrol price:", Number(stored) / 1e6, "EUR/L");
  console.log("Is fresh:", await oracle.isFresh(3 * 86400));
}

main().catch((e) => {
  console.error("Error: " + e.message);
  process.exitCode = 1;
});
