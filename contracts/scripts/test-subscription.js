// Script to test the SubscriptionManager contract after deployment
const hre = require("hardhat");
const { ethers } = require("hardhat");

// Replace with the actual deployed contract address after deployment
const SUBSCRIPTION_MANAGER_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

async function main() {
  console.log("Testing SubscriptionManager contract...");

  // Get the contract instance
  const subscriptionManager = await ethers.getContractAt(
    "SubscriptionManager",
    SUBSCRIPTION_MANAGER_ADDRESS
  );

  // Get signers (accounts)
  const [deployer, recipient] = await ethers.getSigners();
  
  console.log(`Using deployer account: ${deployer.address}`);
  console.log(`Using recipient account: ${recipient.address}`);

  // Test parameters
  const amount = ethers.parseEther("0.01"); // 0.01 WND
  const frequency = 100; // 100 blocks

  console.log(`\nCreating subscription with parameters:`);
  console.log(`Recipient: ${recipient.address}`);
  console.log(`Amount: ${ethers.formatEther(amount)} WND`);
  console.log(`Frequency: ${frequency} blocks`);

  try {
    // Create a subscription
    const tx = await subscriptionManager.createSubscription(
      recipient.address,
      amount,
      frequency,
      { value: amount }
    );

    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Get the subscription ID from the event logs
    const event = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'SubscriptionCreated')
      .map(log => subscriptionManager.interface.parseLog(log))[0];

    if (!event) {
      console.log("Could not find SubscriptionCreated event in logs");
      return;
    }

    const subscriptionId = event.args[0];
    console.log(`\nSubscription created with ID: ${subscriptionId}`);

    // Get subscription details
    const subscription = await subscriptionManager.getSubscription(subscriptionId);
    console.log("\nSubscription details:");
    console.log(`Subscriber: ${subscription[0]}`);
    console.log(`Recipient: ${subscription[1]}`);
    console.log(`Amount: ${ethers.formatEther(subscription[2])} WND`);
    console.log(`Frequency: ${subscription[3]} blocks`);
    console.log(`Next Payment Block: ${subscription[4]}`);
    console.log(`Status: ${["Active", "Cancelled", "Expired"][subscription[5]]}`);

    // Check if payment is due
    const isPaymentDue = await subscriptionManager.isPaymentDue(subscriptionId);
    console.log(`\nIs payment due? ${isPaymentDue}`);

    // Get all subscriptions for the deployer
    const subscriptionIds = await subscriptionManager.getSubscriptionIds(deployer.address);
    console.log(`\nAll subscription IDs for ${deployer.address}: ${subscriptionIds}`);

    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
