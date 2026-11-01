// Usage: FUEL_EUR=1.989 POL_EUR=0.15 SOURCE_DATE=2026-11-01 npx hardhat run scripts/set-prices.ts --network amoy
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Convert a decimal string to 6-decimal fixed point without floating point errors.
function toMicro(v: string): bigint {
  return ethers.parseUnits(v, 6);
}

async function main() {
  const { FUEL_EUR, POL_EUR, SOURCE_DATE } = process.env;
  if (!FUEL_EUR || !POL_EUR || !SOURCE_DATE) throw new Error("Set FUEL_EUR, POL_EUR and SOURCE_DATE (YYYY-MM-DD)");
  const sourceDate = Math.floor(Date.parse(`${SOURCE_DATE}T00:00:00Z`) / 1000);
  if (Number.isNaN(sourceDate)) throw new Error("SOURCE_DATE must be YYYY-MM-DD");

  const file = path.resolve(__dirname, "..", "deployments", `${network.name}.json`);
  const dep = JSON.parse(fs.readFileSync(file, "utf8"));
  const oracle = await ethers.getContractAt("FuelPriceOracle", dep.oracle);
  const tx = await oracle.setPrices(toMicro(FUEL_EUR), toMicro(POL_EUR), sourceDate);
  await tx.wait();
  console.log(`setPrices(${toMicro(FUEL_EUR)}, ${toMicro(POL_EUR)}, ${sourceDate}) tx ${tx.hash}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
