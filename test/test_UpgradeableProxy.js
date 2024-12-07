const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the UpgradeableProxy contract.
// Checks that only admin can upgrade and that calls are properly delegated.
describe("UpgradeableProxy", function () {
  let UpgradeableProxy, MyUpgradableLogic, proxy, logicV1, logicV2;
  let admin, user;

  beforeEach(async function () {
    [admin, user] = await ethers.getSigners();
    MyUpgradableLogic = await ethers.getContractFactory("MyUpgradableLogic");
    logicV1 = await MyUpgradableLogic.deploy();
    await logicV1.deployed();

    UpgradeableProxy = await ethers.getContractFactory("UpgradeableProxy");
    proxy = await UpgradeableProxy.deploy(logicV1.address);
    await proxy.deployed();

    // Deploy a second version of logic to test upgrade
    logicV2 = await MyUpgradableLogic.deploy();
    await logicV2.deployed();
  });

  it("should allow admin to upgrade the implementation", async function () {
    await expect(proxy.connect(admin).upgradeTo(logicV2.address))
      .to.emit(proxy, "Upgraded")
      .withArgs(logicV2.address);
  });

  it("should revert if non-admin tries to upgrade", async function () {
    await expect(proxy.connect(user).upgradeTo(logicV2.address))
      .to.be.revertedWithCustomError(proxy, "NotAdmin");
  });

  it("should delegate calls to the logic contract", async function () {
    const proxyLogic = await ethers.getContractAt("MyUpgradableLogic", proxy.address);
    await proxyLogic.increment();
    expect(await proxyLogic.counter()).to.equal(1);
  });
});
