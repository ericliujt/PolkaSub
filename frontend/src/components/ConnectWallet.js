import React, { useState } from 'react';
import { connectWallet } from '../utils/metamask';

const ConnectWallet = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Connect to MetaMask
      const walletData = await connectWallet();
      
      // Call the onConnect callback with the wallet data
      onConnect(walletData);
      
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect to MetaMask');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Connect Your Wallet</h2>
      
      <p style={{ marginBottom: '20px' }}>
        Connect your MetaMask wallet to manage your subscriptions on the Westend EVM network.
      </p>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <button 
        className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? 'Connecting...' : 'Connect MetaMask'}
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <p><strong>Make sure you have:</strong></p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>MetaMask extension installed</li>
          <li>Westend EVM network added to MetaMask</li>
          <li>Some WND tokens for gas fees</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectWallet;
