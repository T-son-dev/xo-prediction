'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACT_ADDRESSES, FEE_LIMIT } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContract = any;

export function useUSDT() {
  const { tronWeb, wallet, refreshBalances } = useWallet();
  const [isApproving, setIsApproving] = useState(false);

  // Get USDT contract instance
  const getUSDTContract = useCallback(async (): Promise<AnyContract> => {
    if (!tronWeb || !CONTRACT_ADDRESSES.usdt) {
      throw new Error('TronWeb or USDT address not available');
    }
    return await tronWeb.contract().at(CONTRACT_ADDRESSES.usdt);
  }, [tronWeb]);

  // Get USDT balance
  const getBalance = useCallback(
    async (address?: string): Promise<string> => {
      if (!tronWeb) return '0';

      try {
        const contract = await getUSDTContract();
        const targetAddress = address || wallet.address;
        if (!targetAddress) return '0';

        const balance = await contract.balanceOf(targetAddress).call();
        return balance.toString();
      } catch (err) {
        console.error('Error fetching USDT balance:', err);
        return '0';
      }
    },
    [tronWeb, wallet.address, getUSDTContract]
  );

  // Get allowance for prediction market contract
  const getAllowance = useCallback(
    async (ownerAddress?: string): Promise<string> => {
      if (!tronWeb || !CONTRACT_ADDRESSES.predictionMarket) return '0';

      try {
        const contract = await getUSDTContract();
        const owner = ownerAddress || wallet.address;
        if (!owner) return '0';

        const allowance = await contract.allowance(owner, CONTRACT_ADDRESSES.predictionMarket).call();
        return allowance.toString();
      } catch (err) {
        console.error('Error fetching allowance:', err);
        return '0';
      }
    },
    [tronWeb, wallet.address, getUSDTContract]
  );

  // Approve USDT spending
  const approve = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!tronWeb || !CONTRACT_ADDRESSES.predictionMarket) {
        throw new Error('TronWeb or contract address not available');
      }

      setIsApproving(true);

      try {
        const contract = await getUSDTContract();

        // Approve the prediction market contract to spend USDT
        const tx = await contract
          .approve(CONTRACT_ADDRESSES.predictionMarket, amount)
          .send({ feeLimit: FEE_LIMIT });

        console.log('Approval transaction:', tx);
        await refreshBalances();
        return true;
      } catch (err) {
        console.error('Error approving USDT:', err);
        throw err;
      } finally {
        setIsApproving(false);
      }
    },
    [tronWeb, getUSDTContract, refreshBalances]
  );

  // Approve max amount (for convenience)
  const approveMax = useCallback(async (): Promise<boolean> => {
    // Max uint256 value
    const maxAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    return approve(maxAmount);
  }, [approve]);

  // Check if approval is needed
  const checkApprovalNeeded = useCallback(
    async (amount: string): Promise<boolean> => {
      const allowance = await getAllowance();
      return BigInt(allowance) < BigInt(amount);
    },
    [getAllowance]
  );

  // Faucet function (for testnet only)
  const faucet = useCallback(async (): Promise<boolean> => {
    if (!tronWeb) throw new Error('TronWeb not available');

    try {
      const contract = await getUSDTContract();
      const tx = await contract.faucet().send({ feeLimit: FEE_LIMIT });
      console.log('Faucet transaction:', tx);
      await refreshBalances();
      return true;
    } catch (err) {
      console.error('Error using faucet:', err);
      throw err;
    }
  }, [tronWeb, getUSDTContract, refreshBalances]);

  return {
    getBalance,
    getAllowance,
    approve,
    approveMax,
    checkApprovalNeeded,
    faucet,
    isApproving,
  };
}
