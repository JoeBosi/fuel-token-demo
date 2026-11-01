import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.exec(`CREATE TABLE IF NOT EXISTS prices(
    date TEXT PRIMARY KEY, fuel_eur REAL, pol_eur REAL, n_stations INTEGER,
    source TEXT, fetched_at TEXT, tx_hash TEXT)`);
  return db;
}

export function upsertPrice(db, r) {
  // tx_hash is kept if the new row does not provide one (idempotent re-runs).
  db.prepare(`INSERT INTO prices(date,fuel_eur,pol_eur,n_stations,source,fetched_at,tx_hash)
    VALUES(@date,@fuel_eur,@pol_eur,@n_stations,@source,@fetched_at,@tx_hash)
    ON CONFLICT(date) DO UPDATE SET fuel_eur=excluded.fuel_eur, pol_eur=excluded.pol_eur,
      n_stations=excluded.n_stations, source=excluded.source, fetched_at=excluded.fetched_at,
      tx_hash=COALESCE(excluded.tx_hash, prices.tx_hash)`).run({ tx_hash: null, ...r });
}

export const setTxHash = (db, date, tx) =>
  db.prepare('UPDATE prices SET tx_hash=? WHERE date=?').run(tx, date);
export const latestRow = (db) =>
  db.prepare('SELECT * FROM prices ORDER BY date DESC LIMIT 1').get() ?? null;
export const history = (db, days) =>
  db.prepare(`SELECT * FROM prices WHERE date >= date('now', ?) ORDER BY date ASC`).all(`-${days} days`);
