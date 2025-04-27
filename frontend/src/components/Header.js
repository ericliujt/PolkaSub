import React from 'react';
import { formatAddress, getNetworkName } from '../utils/metamask';

const Header = ({ walletData }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span>PolkaSub</span>
          </div>
          
          {walletData && walletData.account && (
            <div className="wallet-info">
              {walletData.network && (
                <span className="network-badge">
                  {getNetworkName(walletData.network.chainId)}
                </span>
              )}
              <span className="wallet-address">{formatAddress(walletData.account)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
