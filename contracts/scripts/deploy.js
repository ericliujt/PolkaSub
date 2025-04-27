// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Deploying SubscriptionManager contract to Westend EVM...");

  // Deploy the SubscriptionManager contract
  const SubscriptionManager = await hre.ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy();

  await subscriptionManager.waitForDeployment();

  const contractAddress = await subscriptionManager.getAddress();
  console.log(`SubscriptionManager deployed to: ${contractAddress}`);

  // Log deployment details for easy reference
  console.log("\nDeployment Details:");
  console.log("--------------------");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Block Number: ${await hre.ethers.provider.getBlockNumber()}`);
  console.log(`Gas Price: ${await hre.ethers.provider.getFeeData().then(data => data.gasPrice)}`);
  
  console.log("\nVerify contract with:");
  console.log(`npx hardhat verify --network westend ${contractAddress}`);
  
  return {
    subscriptionManager: contractAddress
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
