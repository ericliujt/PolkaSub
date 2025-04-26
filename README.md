# PolkaSub - Subscription Manager for Polkadot

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

See the README files in each directory for specific setup instructions.

## To-dos
Make sure your RPC URL points to a working Westend EVM node.
Fund your deployer's account with some test WND.
