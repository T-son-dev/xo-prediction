'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { usePredictions } from '@/hooks/usePredictions';
import { useUSDT } from '@/hooks/useUSDT';
import { PredictionCard } from '@/components/PredictionCard';
import { PredictionStatus, formatUSDT } from '@/types';
import Link from 'next/link';

type TabType = 'all' | 'open' | 'matched' | 'resolved' | 'cancelled';

export default function DashboardPage() {
  const { wallet } = useWallet();
  const { userPredictions, isLoading, fetchUserPredictions } = usePredictions();
  const { faucet, isApproving } = useUSDT();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Dashboard</h2>
        <p className="text-gray-500 mb-4">Connect your wallet to view your predictions</p>
      </div>
    );
  }

  const filteredPredictions = userPredictions.filter((p) => {
    switch (activeTab) {
      case 'open':
        return p.status === PredictionStatus.Open;
      case 'matched':
        return p.status === PredictionStatus.Matched;
      case 'resolved':
        return p.status === PredictionStatus.Resolved || p.status === PredictionStatus.Claimed;
      case 'cancelled':
        return p.status === PredictionStatus.Cancelled;
      default:
        return true;
    }
  });

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: userPredictions.length },
    { id: 'open', label: 'Open', count: userPredictions.filter((p) => p.status === PredictionStatus.Open).length },
    {
      id: 'matched',
      label: 'Matched',
      count: userPredictions.filter((p) => p.status === PredictionStatus.Matched).length,
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: userPredictions.filter(
        (p) => p.status === PredictionStatus.Resolved || p.status === PredictionStatus.Claimed
      ).length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: userPredictions.filter((p) => p.status === PredictionStatus.Cancelled).length,
    },
  ];

  const handleFaucet = async () => {
    setFaucetLoading(true);
    setFaucetMessage(null);
    try {
      await faucet();
      setFaucetMessage('1000 USDT has been added to your wallet!');
    } catch (err) {
      setFaucetMessage('Failed to get test USDT. Please try again.');
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your predictions and track your performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/create"
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Create Prediction
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">TRX Balance</div>
          <div className="text-2xl font-bold text-gray-900">{wallet.balance} TRX</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">USDT Balance</div>
          <div className="text-2xl font-bold text-green-600">{formatUSDT(wallet.usdtBalance)} USDT</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total Predictions</div>
          <div className="text-2xl font-bold text-blue-600">{userPredictions.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Active Predictions</div>
          <div className="text-2xl font-bold text-purple-600">
            {userPredictions.filter((p) => p.status === PredictionStatus.Open || p.status === PredictionStatus.Matched).length}
          </div>
        </div>
      </div>

      {/* Testnet Faucet */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-yellow-800">Testnet USDT Faucet</h3>
            <p className="text-sm text-yellow-700">Get free test USDT to try the platform</p>
          </div>
          <div className="flex items-center gap-4">
            {faucetMessage && (
              <span className={`text-sm ${faucetMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {faucetMessage}
              </span>
            )}
            <button
              onClick={handleFaucet}
              disabled={faucetLoading}
              className="px-4 py-2 text-yellow-800 bg-yellow-200 rounded-lg hover:bg-yellow-300 transition-colors font-medium disabled:opacity-50"
            >
              {faucetLoading ? 'Getting USDT...' : 'Get 1000 Test USDT'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Predictions List */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => fetchUserPredictions()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {isLoading && userPredictions.length === 0 ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your predictions...</p>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-gray-500 mb-4">
            {activeTab === 'all'
              ? "You haven't created or joined any predictions yet"
              : `No ${activeTab} predictions`}
          </p>
          {activeTab === 'all' && (
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Prediction
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              currentUserAddress={wallet.address || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
