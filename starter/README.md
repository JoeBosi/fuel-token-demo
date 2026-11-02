# FuelToken starter

Minimal, working version of FuelToken (price oracle + ERC-20 token + price script + web page).
Teaching demo for test networks only. Follow the tutorial: `tutorial/en/build.html`.

```bash
npm install
npx hardhat test
npx hardhat node                                          # terminal 1
npx hardhat run scripts/deploy.js --network localhost     # terminal 2
npx hardhat run scripts/update-price.js --network localhost
cd web && npm install && npm run dev
```

## Try it without installing anything

- `chapters/*.sol`: the chapter contracts, ready for Remix IDE (open from the tutorial buttons).
- `web/`: the browser page. It ships with the addresses of the public Amoy deployment in `web/src/deployment.json`
  (read only works with no wallet). Running `deploy.js` overwrites that file with your own addresses.
- `../notebooks/`: Google Colab notebooks (Python, read only, no keys).
