import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { Home, Compass, PlusCircle, Wallet, User, Bell, Settings, Menu, X, LogOut } from 'lucide-react';

export type Tab = 'home' | 'discover' | 'create' | 'wallet' | 'profile';

interface NavProps {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenProfile: (userId: string) => void;
  onOpenNftDetail: (nftId: string) => void;
  onOpenP2P: () => void;
}

const NAV_ITEMS: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'discover', label: 'Discover', icon: Compass },
  { key: 'create', label: 'Create', icon: PlusCircle },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'profile', label: 'Profile', icon: User },
];

export function MainLayout({
  children,
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenSettings,
}: NavProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0B0F] flex flex-col">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0D0E14] border-r border-white/[0.06] fixed h-full z-30">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">NovaSocial</h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-white/[0.06] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.key ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={onOpenNotifications}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
          <div className="px-4 py-2">
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.06] sticky top-0 bg-[#0A0B0F]/90 backdrop-blur-lg z-30">
        <h1 className="text-base font-bold text-white">NovaSocial</h1>
        <div className="flex items-center gap-3">
          <button onClick={onOpenNotifications} className="text-gray-400 relative">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-[#0D0E14] border-l border-white/[0.06] flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              <button onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white">
                <Settings className="w-5 h-5" /> Settings
              </button>
              <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D0E14] border-t border-white/[0.06] z-30">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === item.key ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.key ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
