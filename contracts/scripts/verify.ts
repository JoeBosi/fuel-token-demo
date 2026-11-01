// Usage: npx hardhat run scripts/verify.ts --network amoy   (needs POLYGONSCAN_API_KEY)
import { run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const file = path.resolve(__dirname, "..", "deployments", `${network.name}.json`);
  const dep = JSON.parse(fs.readFileSync(file, "utf8"));
  await run("verify:verify", { address: dep.oracle, constructorArguments: [dep.deployer], contract: "contracts/FuelPriceOracle.sol:FuelPriceOracle" });
  await run("verify:verify", { address: dep.token, constructorArguments: [dep.oracle], contract: "contracts/FuelToken.sol:FuelToken" });
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
