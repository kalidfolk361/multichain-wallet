import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { NETWORKS } from '@/lib/networks';
import { getUsdtBalance, getNativeBalance, sendToken, validateAddress, type SendResult } from '@/lib/wallet';
import { supabase } from '@/lib/supabase';
import { formatBalance } from '@/lib/format';
import { X, Send, Loader2, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface SendModalProps {
  networkKey: string;
  address: string;
  onClose: () => void;
}

export function SendModal({ networkKey, address, onClose }: SendModalProps) {
  const { getPrivateKey } = useWallet();
  const network = NETWORKS[networkKey];
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<'usdt' | 'native'>('usdt');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [nativeBalance, setNativeBalance] = useState('0');
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [usdt, native] = await Promise.all([
          getUsdtBalance(networkKey, address),
          getNativeBalance(networkKey, address),
        ]);
        setUsdtBalance(usdt);
        setNativeBalance(native);
      } catch {
        // network error
      }
      setLoadingBalance(false);
    })();
  }, [networkKey, address]);

  const currentBalance = tokenType === 'usdt' ? usdtBalance : nativeBalance;
  const currentSymbol = tokenType === 'usdt' ? 'USDT' : network?.currencySymbol ?? '';

  const validateForm = (): string | null => {
    if (!recipient.trim()) return 'Please enter a recipient address';
    if (!validateAddress(recipient.trim(), networkKey)) return 'Invalid wallet address';
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return 'Please enter a valid amount';
    if (amt > parseFloat(currentBalance)) return 'Insufficient balance';
    return null;
  };

  const handleSend = async () => {
    setError(null);
    const privateKey = getPrivateKey(networkKey);
    if (!privateKey) {
      setError('Wallet is locked. Please unlock it first.');
      return;
    }

    setSending(true);
    try {
      const type = tokenType === 'usdt' ? 'token' : 'native';
      const sendResult = await sendToken(networkKey, privateKey, recipient.trim(), amount, type);
      setResult(sendResult);

      const wallet = await supabase
        .from('wallets')
        .select('id')
        .eq('network_key', networkKey)
        .eq('address', address)
        .maybeSingle();

      if (wallet.data) {
        await supabase.from('transactions').insert({
          wallet_id: wallet.data.id,
          network_key: networkKey,
          tx_hash: sendResult.txHash,
          tx_type: 'send',
          token_symbol: sendResult.tokenSymbol,
          token_type: sendResult.tokenType,
          amount: sendResult.amount,
          counterparty_address: recipient.trim(),
          status: 'pending',
        });
      }
    } catch {
      setError('Transaction could not be sent. Please check your balance and try again.');
    }
    setSending(false);
  };

  if (!network) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0D0E14] border border-white/[0.06] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${network.logoGradient} flex items-center justify-center`}>
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send {currentSymbol}</h3>
              <p className="text-xs text-gray-500">{network.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Transaction Sent</h4>
            <p className="text-sm text-gray-400 mb-4">
              {result.amount} {result.tokenSymbol} has been sent to the blockchain.
            </p>
            <a
              href={`${network.explorerUrl}/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
            >
              View on explorer <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="w-full mt-6 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl py-3 text-sm font-medium text-white transition-all"
            >
              Close
            </button>
          </div>
        ) : showConfirm ? (
          <div className="space-y-4">
            <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">From</span>
                <span className="text-white font-mono text-xs">{address.slice(0, 10)}...{address.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">To</span>
                <span className="text-white font-mono text-xs">{recipient.slice(0, 10)}...{recipient.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-semibold">{amount} {currentSymbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network</span>
                <span className="text-white">{network.name}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-xs text-amber-400/90">
                The transaction will be signed with your private key and broadcast to the network. This cannot be undone.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl py-3 text-sm font-medium text-white transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm Send <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl">
              <button
                onClick={() => { setTokenType('usdt'); setAmount(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tokenType === 'usdt' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
              >
                USDT
              </button>
              <button
                onClick={() => { setTokenType('native'); setAmount(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tokenType === 'native' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
              >
                {network.currencySymbol}
              </button>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">Available</span>
              {loadingBalance ? (
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
              ) : (
                <span className="text-sm font-semibold text-white">{formatBalance(currentBalance)} {currentSymbol}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                placeholder="0x..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Amount</label>
                <button
                  onClick={() => setAmount(formatBalance(currentBalance, 6))}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Max
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 pr-20 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                  {currentSymbol}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={() => {
                const err = validateForm();
                if (err) { setError(err); return; }
                setError(null);
                setShowConfirm(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
