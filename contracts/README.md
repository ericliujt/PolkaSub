# PolkaSub Simple Payment Contract

This directory contains a simple Solidity contract for the PolkaSub project that can send 0.1 WND to a recipient address on the Westend EVM network.

## Contract Overview

The `SimplePayment` contract provides the following functionality:

- Send 0.1 WND to any recipient address
- Automatically refund excess payments
- Allow the contract owner to withdraw any funds from the contract
- Emit events for payment tracking

## Prerequisites

1. Node.js and npm installed
2. MetaMask wallet with Westend EVM configured
3. WND tokens in your wallet for deployment gas fees and payments

## Setup

1. Install dependencies:
   ```shell
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
   ```

2. Create a `.env` file from the example:
   ```shell
   cp .env.example .env
   ```

3. Add your private key to the `.env` file (without the 0x prefix)

## Deployment

To deploy the SimplePayment contract to the Westend EVM network:

```shell
npx hardhat run scripts/deploy.js --network westend
```

This will deploy the contract and output the contract address. Save this address as you'll need it for testing and frontend integration.

## Testing

1. After deployment, update the `SIMPLE_PAYMENT_ADDRESS` in `scripts/send-payment.js` with your deployed contract address.

2. Run the test script to send a payment:
   ```shell
   npx hardhat run scripts/send-payment.js --network westend
   ```

## Frontend Integration

After successful deployment, update the contract address in your frontend to interact with the deployed contract. The frontend should:

1. Connect to the user's MetaMask wallet
2. Allow the user to specify a recipient address
3. Call the `sendPayment` function with 0.1 WND

## Available Commands

```shell
npx hardhat help                   # Show all available commands
npx hardhat compile                # Compile the contract
npx hardhat test                   # Run tests locally
npx hardhat node                   # Run a local development node
```
