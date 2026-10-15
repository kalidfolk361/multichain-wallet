import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Wallet, LayoutDashboard, ArrowLeftRight, Image, LogOut, Menu, X, Lock } from 'lucide-react';

type Page = 'dashboard' | 'transactions' | 'nfts';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function MainLayout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth();
  const { lockAllWallets } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { key: Page; label: string; icon: typeof Wallet }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { key: 'nfts', label: 'NFTs', icon: Image },
  ];

  const handleSignOut = async () => {
    lockAllWallets();
    await signOut();
  };

  const handleLock = () => {
    lockAllWallets();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0D0E14] border-r border-white/[0.06] fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NovaWallet</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.key
                  ? 'bg-white/[0.06] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={handleLock}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            <Lock className="w-4 h-4" /> Lock Wallets
          </button>
          <div className="px-4 py-2">
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0D0E14] border-r border-white/[0.06] flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold text-white">NovaWallet</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { onNavigate(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.key ? 'bg-white/[0.06] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-white/[0.06] space-y-1">
              <button
                onClick={handleLock}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
              >
                <Lock className="w-4 h-4" /> Lock Wallets
              </button>
              <p className="px-4 py-2 text-xs text-gray-600 truncate">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.06] sticky top-0 bg-[#0A0B0F]/90 backdrop-blur-lg z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NovaWallet</span>
          </div>
          <div className="w-6" />
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
