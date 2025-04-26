require("@nomicfoundation/hardhat-toolbox");

// Load environment variables if present
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    // For connecting to Polkadot's Westend Asset Hub
    westend: {
      url: "https://westend-asset-hub-rpc.polkadot.io",
      accounts: [PRIVATE_KEY],
      chainId: 1000,
      gasPrice: 1000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
