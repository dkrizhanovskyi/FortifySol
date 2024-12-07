// This script deploys a selection of the contracts in one go.
// It demonstrates a pattern of deploying contracts that depend on each other,
// like RoleManager before GovernanceToken, or upgrading proxies after base deployments.

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy RoleManager with the deployer as admin
  const RoleManager = await ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy(deployer.address);
  await roleManager.deployed();
  console.log("RoleManager deployed to:", roleManager.address);

  // Deploy GovernanceToken, passing RoleManager address to constructor
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(roleManager.address);
  await governanceToken.deployed();
  console.log("GovernanceToken deployed to:", governanceToken.address);

  // Deploy MultiSigWallet
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  // Example signers: using deployer plus two others
  const signerAddresses = [deployer.address, ethers.Wallet.createRandom().address, ethers.Wallet.createRandom().address];
  const multiSig = await MultiSigWallet.deploy(signerAddresses, 2);
  await multiSig.deployed();
  console.log("MultiSigWallet deployed to:", multiSig.address);

  // Deploy TimeLockController with a given delay
  const TimeLockController = await ethers.getContractFactory("TimeLockController");
  const tlc = await TimeLockController.deploy(3600); // 1-hour delay
  await tlc.deployed();
  console.log("TimeLockController deployed to:", tlc.address);

  // Deploy SafeEscrow
  // For demo purposes, beneficiary is set to the deployer
  const SafeEscrow = await ethers.getContractFactory("SafeEscrow");
  const escrow = await SafeEscrow.deploy(deployer.address, { value: ethers.utils.parseEther("1") });
  await escrow.deployed();
  console.log("SafeEscrow deployed to:", escrow.address);

  // Deploy PausableContract
  const PausableContract = await ethers.getContractFactory("PausableContract");
  const pausable = await PausableContract.deploy();
  await pausable.deployed();
  console.log("PausableContract deployed to:", pausable.address);

  // Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  await vault.deployed();
  console.log("Vault deployed to:", vault.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
