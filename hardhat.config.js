require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Loads environment variables from .env

// Extract environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "00".repeat(32); // fallback for testing
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
      // No need for keys or RPC URLs here; runs a local in-memory chain
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // Optional: Uncomment if using gas reporter, coverage, etc.
  // gasReporter: {
  //   enabled: true,
  //   currency: "USD",
  // },
};
