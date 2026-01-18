'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { useUSDT } from '@/hooks/useUSDT';
import { Prediction, PredictionOption, formatUSDT } from '@/types';
import { TransactionStatus } from './TransactionStatus';

interface JoinPredictionModalProps {
  prediction: Prediction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinPredictionModal({ prediction, isOpen, onClose, onSuccess }: JoinPredictionModalProps) {
  const { wallet } = useWallet();
  const { joinPrediction, txState, resetTxState } = useContract();
  const { checkApprovalNeeded, approve, isApproving } = useUSDT();

  const [step, setStep] = useState<'confirm' | 'approve' | 'joining'>('confirm');
  const [error, setError] = useState<string | null>(null);

  // Opponent must choose the opposite option
  const opponentChoice =
    prediction.creatorChoice === PredictionOption.OptionA ? PredictionOption.OptionB : PredictionOption.OptionA;

  const opponentOptionText =
    opponentChoice === PredictionOption.OptionA ? prediction.optionA : prediction.optionB;

  if (!isOpen) return null;

  const handleJoin = async () => {
    setError(null);

    // Check USDT balance
    const balance = BigInt(wallet.usdtBalance);
    const betAmount = BigInt(prediction.betAmount);

    if (balance < betAmount) {
      setError('Insufficient USDT balance');
      return;
    }

    // Check approval
    const needsApproval = await checkApprovalNeeded(prediction.betAmount);

    if (needsApproval) {
      setStep('approve');
    } else {
      await executeJoin();
    }
  };

  const handleApprove = async () => {
    setError(null);

    try {
      const approvalAmount = (BigInt(prediction.betAmount) * BigInt(10)).toString();
      await approve(approvalAmount);
      await executeJoin();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
      setStep('confirm');
    }
  };

  const executeJoin = async () => {
    setStep('joining');
    setError(null);

    try {
      await joinPrediction(prediction.id, opponentChoice);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setStep('confirm');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setError(null);
    resetTxState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Join Prediction</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 'confirm' && (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{prediction.title}</h3>
                <p className="text-sm text-gray-500">{prediction.description}</p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">You will be betting on:</p>
                <p className="text-lg font-semibold text-blue-700">{opponentOptionText}</p>
              </div>

              <div className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bet Amount:</span>
                  <span className="font-medium text-gray-900">{formatUSDT(prediction.betAmount)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Potential Winnings:</span>
                  <span className="font-medium text-green-600">
                    {(parseFloat(formatUSDT(prediction.betAmount)) * 2 * 0.98).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Your Balance:</span>
                  <span className="font-medium text-gray-900">{formatUSDT(wallet.usdtBalance)} USDT</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoin}
                  className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Join Prediction
                </button>
              </div>
            </>
          )}

          {step === 'approve' && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  You need to approve the contract to spend your USDT before joining.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isApproving ? 'Approving...' : 'Approve USDT'}
                </button>
              </div>
            </>
          )}

          {step === 'joining' && (
            <TransactionStatus
              status={txState.status}
              hash={txState.hash}
              error={txState.error || error}
              onReset={() => setStep('confirm')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
