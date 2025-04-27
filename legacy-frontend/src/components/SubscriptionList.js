import React from 'react';
import SubscriptionCard from './SubscriptionCard';

const SubscriptionList = ({ subscriptions, loading, error, onCancelSubscription }) => {
  if (loading) {
    return (
      <div className="card">
        <h2 className="section-title">Your Subscriptions</h2>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="section-title">Your Subscriptions</h2>
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Your Subscriptions</h2>
      
      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>You don't have any active subscriptions yet.</p>
          <p>Create a new subscription to get started!</p>
        </div>
      ) : (
        <div className="subscription-grid">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onCancel={onCancelSubscription}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;
