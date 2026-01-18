// Contract ABIs
// These are simplified ABIs containing only the functions we need

export const PREDICTION_MARKET_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'admin',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'platformFeePercent',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'predictionCounter',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'accumulatedFees',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_predictionId', type: 'uint256' }],
    name: 'getPrediction',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'opponent', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'optionA', type: 'string' },
          { name: 'optionB', type: 'string' },
          { name: 'betAmount', type: 'uint256' },
          { name: 'creatorChoice', type: 'uint8' },
          { name: 'opponentChoice', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'winningOption', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiryTime', type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserPredictions',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_offset', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getOpenPredictions',
    outputs: [
      { name: 'ids', type: 'uint256[]' },
      { name: 'total', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_offset', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getMatchedPredictions',
    outputs: [
      { name: 'ids', type: 'uint256[]' },
      { name: 'total', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_predictionId', type: 'uint256' }],
    name: 'getWinner',
    outputs: [{ name: 'winner', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_optionA', type: 'string' },
      { name: '_optionB', type: 'string' },
      { name: '_betAmount', type: 'uint256' },
      { name: '_creatorChoice', type: 'uint8' },
      { name: '_expiryTime', type: 'uint256' },
    ],
    name: 'createPrediction',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_predictionId', type: 'uint256' },
      { name: '_choice', type: 'uint8' },
    ],
    name: 'joinPrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_predictionId', type: 'uint256' },
      { name: '_winningOption', type: 'uint8' },
    ],
    name: 'resolvePrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_predictionId', type: 'uint256' }],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_predictionId', type: 'uint256' }],
    name: 'cancelPrediction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_predictionId', type: 'uint256' }],
    name: 'emergencyRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_to', type: 'address' }],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: false, name: 'betAmount', type: 'uint256' },
      { indexed: false, name: 'expiryTime', type: 'uint256' },
    ],
    name: 'PredictionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'opponent', type: 'address' },
      { indexed: false, name: 'opponentChoice', type: 'uint8' },
    ],
    name: 'PredictionJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'winningOption', type: 'uint8' },
      { indexed: false, name: 'winner', type: 'address' },
    ],
    name: 'PredictionResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: false, name: 'cancelledBy', type: 'address' },
    ],
    name: 'PredictionCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'uint256' },
      { indexed: true, name: 'winner', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'fee', type: 'uint256' },
    ],
    name: 'WinningsClaimed',
    type: 'event',
  },
];

export const TRC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // For MockUSDT testing
  {
    inputs: [],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
