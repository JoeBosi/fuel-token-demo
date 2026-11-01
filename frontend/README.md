# FuelToken frontend

Vite + React 18 + TypeScript, wagmi v2 + viem v2, Tailwind CSS v4, recharts, react-router-dom.
Educational demo on a test network: no real value.

## Run

    npm install
    cp .env.example .env     # optional
    npm run dev              # development server
    npm run build            # type-check + production build into dist/
    npm test                 # vitest unit tests (src/lib/price.ts)
    npm run lint

## Environment

- `VITE_API_URL` backend base URL (default `http://127.0.0.1:3801`): `/api/price`, `/api/history`, `/api/faucets`.
- `VITE_CHAIN_ID` chain the app talks to: `80002` (Polygon Amoy, default) or `31337` (local Hardhat node).

## Where the addresses come from

`src/contracts/deployments.json` maps chain id to `{ oracle, token }`, read by `src/contracts/addresses.ts`.
`31337` is copied from `fuel/contracts/deployments/hardhat.json`; `80002` is empty until the Amoy deploy fills it
(from `fuel/contracts/deployments/amoy.json`). With empty addresses the app still shows prices from the API, but
buy, sell and balances are disabled. The ABIs in `src/contracts/` are copies of `fuel/contracts/abi/`.

## Amoy vs localhost

- Amoy: leave defaults, fill the `80002` addresses, set `VITE_API_URL` to the public backend.
- Localhost: start `npx hardhat node` and deploy in `fuel/contracts`, then run with
  `VITE_CHAIN_ID=31337 npm run dev` and import a Hardhat test account in MetaMask (RPC `http://127.0.0.1:8545`, chain id 31337).

## Notes

- Language: Italian default, EN toggle in the header, saved in localStorage (`src/i18n.tsx`).
- Recent operations are read with `getLogs` over the last 40,000 blocks only (public RPCs limit ranges).
- No external fonts, scripts or assets; the favicon is an inline SVG data URI.
- The tutorial link is relative (`tutorial/`) and is expected to be served next to the app.
