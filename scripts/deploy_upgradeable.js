// This script demonstrates deploying an upgradeable proxy and then upgrading its logic.
// It first deploys the MyUpgradableLogic contract and the proxy pointing to it.
// Later, you can upgrade the proxy to a new logic implementation.

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying upgradeable contracts with:", deployer.address);

  // Deploy initial logic contract
  const MyUpgradableLogic = await ethers.getContractFactory("MyUpgradableLogic");
  const logicV1 = await MyUpgradableLogic.deploy();
  await logicV1.deployed();
  console.log("Initial Logic (V1) deployed to:", logicV1.address);

  // Deploy proxy pointing to logicV1
  const UpgradeableProxy = await ethers.getContractFactory("UpgradeableProxy");
  const proxy = await UpgradeableProxy.deploy(logicV1.address);
  await proxy.deployed();
  console.log("Proxy deployed to:", proxy.address);

  // Interact with the logic through the proxy
  const proxyLogic = await ethers.getContractAt("MyUpgradableLogic", proxy.address);
  await proxyLogic.increment();
  console.log("Counter after increment V1:", (await proxyLogic.counter()).toString());

  // Suppose we have a new logic version
  const logicV2 = await MyUpgradableLogic.deploy();
  await logicV2.deployed();
  console.log("New Logic (V2) deployed to:", logicV2.address);

  // Upgrade the proxy to the new logic
  await proxy.connect(deployer).upgradeTo(logicV2.address);
  console.log("Proxy upgraded to V2 logic.");

  await proxyLogic.increment();
  console.log("Counter after increment V2:", (await proxyLogic.counter()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
