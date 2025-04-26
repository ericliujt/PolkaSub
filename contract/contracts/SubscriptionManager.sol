// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SubscriptionManager
 * @dev Manages subscription agreements, collects payments, and tracks status
 */
contract SubscriptionManager is Ownable {
    // Subscription status enum
    enum Status { Active, Cancelled, Expired }
    
    // Subscription struct
    struct Subscription {
        address subscriber;
        address serviceProvider;
        uint256 amount;
        uint256 frequency; // in blocks
        uint256 nextPaymentBlock;
        Status status;
        uint256 subscriptionId;
    }
    
    // Mapping from subscription ID to Subscription
    mapping(uint256 => Subscription) public subscriptions;
    
    // Mapping from address to array of subscription IDs
    mapping(address => uint256[]) public subscriberToSubscriptionIds;
    
    // Counter for subscription IDs
    uint256 private _subscriptionIdCounter;
    
    // Token used for payments
    IERC20 public paymentToken;
    
    // Events
    event SubscriptionCreated(uint256 indexed subscriptionId, address indexed subscriber, address indexed serviceProvider);
    event SubscriptionCancelled(uint256 indexed subscriptionId);
    event SubscriptionExpired(uint256 indexed subscriptionId);
    event PaymentProcessed(uint256 indexed subscriptionId, uint256 amount);
    
    /**
     * @dev Constructor sets the payment token
     * @param _paymentToken Address of the ERC20 token used for payments
     */
    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Creates a new subscription
     * @param _serviceProvider Address of the service provider
     * @param _amount Amount to be paid per period
     * @param _frequency Frequency of payments in blocks
     * @return subscriptionId The ID of the created subscription
     */
    function createSubscription(
        address _serviceProvider,
        uint256 _amount,
        uint256 _frequency
    ) external returns (uint256) {
        require(_serviceProvider != address(0), "Invalid service provider address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_frequency > 0, "Frequency must be greater than 0");
        
        // Transfer the first payment
        require(
            paymentToken.transferFrom(msg.sender, _serviceProvider, _amount),
            "Payment failed"
        );
        
        // Create subscription
        uint256 subscriptionId = _subscriptionIdCounter++;
        Subscription storage subscription = subscriptions[subscriptionId];
        subscription.subscriber = msg.sender;
        subscription.serviceProvider = _serviceProvider;
        subscription.amount = _amount;
        subscription.frequency = _frequency;
        subscription.nextPaymentBlock = block.number + _frequency;
        subscription.status = Status.Active;
        subscription.subscriptionId = subscriptionId;
        
        // Add subscription ID to subscriber's list
        subscriberToSubscriptionIds[msg.sender].push(subscriptionId);
        
        emit SubscriptionCreated(subscriptionId, msg.sender, _serviceProvider);
        
        return subscriptionId;
    }
    
    /**
     * @dev Cancels a subscription
     * @param _subscriptionId ID of the subscription to cancel
     */
    function cancelSubscription(uint256 _subscriptionId) external {
        Subscription storage subscription = subscriptions[_subscriptionId];
        require(subscription.subscriber == msg.sender, "Not the subscriber");
        require(subscription.status == Status.Active, "Subscription not active");
        
        subscription.status = Status.Cancelled;
        
        emit SubscriptionCancelled(_subscriptionId);
    }
    
    /**
     * @dev Processes a payment for a subscription
     * @param _subscriptionId ID of the subscription
     */
    function processPayment(uint256 _subscriptionId) external {
        Subscription storage subscription = subscriptions[_subscriptionId];
        require(subscription.status == Status.Active, "Subscription not active");
        require(block.number >= subscription.nextPaymentBlock, "Payment not due yet");
        
        // Transfer payment
        bool success = paymentToken.transferFrom(
            subscription.subscriber,
            subscription.serviceProvider,
            subscription.amount
        );
        
        if (success) {
            // Update next payment block
            subscription.nextPaymentBlock = block.number + subscription.frequency;
            emit PaymentProcessed(_subscriptionId, subscription.amount);
        } else {
            // Mark as expired if payment fails
            subscription.status = Status.Expired;
            emit SubscriptionExpired(_subscriptionId);
        }
    }
    
    /**
     * @dev Gets all subscription IDs for a subscriber
     * @param _subscriber Address of the subscriber
     * @return Array of subscription IDs
     */
    function getSubscriptionIds(address _subscriber) external view returns (uint256[] memory) {
        return subscriberToSubscriptionIds[_subscriber];
    }
    
    /**
     * @dev Gets subscription details
     * @param _subscriptionId ID of the subscription
     * @return Subscription details
     */
    function getSubscription(uint256 _subscriptionId) external view returns (Subscription memory) {
        return subscriptions[_subscriptionId];
    }
    
    /**
     * @dev Sets the payment token
     * @param _paymentToken Address of the new payment token
     */
    function setPaymentToken(address _paymentToken) external onlyOwner {
        require(_paymentToken != address(0), "Invalid token address");
        paymentToken = IERC20(_paymentToken);
    }
}
