import { ethers } from 'ethers';

// Westend EVM Chain ID
const WESTEND_CHAIN_ID = 420420421; // Westend EVM chain ID

// Westend RPC URL - replace with actual Westend EVM RPC URL
const WESTEND_RPC_URL = 'https://westend-asset-hub-eth-rpc.polkadot.io';

// Subscription Manager ABI - this will need to be replaced with your actual contract ABI
const SUBSCRIPTION_MANAGER_ABI = [
  // Example ABI - replace with your actual contract ABI
  "function createSubscription(address _serviceProvider, uint256 _amount, uint256 _frequency) external returns (uint256)",
  "function cancelSubscription(uint256 _subscriptionId) external",
  "function getSubscriptionIds(address _subscriber) external view returns (uint256[])",
  "function getSubscription(uint256 _subscriptionId) external view returns (tuple(address subscriber, address serviceProvider, uint256 amount, uint256 frequency, uint256 nextPaymentBlock, uint8 status, uint256 subscriptionId))"
];

// Contract address - replace with your deployed contract address
const SUBSCRIPTION_MANAGER_ADDRESS = '0x455aaFbD12cAeF26858ecd72c87f944Ce1f04d64';

// Connect to MetaMask
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to use this application.');
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found in MetaMask.');
    }

    // Get the connected chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Check if connected to Westend
    if (parseInt(chainId, 16) !== WESTEND_CHAIN_ID) {
      // Try to switch to Westend
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${WESTEND_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${WESTEND_CHAIN_ID.toString(16)}`,
                chainName: 'Westend EVM',
                nativeCurrency: {
                  name: 'Westend Token',
                  symbol: 'WND',
                  decimals: 18,
                },
                rpcUrls: [WESTEND_RPC_URL],
                blockExplorerUrls: ['https://assethub-westend.subscan.io/'],
              },
            ],
          });
        } else {
          throw new Error('Failed to switch to the Westend network. Please switch manually in MetaMask.');
        }
      }
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Get network information
    const network = await provider.getNetwork();
    
    // Create contract instance
    const contract = new ethers.Contract(
      SUBSCRIPTION_MANAGER_ADDRESS,
      SUBSCRIPTION_MANAGER_ABI,
      signer
    );

    return {
      account: accounts[0],
      provider,
      signer,
      network,
      contract
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return '';
  
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  
  return `${start}...${end}`;
};

// Get network name
export const getNetworkName = (chainId) => {
  if (!chainId) return 'Unknown Network';
  
  const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  
  switch (id) {
    case WESTEND_CHAIN_ID:
      return 'Westend EVM';
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    default:
      return `Chain ID: ${id}`;
  }
};

// Create a subscription
export const createSubscription = async (contract, serviceProvider, amount, frequency) => {
  try {
    const tx = await contract.createSubscription(serviceProvider, amount, frequency);
    const receipt = await tx.wait();
    
    // In a real implementation, you would extract the subscription ID from the event logs
    // For now, we'll use a timestamp as a placeholder
    const subscriptionId = Date.now().toString();
    
    return {
      id: subscriptionId,
      serviceProvider,
      amount,
      frequency,
      nextPaymentBlock: 0, // This would come from the contract
      status: 'Active',
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (contract, subscriptionId) => {
  try {
    const tx = await contract.cancelSubscription(subscriptionId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Get all subscriptions for an account
export const getSubscriptions = async (contract, account) => {
  try {
    // Get subscription IDs
    const subscriptionIds = await contract.getSubscriptionIds(account);
    
    // Get details for each subscription
    const subscriptions = await Promise.all(
      subscriptionIds.map(async (id) => {
        const subscription = await contract.getSubscription(id);
        
        return {
          id: id.toString(),
          serviceProvider: subscription[1], // serviceProvider
          amount: subscription[2].toString(), // amount
          frequency: subscription[3].toString(), // frequency
          nextPaymentBlock: subscription[4].toString(), // nextPaymentBlock
          status: ['Active', 'Cancelled', 'Expired'][subscription[5]], // status
          txHash: '' // This would come from event logs in a real implementation
        };
      })
    );
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    
    // Return dummy data for demonstration (remove in production)
    return [
      {
        id: '1',
        serviceProvider: '0x1234567890123456789012345678901234567890',
        amount: ethers.parseEther('0.1').toString(),
        frequency: '100',
        nextPaymentBlock: '1000000',
        status: 'Active',
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
      }
    ];
  }
};
