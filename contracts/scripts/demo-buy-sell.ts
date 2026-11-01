import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Buys FUEL with POL, then sells part of it back. Network-agnostic: reads deployments/<network>.json,
// uses the first signer. Env: BUY_POL (default 1), SELL_FRACTION_PCT (default 50).
async function main() {
  const file = path.resolve(__dirname, "..", "deployments", `${network.name}.json`);
  const dep = JSON.parse(fs.readFileSync(file, "utf8"));
  const [user] = await ethers.getSigners();
  const oracle = await ethers.getContractAt("FuelPriceOracle", dep.oracle, user);
  const token = await ethers.getContractAt("FuelToken", dep.token, user);

  const buyWei = ethers.parseEther(process.env.BUY_POL || "1");
  const pct = BigInt(process.env.SELL_FRACTION_PCT || "50");
  const [fuelP] = await oracle.fuelPrice();
  const [polP] = await oracle.polPrice();
  console.log(`network ${network.name}, user ${user.address}`);
  console.log(`oracle: petrol ${Number(fuelP) / 1e6} EUR/l, POL ${Number(polP) / 1e6} EUR`);

  const expectedFuel = (buyWei * polP) / fuelP;
  const quote = await token.quoteBuy(buyWei);
  if (quote !== expectedFuel) throw new Error(`quoteBuy ${quote} != expected ${expectedFuel}`);

  const before = await token.balanceOf(user.address);
  const r0 = await token.reserve();
  await (await token.buy({ value: buyWei })).wait();
  const afterBuy = await token.balanceOf(user.address);
  const r1 = await token.reserve();
  const got = afterBuy - before;
  if (got !== expectedFuel) throw new Error(`minted ${got} != expected ${expectedFuel}`);
  if (r1 - r0 !== buyWei) throw new Error("reserve did not grow by the POL sent");
  console.log(`bought with ${ethers.formatEther(buyWei)} POL -> ${ethers.formatEther(got)} FUEL (reserve ${ethers.formatEther(r1)} POL)`);

  const sellAmt = (got * pct) / 100n;
  const expectedPol = (sellAmt * fuelP) / polP;
  const sq = await token.quoteSell(sellAmt);
  if (sq !== expectedPol) throw new Error(`quoteSell ${sq} != expected ${expectedPol}`);
  await (await token.sell(sellAmt)).wait();
  const r2 = await token.reserve();
  const balEnd = await token.balanceOf(user.address);
  if (r2 !== r1 - expectedPol) throw new Error("reserve did not decrease by the POL paid");
  if (balEnd !== afterBuy - sellAmt) throw new Error("FUEL balance wrong after sell");
  console.log(`sold ${ethers.formatEther(sellAmt)} FUEL -> ${ethers.formatEther(expectedPol)} POL`);
  console.log(`FUEL balance ${ethers.formatEther(balEnd)}, reserve ${ethers.formatEther(r2)} POL (decreased by ${ethers.formatEther(r1 - r2)})`);
  console.log("OK: math matches the oracle prices");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
