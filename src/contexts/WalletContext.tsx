'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState, TronLinkWindow, TronWebInstance } from '@/types';
import { CONTRACT_ADDRESSES, BALANCE_REFRESH_INTERVAL } from '@/lib/constants';

interface WalletContextType {
  wallet: WalletState;
  tronWeb: TronWebInstance | null;
  connect: () => Promise<void>;
  connectMock: () => void;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
}

const defaultWalletState: WalletState = {
  isConnected: false,
  address: null,
  balance: '0',
  usdtBalance: '0',
  isAdmin: false,
};

// Mock wallet for development without TronLink
const mockWalletState: WalletState = {
  isConnected: true,
  address: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW',
  balance: '1000.00',
  usdtBalance: '10000000000', // 10,000 USDT (6 decimals)
  isAdmin: true,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(defaultWalletState);
  const [tronWeb, setTronWeb] = useState<TronWebInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  // Check if TronLink is installed
  const getTronLink = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const win = window as TronLinkWindow;
    return win.tronLink;
  }, []);

  // Get TronWeb instance
  const getTronWeb = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const win = window as TronLinkWindow;
    return win.tronWeb;
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (isMockMode) {
      // In mock mode, just keep the mock balances
      return;
    }

    const tronWebInstance = getTronWeb();
    if (!tronWebInstance || !tronWebInstance.defaultAddress?.base58) return;

    try {
      const address = tronWebInstance.defaultAddress.base58;

      // Get TRX balance
      const trxBalance = await tronWebInstance.trx.getBalance(address);
      const trxBalanceFormatted = (trxBalance / 1e6).toFixed(2);

      // Get USDT balance
      let usdtBalance = '0';
      if (CONTRACT_ADDRESSES.usdt) {
        try {
          const usdtContract = await tronWebInstance.contract().at(CONTRACT_ADDRESSES.usdt);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const balance = await (usdtContract as any).balanceOf(address).call();
          usdtBalance = String(balance);
        } catch (err) {
          console.error('Error fetching USDT balance:', err);
        }
      }

      // Check if admin
      let isAdmin = false;
      if (CONTRACT_ADDRESSES.predictionMarket) {
        try {
          const marketContract = await tronWebInstance.contract().at(CONTRACT_ADDRESSES.predictionMarket);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const adminAddress = await (marketContract as any).admin().call();
          const adminBase58 = tronWebInstance.address.fromHex(adminAddress);
          isAdmin = adminBase58.toLowerCase() === address.toLowerCase();
        } catch (err) {
          console.error('Error checking admin status:', err);
        }
      }

      setWallet((prev) => ({
        ...prev,
        balance: trxBalanceFormatted,
        usdtBalance,
        isAdmin,
      }));
    } catch (err) {
      console.error('Error refreshing balances:', err);
    }
  }, [getTronWeb, isMockMode]);

  // Connect with mock wallet (for development)
  const connectMock = useCallback(() => {
    setIsMockMode(true);
    setWallet(mockWalletState);
    setError(null);
    console.log('Connected with mock wallet for development');
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tronLink = getTronLink();

      if (!tronLink) {
        throw new Error('TronLink wallet not found. Please install TronLink extension or use Mock Mode for testing.');
      }

      // Check if TronLink is ready
      if (!tronLink.ready) {
        // Wait a bit for TronLink to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Request account access
      let res;
      try {
        res = await tronLink.request({ method: 'tron_requestAccounts' });
      } catch (requestErr) {
        console.error('TronLink request error:', requestErr);
        throw new Error('TronLink request failed. Make sure TronLink is unlocked and try again.');
      }

      // Check response - TronLink returns different formats
      if (res === false || (typeof res === 'object' && (res as { code?: number })?.code === 4001)) {
        throw new Error('Wallet connection was rejected by user.');
      }

      // Wait for TronWeb to be ready
      let attempts = 0;
      while (attempts < 20) {
        const tronWebInstance = getTronWeb();
        if (tronWebInstance?.ready && tronWebInstance?.defaultAddress?.base58) {
          setTronWeb(tronWebInstance);
          setIsMockMode(false);

          setWallet({
            isConnected: true,
            address: tronWebInstance.defaultAddress.base58,
            balance: '0',
            usdtBalance: '0',
            isAdmin: false,
          });

          // Refresh balances after connection
          setTimeout(() => refreshBalances(), 500);
          setIsLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        attempts++;
      }

      throw new Error('TronLink connected but wallet not ready. Please unlock TronLink and try again.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getTronLink, getTronWeb, refreshBalances]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet(defaultWalletState);
    setTronWeb(null);
    setError(null);
    setIsMockMode(false);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.message?.action === 'setAccount') {
        const address = e.data.message.data?.address;
        if (address && wallet.isConnected && !isMockMode) {
          setWallet((prev) => ({
            ...prev,
            address,
          }));
          refreshBalances();
        } else if (!address && wallet.isConnected && !isMockMode) {
          disconnect();
        }
      }

      if (e.data?.message?.action === 'setNode') {
        // Network changed, refresh balances
        if (wallet.isConnected && !isMockMode) {
          refreshBalances();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [wallet.isConnected, refreshBalances, disconnect, isMockMode]);

  // Auto-refresh balances
  useEffect(() => {
    if (!wallet.isConnected || isMockMode) return;

    const interval = setInterval(refreshBalances, BALANCE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [wallet.isConnected, refreshBalances, isMockMode]);

  // Check for existing connection on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkExistingConnection = async () => {
      const tronWebInstance = getTronWeb();
      if (tronWebInstance?.ready && tronWebInstance?.defaultAddress?.base58) {
        setTronWeb(tronWebInstance);
        setWallet({
          isConnected: true,
          address: tronWebInstance.defaultAddress.base58,
          balance: '0',
          usdtBalance: '0',
          isAdmin: false,
        });
        setTimeout(() => refreshBalances(), 500);
      }
    };

    // Wait for TronLink to inject
    const timer = setTimeout(checkExistingConnection, 1000);
    return () => clearTimeout(timer);
  }, [getTronWeb, refreshBalances]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        tronWeb,
        connect,
        connectMock,
        disconnect,
        refreshBalances,
        isLoading,
        error,
        isMockMode,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
