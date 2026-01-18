import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { WalletProvider } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'XO Prediction Market',
  description: 'Head-to-head prediction market on Tron network with USDT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">X</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">XO Prediction</span>
                  </Link>

                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Browse
                    </Link>
                    <Link
                      href="/create"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Create
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Admin
                    </Link>
                  </nav>

                  {/* Wallet */}
                  <WalletConnect />
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    XO Prediction Market - Built on Tron Network
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Platform Fee: 2%</span>
                    <span>|</span>
                    <a
                      href="https://shasta.tronscan.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-700"
                    >
                      Shasta Testnet
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
