# PolkaSub Frontend

This is the frontend application for the PolkaSub - Subscription Manager on Polkadot Westend EVM.

## Features

- Connect to MetaMask wallet
- Create subscriptions with custom payment schedules
- View active subscriptions
- Cancel subscriptions
- Integration with Westend EVM network

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MetaMask browser extension installed
- An account on the Westend EVM network with some WND tokens

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Connect Wallet**:
   - Click the "Connect MetaMask" button
   - Approve the connection request in MetaMask
   - If prompted, add the Westend EVM network to MetaMask
   - Make sure you're connected to the Westend EVM network

2. **Create Subscription**:
   - Enter the recipient's Ethereum address (0x format)
   - Specify the amount in WND tokens
   - Set the payment frequency in blocks
   - Click "Create Subscription"

3. **View Subscriptions**:
   - All your active subscriptions will be displayed in the "Your Subscriptions" section
   - Each subscription shows details like recipient, amount, frequency, and next payment block

4. **Cancel Subscription**:
   - Click the "Cancel Subscription" button on any active subscription
   - Confirm the transaction in MetaMask

## Westend EVM Network Configuration

If MetaMask doesn't automatically add the Westend EVM network, you can add it manually with these settings:

- **Network Name**: Westend EVM
- **RPC URL**: https://westend-evm.polkadot.io
- **Chain ID**: 1281
- **Currency Symbol**: WND
- **Block Explorer URL**: https://westend.subscan.io/

## Development Notes

This application uses:
- React for the UI
- ethers.js for Ethereum blockchain interactions
- MetaMask for wallet connectivity

The current implementation uses placeholder functions for subscription management. In a production environment, these would interact with your deployed smart contracts on the Westend EVM.

## Troubleshooting

- **Wallet Connection Issues**: Make sure MetaMask is installed and you have created an account
- **Network Issues**: Ensure you're connected to the Westend EVM network in MetaMask
- **Transaction Failures**: Check that you have sufficient WND tokens for gas fees
