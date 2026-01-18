'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { usePredictions } from '@/hooks/usePredictions';
import { Prediction, PredictionOption, formatUSDT, formatAddress, formatTimestamp } from '@/types';
import { TransactionStatus } from './TransactionStatus';

export function AdminPanel() {
  const { wallet } = useWallet();
  const { resolvePrediction, emergencyRefund, txState, resetTxState } = useContract();
  const { matchedPredictions, fetchMatchedPredictions, isLoading } = usePredictions();

  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [action, setAction] = useState<'resolve' | 'refund' | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<PredictionOption | null>(null);

  if (!wallet.isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You do not have admin access.</p>
      </div>
    );
  }

  const handleResolve = async () => {
    if (!selectedPrediction || !selectedWinner) return;

    try {
      await resolvePrediction(selectedPrediction.id, selectedWinner);
      setTimeout(() => {
        setSelectedPrediction(null);
        setAction(null);
        setSelectedWinner(null);
        resetTxState();
        fetchMatchedPredictions();
      }, 2000);
    } catch (err) {
      console.error('Error resolving prediction:', err);
    }
  };

  const handleRefund = async () => {
    if (!selectedPrediction) return;

    try {
      await emergencyRefund(selectedPrediction.id);
      setTimeout(() => {
        setSelectedPrediction(null);
        setAction(null);
        resetTxState();
        fetchMatchedPredictions();
      }, 2000);
    } catch (err) {
      console.error('Error refunding prediction:', err);
    }
  };

  const handleCancel = () => {
    setSelectedPrediction(null);
    setAction(null);
    setSelectedWinner(null);
    resetTxState();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <button
          onClick={() => fetchMatchedPredictions()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Predictions Pending Resolution</h3>
          <p className="text-sm text-gray-500">
            {matchedPredictions.length} prediction{matchedPredictions.length !== 1 ? 's' : ''} awaiting resolution
          </p>
        </div>

        {matchedPredictions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No predictions pending resolution</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {matchedPredictions.map((prediction) => (
              <div key={prediction.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      #{prediction.id}: {prediction.title}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">{prediction.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Option A</div>
                        <div className="font-medium">{prediction.optionA}</div>
                        <div className="text-xs text-blue-600">
                          {prediction.creatorChoice === PredictionOption.OptionA ? 'Creator' : 'Opponent'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Option B</div>
                        <div className="font-medium">{prediction.optionB}</div>
                        <div className="text-xs text-blue-600">
                          {prediction.creatorChoice === PredictionOption.OptionB ? 'Creator' : 'Opponent'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Pot: {formatUSDT((BigInt(prediction.betAmount) * BigInt(2)).toString())} USDT</span>
                      <span>Creator: {formatAddress(prediction.creator)}</span>
                      <span>Opponent: {formatAddress(prediction.opponent)}</span>
                      <span>Created: {formatTimestamp(prediction.createdAt)}</span>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedPrediction(prediction);
                        setAction('resolve');
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPrediction(prediction);
                        setAction('refund');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Refund
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedPrediction && action === 'resolve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Resolve Prediction</h3>
            <p className="text-gray-600 mb-4">{selectedPrediction.title}</p>

            {txState.status === 'idle' ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Select the winning option:</p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setSelectedWinner(PredictionOption.OptionA)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedWinner === PredictionOption.OptionA
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{selectedPrediction.optionA}</div>
                    <div className="text-sm text-gray-500">
                      Winner:{' '}
                      {selectedPrediction.creatorChoice === PredictionOption.OptionA
                        ? formatAddress(selectedPrediction.creator)
                        : formatAddress(selectedPrediction.opponent)}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedWinner(PredictionOption.OptionB)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedWinner === PredictionOption.OptionB
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{selectedPrediction.optionB}</div>
                    <div className="text-sm text-gray-500">
                      Winner:{' '}
                      {selectedPrediction.creatorChoice === PredictionOption.OptionB
                        ? formatAddress(selectedPrediction.creator)
                        : formatAddress(selectedPrediction.opponent)}
                    </div>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={!selectedWinner}
                    className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Confirm Resolution
                  </button>
                </div>
              </>
            ) : (
              <TransactionStatus
                status={txState.status}
                hash={txState.hash}
                error={txState.error}
                onReset={handleCancel}
              />
            )}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {selectedPrediction && action === 'refund' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Refund</h3>

            {txState.status === 'idle' ? (
              <>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to refund this prediction? Both parties will receive their original bet
                  amount back.
                </p>

                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action cannot be undone. Only use this if the prediction
                    cannot be fairly resolved.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefund}
                    className="flex-1 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Refund
                  </button>
                </div>
              </>
            ) : (
              <TransactionStatus
                status={txState.status}
                hash={txState.hash}
                error={txState.error}
                onReset={handleCancel}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
