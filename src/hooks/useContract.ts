'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACT_ADDRESSES, FEE_LIMIT } from '@/lib/constants';
import { Prediction, PredictionOption, PredictionStatus, TransactionState } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContract = any;

export function useContract() {
  const { tronWeb, wallet, refreshBalances } = useWallet();
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  // Get contract instance
  const getContract = useCallback(async (): Promise<AnyContract> => {
    if (!tronWeb || !CONTRACT_ADDRESSES.predictionMarket) {
      throw new Error('TronWeb or contract address not available');
    }
    return await tronWeb.contract().at(CONTRACT_ADDRESSES.predictionMarket);
  }, [tronWeb]);

  // Get USDT contract instance
  const getUSDTContract = useCallback(async (): Promise<AnyContract> => {
    if (!tronWeb || !CONTRACT_ADDRESSES.usdt) {
      throw new Error('TronWeb or USDT address not available');
    }
    return await tronWeb.contract().at(CONTRACT_ADDRESSES.usdt);
  }, [tronWeb]);

  // Create prediction
  const createPrediction = useCallback(
    async (
      title: string,
      description: string,
      optionA: string,
      optionB: string,
      betAmount: string,
      creatorChoice: PredictionOption,
      expiryTime: number
    ): Promise<number | null> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract
          .createPrediction(title, description, optionA, optionB, betAmount, creatorChoice, expiryTime)
          .send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
        await refreshBalances();

        // Get prediction ID from transaction
        // Note: In production, you'd parse the event logs
        return null; // Return prediction ID after parsing events
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract, refreshBalances]
  );

  // Join prediction
  const joinPrediction = useCallback(
    async (predictionId: number, choice: PredictionOption): Promise<void> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract.joinPrediction(predictionId, choice).send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
        await refreshBalances();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract, refreshBalances]
  );

  // Resolve prediction (admin only)
  const resolvePrediction = useCallback(
    async (predictionId: number, winningOption: PredictionOption): Promise<void> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract.resolvePrediction(predictionId, winningOption).send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract]
  );

  // Claim winnings
  const claimWinnings = useCallback(
    async (predictionId: number): Promise<void> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract.claimWinnings(predictionId).send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
        await refreshBalances();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract, refreshBalances]
  );

  // Cancel prediction
  const cancelPrediction = useCallback(
    async (predictionId: number): Promise<void> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract.cancelPrediction(predictionId).send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
        await refreshBalances();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract, refreshBalances]
  );

  // Emergency refund (admin only)
  const emergencyRefund = useCallback(
    async (predictionId: number): Promise<void> => {
      if (!tronWeb) throw new Error('Wallet not connected');

      setTxState({ status: 'pending', hash: null, error: null });

      try {
        const contract = await getContract();

        const tx = await contract.emergencyRefund(predictionId).send({ feeLimit: FEE_LIMIT });

        setTxState({ status: 'success', hash: tx, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setTxState({ status: 'error', hash: null, error: message });
        throw err;
      }
    },
    [tronWeb, getContract]
  );

  // Get prediction by ID
  const getPrediction = useCallback(
    async (predictionId: number): Promise<Prediction | null> => {
      if (!tronWeb) return null;

      try {
        const contract = await getContract();
        const result = await contract.getPrediction(predictionId).call();

        return {
          id: Number(result.id),
          creator: tronWeb.address.fromHex(result.creator),
          opponent: result.opponent === '410000000000000000000000000000000000000000'
            ? ''
            : tronWeb.address.fromHex(result.opponent),
          title: result.title,
          description: result.description,
          optionA: result.optionA,
          optionB: result.optionB,
          betAmount: result.betAmount.toString(),
          creatorChoice: Number(result.creatorChoice) as PredictionOption,
          opponentChoice: Number(result.opponentChoice) as PredictionOption,
          status: Number(result.status) as PredictionStatus,
          winningOption: Number(result.winningOption) as PredictionOption,
          createdAt: Number(result.createdAt),
          expiryTime: Number(result.expiryTime),
        };
      } catch (err) {
        console.error('Error fetching prediction:', err);
        return null;
      }
    },
    [tronWeb, getContract]
  );

  // Get open predictions
  const getOpenPredictions = useCallback(
    async (offset: number = 0, limit: number = 10): Promise<{ ids: number[]; total: number }> => {
      if (!tronWeb) return { ids: [], total: 0 };

      try {
        const contract = await getContract();
        const result = await contract.getOpenPredictions(offset, limit).call();

        return {
          ids: result.ids.map((id: { toNumber?: () => number }) =>
            typeof id.toNumber === 'function' ? id.toNumber() : Number(id)
          ),
          total: typeof result.total.toNumber === 'function' ? result.total.toNumber() : Number(result.total),
        };
      } catch (err) {
        console.error('Error fetching open predictions:', err);
        return { ids: [], total: 0 };
      }
    },
    [tronWeb, getContract]
  );

  // Get matched predictions (for admin)
  const getMatchedPredictions = useCallback(
    async (offset: number = 0, limit: number = 10): Promise<{ ids: number[]; total: number }> => {
      if (!tronWeb) return { ids: [], total: 0 };

      try {
        const contract = await getContract();
        const result = await contract.getMatchedPredictions(offset, limit).call();

        return {
          ids: result.ids.map((id: { toNumber?: () => number }) =>
            typeof id.toNumber === 'function' ? id.toNumber() : Number(id)
          ),
          total: typeof result.total.toNumber === 'function' ? result.total.toNumber() : Number(result.total),
        };
      } catch (err) {
        console.error('Error fetching matched predictions:', err);
        return { ids: [], total: 0 };
      }
    },
    [tronWeb, getContract]
  );

  // Get user predictions
  const getUserPredictions = useCallback(
    async (address: string): Promise<number[]> => {
      if (!tronWeb) return [];

      try {
        const contract = await getContract();
        const result = await contract.getUserPredictions(address).call();

        return result.map((id: { toNumber?: () => number }) =>
          typeof id.toNumber === 'function' ? id.toNumber() : Number(id)
        );
      } catch (err) {
        console.error('Error fetching user predictions:', err);
        return [];
      }
    },
    [tronWeb, getContract]
  );

  // Get winner
  const getWinner = useCallback(
    async (predictionId: number): Promise<string | null> => {
      if (!tronWeb) return null;

      try {
        const contract = await getContract();
        const result = await contract.getWinner(predictionId).call();

        if (result === '410000000000000000000000000000000000000000') {
          return null;
        }

        return tronWeb.address.fromHex(result);
      } catch (err) {
        console.error('Error fetching winner:', err);
        return null;
      }
    },
    [tronWeb, getContract]
  );

  // Reset transaction state
  const resetTxState = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    txState,
    resetTxState,
    createPrediction,
    joinPrediction,
    resolvePrediction,
    claimWinnings,
    cancelPrediction,
    emergencyRefund,
    getPrediction,
    getOpenPredictions,
    getMatchedPredictions,
    getUserPredictions,
    getWinner,
  };
}
