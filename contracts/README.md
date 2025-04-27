# PolkaSub Contract Deployment

This directory contains the smart contract for the PolkaSub subscription management system and scripts to deploy it to the Westend EVM network.

## Prerequisites

1. Node.js and npm installed
2. MetaMask wallet with Westend EVM configured
3. WND tokens in your wallet for deployment gas fees

## Setup

1. Install dependencies:
   ```shell
   npm install
   ```

2. Create a `.env` file from the example:
   ```shell
   cp .env.example .env
   ```

3. Add your private key to the `.env` file (without the 0x prefix)

## Deployment

To deploy the SubscriptionManager contract to the Westend EVM network:

```shell
npx hardhat run scripts/deploy.js --network westend
```

This will deploy the contract and output the contract address. Save this address as you'll need it for testing and frontend integration.

## Testing

1. After deployment, update the `SUBSCRIPTION_MANAGER_ADDRESS` in `scripts/test-subscription.js` with your deployed contract address.

2. Run the test script:
   ```shell
   npx hardhat run scripts/test-subscription.js --network westend
   ```

## Frontend Integration

After successful deployment, update the contract address in your frontend's `metamask.js` file to interact with the deployed contract.

## Available Commands

```shell
npx hardhat help                   # Show all available commands
npx hardhat compile                # Compile the contract
npx hardhat test                   # Run tests
npx hardhat node                   # Run a local development node
```
