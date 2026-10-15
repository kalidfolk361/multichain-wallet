import { useState, useEffect, useCallback } from 'react';
import { useWallet, type WalletRow } from '@/context/WalletContext';
import { NETWORKS } from '@/lib/networks';
import { getWalletBalances, type WalletBalance } from '@/lib/wallet';
import { formatBalance, formatUsd, shortenAddress, copyToClipboard } from '@/lib/format';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';
import { WalletOnboarding } from './WalletOnboarding';
import { Wallet, Send, Download, Copy, Check, Loader2, Plus, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export function Dashboard() {
  const { wallets, loading, unlockedNetworks, unlockWallet } = useWallet();
  const [balances, setBalances] = useState<Record<string, WalletBalance>>({});
  const [loadingBalances, setLoadingBalances] = useState<Set<string>>(new Set());
  const [sendModal, setSendModal] = useState<{ networkKey: string; address: string } | null>(null);
  const [receiveModal, setReceiveModal] = useState<{ networkKey: string; address: string } | null>(null);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [unlockModal, setUnlockModal] = useState<string | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchBalances = useCallback(async () => {
    for (const wallet of wallets) {
      if (loadingBalances.has(wallet.id)) continue;
      setLoadingBalances((prev) => new Set(prev).add(wallet.id));
      try {
        const bal = await getWalletBalances(wallet.network_key, wallet.address);
        setBalances((prev) => ({ ...prev, [wallet.id]: bal }));
      } catch {
        // network error, skip
      }
      setLoadingBalances((prev) => {
        const next = new Set(prev);
        next.delete(wallet.id);
        return next;
      });
    }
  }, [wallets]);

  useEffect(() => {
    if (wallets.length > 0) {
      fetchBalances();
    }
  }, [wallets, fetchBalances]);

  const totalUsdt = wallets.reduce((sum, w) => {
    const bal = balances[w.id];
    return sum + (bal ? parseFloat(bal.usdtBalance) : 0);
  }, 0);

  const handleCopy = async (address: string) => {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopiedAddr(address);
      setTimeout(() => setCopiedAddr(null), 2000);
    }
  };

  const handleUnlock = async () => {
    if (!unlockModal) return;
    setUnlockError(null);
    setUnlockLoading(true);
    const result = await unlockWallet(unlockModal, unlockPassword);
    setUnlockLoading(false);
    if (result.error) {
      setUnlockError(result.error);
    } else {
      setUnlockModal(null);
      setUnlockPassword('');
    }
  };

  const toggleExpand = (walletId: string) => {
    setExpandedWallets((prev) => {
      const next = new Set(prev);
      if (next.has(walletId)) next.delete(walletId);
      else next.add(walletId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (showOnboarding || wallets.length === 0) {
    return <WalletOnboarding />;
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-transparent border border-white/[0.06] p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm text-gray-400 mb-1">Total USDT Balance</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">{formatUsd(totalUsdt.toString())}</h2>
          <p className="text-sm text-gray-500 mt-1">{formatBalance(totalUsdt.toString(), 2)} USDT</p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => {
                const firstUnlocked = wallets.find((w) => unlockedNetworks.has(w.network_key));
                if (firstUnlocked) {
                  setSendModal({ networkKey: firstUnlocked.network_key, address: firstUnlocked.address });
                }
              }}
              className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <Send className="w-4 h-4" /> Send
            </button>
            <button
              onClick={() => {
                if (wallets[0]) {
                  setReceiveModal({ networkKey: wallets[0].network_key, address: wallets[0].address });
                }
              }}
              className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <Download className="w-4 h-4" /> Receive
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <Plus className="w-4 h-4" /> Add Network
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            balance={balances[wallet.id]}
            loadingBalance={loadingBalances.has(wallet.id)}
            isUnlocked={unlockedNetworks.has(wallet.network_key)}
            onSend={() => setSendModal({ networkKey: wallet.network_key, address: wallet.address })}
            onReceive={() => setReceiveModal({ networkKey: wallet.network_key, address: wallet.address })}
            onCopy={() => handleCopy(wallet.address)}
            copied={copiedAddr === wallet.address}
            onUnlock={() => setUnlockModal(wallet.network_key)}
            expanded={expandedWallets.has(wallet.id)}
            onToggleExpand={() => toggleExpand(wallet.id)}
          />
        ))}

        {/* Add Network Card */}
        <button
          onClick={() => setShowOnboarding(true)}
          className="rounded-2xl border border-dashed border-white/[0.08] hover:border-white/[0.15] p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white transition-all min-h-[180px]"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Add Network Wallet</span>
          <span className="text-xs text-gray-600">Create or import on another chain</span>
        </button>
      </div>

      {/* Send Modal */}
      {sendModal && (
        <SendModal
          networkKey={sendModal.networkKey}
          address={sendModal.address}
          onClose={() => setSendModal(null)}
        />
      )}

      {/* Receive Modal */}
      {receiveModal && (
        <ReceiveModal
          networkKey={receiveModal.networkKey}
          address={receiveModal.address}
          onClose={() => setReceiveModal(null)}
        />
      )}

      {/* Unlock Modal */}
      {unlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setUnlockModal(null); setUnlockError(null); setUnlockPassword(''); }} />
          <div className="relative z-10 w-full max-w-sm bg-[#0D0E14] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Unlock Wallet</h3>
                <p className="text-xs text-gray-500">{NETWORKS[unlockModal]?.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Encryption Password</label>
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Enter your password"
                  autoFocus
                />
              </div>
              {unlockError && <p className="text-sm text-red-400">{unlockError}</p>}
              <button
                onClick={handleUnlock}
                disabled={unlockLoading || !unlockPassword}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {unlockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface WalletCardProps {
  wallet: WalletRow;
  balance: WalletBalance | undefined;
  loadingBalance: boolean;
  isUnlocked: boolean;
  onSend: () => void;
  onReceive: () => void;
  onCopy: () => void;
  copied: boolean;
  onUnlock: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

function WalletCard({
  wallet,
  balance,
  loadingBalance,
  isUnlocked,
  onSend,
  onReceive,
  onCopy,
  copied,
  onUnlock,
  expanded,
  onToggleExpand,
}: WalletCardProps) {
  const network = NETWORKS[wallet.network_key];
  if (!network) return null;

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${network.logoGradient} flex items-center justify-center`}>
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{network.name}</p>
            <button onClick={onCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              {shortenAddress(wallet.address, 5)}
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
              <Check className="w-3 h-3" /> Unlocked
            </span>
          ) : (
            <button
              onClick={onUnlock}
              className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg transition-all"
            >
              <Lock className="w-3 h-3" /> Locked
            </button>
          )}
          <button onClick={onToggleExpand} className="text-gray-500 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-green-400">T</span>
            </div>
            <span className="text-sm text-gray-300">USDT</span>
          </div>
          {loadingBalance ? (
            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
          ) : (
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{formatBalance(balance?.usdtBalance ?? '0')}</p>
              <p className="text-xs text-gray-500">{formatUsd(balance?.usdtBalance ?? '0')}</p>
            </div>
          )}
        </div>

        {expanded && (
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-400">{network.shortName.slice(0, 2)}</span>
              </div>
              <span className="text-sm text-gray-300">{network.currencySymbol}</span>
              <span className="text-xs text-gray-600">(gas)</span>
            </div>
            {loadingBalance ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <p className="text-sm font-semibold text-white">{formatBalance(balance?.nativeBalance ?? '0')}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={isUnlocked ? onSend : onUnlock}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg py-2 text-xs font-medium text-white transition-all"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
        <button
          onClick={onReceive}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg py-2 text-xs font-medium text-white transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Receive
        </button>
      </div>
    </div>
  );
}
