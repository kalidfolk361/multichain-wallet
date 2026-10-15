import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { NETWORK_LIST } from '@/lib/networks';
import {
  Plus,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Shield,
  Key,
  Sparkles,
} from 'lucide-react';

type Step = 'overview' | 'network-select' | 'create' | 'import-method' | 'import-key' | 'import-seed' | 'backup';

export function WalletOnboarding() {
  const { createWallet, importWalletFromKey, importWalletFromSeed } = useWallet();
  const [step, setStep] = useState<Step>('overview');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importKey, setImportKey] = useState('');
  const [importSeed, setImportSeed] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupPhrase, setBackupPhrase] = useState('');
  const [copied, setCopied] = useState(false);

  const network = NETWORK_LIST.find((n) => n.key === selectedNetwork);

  const handleCreate = async () => {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await createWallet(selectedNetwork, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.mnemonic) {
      setBackupPhrase(result.mnemonic);
    }
    setStep('backup');
  };

  const handleImportKey = async () => {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!importKey.trim()) {
      setError('Please enter a private key');
      return;
    }
    setLoading(true);
    const result = await importWalletFromKey(selectedNetwork, importKey.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleImportSeed = async () => {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!importSeed.trim()) {
      setError('Please enter your recovery phrase');
      return;
    }
    setLoading(true);
    const result = await importWalletFromSeed(selectedNetwork, importSeed.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const copyPhrase = () => {
    navigator.clipboard.writeText(backupPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        {step !== 'overview' && step !== 'backup' && (
          <button
            onClick={() => {
              setStep(step === 'create' || step === 'import-method' ? 'network-select' : step === 'import-key' || step === 'import-seed' ? 'import-method' : 'overview');
              setError(null);
            }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {step === 'overview' && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Welcome to your wallet</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Create a new wallet or import an existing one. Your private keys are encrypted and stored only in your browser.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep('network-select')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-white">Create New Wallet</p>
                  <p className="text-xs text-gray-500">Generate a new wallet with a recovery phrase</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => setStep('network-select')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-white">Import Wallet</p>
                  <p className="text-xs text-gray-500">Import using private key or recovery phrase</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {step === 'network-select' && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-1">Choose a network</h2>
            <p className="text-sm text-gray-400 mb-6">Select the blockchain network for your wallet</p>
            <div className="grid grid-cols-2 gap-3">
              {NETWORK_LIST.map((n) => (
                <button
                  key={n.key}
                  onClick={() => {
                    setSelectedNetwork(n.key);
                    setStep('import-method');
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 transition-all group text-left"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${n.logoGradient} mb-3`} />
                  <p className="text-sm font-medium text-white">{n.name}</p>
                  <p className="text-xs text-gray-500">{n.currencySymbol} & USDT</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSelectedNetwork(selectedNetwork || NETWORK_LIST[0].key);
                setStep('create');
              }}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> Create new on selected network
            </button>
          </div>
        )}

        {step === 'import-method' && network && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${network.logoGradient}`} />
              <div>
                <h2 className="text-lg font-bold text-white">{network.name}</h2>
                <p className="text-xs text-gray-500">How would you like to add your wallet?</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep('create')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Create New Wallet</p>
                  <p className="text-xs text-gray-500">Generate a fresh wallet address</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setStep('import-key')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Import with Private Key</p>
                  <p className="text-xs text-gray-500">Enter your existing private key</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setStep('import-seed')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Import with Recovery Phrase</p>
                  <p className="text-xs text-gray-500">Enter your 12 or 24 word seed phrase</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {step === 'create' && network && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${network.logoGradient}`} />
              <div>
                <h2 className="text-lg font-bold text-white">Create {network.name} Wallet</h2>
                <p className="text-xs text-gray-500">Set a password to encrypt your private key</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Encryption Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Encrypt your private key"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Re-enter your password"
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  This password encrypts your private key in the browser. If you forget it, you will need your recovery phrase to restore access.
                </p>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Wallet <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 'import-key' && network && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${network.logoGradient}`} />
              <div>
                <h2 className="text-lg font-bold text-white">Import to {network.name}</h2>
                <p className="text-xs text-gray-500">Enter your private key</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Private Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={importKey}
                    onChange={(e) => setImportKey(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    placeholder="0x..."
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Encryption Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Set a password to encrypt your key"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleImportKey}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Import Wallet <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 'import-seed' && network && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${network.logoGradient}`} />
              <div>
                <h2 className="text-lg font-bold text-white">Import to {network.name}</h2>
                <p className="text-xs text-gray-500">Enter your recovery phrase</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Recovery Phrase (12 or 24 words)</label>
                <textarea
                  value={importSeed}
                  onChange={(e) => setImportSeed(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono resize-none"
                  placeholder="word1 word2 word3..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Encryption Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Set a password to encrypt your key"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleImportSeed}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Import Wallet <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 'backup' && network && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20 mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Save your recovery phrase</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Write down these 12 words and keep them somewhere safe. You will need them to recover your wallet if you forget your password.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-400/90 text-center">
                Never share your recovery phrase with anyone. Anyone with these words can access your funds.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
              <div className="grid grid-cols-3 gap-3">
                {backupPhrase.split(' ').map((word, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-600 font-mono">{i + 1}</span>
                    <span className="text-sm text-white font-mono">{word}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyPhrase}
                className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl py-3 text-sm text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => { setStep('overview'); setPassword(''); setConfirmPassword(''); setBackupPhrase(''); }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                I've saved it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
