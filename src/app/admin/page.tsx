'use client';

import { useWallet } from '@/contexts/WalletContext';
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminPage() {
  const { wallet } = useWallet();

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
        <p className="text-gray-500">Connect your wallet to access the admin panel</p>
      </div>
    );
  }

  if (!wallet.isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-700">
            Access denied. Only the contract admin can access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPanel />
    </div>
  );
}
