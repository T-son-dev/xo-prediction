'use client';

import { getNetworkConfig } from '@/lib/constants';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
  onReset?: () => void;
}

export function TransactionStatus({ status, hash, error, onReset }: TransactionStatusProps) {
  const network = getNetworkConfig();

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="space-y-4">
      {status === 'pending' && (
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Transaction pending...</p>
            <p className="text-sm text-gray-500 mt-1">Please confirm in your TronLink wallet</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium mb-2">Transaction Successful!</p>
            {hash && (
              <a
                href={`${network.explorerUrl}/#/transaction/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on TronScan
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-2">Transaction Failed</p>
            {error && <p className="text-sm text-gray-500">{error}</p>}
            {onReset && (
              <button
                onClick={onReset}
                className="mt-4 px-4 py-2 text-sm text-blue-600 hover:underline"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
