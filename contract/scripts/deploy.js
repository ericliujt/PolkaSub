// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy TestToken first
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();

  const testTokenAddress = await testToken.getAddress();
  console.log(`TestToken deployed to: ${testTokenAddress}`);

  // Deploy SubscriptionManager with TestToken address
  const SubscriptionManager = await hre.ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy(testTokenAddress);
  await subscriptionManager.waitForDeployment();

  const subscriptionManagerAddress = await subscriptionManager.getAddress();
  console.log(`SubscriptionManager deployed to: ${subscriptionManagerAddress}`);

  console.log("Deployment completed successfully!");
  
  // Return the contract addresses for testing
  return {
    testToken: testTokenAddress,
    subscriptionManager: subscriptionManagerAddress
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
