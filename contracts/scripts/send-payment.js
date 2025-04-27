// Script to test the SimplePayment contract after deployment
const hre = require("hardhat");
const { ethers } = require("hardhat");

// Replace with the actual deployed contract address after deployment
const SIMPLE_PAYMENT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

async function main() {
  console.log("Testing SimplePayment contract...");

  // Get the contract instance
  const simplePayment = await ethers.getContractAt(
    "SimplePayment",
    SIMPLE_PAYMENT_ADDRESS
  );

  // Get signers (accounts)
  const [deployer, recipient] = await ethers.getSigners();
  
  console.log(`Using deployer account: ${deployer.address}`);
  console.log(`Using recipient account: ${recipient.address}`);

  // Payment amount (0.1 WND)
  const paymentAmount = ethers.parseEther("0.1");

  console.log(`\nSending payment with parameters:`);
  console.log(`Recipient: ${recipient.address}`);
  console.log(`Amount: ${ethers.formatEther(paymentAmount)} WND`);

  try {
    // Send a payment
    const tx = await simplePayment.sendPayment(
      recipient.address,
      { value: paymentAmount }
    );

    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Get the event from the logs
    const event = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'PaymentSent')
      .map(log => simplePayment.interface.parseLog(log))[0];

    if (event) {
      console.log("\nPayment details from event:");
      console.log(`Recipient: ${event.args[0]}`);
      console.log(`Amount: ${ethers.formatEther(event.args[1])} WND`);
      console.log(`Timestamp: ${new Date(Number(event.args[2]) * 1000).toLocaleString()}`);
    } else {
      console.log("Could not find PaymentSent event in logs");
    }

    // Check recipient balance
    const recipientBalance = await ethers.provider.getBalance(recipient.address);
    console.log(`\nRecipient balance: ${ethers.formatEther(recipientBalance)} WND`);

    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
