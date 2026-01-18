// Network configuration
export const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    fullHost: 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    usdtAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // Official USDT on mainnet
  },
  shasta: {
    name: 'Shasta Testnet',
    fullHost: 'https://api.shasta.trongrid.io',
    explorerUrl: 'https://shasta.tronscan.org',
    usdtAddress: '', // Will be set after deployment
  },
  nile: {
    name: 'Nile Testnet',
    fullHost: 'https://nile.trongrid.io',
    explorerUrl: 'https://nile.tronscan.org',
    usdtAddress: '', // Will be set after deployment
  },
} as const;

// Current network (change this for different environments)
export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_TRON_NETWORK || 'shasta';

// Get current network config
export const getNetworkConfig = () => {
  return NETWORKS[CURRENT_NETWORK as keyof typeof NETWORKS] || NETWORKS.shasta;
};

// Contract addresses (set after deployment)
export const CONTRACT_ADDRESSES = {
  predictionMarket: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '',
  usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS || '',
};

// USDT has 6 decimals
export const USDT_DECIMALS = 6;

// Platform fee percentage
export const PLATFORM_FEE_PERCENT = 2;

// Minimum bet amount (in USDT)
export const MIN_BET_AMOUNT = 1;

// Maximum bet amount (in USDT)
export const MAX_BET_AMOUNT = 10000;

// Default expiry time options (in hours)
export const EXPIRY_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '6 hours', value: 6 },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 },
  { label: '7 days', value: 168 },
];

// Transaction fee limit (in SUN)
export const FEE_LIMIT = 100_000_000; // 100 TRX

// Pagination
export const PREDICTIONS_PER_PAGE = 10;

// Refresh intervals (in ms)
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const BALANCE_REFRESH_INTERVAL = 15000; // 15 seconds

// Local storage keys
export const STORAGE_KEYS = {
  lastConnectedAddress: 'xo_last_connected_address',
  theme: 'xo_theme',
};

// Error messages
export const ERROR_MESSAGES = {
  walletNotFound: 'TronLink wallet not found. Please install TronLink extension.',
  connectionRejected: 'Wallet connection was rejected.',
  insufficientBalance: 'Insufficient USDT balance.',
  insufficientTRX: 'Insufficient TRX for gas fees.',
  transactionFailed: 'Transaction failed. Please try again.',
  approvalFailed: 'USDT approval failed. Please try again.',
  networkError: 'Network error. Please check your connection.',
  invalidAmount: 'Please enter a valid amount.',
  predictionNotFound: 'Prediction not found.',
  alreadyJoined: 'You have already joined this prediction.',
  cannotJoinOwn: 'You cannot join your own prediction.',
  predictionExpired: 'This prediction has expired.',
  notWinner: 'You are not the winner of this prediction.',
  alreadyClaimed: 'Winnings have already been claimed.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  walletConnected: 'Wallet connected successfully!',
  predictionCreated: 'Prediction created successfully!',
  predictionJoined: 'You have joined the prediction!',
  predictionResolved: 'Prediction resolved successfully!',
  winningsClaimed: 'Winnings claimed successfully!',
  predictionCancelled: 'Prediction cancelled successfully!',
  approvalSuccess: 'USDT approval successful!',
};
