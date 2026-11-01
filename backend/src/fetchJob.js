import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { openDb, upsertPrice, setTxHash, latestRow } from './db.js';
import { fetchFuel, fetchPol, todayRome } from './fetchPrice.js';
import { updateOracle } from './updateOracle.js';

const SOURCE = 'MIMIT Osservaprezzi Carburanti (median, self petrol)';

/** One full run: fetch, store, push on-chain. `deps` allows injection in tests. */
export async function runFetch(db, deps = {}) {
  const { fuel = fetchFuel, pol = fetchPol, oracle = updateOracle } = deps;
  const date = todayRome();
  const f = await fuel();
  let pol_eur;
  try {
    pol_eur = await pol();
  } catch (e) {
    pol_eur = latestRow(db)?.pol_eur;
    if (!pol_eur) throw new Error(`POL price unavailable and no previous value: ${e.message}`);
    console.warn(`[fetch] WARNING: POL price failed (${e.message}); keeping last known ${pol_eur}`);
  }
  const row = { date, fuel_eur: f.fuel_eur, pol_eur, n_stations: f.n_stations, source: SOURCE, fetched_at: new Date().toISOString() };
  upsertPrice(db, row);
  console.log(`[fetch] ${date}: median ${row.fuel_eur} EUR/L over ${row.n_stations} stations, POL ${pol_eur} EUR`);
  try {
    const tx = await oracle(row);
    if (tx) { setTxHash(db, date, tx); row.tx_hash = tx; }
  } catch (e) {
    console.error('[oracle] update failed:', e.message);
    throw e;
  }
  return row;
}

export async function runWithRetries(db, tries = 3, delayMs = 10 * 60 * 1000, deps = {}) {
  for (let i = 1; i <= tries; i++) {
    try { return await runFetch(db, deps); }
    catch (e) {
      console.error(`[fetch] attempt ${i}/${tries} failed: ${e.message}`);
      if (i === tries) throw e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = openDb(config.dbPath);
  runFetch(db).then(() => process.exit(0), () => process.exit(1));
}
