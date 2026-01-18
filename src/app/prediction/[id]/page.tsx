'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import {
  Prediction,
  PredictionStatus,
  PredictionOption,
  getStatusLabel,
  getStatusColor,
  formatUSDT,
  formatAddress,
  formatTimestamp,
  isPredictionExpired,
} from '@/types';
import { JoinPredictionModal } from '@/components/JoinPredictionModal';
import { TransactionStatus } from '@/components/TransactionStatus';
import { getNetworkConfig } from '@/lib/constants';

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { wallet } = useWallet();
  const { getPrediction, claimWinnings, cancelPrediction, getWinner, txState, resetTxState } = useContract();

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [action, setAction] = useState<'claim' | 'cancel' | null>(null);

  const predictionId = parseInt(params.id as string);
  const network = getNetworkConfig();

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!predictionId) return;

      setIsLoading(true);
      const data = await getPrediction(predictionId);
      setPrediction(data);

      if (data && (data.status === PredictionStatus.Resolved || data.status === PredictionStatus.Claimed)) {
        const winnerAddress = await getWinner(predictionId);
        setWinner(winnerAddress);
      }

      setIsLoading(false);
    };

    fetchPrediction();
  }, [predictionId, getPrediction, getWinner]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-500">Loading prediction...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prediction Not Found</h2>
        <p className="text-gray-500 mb-4">The prediction you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isExpired = isPredictionExpired(prediction.expiryTime);
  const isCreator = wallet.address?.toLowerCase() === prediction.creator.toLowerCase();
  const isOpponent = prediction.opponent && wallet.address?.toLowerCase() === prediction.opponent.toLowerCase();
  const isWinner = winner && wallet.address?.toLowerCase() === winner.toLowerCase();
  const totalPot = BigInt(prediction.betAmount) * BigInt(2);
  const winnings = (Number(totalPot) * 0.98).toString();

  const canJoin =
    prediction.status === PredictionStatus.Open &&
    !isExpired &&
    !isCreator &&
    wallet.isConnected;

  const canCancel = prediction.status === PredictionStatus.Open && isCreator;

  const canClaim =
    prediction.status === PredictionStatus.Resolved &&
    isWinner;

  const handleClaim = async () => {
    setAction('claim');
    try {
      await claimWinnings(prediction.id);
      setTimeout(() => {
        setAction(null);
        resetTxState();
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error('Error claiming winnings:', err);
    }
  };

  const handleCancel = async () => {
    setAction('cancel');
    try {
      await cancelPrediction(prediction.id);
      setTimeout(() => {
        setAction(null);
        resetTxState();
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error cancelling prediction:', err);
    }
  };

  const handleJoinSuccess = () => {
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{prediction.title}</h1>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(prediction.status)}`}>
              {getStatusLabel(prediction.status)}
            </span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: #{prediction.id}</p>
            <p>Created: {formatTimestamp(prediction.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Description */}
        {prediction.description && (
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-gray-600">{prediction.description}</p>
          </div>
        )}

        {/* Options */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">OPTIONS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                prediction.winningOption === PredictionOption.OptionA
                  ? 'border-green-500 bg-green-50'
                  : prediction.creatorChoice === PredictionOption.OptionA
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">Option A</div>
              <div className="text-lg font-semibold text-gray-900">{prediction.optionA}</div>
              <div className="text-sm text-gray-600 mt-2">
                {prediction.creatorChoice === PredictionOption.OptionA ? (
                  <span className="text-blue-600">
                    Creator ({formatAddress(prediction.creator)})
                    {isCreator && ' (You)'}
                  </span>
                ) : prediction.opponent ? (
                  <span className="text-purple-600">
                    Opponent ({formatAddress(prediction.opponent)})
                    {isOpponent && ' (You)'}
                  </span>
                ) : (
                  <span className="text-gray-400">Waiting for opponent</span>
                )}
              </div>
              {prediction.winningOption === PredictionOption.OptionA && (
                <div className="mt-2 text-green-600 font-medium">Winner!</div>
              )}
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                prediction.winningOption === PredictionOption.OptionB
                  ? 'border-green-500 bg-green-50'
                  : prediction.creatorChoice === PredictionOption.OptionB
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">Option B</div>
              <div className="text-lg font-semibold text-gray-900">{prediction.optionB}</div>
              <div className="text-sm text-gray-600 mt-2">
                {prediction.creatorChoice === PredictionOption.OptionB ? (
                  <span className="text-blue-600">
                    Creator ({formatAddress(prediction.creator)})
                    {isCreator && ' (You)'}
                  </span>
                ) : prediction.opponent ? (
                  <span className="text-purple-600">
                    Opponent ({formatAddress(prediction.opponent)})
                    {isOpponent && ' (You)'}
                  </span>
                ) : (
                  <span className="text-gray-400">Waiting for opponent</span>
                )}
              </div>
              {prediction.winningOption === PredictionOption.OptionB && (
                <div className="mt-2 text-green-600 font-medium">Winner!</div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Bet Amount</div>
              <div className="font-semibold text-gray-900">{formatUSDT(prediction.betAmount)} USDT</div>
            </div>
            <div>
              <div className="text-gray-500">Total Pot</div>
              <div className="font-semibold text-green-600">
                {prediction.status === PredictionStatus.Open
                  ? formatUSDT(prediction.betAmount)
                  : formatUSDT(totalPot.toString())}{' '}
                USDT
              </div>
            </div>
            <div>
              <div className="text-gray-500">Platform Fee</div>
              <div className="font-semibold text-gray-900">2%</div>
            </div>
            <div>
              <div className={`${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                {isExpired ? 'Expired' : 'Expires'}
              </div>
              <div className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTimestamp(prediction.expiryTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Winner Info */}
        {winner && (
          <div className="px-6 py-4 border-t border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600">Winner</div>
                <div className="font-semibold text-green-800">
                  {formatAddress(winner)}
                  {isWinner && ' (You!)'}
                </div>
              </div>
              {prediction.status === PredictionStatus.Resolved && (
                <div>
                  <div className="text-sm text-green-600">Prize</div>
                  <div className="font-semibold text-green-800">{formatUSDT(winnings)} USDT</div>
                </div>
              )}
              {prediction.status === PredictionStatus.Claimed && (
                <div className="text-sm text-green-600">Claimed</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {action ? (
          <div className="px-6 py-6 border-t border-gray-200">
            <TransactionStatus
              status={txState.status}
              hash={txState.hash}
              error={txState.error}
              onReset={() => {
                setAction(null);
                resetTxState();
              }}
            />
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              {canJoin && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Join Prediction ({formatUSDT(prediction.betAmount)} USDT)
                </button>
              )}

              {canClaim && (
                <button
                  onClick={handleClaim}
                  className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Claim Winnings ({formatUSDT(winnings)} USDT)
                </button>
              )}

              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel & Refund
                </button>
              )}

              {!canJoin && !canClaim && !canCancel && (
                <p className="text-gray-500">
                  {prediction.status === PredictionStatus.Matched
                    ? 'Waiting for admin resolution'
                    : prediction.status === PredictionStatus.Claimed
                    ? 'This prediction has been settled'
                    : prediction.status === PredictionStatus.Cancelled
                    ? 'This prediction was cancelled'
                    : isExpired
                    ? 'This prediction has expired'
                    : 'No actions available'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Links */}
      <div className="text-center text-sm text-gray-500">
        <a
          href={`${network.explorerUrl}/#/contract/${prediction.creator}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          View on TronScan
        </a>
      </div>

      {/* Join Modal */}
      <JoinPredictionModal
        prediction={prediction}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
