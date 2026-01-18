'use client';

import { useState, useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { useWallet } from '@/contexts/WalletContext';
import { Prediction } from '@/types';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function usePredictions() {
  const { wallet } = useWallet();
  const { getOpenPredictions, getMatchedPredictions, getUserPredictions, getPrediction } = useContract();

  const [openPredictions, setOpenPredictions] = useState<Prediction[]>([]);
  const [matchedPredictions, setMatchedPredictions] = useState<Prediction[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch multiple predictions by IDs
  const fetchPredictionsByIds = useCallback(
    async (ids: number[]): Promise<Prediction[]> => {
      const predictions: Prediction[] = [];

      for (const id of ids) {
        const prediction = await getPrediction(id);
        if (prediction) {
          predictions.push(prediction);
        }
      }

      return predictions;
    },
    [getPrediction]
  );

  // Fetch open predictions
  const fetchOpenPredictions = useCallback(
    async (offset: number = 0, limit: number = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const { ids } = await getOpenPredictions(offset, limit);
        const predictions = await fetchPredictionsByIds(ids);
        setOpenPredictions(predictions);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
        setError(message);
        console.error('Error fetching open predictions:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [getOpenPredictions, fetchPredictionsByIds]
  );

  // Fetch matched predictions (for admin)
  const fetchMatchedPredictions = useCallback(
    async (offset: number = 0, limit: number = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const { ids } = await getMatchedPredictions(offset, limit);
        const predictions = await fetchPredictionsByIds(ids);
        setMatchedPredictions(predictions);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
        setError(message);
        console.error('Error fetching matched predictions:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [getMatchedPredictions, fetchPredictionsByIds]
  );

  // Fetch user's predictions
  const fetchUserPredictions = useCallback(async () => {
    if (!wallet.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const ids = await getUserPredictions(wallet.address);
      const predictions = await fetchPredictionsByIds(ids);
      // Sort by most recent first
      predictions.sort((a, b) => b.createdAt - a.createdAt);
      setUserPredictions(predictions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
      setError(message);
      console.error('Error fetching user predictions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, getUserPredictions, fetchPredictionsByIds]);

  // Refresh all predictions
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchOpenPredictions(),
      wallet.isAdmin ? fetchMatchedPredictions() : Promise.resolve(),
      wallet.address ? fetchUserPredictions() : Promise.resolve(),
    ]);
  }, [fetchOpenPredictions, fetchMatchedPredictions, fetchUserPredictions, wallet.isAdmin, wallet.address]);

  // Auto-refresh on interval
  useEffect(() => {
    if (!wallet.isConnected) return;

    fetchOpenPredictions();

    const interval = setInterval(() => {
      fetchOpenPredictions();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [wallet.isConnected, fetchOpenPredictions]);

  // Fetch user predictions when wallet changes
  useEffect(() => {
    if (wallet.address) {
      fetchUserPredictions();
    }
  }, [wallet.address, fetchUserPredictions]);

  // Fetch matched predictions for admin
  useEffect(() => {
    if (wallet.isAdmin) {
      fetchMatchedPredictions();
    }
  }, [wallet.isAdmin, fetchMatchedPredictions]);

  return {
    openPredictions,
    matchedPredictions,
    userPredictions,
    isLoading,
    error,
    fetchOpenPredictions,
    fetchMatchedPredictions,
    fetchUserPredictions,
    refreshAll,
    getPrediction,
  };
}
