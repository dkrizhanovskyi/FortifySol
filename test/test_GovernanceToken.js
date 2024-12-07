const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the GovernanceToken contract.
// Checks minting by MINTER_ROLE and standard ERC20-like behaviors.
describe("GovernanceToken", function () {
  let GovernanceToken, token, RoleManager, roleManager;
  let admin, minter, user;

  beforeEach(async function () {
    [admin, minter, user] = await ethers.getSigners();

    RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy(admin.address);
    await roleManager.deployed();

    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    token = await GovernanceToken.deploy(roleManager.address);
    await token.deployed();

    const MINTER_ROLE = await token.MINTER_ROLE();
    await roleManager.connect(admin).grantRole(MINTER_ROLE, minter.address);
  });

  it("should mint tokens by minter only", async function () {
    await expect(token.connect(minter).mint(user.address, 1000))
      .to.emit(token, "Transfer")
      .withArgs(ethers.constants.AddressZero, user.address, 1000);

    expect(await token.balanceOf(user.address)).to.equal(1000);
  });

  it("should revert if non-minter tries to mint", async function () {
    await expect(token.connect(user).mint(user.address, 1000))
      .to.be.revertedWithCustomError(token, "NotMinter");
  });

  it("should allow transfers and approvals", async function () {
    await token.connect(minter).mint(admin.address, 500);
    await expect(token.connect(admin).transfer(user.address, 200))
      .to.emit(token, "Transfer")
      .withArgs(admin.address, user.address, 200);

    await expect(token.connect(user).approve(admin.address, 100))
      .to.emit(token, "Approval")
      .withArgs(user.address, admin.address, 100);
  });
});
