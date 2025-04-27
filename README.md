# PolkaSub - A Subscription Manager on Polkadot Westend

A subscription management system built on the Polkadot Westend testnet, specifically targeting the Asset Hub.

## Features

### Frontend
- UI for users to subscribe to services (pay every N blocks)
- View active subscriptions
- Cancel subscriptions

### Smart Contract (Solidity)
- Manages subscription agreements
- Collects and transfers payments
- Tracks subscription status (Active, Cancelled, Expired)

## Project Structure

- `/contract` - Hardhat project with Solidity smart contracts for subscription management
- `/frontend` - React-based frontend application

## Setup and Installation

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npx next dev
   ```

4. Access the application at http://localhost:3000

### Smart Contract Setup

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your private key to the `.env` file

5. Deploy the contract to Westend EVM:
   ```bash
   npx hardhat run scripts/deploy.js --network westend
   ```

## To-dos
- Make sure your RPC URL points to a working Westend EVM node
- Fund your deployer's account with some test WND
- Update the frontend to use your deployed contract address
