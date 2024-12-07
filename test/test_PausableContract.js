const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the PausableContract contract.
// Checks pausing, unpausing, and ensures paused state restricts actions.
describe("PausableContract", function () {
  let PausableContract, pausable;
  let owner, other;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    PausableContract = await ethers.getContractFactory("PausableContract");
    pausable = await PausableContract.deploy();
    await pausable.deployed();
  });

  it("should allow owner to pause and unpause", async function () {
    await expect(pausable.connect(owner).pause())
      .to.emit(pausable, "Paused")
      .withArgs(owner.address);

    expect(await pausable.paused()).to.equal(true);

    await expect(pausable.connect(owner).unpause())
      .to.emit(pausable, "Unpaused")
      .withArgs(owner.address);

    expect(await pausable.paused()).to.equal(false);
  });

  it("should revert if non-pauser tries to pause", async function () {
    await expect(pausable.connect(other).pause())
      .to.be.revertedWithCustomError(pausable, "NotPauser");
  });

  it("should revert action when paused", async function () {
    await pausable.connect(owner).pause();
    await expect(pausable.connect(owner).safeAction())
      .to.be.revertedWithCustomError(pausable, "ContractPaused");
  });
});
