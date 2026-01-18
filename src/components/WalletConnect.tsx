'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress, formatUSDT } from '@/types';

export function WalletConnect() {
  const { wallet, connect, connectMock, disconnect, isLoading, error, isMockMode } = useWallet();
  const [showOptions, setShowOptions] = useState(false);

  if (wallet.isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <div className="font-medium text-gray-900">
            {formatAddress(wallet.address || '')}
            {isMockMode && <span className="ml-1 text-orange-500">(Mock)</span>}
          </div>
          <div className="text-gray-500">
            {wallet.balance} TRX | {formatUSDT(wallet.usdtBalance)} USDT
          </div>
        </div>
        {wallet.isAdmin && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            Admin
          </span>
        )}
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {error && <span className="text-sm text-red-600 max-w-[200px] truncate">{error}</span>}

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isLoading}
            className="px-6 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                Connect Wallet
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {showOptions && !isLoading && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => {
                  setShowOptions(false);
                  connect();
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">TronLink</div>
                  <div className="text-xs text-gray-500">Connect real wallet</div>
                </div>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={() => {
                  setShowOptions(false);
                  connectMock();
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Mock Wallet</div>
                  <div className="text-xs text-gray-500">For testing (no TronLink)</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close dropdown */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
