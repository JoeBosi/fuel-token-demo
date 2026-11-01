import cron from 'node-cron';
import { config } from './config.js';
import { openDb } from './db.js';
import { createApp } from './app.js';
import { runWithRetries } from './fetchJob.js';

const db = openDb(config.dbPath);
createApp(db).listen(config.port, '127.0.0.1', () =>
  console.log(`[api] listening on 127.0.0.1:${config.port}`));

cron.schedule('30 8 * * *', () => {
  runWithRetries(db).catch((e) => console.error('[cron] giving up for today:', e.message));
}, { timezone: 'Europe/Rome' });
console.log('[cron] daily fetch scheduled at 08:30 Europe/Rome');
