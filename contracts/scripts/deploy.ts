import { ethers, network, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const updater = process.env.UPDATER_ADDRESS || deployer.address;
  if (!ethers.isAddress(updater)) throw new Error("UPDATER_ADDRESS is not a valid address");

  const oracle = await ethers.deployContract("FuelPriceOracle", [deployer.address]);
  await oracle.waitForDeployment();
  const token = await ethers.deployContract("FuelToken", [await oracle.getAddress()]);
  await token.waitForDeployment();

  await (await oracle.grantRole(await oracle.UPDATER_ROLE(), updater)).wait();

  const block = await ethers.provider.getBlock("latest");
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const info = {
    chainId,
    oracle: await oracle.getAddress(),
    token: await token.getAddress(),
    deployer: deployer.address,
    updater,
    blockNumber: block!.number,
    timestamp: block!.timestamp,
  };

  const root = path.resolve(__dirname, "..");
  fs.mkdirSync(path.join(root, "deployments"), { recursive: true });
  fs.mkdirSync(path.join(root, "abi"), { recursive: true });
  fs.writeFileSync(path.join(root, "deployments", `${network.name}.json`), JSON.stringify(info, null, 2) + "\n");
  for (const name of ["FuelPriceOracle", "FuelToken"]) {
    const art = await artifacts.readArtifact(name);
    fs.writeFileSync(path.join(root, "abi", `${name}.json`), JSON.stringify(art.abi, null, 2) + "\n");
  }
  console.log(`Deployed on ${network.name} (chainId ${chainId})`);
  console.log(info);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
