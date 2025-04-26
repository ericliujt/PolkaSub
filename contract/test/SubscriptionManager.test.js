const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SubscriptionManager", function () {
  let testToken;
  let subscriptionManager;
  let owner;
  let subscriber;
  let serviceProvider;
  let addrs;

  // Constants for testing
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const SUBSCRIPTION_AMOUNT = ethers.parseEther("10");
  const SUBSCRIPTION_FREQUENCY = 10; // 10 blocks

  beforeEach(async function () {
    // Get signers
    [owner, subscriber, serviceProvider, ...addrs] = await ethers.getSigners();

    // Deploy TestToken
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();

    // Deploy SubscriptionManager with TestToken address
    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    subscriptionManager = await SubscriptionManager.deploy(await testToken.getAddress());

    // Transfer tokens to subscriber for testing
    await testToken.transfer(subscriber.address, INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the correct payment token", async function () {
      expect(await subscriptionManager.paymentToken()).to.equal(await testToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await subscriptionManager.owner()).to.equal(owner.address);
    });
  });

  describe("Subscription Creation", function () {
    it("Should create a subscription successfully", async function () {
      // Approve tokens for the subscription manager
      await testToken.connect(subscriber).approve(await subscriptionManager.getAddress(), SUBSCRIPTION_AMOUNT);

      // Create subscription
      await expect(
        subscriptionManager.connect(subscriber).createSubscription(
          serviceProvider.address,
          SUBSCRIPTION_AMOUNT,
          SUBSCRIPTION_FREQUENCY
        )
      )
        .to.emit(subscriptionManager, "SubscriptionCreated")
        .withArgs(0, subscriber.address, serviceProvider.address);

      // Check subscription details
      const subscription = await subscriptionManager.getSubscription(0);
      expect(subscription.subscriber).to.equal(subscriber.address);
      expect(subscription.serviceProvider).to.equal(serviceProvider.address);
      expect(subscription.amount).to.equal(SUBSCRIPTION_AMOUNT);
      expect(subscription.frequency).to.equal(SUBSCRIPTION_FREQUENCY);
      expect(subscription.status).to.equal(0); // Active status
    });

    it("Should fail if payment token transfer fails", async function () {
      // Don't approve tokens
      await expect(
        subscriptionManager.connect(subscriber).createSubscription(
          serviceProvider.address,
          SUBSCRIPTION_AMOUNT,
          SUBSCRIPTION_FREQUENCY
        )
      ).to.be.reverted;
    });
  });

  describe("Subscription Management", function () {
    beforeEach(async function () {
      // Approve tokens for the subscription manager
      await testToken.connect(subscriber).approve(await subscriptionManager.getAddress(), SUBSCRIPTION_AMOUNT.mul(10));

      // Create subscription
      await subscriptionManager.connect(subscriber).createSubscription(
        serviceProvider.address,
        SUBSCRIPTION_AMOUNT,
        SUBSCRIPTION_FREQUENCY
      );
    });

    it("Should allow subscriber to cancel subscription", async function () {
      await expect(subscriptionManager.connect(subscriber).cancelSubscription(0))
        .to.emit(subscriptionManager, "SubscriptionCancelled")
        .withArgs(0);

      const subscription = await subscriptionManager.getSubscription(0);
      expect(subscription.status).to.equal(1); // Cancelled status
    });

    it("Should not allow non-subscriber to cancel subscription", async function () {
      await expect(
        subscriptionManager.connect(serviceProvider).cancelSubscription(0)
      ).to.be.revertedWith("Not the subscriber");
    });

    it("Should process payment when due", async function () {
      // Mine blocks to reach next payment block
      for (let i = 0; i < SUBSCRIPTION_FREQUENCY; i++) {
        await ethers.provider.send("evm_mine");
      }

      // Approve tokens for the next payment
      await testToken.connect(subscriber).approve(await subscriptionManager.getAddress(), SUBSCRIPTION_AMOUNT);

      await expect(subscriptionManager.processPayment(0))
        .to.emit(subscriptionManager, "PaymentProcessed")
        .withArgs(0, SUBSCRIPTION_AMOUNT);

      // Check that next payment block was updated
      const subscription = await subscriptionManager.getSubscription(0);
      expect(subscription.nextPaymentBlock).to.be.gt(SUBSCRIPTION_FREQUENCY);
    });

    it("Should mark subscription as expired if payment fails", async function () {
      // Mine blocks to reach next payment block
      for (let i = 0; i < SUBSCRIPTION_FREQUENCY; i++) {
        await ethers.provider.send("evm_mine");
      }

      // Don't approve tokens for the next payment
      await testToken.connect(subscriber).approve(await subscriptionManager.getAddress(), 0);

      await expect(subscriptionManager.processPayment(0))
        .to.emit(subscriptionManager, "SubscriptionExpired")
        .withArgs(0);

      // Check that subscription is marked as expired
      const subscription = await subscriptionManager.getSubscription(0);
      expect(subscription.status).to.equal(2); // Expired status
    });
  });

  describe("Subscription Queries", function () {
    beforeEach(async function () {
      // Approve tokens for the subscription manager
      await testToken.connect(subscriber).approve(await subscriptionManager.getAddress(), SUBSCRIPTION_AMOUNT.mul(10));

      // Create multiple subscriptions
      for (let i = 0; i < 3; i++) {
        await subscriptionManager.connect(subscriber).createSubscription(
          serviceProvider.address,
          SUBSCRIPTION_AMOUNT,
          SUBSCRIPTION_FREQUENCY
        );
      }
    });

    it("Should return all subscription IDs for a subscriber", async function () {
      const subscriptionIds = await subscriptionManager.getSubscriptionIds(subscriber.address);
      expect(subscriptionIds.length).to.equal(3);
      expect(subscriptionIds[0]).to.equal(0);
      expect(subscriptionIds[1]).to.equal(1);
      expect(subscriptionIds[2]).to.equal(2);
    });
  });
});
