import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { median, extractPrices, summarize } from '../src/fetchPrice.js';
import { scale, dateToUnix } from '../src/updateOracle.js';
import { openDb, upsertPrice, latestRow } from '../src/db.js';
import { createApp } from '../src/app.js';
import { runFetch } from '../src/fetchJob.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/zone.json', import.meta.url)));

test('median odd/even/empty', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([]), null);
});

test('filters non-self and other fuels', () => {
  const fake = { results: [
    { fuels: [{ price: 2, fuelId: 1, name: 'Benzina', isSelf: true }, { price: 9, fuelId: 1, name: 'Benzina', isSelf: false }, { price: 5, fuelId: 2, name: 'Gasolio', isSelf: true }] },
    { fuels: [{ price: 4, fuelId: 1, name: 'Benzina', isSelf: true }] },
  ] };
  assert.deepEqual(extractPrices(fake), [2, 4]);
  assert.deepEqual(summarize(fake), { fuel_eur: 3, n_stations: 2 });
});

test('parses saved sample response', () => {
  const s = summarize(fixture);
  assert.ok(s.n_stations > 0 && s.n_stations <= fixture.results.length);
  assert.ok(s.fuel_eur > 1 && s.fuel_eur < 3);
});

test('scaling and date', () => {
  assert.equal(scale(1.989), 1989000n);
  assert.equal(dateToUnix('1970-01-02'), 86400);
});

test('upsert is idempotent per date and keeps tx_hash', () => {
  const db = openDb(':memory:');
  const r = { date: '2026-11-01', fuel_eur: 1.9, pol_eur: 0.1, n_stations: 5, source: 's', fetched_at: 'x' };
  upsertPrice(db, { ...r, tx_hash: '0xabc' });
  upsertPrice(db, { ...r, fuel_eur: 2.0 });
  assert.equal(db.prepare('SELECT COUNT(*) c FROM prices').get().c, 1);
  assert.equal(latestRow(db).fuel_eur, 2.0);
  assert.equal(latestRow(db).tx_hash, '0xabc');
});

test('runFetch falls back to last POL price', async () => {
  const db = openDb(':memory:');
  upsertPrice(db, { date: '2020-01-01', fuel_eur: 1, pol_eur: 0.42, n_stations: 1, source: 's', fetched_at: 'x' });
  const row = await runFetch(db, {
    fuel: async () => ({ fuel_eur: 1.9, n_stations: 3 }),
    pol: async () => { throw new Error('down'); },
    oracle: async () => null,
  });
  assert.equal(row.pol_eur, 0.42);
});

async function withServer(db, opts, fn) {
  const server = createApp(db, opts).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { server.close(); }
}

test('API endpoints', async () => {
  const db = openDb(':memory:');
  const today = new Date().toISOString().slice(0, 10);
  upsertPrice(db, { date: today, fuel_eur: 1.989, pol_eur: 0.12, n_stations: 30, source: 's', fetched_at: 'x' });
  const oracle = { fuel: 1.989, pol: 0.12, updatedAt: 1, fresh: true };
  await withServer(db, { oracleReader: async () => oracle }, async (base) => {
    assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { ok: true });
    const p = await (await fetch(`${base}/api/price`)).json();
    assert.equal(p.fuel_eur, 1.989);
    assert.deepEqual(p.oracle, oracle);
    const h = await (await fetch(`${base}/api/history?days=30`)).json();
    assert.equal(h.length, 1);
    const f = await fetch(`${base}/api/faucets`);
    assert.equal(f.headers.get('access-control-allow-origin'), '*');
    assert.ok(Array.isArray(await f.json()));
  });
});

test('price without data is 404, oracle null when unconfigured', async () => {
  const db = openDb(':memory:');
  await withServer(db, { oracleReader: async () => null }, async (base) => {
    assert.equal((await fetch(`${base}/api/price`)).status, 404);
  });
});
