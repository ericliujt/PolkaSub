import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Westend network configuration
const WESTEND_ENDPOINT = 'wss://westend-rpc.polkadot.io';
const WESTEND_ASSET_HUB_ENDPOINT = 'wss://westend-asset-hub-rpc.polkadot.io';

// Initialize the API
export const initApi = async (endpoint = WESTEND_ENDPOINT) => {
  try {
    const provider = new WsProvider(endpoint);
    const api = await ApiPromise.create({ provider });
    
    // Wait for API to be ready
    await api.isReady;
    
    // Get chain information
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);
    
    console.log(`Connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    
    return { api, chain: chain.toString() };
  } catch (error) {
    console.error('Error initializing API:', error);
    throw error;
  }
};

// Connect to Polkadot.js Extension
export const connectExtension = async () => {
  try {
    // Enable the extension
    const extensions = await web3Enable('PolkaSub - Subscription Manager');
    
    if (extensions.length === 0) {
      throw new Error('No extension found. Please install Polkadot.js Extension.');
    }
    
    // Get all accounts from the extension
    const allAccounts = await web3Accounts();
    
    if (allAccounts.length === 0) {
      throw new Error('No accounts found. Please create an account in the Polkadot.js Extension.');
    }
    
    return allAccounts;
  } catch (error) {
    console.error('Error connecting to extension:', error);
    throw error;
  }
};

// Get an injector for a specific address
export const getInjector = async (address) => {
  try {
    const injector = await web3FromAddress(address);
    return injector;
  } catch (error) {
    console.error('Error getting injector:', error);
    throw error;
  }
};

// Format an address for display
export const formatAddress = (address) => {
  if (!address) return '';
  
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  
  return `${start}...${end}`;
};

// Check if connected to Westend network
export const isWestendNetwork = (chain) => {
  return chain && (chain.toLowerCase().includes('westend') || chain === 'Westend');
};

// Get network name from chain
export const getNetworkName = (chain) => {
  if (!chain) return 'Unknown Network';
  
  if (isWestendNetwork(chain)) {
    return 'Westend';
  }
  
  return chain.toString();
};

// Create a subscription
export const createSubscription = async (api, account, recipient, amount, frequency) => {
  try {
    // This is a placeholder for the actual subscription creation logic
    // In a real implementation, this would interact with your smart contract
    
    // Example of a transfer transaction (not an actual subscription)
    const injector = await getInjector(account.address);
    
    // Create a transfer extrinsic
    const transfer = api.tx.balances.transfer(recipient, amount);
    
    // Sign and send the transaction
    const txHash = await transfer.signAndSend(
      account.address,
      { signer: injector.signer }
    );
    
    return {
      id: Date.now().toString(), // Placeholder ID
      recipient,
      amount,
      frequency,
      status: 'Active',
      txHash: txHash.toString()
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (api, account, subscriptionId) => {
  try {
    // This is a placeholder for the actual subscription cancellation logic
    // In a real implementation, this would interact with your smart contract
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Get all subscriptions for an account
export const getSubscriptions = async (account) => {
  try {
    // This is a placeholder for the actual subscription retrieval logic
    // In a real implementation, this would interact with your smart contract
    
    // Return dummy data for demonstration
    return [
      {
        id: '1',
        recipient: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '1000000000000',
        frequency: '100',
        nextPayment: Date.now() + 86400000, // 1 day from now
        status: 'Active',
        txHash: '0x...'
      }
    ];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};
