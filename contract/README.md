# PolkaSub - Subscription Manager Smart Contracts

This directory contains the Solidity smart contracts for the PolkaSub Subscription Manager, designed to be deployed on the Polkadot Westend Asset Hub.

## Contracts

- `SubscriptionManager.sol`: Manages subscription agreements, collects payments, and tracks status
- `TestToken.sol`: A simple ERC20 token for testing the subscription functionality

## Setup

1. Install dependencies:
   ```shell
   npm install
   ```

2. Create a `.env` file based on `.env.example` and add your private key:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

## Deployment

### Local Development

1. Start a local Hardhat node:
   ```shell
   npx hardhat node
   ```

2. Deploy contracts to the local network:
   ```shell
   npx hardhat run scripts/deploy.js --network localhost
   ```

### Westend Asset Hub Deployment

Deploy contracts to the Westend Asset Hub:
```shell
npx hardhat run scripts/deploy.js --network westend
```

## Testing

Run tests:
```shell
npx hardhat test
```

## Common Commands

```shell
npx hardhat help
npx hardhat compile
npx hardhat clean
```
