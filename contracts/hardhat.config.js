require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    // Westend EVM network
    westend: {
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [PRIVATE_KEY],
      chainId: 420420421,
      gasPrice: 1000000000,
    },
  },
  paths: {
    sources: "./SubscriptionManager.sol",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
