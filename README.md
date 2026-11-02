# FuelToken (demo 1)

A test-network token worth one litre of petrol (1 FUEL = 1 litre). No real value.

Three parts:

- `contracts/`: `FuelPriceOracle` (daily petrol and POL prices, 6 decimals) and `FuelToken` (ERC-20, `buy()` / `sell()` against a POL reserve). Hardhat.
- `backend/`: Node job that reads the median self-service petrol price within 30 km of Arezzo (Ministry Osservaprezzi API) and POL/EUR (CoinGecko), stores them in SQLite, calls `setPrices` on the oracle, and serves a small JSON API.
- `frontend/`: Vite app that reads the chain and the API.

## Run everything locally

Run each in its own terminal. Hardhat accounts are public test keys: never use them elsewhere.

    # 1. chain
    cd contracts && npx hardhat node
    # 2. deploy (account #1 as updater)
    cd contracts && UPDATER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8 npm run deploy:local
    # 3. fetch prices and push them to the oracle (fill backend/.env from .env.example first)
    cd backend && RPC_URL=http://127.0.0.1:8545 CHAIN_ID=31337 ORACLE_ADDRESS=<oracle from contracts/deployments/localhost.json> \
      UPDATER_PRIVATE_KEY=<private key of Hardhat account #1, printed by `npx hardhat node`> npm run fetch
    # 4. API (same env as step 3) on 127.0.0.1:3801
    cd backend && <same env> npm start
    # 5. optional buy/sell check
    cd contracts && npm run demo:local
    # 6. frontend (VITE_API_URL=http://127.0.0.1:3801, VITE_CHAIN_ID=31337)
    cd frontend && npm run dev

Stop the chain and the API by PID (`kill <pid>`), never with `pkill -f`.

## Daily job

`npm start` in `backend/` schedules the fetch at 08:30 Europe/Rome (3 attempts, 10 minutes apart), idempotent per date. Alternative: a systemd timer running `npm run fetch` (example unit in `backend/deploy/`). The oracle is "fresh" for 3 days; after that `buy()` and `sell()` revert with `StalePrice`.

## Deploy to Polygon Amoy (checklist)

1. Generate two test keys: deployer and updater. Never reuse real keys.
2. Get test POL from a faucet for both (see `backend/faucets.json`).
3. `contracts/.env` from `.env.example`: `DEPLOYER_PRIVATE_KEY`, `UPDATER_ADDRESS`, `POLYGONSCAN_API_KEY`.
4. `cd contracts && npm run deploy:amoy` (writes `deployments/amoy.json` and `abi/`).
5. `backend/.env` from `.env.example`: `ORACLE_ADDRESS`, `UPDATER_PRIVATE_KEY` (the updater key), `RPC_URL`, `CHAIN_ID=80002`.
6. `cd backend && npm run fetch`; check the `tx_hash` in `data/fuel.db` and `GET /api/price` (`oracle.fresh` must be true).
7. `cd contracts && npm run verify:amoy`, then check both contracts on Polygonscan (Amoy).
8. Copy `deployments/amoy.json` into the frontend (`src/contracts/`), set `VITE_API_URL`, build.
9. Optionally send some POL to the token contract's reserve (via a first `buy()`), so `sell()` has liquidity.

## Verified source (Sourcify, Polygon Amoy)
- FuelPriceOracle: https://repo.sourcify.dev/80002/0xf30D07696476e97103730BE0dFb55045945409D8
- FuelToken: https://repo.sourcify.dev/80002/0x87eAE9eF4A2dD56D04b4798bA9Bc7B777E70c9ac

Re-run with `node contracts/scripts/verify-sourcify.js 80002 <address> <ContractName>`.
