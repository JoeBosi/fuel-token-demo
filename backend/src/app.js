import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { latestRow, history } from './db.js';
import { readOracle } from './updateOracle.js';

export function createApp(db, { oracleReader = readOracle, faucetsPath = new URL('../faucets.json', import.meta.url) } = {}) {
  const app = express();
  app.use(cors());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/price', async (_req, res) => {
    const row = latestRow(db);
    if (!row) return res.status(404).json({ error: 'no data yet' });
    res.json({ ...row, oracle: await oracleReader() });
  });

  app.get('/api/history', (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 365, 1), 3650);
    res.json(history(db, days));
  });

  app.get('/api/faucets', (_req, res) => {
    try { res.json(JSON.parse(readFileSync(faucetsPath, 'utf8'))); }
    catch { res.status(500).json({ error: 'faucets.json unreadable' }); }
  });

  return app;
}
