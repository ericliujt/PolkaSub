// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SubscriptionManager
 * @dev A simple contract to manage subscription payments on Westend EVM
 */
contract SubscriptionManager {
    // Subscription status enum
    enum Status { Active, Cancelled, Expired }
    
    // Subscription struct
    struct Subscription {
        address subscriber;
        address recipient;
        uint256 amount;
        uint256 frequency; // in blocks
        uint256 nextPaymentBlock;
        Status status;
        uint256 id;
    }
    
    // Mapping from subscription ID to Subscription
    mapping(uint256 => Subscription) public subscriptions;
    
    // Mapping from address to array of subscription IDs
    mapping(address => uint256[]) public subscriberToSubscriptionIds;
    
    // Counter for subscription IDs
    uint256 private _subscriptionIdCounter;
    
    // Events
    event SubscriptionCreated(uint256 indexed id, address indexed subscriber, address indexed recipient, uint256 amount, uint256 frequency);
    event SubscriptionCancelled(uint256 indexed id);
    event SubscriptionExpired(uint256 indexed id);
    event PaymentProcessed(uint256 indexed id, uint256 amount);
    
    /**
     * @dev Creates a new subscription
     * @param _recipient Address of the recipient
     * @param _amount Amount to be paid per period in WND
     * @param _frequency Frequency of payments in blocks
     * @return id The ID of the created subscription
     */
    function createSubscription(
        address _recipient,
        uint256 _amount,
        uint256 _frequency
    ) external payable returns (uint256) {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_frequency > 0, "Frequency must be greater than 0");
        require(msg.value >= _amount, "Insufficient funds for first payment");
        
        // Process the first payment
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Payment failed");
        
        // If user sent more than the amount, refund the excess
        if (msg.value > _amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - _amount}("");
            require(refundSuccess, "Refund failed");
        }
        
        // Create subscription
        uint256 id = _subscriptionIdCounter++;
        Subscription storage subscription = subscriptions[id];
        subscription.subscriber = msg.sender;
        subscription.recipient = _recipient;
        subscription.amount = _amount;
        subscription.frequency = _frequency;
        subscription.nextPaymentBlock = block.number + _frequency;
        subscription.status = Status.Active;
        subscription.id = id;
        
        // Add subscription ID to subscriber's list
        subscriberToSubscriptionIds[msg.sender].push(id);
        
        emit SubscriptionCreated(id, msg.sender, _recipient, _amount, _frequency);
        
        return id;
    }
    
    /**
     * @dev Cancels a subscription
     * @param _id ID of the subscription to cancel
     */
    function cancelSubscription(uint256 _id) external {
        Subscription storage subscription = subscriptions[_id];
        require(subscription.subscriber == msg.sender, "Not the subscriber");
        require(subscription.status == Status.Active, "Subscription not active");
        
        subscription.status = Status.Cancelled;
        
        emit SubscriptionCancelled(_id);
    }
    
    /**
     * @dev Processes a payment for a subscription
     * @param _id ID of the subscription
     */
    function processPayment(uint256 _id) external payable {
        Subscription storage subscription = subscriptions[_id];
        require(subscription.status == Status.Active, "Subscription not active");
        require(block.number >= subscription.nextPaymentBlock, "Payment not due yet");
        require(msg.value >= subscription.amount, "Insufficient funds for payment");
        
        // Process payment
        (bool success, ) = subscription.recipient.call{value: subscription.amount}("");
        
        // Refund excess payment if any
        if (msg.value > subscription.amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - subscription.amount}("");
            require(refundSuccess, "Refund failed");
        }
        
        if (success) {
            // Update next payment block
            subscription.nextPaymentBlock = block.number + subscription.frequency;
            emit PaymentProcessed(_id, subscription.amount);
        } else {
            // Mark as expired if payment fails
            subscription.status = Status.Expired;
            emit SubscriptionExpired(_id);
            
            // Refund the payment
            (bool refundSuccess, ) = msg.sender.call{value: subscription.amount}("");
            require(refundSuccess, "Refund failed");
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
     * @param _id ID of the subscription
     * @return Subscription details
     */
    function getSubscription(uint256 _id) external view returns (
        address subscriber,
        address recipient,
        uint256 amount,
        uint256 frequency,
        uint256 nextPaymentBlock,
        Status status
    ) {
        Subscription storage subscription = subscriptions[_id];
        return (
            subscription.subscriber,
            subscription.recipient,
            subscription.amount,
            subscription.frequency,
            subscription.nextPaymentBlock,
            subscription.status
        );
    }
    
    /**
     * @dev Checks if a payment is due for a subscription
     * @param _id ID of the subscription
     * @return bool True if payment is due
     */
    function isPaymentDue(uint256 _id) external view returns (bool) {
        Subscription storage subscription = subscriptions[_id];
        return (
            subscription.status == Status.Active &&
            block.number >= subscription.nextPaymentBlock
        );
    }
}
