import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const FUEL = 1_989_000n; // 1.989 EUR per litre
const POL = 150_000n; // 0.15 EUR per POL
const ONE = 10n ** 18n;

describe("FuelToken", () => {
  async function setup() {
    const [owner, updater, alice, bob] = await ethers.getSigners();
    const oracle = await ethers.deployContract("FuelPriceOracle", [owner.address]);
    await oracle.grantRole(await oracle.UPDATER_ROLE(), updater.address);
    await oracle.connect(updater).setPrices(FUEL, POL, 1700000000);
    const token = await ethers.deployContract("FuelToken", [await oracle.getAddress()]);
    return { owner, updater, alice, bob, oracle, token };
  }

  it("has the right metadata", async () => {
    const { token, owner } = await setup();
    expect(await token.name()).to.equal("FuelToken");
    expect(await token.symbol()).to.equal("FUEL");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.maxAge()).to.equal(3n * 24n * 3600n);
    expect(await token.owner()).to.equal(owner.address);
  });

  it("buy: 1 POL buys 0.0754148... FUEL (exact math)", async () => {
    const { token, alice } = await setup();
    const expected = (ONE * POL) / FUEL;
    expect(expected).to.equal(75414781297134238n);
    expect(await token.quoteBuy(ONE)).to.equal(expected);
    await expect(token.connect(alice).buy({ value: ONE }))
      .to.emit(token, "Bought").withArgs(alice.address, ONE, expected, FUEL, POL);
    expect(await token.balanceOf(alice.address)).to.equal(expected);
    expect(await token.reserve()).to.equal(ONE);
  });

  it("sell: 1 FUEL returns 13.26 POL (exact math)", async () => {
    const { token, alice, bob } = await setup();
    // fund reserve with plenty of POL via a purchase by bob
    await token.connect(bob).buy({ value: 100n * ONE });
    await token.connect(alice).buy({ value: 20n * ONE });
    const bal = await token.balanceOf(alice.address);
    const expected = (bal * FUEL) / POL;
    expect(await token.quoteSell(bal)).to.equal(expected);
    await expect(token.connect(alice).sell(bal))
      .to.emit(token, "Sold").withArgs(alice.address, bal, expected, FUEL, POL);
    expect(await token.balanceOf(alice.address)).to.equal(0n);
    expect(await token.quoteSell(ONE)).to.equal((ONE * FUEL) / POL); // 13.26 POL
    expect((ONE * FUEL) / POL).to.equal(13_260_000_000_000_000_000n);
  });

  it("rounds down in favour of the contract; round trip never profits", async () => {
    const { token, alice, bob } = await setup();
    await token.connect(bob).buy({ value: 50n * ONE });
    const pay = 1_234_567_891_011_121_314n;
    await token.connect(alice).buy({ value: pay });
    const fuel = await token.balanceOf(alice.address);
    expect(fuel).to.equal((pay * POL) / FUEL);
    const before = await ethers.provider.getBalance(alice.address);
    const tx = await token.connect(alice).sell(fuel);
    const r = await tx.wait();
    const gas = r!.gasUsed * r!.gasPrice;
    const after = await ethers.provider.getBalance(alice.address);
    const received = after - before + gas;
    expect(received).to.be.lte(pay);
  });

  it("reverts on zero amounts and dust that rounds to zero", async () => {
    const { token, alice } = await setup();
    await expect(token.connect(alice).buy({ value: 0 })).to.be.revertedWithCustomError(token, "ZeroAmount");
    await expect(token.connect(alice).buy({ value: 1 })).to.be.revertedWithCustomError(token, "ZeroAmount");
    await expect(token.connect(alice).sell(0)).to.be.revertedWithCustomError(token, "ZeroAmount");
  });

  it("reverts with InsufficientReserve when the contract lacks POL", async () => {
    const { token, alice, oracle, updater } = await setup();
    await token.connect(alice).buy({ value: ONE });
    const bal = await token.balanceOf(alice.address);
    // POL halves in value: selling FUEL now needs twice the POL held
    await oracle.connect(updater).setPrices(FUEL, POL / 2n, 1700086400);
    await expect(token.connect(alice).sell(bal)).to.be.revertedWithCustomError(token, "InsufficientReserve");
  });

  it("reverts with StalePrice after maxAge and works again after refresh or longer maxAge", async () => {
    const { token, alice, owner, oracle, updater } = await setup();
    await time.increase(3 * 24 * 3600 + 10);
    await expect(token.connect(alice).buy({ value: ONE })).to.be.revertedWithCustomError(token, "StalePrice");
    await expect(token.quoteBuy(ONE)).to.be.revertedWithCustomError(token, "StalePrice");
    await token.connect(owner).setMaxAge(10 * 24 * 3600);
    await token.connect(alice).buy({ value: ONE });
    await time.increase(10 * 24 * 3600);
    await expect(token.connect(alice).buy({ value: ONE })).to.be.revertedWithCustomError(token, "StalePrice");
    await oracle.connect(updater).setPrices(FUEL, POL, 1700900000);
    await token.connect(alice).buy({ value: ONE });
  });

  it("only the owner can set maxAge and pause", async () => {
    const { token, alice } = await setup();
    await expect(token.connect(alice).setMaxAge(1)).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    await expect(token.connect(alice).pause()).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    await expect(token.connect(alice).unpause()).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("pause blocks buy and sell, unpause restores them", async () => {
    const { token, alice, owner } = await setup();
    await token.connect(alice).buy({ value: ONE });
    await token.connect(owner).pause();
    await expect(token.connect(alice).buy({ value: ONE })).to.be.revertedWithCustomError(token, "EnforcedPause");
    await expect(token.connect(alice).sell(1000n)).to.be.revertedWithCustomError(token, "EnforcedPause");
    await token.connect(owner).unpause();
    await token.connect(alice).buy({ value: ONE });
    await token.connect(alice).sell(await token.balanceOf(alice.address) / 2n);
  });

  it("permit (EIP-2612): gasless approval then transferFrom", async () => {
    const { token, alice, bob } = await setup();
    await token.connect(alice).buy({ value: ONE });
    const value = 1000n;
    const deadline = (await time.latest()) + 3600;
    const nonce = await token.nonces(alice.address);
    const { chainId } = await ethers.provider.getNetwork();
    const sig = await alice.signTypedData(
      { name: "FuelToken", version: "1", chainId, verifyingContract: await token.getAddress() },
      { Permit: [
        { name: "owner", type: "address" }, { name: "spender", type: "address" },
        { name: "value", type: "uint256" }, { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" } ] },
      { owner: alice.address, spender: bob.address, value, nonce, deadline },
    );
    const { v, r, s } = ethers.Signature.from(sig);
    await token.connect(bob).permit(alice.address, bob.address, value, deadline, v, r, s);
    expect(await token.allowance(alice.address, bob.address)).to.equal(value);
    await token.connect(bob).transferFrom(alice.address, bob.address, value);
    expect(await token.balanceOf(bob.address)).to.equal(value);
    // replay fails
    await expect(token.connect(bob).permit(alice.address, bob.address, value, deadline, v, r, s)).to.be.reverted;
  });
});
