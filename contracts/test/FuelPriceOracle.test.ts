import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("FuelPriceOracle", () => {
  async function setup() {
    const [admin, updater, other] = await ethers.getSigners();
    const oracle = await ethers.deployContract("FuelPriceOracle", [admin.address]);
    await oracle.grantRole(await oracle.UPDATER_ROLE(), updater.address);
    return { oracle, admin, updater, other };
  }

  it("lets only the updater set prices", async () => {
    const { oracle, admin, other } = await setup();
    await expect(oracle.connect(other).setPrices(1989000, 150000, 1))
      .to.be.revertedWithCustomError(oracle, "AccessControlUnauthorizedAccount");
    await expect(oracle.connect(admin).setPrices(1989000, 150000, 1))
      .to.be.revertedWithCustomError(oracle, "AccessControlUnauthorizedAccount");
  });

  it("admin can grant and revoke the updater role", async () => {
    const { oracle, admin, other } = await setup();
    const role = await oracle.UPDATER_ROLE();
    await oracle.connect(admin).grantRole(role, other.address);
    await oracle.connect(other).setPrices(1, 1, 1);
    await oracle.connect(admin).revokeRole(role, other.address);
    await expect(oracle.connect(other).setPrices(1, 1, 1)).to.be.reverted;
  });

  it("stores prices and emits PricesUpdated", async () => {
    const { oracle, updater } = await setup();
    const tx = await oracle.connect(updater).setPrices(1989000, 150000, 1700000000);
    const ts = await time.latest();
    await expect(tx).to.emit(oracle, "PricesUpdated").withArgs(1989000, 150000, 1700000000, ts);
    expect(await oracle.fuelPrice()).to.deep.equal([1989000n, BigInt(ts)]);
    expect(await oracle.polPrice()).to.deep.equal([150000n, BigInt(ts)]);
    expect(await oracle.latestSourceDate()).to.equal(1700000000n);
  });

  it("rejects zero prices", async () => {
    const { oracle, updater } = await setup();
    await expect(oracle.connect(updater).setPrices(0, 150000, 1)).to.be.revertedWithCustomError(oracle, "ZeroPrice");
    await expect(oracle.connect(updater).setPrices(1989000, 0, 1)).to.be.revertedWithCustomError(oracle, "ZeroPrice");
  });

  it("freshness: false before any update, true then false after maxAge", async () => {
    const { oracle, updater } = await setup();
    expect(await oracle.isFresh(3600)).to.equal(false);
    await oracle.connect(updater).setPrices(1989000, 150000, 1);
    expect(await oracle.isFresh(3600)).to.equal(true);
    await time.increase(3601);
    expect(await oracle.isFresh(3600)).to.equal(false);
    expect(await oracle.isFresh(7200)).to.equal(true);
  });
});
