const fs = require("fs");
const path = require("path");
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network:", network.name, "| deployer:", deployer.address);

  const oracle = await ethers.deployContract("SimpleFuelOracle", [deployer.address]);
  await oracle.waitForDeployment();
  await (await oracle.grantRole(await oracle.UPDATER_ROLE(), deployer.address)).wait();

  const token = await ethers.deployContract("SimpleFuelToken", [await oracle.getAddress()]);
  await token.waitForDeployment();

  const info = {
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    oracle: await oracle.getAddress(),
    token: await token.getAddress(),
  };
  console.log("Oracle:", info.oracle);
  console.log("Token: ", info.token);

  // The scripts and the web page read the addresses from these files.
  fs.writeFileSync("deployment.json", JSON.stringify(info, null, 2));
  fs.writeFileSync(path.join("web", "src", "deployment.json"), JSON.stringify(info, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
