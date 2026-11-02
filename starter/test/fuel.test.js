const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const FUEL = 1_989_000n; // 1.989 EUR per litre (6 decimals)
const POL = 400_000n; // 0.40 EUR per POL (6 decimals)

describe("SimpleFuelOracle and SimpleFuelToken", function () {
  async function setup() {
    const [admin, alice, stranger] = await ethers.getSigners();
    const oracle = await ethers.deployContract("SimpleFuelOracle", [admin.address]);
    await oracle.grantRole(await oracle.UPDATER_ROLE(), admin.address);
    const token = await ethers.deployContract("SimpleFuelToken", [await oracle.getAddress()]);
    return { admin, alice, stranger, oracle, token };
  }

  it("is not fresh before the first update", async function () {
    const { oracle } = await setup();
    expect(await oracle.isFresh(3 * 86400)).to.equal(false);
  });

  it("stores prices written by the updater", async function () {
    const { oracle } = await setup();
    await oracle.setPrices(FUEL, POL);
    const [price] = await oracle.fuelPrice();
    expect(price).to.equal(FUEL);
    expect(await oracle.isFresh(3 * 86400)).to.equal(true);
  });

  it("rejects a stranger and a zero price", async function () {
    const { oracle, stranger } = await setup();
    await expect(oracle.connect(stranger).setPrices(FUEL, POL)).to.be.reverted;
    await expect(oracle.setPrices(0, POL)).to.be.revertedWithCustomError(oracle, "ZeroPrice");
  });

  it("buys FUEL at the oracle price", async function () {
    const { oracle, token, alice } = await setup();
    await oracle.setPrices(FUEL, POL);
    // 1 POL = 0.40 EUR, 1 L = 1.989 EUR  =>  0.2011... L
    await token.connect(alice).buy({ value: ethers.parseEther("1") });
    const expected = (ethers.parseEther("1") * POL) / FUEL;
    expect(await token.balanceOf(alice.address)).to.equal(expected);
  });

  it("sells FUEL back for POL", async function () {
    const { oracle, token, alice } = await setup();
    await oracle.setPrices(FUEL, POL);
    await token.connect(alice).buy({ value: ethers.parseEther("1") });
    const fuel = await token.balanceOf(alice.address);
    await expect(token.connect(alice).sell(fuel)).to.changeEtherBalance(
      alice,
      (fuel * FUEL) / POL
    );
    expect(await token.balanceOf(alice.address)).to.equal(0n);
  });

  it("refuses to trade when the price is old", async function () {
    const { oracle, token, alice } = await setup();
    await oracle.setPrices(FUEL, POL);
    await time.increase(4 * 86400);
    await expect(
      token.connect(alice).buy({ value: ethers.parseEther("1") })
    ).to.be.revertedWithCustomError(token, "StalePrice");
  });
});
