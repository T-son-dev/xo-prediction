'use client';

import { useWallet } from '@/contexts/WalletContext';
import { usePredictions } from '@/hooks/usePredictions';
import { PredictionCard } from '@/components/PredictionCard';
import Link from 'next/link';

export default function HomePage() {
  const { wallet } = useWallet();
  const { openPredictions, isLoading, error, fetchOpenPredictions } = usePredictions();

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">XO Prediction Market</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Head-to-head predictions with USDT on Tron. Create a prediction, find an opponent, winner takes all.
        </p>

        {!wallet.isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800">Connect your TronLink wallet to start predicting</p>
          </div>
        ) : (
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Prediction
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{openPredictions.length}</div>
          <div className="text-gray-500">Open Predictions</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">2%</div>
          <div className="text-gray-500">Platform Fee</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">USDT</div>
          <div className="text-gray-500">Settlement Currency</div>
        </div>
      </div>

      {/* Open Predictions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Open Predictions</h2>
          <button
            onClick={() => fetchOpenPredictions()}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {isLoading && openPredictions.length === 0 ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading predictions...</p>
          </div>
        ) : openPredictions.length === 0 ? (
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No open predictions yet</p>
            {wallet.isConnected && (
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Be the first to create one
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {openPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                currentUserAddress={wallet.address || undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create</h3>
            <p className="text-sm text-gray-500">Create a prediction with two options and your bet amount</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Match</h3>
            <p className="text-sm text-gray-500">Wait for an opponent to join and take the opposite side</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Resolve</h3>
            <p className="text-sm text-gray-500">Admin resolves the prediction when the outcome is known</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 font-bold text-xl">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Claim</h3>
            <p className="text-sm text-gray-500">Winner claims the pot (minus 2% platform fee)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
