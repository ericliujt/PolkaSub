import React, { useState } from 'react';
import { ethers } from 'ethers';

const SubscriptionForm = ({ onCreateSubscription, loading }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!recipient || !amount || !frequency) {
      setError('All fields are required');
      return;
    }
    
    if (!ethers.isAddress(recipient)) {
      setError('Invalid Ethereum address format');
      return;
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    
    if (isNaN(frequency) || parseInt(frequency) <= 0) {
      setError('Frequency must be a positive number of blocks');
      return;
    }
    
    try {
      setError('');
      
      // Convert amount to wei (10^18 units)
      const amountInWei = ethers.parseEther(amount);
      
      // Call the onCreateSubscription callback
      await onCreateSubscription(recipient, amountInWei, parseInt(frequency));
      
      // Show success message
      setSuccess('Subscription created successfully!');
      
      // Reset form
      setRecipient('');
      setAmount('');
      setFrequency('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error.message || 'Failed to create subscription');
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Create New Subscription</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            type="text"
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
          <div className="hint">The Ethereum address that will receive the payments</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (WND)</label>
          <input
            type="number"
            id="amount"
            placeholder="0.1"
            step="0.000000000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <div className="hint">Amount in Westend tokens (WND) per payment</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="frequency">Payment Frequency (blocks)</label>
          <input
            type="number"
            id="frequency"
            placeholder="100"
            min="1"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            disabled={loading}
          />
          <div className="hint">
            Number of blocks between payments (approx. 12 seconds per block)
            {frequency && parseInt(frequency) > 0 && (
              <span> ≈ {Math.round(parseInt(frequency) * 12 / 60)} minutes</span>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Subscription'}
        </button>
      </form>
    </div>
  );
};

export default SubscriptionForm;
