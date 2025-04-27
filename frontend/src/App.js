import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConnectWallet from './components/ConnectWallet';
import SubscriptionForm from './components/SubscriptionForm';
import SubscriptionList from './components/SubscriptionList';
import { 
  createSubscription, 
  cancelSubscription, 
  getSubscriptions,
  getNetworkName
} from './utils/metamask';

function App() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState('');

  // Set up event listeners for MetaMask
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWalletData(null);
          setError('Wallet disconnected. Please connect your wallet.');
        } else if (walletData && accounts[0] !== walletData.account) {
          // User switched accounts, reload with new account
          window.location.reload();
        }
      };

      // Handle chain changes
      const handleChainChanged = () => {
        // Reload the page when the chain changes
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup function
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletData]);

  // Load subscriptions when wallet connects
  useEffect(() => {
    if (walletData && walletData.contract) {
      loadSubscriptions();
    }
  }, [walletData]);

  // Handle wallet connection
  const handleConnect = async (connectedWalletData) => {
    try {
      setWalletData(connectedWalletData);
      
      // Check if connected to Westend EVM
      const chainId = connectedWalletData.network.chainId;
      const networkName = 'Westend EVM'//getNetworkName(chainId);
      
      if (!networkName.includes('Westend')) {
        setError(`Connected to ${networkName} instead of Westend EVM. Please switch networks in MetaMask.`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    }
  };

  // Load user's subscriptions
  const loadSubscriptions = async () => {
    if (!walletData || !walletData.contract) return;
    
    try {
      setSubscriptionsLoading(true);
      setSubscriptionsError('');
      
      const userSubscriptions = await getSubscriptions(walletData.contract, walletData.account);
      setSubscriptions(userSubscriptions);
      
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptionsError('Failed to load subscriptions. Please try again.');
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  // Create a new subscription
  const handleCreateSubscription = async (serviceProvider, amount, frequency) => {
    if (!walletData || !walletData.contract) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      
      const subscription = await createSubscription(
        walletData.contract,
        serviceProvider,
        amount,
        frequency
      );
      
      // Add the new subscription to the list
      setSubscriptions([...subscriptions, subscription]);
      
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a subscription
  const handleCancelSubscription = async (subscriptionId) => {
    if (!walletData || !walletData.contract) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      
      await cancelSubscription(walletData.contract, subscriptionId);
      
      // Update the subscription status in the list
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'Cancelled' } 
          : sub
      ));
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header walletData={walletData} />
      
      <div className="container">
        {error && (
          <div className="alert alert-error" style={{ marginTop: '20px' }}>
            {error}
          </div>
        )}
        
        {!walletData ? (
          <ConnectWallet onConnect={handleConnect} />
        ) : (
          <>
            <SubscriptionForm 
              onCreateSubscription={handleCreateSubscription}
              loading={loading}
            />
            
            <SubscriptionList 
              subscriptions={subscriptions}
              loading={subscriptionsLoading}
              error={subscriptionsError}
              onCancelSubscription={handleCancelSubscription}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
