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
