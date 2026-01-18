'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { useUSDT } from '@/hooks/useUSDT';
import { PredictionOption, parseUSDT, formatUSDT } from '@/types';
import { EXPIRY_OPTIONS, MIN_BET_AMOUNT, MAX_BET_AMOUNT } from '@/lib/constants';
import { TransactionStatus } from './TransactionStatus';

export function CreatePredictionForm() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { createPrediction, txState, resetTxState } = useContract();
  const { checkApprovalNeeded, approve, isApproving } = useUSDT();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    optionA: '',
    optionB: '',
    betAmount: '',
    creatorChoice: PredictionOption.OptionA,
    expiryHours: 24,
  });

  const [step, setStep] = useState<'form' | 'approve' | 'confirm'>('form');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChoiceChange = (choice: PredictionOption) => {
    setFormData((prev) => ({ ...prev, creatorChoice: choice }));
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }

    if (!formData.optionA.trim() || !formData.optionB.trim()) {
      setError('Both options are required');
      return false;
    }

    const amount = parseFloat(formData.betAmount);
    if (isNaN(amount) || amount < MIN_BET_AMOUNT || amount > MAX_BET_AMOUNT) {
      setError(`Bet amount must be between ${MIN_BET_AMOUNT} and ${MAX_BET_AMOUNT} USDT`);
      return false;
    }

    const usdtBalance = parseFloat(formatUSDT(wallet.usdtBalance));
    if (amount > usdtBalance) {
      setError('Insufficient USDT balance');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const betAmountRaw = parseUSDT(formData.betAmount);

    // Check if approval is needed
    const needsApproval = await checkApprovalNeeded(betAmountRaw);

    if (needsApproval) {
      setStep('approve');
    } else {
      setStep('confirm');
      await executeCreate(betAmountRaw);
    }
  };

  const handleApprove = async () => {
    setError(null);

    try {
      const betAmountRaw = parseUSDT(formData.betAmount);
      // Approve a bit more to account for future predictions
      const approvalAmount = (BigInt(betAmountRaw) * BigInt(10)).toString();
      await approve(approvalAmount);
      setStep('confirm');
      await executeCreate(betAmountRaw);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
    }
  };

  const executeCreate = async (betAmountRaw: string) => {
    setError(null);

    try {
      const expiryTime = Math.floor(Date.now() / 1000) + formData.expiryHours * 3600;

      await createPrediction(
        formData.title,
        formData.description,
        formData.optionA,
        formData.optionB,
        betAmountRaw,
        formData.creatorChoice,
        expiryTime
      );

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setError(null);
    resetTxState();
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Please connect your wallet to create a prediction</p>
      </div>
    );
  }

  if (step === 'approve') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Approve USDT</h2>
          <p className="text-gray-600 mb-6">
            To create a prediction, you need to approve the contract to spend your USDT. This is a one-time
            approval that allows you to create multiple predictions.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isApproving ? 'Approving...' : 'Approve USDT'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Creating Prediction</h2>

          <TransactionStatus
            status={txState.status}
            hash={txState.hash}
            error={txState.error || error}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Prediction</h2>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Prediction Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Will Bitcoin reach $100k by end of 2025?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add more context about your prediction..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={500}
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="optionA" className="block text-sm font-medium text-gray-700 mb-2">
              Option A *
            </label>
            <input
              type="text"
              id="optionA"
              name="optionA"
              value={formData.optionA}
              onChange={handleInputChange}
              placeholder="e.g., Yes"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="optionB" className="block text-sm font-medium text-gray-700 mb-2">
              Option B *
            </label>
            <input
              type="text"
              id="optionB"
              name="optionB"
              value={formData.optionB}
              onChange={handleInputChange}
              placeholder="e.g., No"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
        </div>

        {/* Your Choice */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Choice *</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChoiceChange(PredictionOption.OptionA)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                formData.creatorChoice === PredictionOption.OptionA
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Option A: {formData.optionA || '...'}
            </button>
            <button
              type="button"
              onClick={() => handleChoiceChange(PredictionOption.OptionB)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                formData.creatorChoice === PredictionOption.OptionB
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Option B: {formData.optionB || '...'}
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Bet Amount (USDT) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="betAmount"
              name="betAmount"
              value={formData.betAmount}
              onChange={handleInputChange}
              placeholder="100"
              min={MIN_BET_AMOUNT}
              max={MAX_BET_AMOUNT}
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USDT</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Balance: {formatUSDT(wallet.usdtBalance)} USDT
          </p>
        </div>

        {/* Expiry */}
        <div className="mb-6">
          <label htmlFor="expiryHours" className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Time *
          </label>
          <select
            id="expiryHours"
            name="expiryHours"
            value={formData.expiryHours}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {EXPIRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              You are betting <strong>{formData.betAmount || '0'} USDT</strong> on{' '}
              <strong>
                {formData.creatorChoice === PredictionOption.OptionA
                  ? formData.optionA || 'Option A'
                  : formData.optionB || 'Option B'}
              </strong>
            </p>
            <p>
              If you win, you&apos;ll receive{' '}
              <strong>{((parseFloat(formData.betAmount) || 0) * 2 * 0.98).toFixed(2)} USDT</strong> (after 2% fee)
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Create Prediction
        </button>
      </div>
    </form>
  );
}
