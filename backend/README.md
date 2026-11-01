# FuelToken backend

Reads the daily self-service petrol price from the Italian Ministry's Osservaprezzi Carburanti API (median over stations within a radius), reads the POL/EUR price from CoinGecko, stores both in SQLite and pushes them to the `FuelPriceOracle` contract with `setPrices`. A small JSON API serves the data to the frontend.

## Run

```
npm install
cp .env.example .env     # fill ORACLE_ADDRESS and UPDATER_PRIVATE_KEY
npm run fetch            # one run: fetch, store, update oracle
npm start                # API on 127.0.0.1:3801 + daily cron
npm test
```

If `ORACLE_ADDRESS`, `UPDATER_PRIVATE_KEY` or `RPC_URL` is missing, the on-chain update is skipped (logged) and data is only stored. Never commit `.env`.

## Daily job

`npm start` schedules the fetch at 08:30 Europe/Rome (node-cron), with 3 attempts 10 minutes apart. Runs are idempotent per date (upsert in `prices`). Prices are sent scaled by 1e6 (1.989 EUR becomes `1989000`); `sourceDate` is the date at 00:00 UTC. If CoinGecko fails, the last known POL price is reused with a warning. Alternatively run `npm run fetch` from a systemd timer.

## API (all JSON, CORS enabled)

- `GET /api/price`: latest row (`date, fuel_eur, pol_eur, n_stations, source, fetched_at, tx_hash`) plus `oracle: {fuel, pol, updatedAt, fresh}` read on-chain (`null` if not configured or unreachable). 404 if no data yet.
- `GET /api/history?days=365`: rows in ascending date order.
- `GET /api/faucets`: contents of `faucets.json`.
- `GET /api/health`: `{"ok":true}`.

The server binds only to `127.0.0.1`; expose it through a reverse proxy.

## systemd

See `deploy/fuel-backend.service` (example only, adjust user and paths):

```
sudo cp deploy/fuel-backend.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now fuel-backend
```

## Data source

`POST https://carburanti.mise.gov.it/ospzApi/search/zone` with `fuelType: "1-x"`; only `fuelId 1` (Benzina) with `isSelf: true` is kept. SQLite file: `data/fuel.db`.
