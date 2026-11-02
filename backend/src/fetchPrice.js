import { config } from './config.js';

const ZONE_URL = 'https://carburanti.mise.gov.it/ospzApi/search/zone';
const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=eur';

export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Self-service unleaded petrol (fuelId 1) prices from a /search/zone response. */
export function extractPrices(resp) {
  const out = [];
  for (const st of resp?.results ?? []) {
    for (const f of st.fuels ?? []) {
      if ((f.fuelId === 1 || f.name === 'Benzina') && f.isSelf === true && Number(f.price) > 0) {
        out.push(Number(f.price));
      }
    }
  }
  return out;
}

export function summarize(resp) {
  const prices = extractPrices(resp);
  const m = median(prices);
  return { fuel_eur: m === null ? null : Math.round(m * 1e6) / 1e6, n_stations: prices.length };
}

export function todayRome(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(now); // YYYY-MM-DD
}

export async function fetchFuel({ lat = config.lat, lng = config.lng, radiusKm = config.radiusKm } = {}) {
  const res = await fetch(ZONE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; educational-demo)' },
    body: JSON.stringify({ points: [{ lat, lng }], radius: radiusKm, fuelType: '1-x', priceOrder: 'asc' }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Osservaprezzi HTTP ${res.status}`);
  const s = summarize(await res.json());
  if (!s.n_stations) throw new Error('No self-service petrol prices found');
  return s;
}

export async function fetchPol() {
  const res = await fetch(COINGECKO_URL, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; educational-demo)' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const eur = (await res.json())?.['polygon-ecosystem-token']?.eur;
  if (!(eur > 0)) throw new Error('CoinGecko: missing price');
  return eur;
}
