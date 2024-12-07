const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the RoleManager contract.
// This suite checks that roles can be granted and revoked, and that only authorized users can perform restricted actions.
describe("RoleManager", function () {
  let RoleManager, roleManager;
  let admin, user, other;

  beforeEach(async function () {
    [admin, user, other] = await ethers.getSigners();
    RoleManager = await ethers.getContractFactory("RoleManager");
    roleManager = await RoleManager.deploy(admin.address);
    await roleManager.deployed();
  });

  it("should grant and revoke roles by admin", async function () {
    const ADMIN_ROLE = await roleManager.ADMIN_ROLE();
    await expect(roleManager.connect(admin).grantRole(ADMIN_ROLE, user.address))
      .to.emit(roleManager, "RoleGranted")
      .withArgs(ADMIN_ROLE, user.address);

    expect(await roleManager.hasRole(ADMIN_ROLE, user.address)).to.equal(true);

    await expect(roleManager.connect(admin).revokeRole(ADMIN_ROLE, user.address))
      .to.emit(roleManager, "RoleRevoked")
      .withArgs(ADMIN_ROLE, user.address);

    expect(await roleManager.hasRole(ADMIN_ROLE, user.address)).to.equal(false);
  });

  it("should revert if non-admin tries to grant a role", async function () {
    const ADMIN_ROLE = await roleManager.ADMIN_ROLE();
    await expect(
      roleManager.connect(user).grantRole(ADMIN_ROLE, other.address)
    ).to.be.revertedWithCustomError(roleManager, "Unauthorized");
  });
});
