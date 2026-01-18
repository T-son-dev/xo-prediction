'use client';

import Link from 'next/link';
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

interface PredictionCardProps {
  prediction: Prediction;
  showActions?: boolean;
  currentUserAddress?: string;
}

export function PredictionCard({ prediction, showActions = true, currentUserAddress }: PredictionCardProps) {
  const isExpired = isPredictionExpired(prediction.expiryTime);
  const isCreator = currentUserAddress?.toLowerCase() === prediction.creator.toLowerCase();
  const isOpponent = prediction.opponent && currentUserAddress?.toLowerCase() === prediction.opponent.toLowerCase();
  const totalPot = BigInt(prediction.betAmount) * BigInt(2);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{prediction.title}</h3>
            {prediction.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{prediction.description}</p>
            )}
          </div>
          <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(prediction.status)}`}>
            {getStatusLabel(prediction.status)}
          </span>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className={`p-3 rounded-lg border-2 ${
              prediction.winningOption === PredictionOption.OptionA
                ? 'border-green-500 bg-green-50'
                : prediction.creatorChoice === PredictionOption.OptionA
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Option A</div>
            <div className="font-medium text-gray-900">{prediction.optionA}</div>
            {prediction.creatorChoice === PredictionOption.OptionA && (
              <div className="text-xs text-blue-600 mt-1">Creator&apos;s pick</div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg border-2 ${
              prediction.winningOption === PredictionOption.OptionB
                ? 'border-green-500 bg-green-50'
                : prediction.creatorChoice === PredictionOption.OptionB
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Option B</div>
            <div className="font-medium text-gray-900">{prediction.optionB}</div>
            {prediction.creatorChoice === PredictionOption.OptionB && (
              <div className="text-xs text-blue-600 mt-1">Creator&apos;s pick</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="text-gray-400">Bet:</span>{' '}
            <span className="font-medium text-gray-900">{formatUSDT(prediction.betAmount)} USDT</span>
          </div>
          {prediction.status === PredictionStatus.Matched && (
            <div>
              <span className="text-gray-400">Pot:</span>{' '}
              <span className="font-medium text-green-600">{formatUSDT(totalPot.toString())} USDT</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Creator:</span>{' '}
            <span className="font-mono">{formatAddress(prediction.creator)}</span>
            {isCreator && <span className="text-blue-600 ml-1">(You)</span>}
          </div>
          {prediction.opponent && (
            <div>
              <span className="text-gray-400">Opponent:</span>{' '}
              <span className="font-mono">{formatAddress(prediction.opponent)}</span>
              {isOpponent && <span className="text-blue-600 ml-1">(You)</span>}
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between text-sm">
          <div className={`${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
            {isExpired ? 'Expired' : `Expires: ${formatTimestamp(prediction.expiryTime)}`}
          </div>

          {showActions && prediction.status === PredictionStatus.Open && !isExpired && !isCreator && (
            <Link
              href={`/prediction/${prediction.id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Join Prediction
            </Link>
          )}

          {showActions && (prediction.status !== PredictionStatus.Open || isCreator) && (
            <Link
              href={`/prediction/${prediction.id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
