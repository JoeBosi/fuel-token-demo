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

async function fetchFuelPrice() {
  const res = await fetch(ZONE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      points: [{ lat: LAT, lng: LNG }],
      radius: 30,
      fuelType: "1-x",
      priceOrder: "asc",
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error("Osservaprezzi HTTP " + res.status);
  const data = await res.json();
  const prices = [];
  for (const station of data.results ?? []) {
    for (const f of station.fuels ?? []) {
      // fuelId 1 = unleaded petrol, isSelf = self-service price
      if (f.fuelId === 1 && f.isSelf === true && Number(f.price) > 0) prices.push(Number(f.price));
    }
  }
  if (prices.length === 0) throw new Error("No petrol prices found");
  return { eur: median(prices), stations: prices.length };
}

async function fetchPolPrice() {
  if (process.env.POL_EUR) return Number(process.env.POL_EUR); // manual override
  const res = await fetch(COINGECKO_URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error("CoinGecko HTTP " + res.status);
  const eur = (await res.json())["polygon-ecosystem-token"]?.eur;
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
  console.error(e);
  process.exitCode = 1;
});
