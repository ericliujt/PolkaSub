// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract SubscriptionManager {
    struct Subscription {
        address recipient;
        uint256 amount;
        uint256 nextBlock;
        bool active;
    }
    
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256[]) public userSubscriptions;
    uint256 private counter;
    
    event SubscriptionCreated(uint256 indexed id, address indexed recipient);
    event PaymentSent(uint256 indexed id, uint256 amount);
    
    // Create a new subscription
    function createSubscription(address recipient, uint256 amount) external payable returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(msg.value >= amount, "Insufficient funds");
        
        // Send first payment
        payable(recipient).transfer(amount);
        
        // Create subscription
        uint256 id = counter++;
        subscriptions[id] = Subscription({
            recipient: recipient,
            amount: amount,
            nextBlock: block.number + 100,
            active: true
        });
        
        userSubscriptions[msg.sender].push(id);
        
        emit SubscriptionCreated(id, recipient);
        emit PaymentSent(id, amount);
        
        return id;
    }
    
    // Process a payment for a subscription
    function processPayment(uint256 id) external {
        Subscription storage sub = subscriptions[id];
        require(sub.active, "Subscription not active");
        require(address(this).balance >= sub.amount, "Insufficient contract balance");
        
        payable(sub.recipient).transfer(sub.amount);
        sub.nextBlock = block.number + 100;
        
        emit PaymentSent(id, sub.amount);
    }
    
    // Get all subscriptions for a user
    function getSubscriptions(address user) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }
    
    // Function to receive ETH
    receive() external payable {}
}
