const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the SafeEscrow contract.
// Checks that funds are held until conditions are met and released by the depositor.
describe("SafeEscrow", function () {
  let SafeEscrow, escrow;
  let depositor, beneficiary;

  beforeEach(async function () {
    [depositor, beneficiary] = await ethers.getSigners();
    SafeEscrow = await ethers.getContractFactory("SafeEscrow");
    escrow = await SafeEscrow.connect(depositor).deploy(beneficiary.address, { value: ethers.utils.parseEther("1") });
    await escrow.deployed();
  });

  it("should hold funds until release is called by depositor", async function () {
    const initialBalance = await ethers.provider.getBalance(beneficiary.address);
    await expect(escrow.connect(beneficiary).release())
      .to.be.revertedWithCustomError(escrow, "NotDepositor");

    await expect(escrow.connect(depositor).release())
      .to.emit(escrow, "Released")
      .withArgs(beneficiary.address, ethers.utils.parseEther("1"));

    const finalBalance = await ethers.provider.getBalance(beneficiary.address);
    expect(finalBalance.sub(initialBalance)).to.be.closeTo(ethers.utils.parseEther("1"), ethers.utils.parseEther("0.001"));
  });

  it("should revert if already released", async function () {
    await escrow.connect(depositor).release();
    await expect(escrow.connect(depositor).release())
      .to.be.revertedWithCustomError(escrow, "AlreadyReleased");
  });
});
