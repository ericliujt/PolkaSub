import React, { useState } from 'react';
import { formatAddress } from '../utils/metamask';
import { ethers } from 'ethers';

const SubscriptionCard = ({ subscription, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError('');
      
      await onCancel(subscription.id);
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  // Format amount from wei to WND
  const formatAmount = (amount) => {
    try {
      const amountInWND = ethers.formatEther(amount);
      return `${parseFloat(amountInWND).toFixed(4)} WND`;
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} WND`;
    }
  };

  // Format block number to estimated date
  const formatNextPaymentBlock = (blockNumber) => {
    // Assuming 12 seconds per block on Westend EVM
    if (!blockNumber || blockNumber === '0') {
      return 'Not scheduled';
    }
    
    const currentBlock = 1000000; // This should be fetched from the network
    const blocksRemaining = parseInt(blockNumber) - currentBlock;
    
    if (blocksRemaining <= 0) {
      return 'Due now';
    }
    
    const secondsRemaining = blocksRemaining * 12;
    const estimatedDate = new Date(Date.now() + (secondsRemaining * 1000));
    
    return estimatedDate.toLocaleString();
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'cancelled':
        return 'status-cancelled';
      case 'expired':
        return 'status-expired';
      default:
        return '';
    }
  };

  // Generate block explorer link
  const getBlockExplorerLink = (txHash) => {
    return `https://westend.subscan.io/evm/tx/${txHash}`;
  };

  return (
    <div className="subscription-card">
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <div className="subscription-header">
        <div className="subscription-title">
          Subscription #{subscription.id}
        </div>
        <div className={`subscription-status ${getStatusClass(subscription.status)}`}>
          {subscription.status}
        </div>
      </div>
      
      <div className="subscription-details">
        <div className="subscription-detail">
          <div className="detail-label">Recipient:</div>
          <div>{formatAddress(subscription.serviceProvider)}</div>
        </div>
        
        <div className="subscription-detail">
          <div className="detail-label">Amount:</div>
          <div>{formatAmount(subscription.amount)}</div>
        </div>
        
        <div className="subscription-detail">
          <div className="detail-label">Frequency:</div>
          <div>Every {subscription.frequency} blocks</div>
        </div>
        
        <div className="subscription-detail">
          <div className="detail-label">Next Payment:</div>
          <div>{formatNextPaymentBlock(subscription.nextPaymentBlock)}</div>
        </div>
        
        {subscription.txHash && (
          <div className="subscription-detail">
            <div className="detail-label">Transaction:</div>
            <div>
              <a 
                href={getBlockExplorerLink(subscription.txHash)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
              >
                View on Block Explorer
              </a>
            </div>
          </div>
        )}
      </div>
      
      {subscription.status.toLowerCase() === 'active' && (
        <div className="subscription-actions">
          <button
            className={`btn btn-danger ${loading ? 'btn-disabled' : ''}`}
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
