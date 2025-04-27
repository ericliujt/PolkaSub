// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract SubscriptionManager {
    struct Sub {
        address subscriber;
        address recipient;
        uint256 amount;
        uint256 balance;
        uint256 nextBlock;
        uint256 frequency;
        bool active;
    }
    
    mapping(uint256 => Sub) public subs;
    mapping(address => uint256[]) public userSubs;
    uint256 private _counter;
    
    event Created(uint256 indexed id, address indexed recipient);
    event Paid(uint256 indexed id, uint256 amount);
    
    /**
     * @notice Create a new subscription
     * @param to The recipient of the subscription payments
     * @param amount The amount to pay each interval
     * @param freq The frequency (in blocks) for each payment
     * @return id The new subscription ID
     */
    function create(address to, uint256 amount, uint256 freq) external payable returns (uint256 id) {
        require(to != address(0), "Recipient cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(freq > 0, "Frequency must be greater than zero");
        require(msg.value >= amount, "Insufficient ETH sent for first payment");

        id = _counter;
        _counter++;

        // Effects: update state before external call
        subs[id] = Sub({
            subscriber: msg.sender,
            recipient: to,
            amount: amount,
            balance: msg.value - amount,
            nextBlock: block.number + freq,
            frequency: freq,
            active: true
        });
        userSubs[msg.sender].push(id);

        emit Created(id, to);

        // Interactions: external call after state update
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "First payment transfer failed");
        emit Paid(id, amount);
    }
    
    function process(uint256 id) external {
        Sub storage s = subs[id];
        require(s.active && block.number >= s.nextBlock && s.balance >= s.amount, "Error");
        
        (bool sent,) = s.recipient.call{value: s.amount}("");
        require(sent, "Failed");
        
        s.balance -= s.amount;
        s.nextBlock += s.frequency;
        if (s.balance < s.amount) s.active = false;
        
        emit Paid(id, s.amount);
    }
    
    function getUserSubs(address user) external view returns (uint256[] memory) {
        return userSubs[user];
    }
}
