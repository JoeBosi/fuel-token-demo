# FuelToken smart contracts

Educational demo on a test network: no real value.

- `FuelPriceOracle`: stores the daily petrol price (EUR per litre) and the POL price (EUR). Only an address with `UPDATER_ROLE` can write; zero prices are rejected. Prices have 6 decimals (1.989 EUR = `1989000`).
- `FuelToken` (FUEL, 18 decimals, 1 FUEL = 1 litre): ERC-20 with EIP-2612 permit, pausable, owned. `buy()` mints FUEL for the POL sent; `sell(amount)` burns FUEL and pays POL back from the contract reserve. No fees. Both revert with `StalePrice` if the oracle data is older than `maxAge` (default 3 days, owner can change it). Other errors: `ZeroAmount`, `InsufficientReserve`.

## Install and test

    npm install
    npm test

## Deploy locally

    npx hardhat node                      # terminal 1
    npm run deploy:local                  # terminal 2 (network localhost)
    # or a throwaway in-process run:
    npx hardhat run scripts/deploy.ts

`UPDATER_ADDRESS` (optional locally) receives `UPDATER_ROLE`; if unset, the deployer does.
The script writes `deployments/<network>.json` (`chainId, oracle, token, deployer, updater, blockNumber, timestamp`) and the ABIs to `abi/FuelPriceOracle.json` and `abi/FuelToken.json`.

## Demo buy/sell script

    npm run demo:local       # = hardhat run scripts/demo-buy-sell.ts --network localhost

Reads `deployments/<network>.json`, uses the first signer, buys with `BUY_POL` (default 1) POL, then sells `SELL_FRACTION_PCT` (default 50) percent of the FUEL received. It checks `quoteBuy`/`quoteSell`, the minted amount and the reserve against the oracle prices, and fails on any mismatch. On Amoy: `npx hardhat run scripts/demo-buy-sell.ts --network amoy` (the signer needs test POL; the oracle must be fresh).

## Deploy to Polygon Amoy (chain id 80002)

    cp .env.example .env     # fill AMOY_RPC_URL, DEPLOYER_PRIVATE_KEY (test key only), UPDATER_ADDRESS, POLYGONSCAN_API_KEY
    npm run deploy:amoy
    npm run verify:amoy
    FUEL_EUR=1.989 POL_EUR=0.15 SOURCE_DATE=2026-11-01 npm run set-prices   # manual price update

Never commit `.env`. Use a freshly generated test key and test POL from a faucet.

## Price math

All prices have 6 decimals, amounts are in wei (18 decimals). Integer division rounds down, so a round trip never gains.

    buy:  fuel = msg.value * polEur / fuelEurPerLitre
    sell: pol  = amount * fuelEurPerLitre / polEur

Worked example: petrol 1.989 EUR/l (`1989000`), POL 0.15 EUR (`150000`).
Buying with 1 POL (10^18 wei): `10^18 * 150000 / 1989000 = 75414781297134238` wei = 0.0754147... FUEL.
Selling 1 FUEL (10^18): `10^18 * 1989000 / 150000 = 13.26` POL.
