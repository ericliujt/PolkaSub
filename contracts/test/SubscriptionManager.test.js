const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SubscriptionManager", function () {
  let subscriptionManager;
  let owner;
  let recipient;
  let addr1;
  
  // Test parameters
  const amount = ethers.parseEther("0.01"); // 0.01 WND
  const frequency = 100; // 100 blocks
  
  beforeEach(async function () {
    // Get signers
    [owner, recipient, addr1] = await ethers.getSigners();
    
    // Deploy the contract
    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManager.deploy();
    await subscriptionManager.waitForDeployment();
  });
  
  describe("Subscription Creation", function () {
    it("Should create a subscription and emit an event", async function () {
      // Create a subscription
      await expect(
        subscriptionManager.createSubscription(
          recipient.address,
          amount,
          frequency,
          { value: amount }
        )
      )
        .to.emit(subscriptionManager, "SubscriptionCreated")
        .withArgs(0, owner.address, recipient.address, amount, frequency);
      
      // Check subscription details
      const subscription = await subscriptionManager.getSubscription(0);
      expect(subscription[0]).to.equal(owner.address); // subscriber
      expect(subscription[1]).to.equal(recipient.address); // recipient
      expect(subscription[2]).to.equal(amount); // amount
      expect(subscription[3]).to.equal(frequency); // frequency
      expect(subscription[5]).to.equal(0); // status (Active)
    });
    
    it("Should fail if amount is 0", async function () {
      await expect(
        subscriptionManager.createSubscription(
          recipient.address,
          0,
          frequency,
          { value: amount }
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
    
    it("Should fail if frequency is 0", async function () {
      await expect(
        subscriptionManager.createSubscription(
          recipient.address,
          amount,
          0,
          { value: amount }
        )
      ).to.be.revertedWith("Frequency must be greater than 0");
    });
    
    it("Should fail if insufficient funds", async function () {
      await expect(
        subscriptionManager.createSubscription(
          recipient.address,
          amount,
          frequency,
          { value: ethers.parseEther("0.005") } // Less than amount
        )
      ).to.be.revertedWith("Insufficient funds for first payment");
    });
  });
  
  describe("Subscription Management", function () {
    let subscriptionId;
    
    beforeEach(async function () {
      // Create a subscription
      const tx = await subscriptionManager.createSubscription(
        recipient.address,
        amount,
        frequency,
        { value: amount }
      );
      const receipt = await tx.wait();
      
      // Get subscription ID from event
      const event = receipt.logs
        .filter(log => log.fragment && log.fragment.name === 'SubscriptionCreated')
        .map(log => subscriptionManager.interface.parseLog(log))[0];
      
      subscriptionId = event.args[0];
    });
    
    it("Should allow subscriber to cancel subscription", async function () {
      await expect(
        subscriptionManager.cancelSubscription(subscriptionId)
      )
        .to.emit(subscriptionManager, "SubscriptionCancelled")
        .withArgs(subscriptionId);
      
      // Check subscription status
      const subscription = await subscriptionManager.getSubscription(subscriptionId);
      expect(subscription[5]).to.equal(1); // status (Cancelled)
    });
    
    it("Should not allow non-subscriber to cancel subscription", async function () {
      await expect(
        subscriptionManager.connect(addr1).cancelSubscription(subscriptionId)
      ).to.be.revertedWith("Not the subscriber");
    });
    
    it("Should get all subscription IDs for a subscriber", async function () {
      const subscriptionIds = await subscriptionManager.getSubscriptionIds(owner.address);
      expect(subscriptionIds.length).to.equal(1);
      expect(subscriptionIds[0]).to.equal(subscriptionId);
    });
    
    it("Should check if payment is due", async function () {
      // Initially payment is not due
      expect(await subscriptionManager.isPaymentDue(subscriptionId)).to.equal(false);
      
      // Advance blocks to make payment due
      for (let i = 0; i < frequency; i++) {
        await ethers.provider.send("evm_mine");
      }
      
      // Now payment should be due
      expect(await subscriptionManager.isPaymentDue(subscriptionId)).to.equal(true);
    });
  });
});
