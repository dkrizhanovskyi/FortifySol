// This script verifies deployed contracts on Etherscan (or similar block explorers).
// To run this, you need:
// - An ETHERSCAN_API_KEY in your .env
// - Correct network configuration in hardhat.config.js
// - Contracts deployed on a public network
//
// Example command:
// npx hardhat run scripts/verify_all.js --network goerli

const { run } = require("hardhat");

// Update these addresses with your deployed contract addresses and constructor args.
const CONTRACTS_TO_VERIFY = [
  {
    name: "RoleManager",
    address: "0xYourDeployedRoleManagerAddress",
    constructorArguments: ["0xAdminAddress"]
  },
  {
    name: "GovernanceToken",
    address: "0xYourDeployedGovernanceTokenAddress",
    constructorArguments: ["0xRoleManagerAddress"]
  },
  {
    name: "MultiSigWallet",
    address: "0xYourDeployedMultiSigAddress",
    constructorArguments: [["0xSigner1","0xSigner2","0xSigner3"], 2]
  },
  {
    name: "TimeLockController",
    address: "0xYourDeployedTimeLockAddress",
    constructorArguments: [3600]
  },
  {
    name: "SafeEscrow",
    address: "0xYourDeployedSafeEscrowAddress",
    constructorArguments: ["0xBeneficiaryAddress"]
  },
  {
    name: "PausableContract",
    address: "0xYourDeployedPausableAddress",
    constructorArguments: []
  },
  {
    name: "Vault",
    address: "0xYourDeployedVaultAddress",
    constructorArguments: []
  }
];

async function main() {
  for (const contract of CONTRACTS_TO_VERIFY) {
    console.log(`Verifying ${contract.name} at ${contract.address}...`);
    try {
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArguments
      });
      console.log(`Verified ${contract.name}`);
    } catch (error) {
      console.error(`Failed to verify ${contract.name}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
