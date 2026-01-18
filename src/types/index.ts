// Prediction status enum (mirrors smart contract)
export enum PredictionStatus {
  Open = 0,
  Matched = 1,
  Resolved = 2,
  Cancelled = 3,
  Claimed = 4,
}

// Prediction option enum (mirrors smart contract)
export enum PredictionOption {
  None = 0,
  OptionA = 1,
  OptionB = 2,
}

// Prediction data structure
export interface Prediction {
  id: number;
  creator: string;
  opponent: string;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  betAmount: string; // BigNumber as string
  creatorChoice: PredictionOption;
  opponentChoice: PredictionOption;
  status: PredictionStatus;
  winningOption: PredictionOption;
  createdAt: number;
  expiryTime: number;
}

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  usdtBalance: string;
  isAdmin: boolean;
}

// Transaction state
export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  error: string | null;
}

// Create prediction form data
export interface CreatePredictionForm {
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  betAmount: string;
  creatorChoice: PredictionOption;
  expiryHours: number;
}

// Contract event types
export interface PredictionCreatedEvent {
  id: number;
  creator: string;
  title: string;
  betAmount: string;
  expiryTime: number;
}

export interface PredictionJoinedEvent {
  id: number;
  opponent: string;
  opponentChoice: PredictionOption;
}

export interface PredictionResolvedEvent {
  id: number;
  winningOption: PredictionOption;
  winner: string;
}

// TronLink types
export interface TronLinkWindow extends Window {
  tronLink?: {
    ready: boolean;
    request: (args: { method: string }) => Promise<unknown>;
    tronWeb?: TronWebInstance;
  };
  tronWeb?: TronWebInstance;
}

export interface TronWebInstance {
  ready: boolean;
  defaultAddress: {
    base58: string;
    hex: string;
  };
  trx: {
    getBalance: (address: string) => Promise<number>;
    sign: (transaction: unknown) => Promise<unknown>;
  };
  contract: () => {
    at: (address: string) => Promise<TronContract>;
  };
  toSun: (amount: number) => number;
  fromSun: (amount: number) => number;
  address: {
    fromHex: (hex: string) => string;
    toHex: (base58: string) => string;
  };
}

export interface TronContract {
  methods: Record<string, (...args: unknown[]) => ContractMethod>;
  // Add specific method signatures
  [key: string]: unknown;
}

export interface ContractMethod {
  call: () => Promise<unknown>;
  send: (options?: { feeLimit?: number; callValue?: number }) => Promise<unknown>;
}

// Helper function to get status label
export function getStatusLabel(status: PredictionStatus): string {
  switch (status) {
    case PredictionStatus.Open:
      return 'Open';
    case PredictionStatus.Matched:
      return 'Matched';
    case PredictionStatus.Resolved:
      return 'Resolved';
    case PredictionStatus.Cancelled:
      return 'Cancelled';
    case PredictionStatus.Claimed:
      return 'Claimed';
    default:
      return 'Unknown';
  }
}

// Helper function to get status color
export function getStatusColor(status: PredictionStatus): string {
  switch (status) {
    case PredictionStatus.Open:
      return 'bg-green-100 text-green-800';
    case PredictionStatus.Matched:
      return 'bg-blue-100 text-blue-800';
    case PredictionStatus.Resolved:
      return 'bg-purple-100 text-purple-800';
    case PredictionStatus.Cancelled:
      return 'bg-gray-100 text-gray-800';
    case PredictionStatus.Claimed:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to format USDT amount (6 decimals)
export function formatUSDT(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num / 1e6).toFixed(2);
}

// Helper function to parse USDT amount to contract format
export function parseUSDT(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(num * 1e6).toString();
}

// Helper to format address
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format timestamp
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Helper to check if prediction is expired
export function isPredictionExpired(expiryTime: number): boolean {
  return Date.now() / 1000 > expiryTime;
}
