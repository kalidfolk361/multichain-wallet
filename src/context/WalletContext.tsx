import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { encryptPrivateKey, decryptPrivateKey, storeDecryptedKey, getDecryptedKey, clearAllDecryptedKeys } from '@/lib/crypto';
import { createNewWallet, importWalletFromPrivateKey, importWalletFromMnemonic, type NetworkConfig } from '@/lib/wallet';

export interface WalletRow {
  id: string;
  user_id: string;
  address: string;
  encrypted_private_key: string | null;
  network_key: string;
  label: string;
  is_primary: boolean;
  created_at: string;
}

interface WalletContextValue {
  wallets: WalletRow[];
  loading: boolean;
  unlockedNetworks: Set<string>;
  createWallet: (networkKey: string, password: string) => Promise<{ error: string | null; mnemonic?: string }>;
  importWalletFromKey: (networkKey: string, privateKey: string, password: string) => Promise<{ error: string | null }>;
  importWalletFromSeed: (networkKey: string, mnemonic: string, password: string) => Promise<{ error: string | null }>;
  unlockWallet: (networkKey: string, password: string) => Promise<{ error: string | null }>;
  lockWallet: (networkKey: string) => void;
  lockAllWallets: () => void;
  getPrivateKey: (networkKey: string) => string | null;
  refreshWallets: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedNetworks, setUnlockedNetworks] = useState<Set<string>>(new Set());

  const fetchWallets = useCallback(async () => {
    if (!user) {
      setWallets([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      setWallets([]);
    } else {
      setWallets(data as WalletRow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    if (!user) {
      setUnlockedNetworks(new Set());
      clearAllDecryptedKeys();
    }
  }, [user]);

  const createWallet = async (networkKey: string, password: string) => {
    try {
      const newWallet = createNewWallet(networkKey);
      const encryptedKey = await encryptPrivateKey(newWallet.privateKey, password);
      const { data, error } = await supabase.from('wallets').insert({
        address: newWallet.address,
        encrypted_private_key: encryptedKey,
        network_key: networkKey,
        label: 'My Wallet',
      }).select().single();
      if (error) {
        return { error: 'Could not create wallet. Please try again.' };
      }
      storeDecryptedKey(networkKey, newWallet.privateKey);
      setUnlockedNetworks((prev) => new Set(prev).add(networkKey));
      setWallets((prev) => [...prev, data as WalletRow]);
      return { error: null, mnemonic: newWallet.mnemonic };
    } catch {
      return { error: 'Could not create wallet. Please try again.' };
    }
  };

  const importWalletFromKey = async (networkKey: string, privateKey: string, password: string) => {
    try {
      const imported = importWalletFromPrivateKey(privateKey, networkKey);
      const encryptedKey = await encryptPrivateKey(imported.privateKey, password);
      const { data, error } = await supabase.from('wallets').insert({
        address: imported.address,
        encrypted_private_key: encryptedKey,
        network_key: networkKey,
        label: 'Imported Wallet',
      }).select().single();
      if (error) {
        if (error.code === '23505') {
          return { error: 'This wallet is already imported on this network.' };
        }
        return { error: 'Could not import wallet. Please try again.' };
      }
      storeDecryptedKey(networkKey, imported.privateKey);
      setUnlockedNetworks((prev) => new Set(prev).add(networkKey));
      setWallets((prev) => [...prev, data as WalletRow]);
      return { error: null };
    } catch {
      return { error: 'Invalid private key. Please check and try again.' };
    }
  };

  const importWalletFromSeed = async (networkKey: string, mnemonic: string, password: string) => {
    try {
      const imported = importWalletFromMnemonic(mnemonic, networkKey);
      const encryptedKey = await encryptPrivateKey(imported.privateKey, password);
      const { data, error } = await supabase.from('wallets').insert({
        address: imported.address,
        encrypted_private_key: encryptedKey,
        network_key: networkKey,
        label: 'Imported Wallet',
      }).select().single();
      if (error) {
        if (error.code === '23505') {
          return { error: 'This wallet is already imported on this network.' };
        }
        return { error: 'Could not import wallet. Please try again.' };
      }
      storeDecryptedKey(networkKey, imported.privateKey);
      setUnlockedNetworks((prev) => new Set(prev).add(networkKey));
      setWallets((prev) => [...prev, data as WalletRow]);
      return { error: null };
    } catch {
      return { error: 'Invalid recovery phrase. Please check and try again.' };
    }
  };

  const unlockWallet = async (networkKey: string, password: string) => {
    const wallet = wallets.find((w) => w.network_key === networkKey);
    if (!wallet || !wallet.encrypted_private_key) {
      return { error: 'No encrypted key found for this wallet.' };
    }
    try {
      const privateKey = await decryptPrivateKey(wallet.encrypted_private_key, password);
      storeDecryptedKey(networkKey, privateKey);
      setUnlockedNetworks((prev) => new Set(prev).add(networkKey));
      return { error: null };
    } catch {
      return { error: 'Incorrect password. Please try again.' };
    }
  };

  const lockWallet = (networkKey: string) => {
    import('@/lib/crypto').then(({ clearDecryptedKey }) => {
      clearDecryptedKey(networkKey);
    });
    setUnlockedNetworks((prev) => {
      const next = new Set(prev);
      next.delete(networkKey);
      return next;
    });
  };

  const lockAllWallets = () => {
    clearAllDecryptedKeys();
    setUnlockedNetworks(new Set());
  };

  const getPrivateKey = (networkKey: string): string | null => {
    return getDecryptedKey(networkKey);
  };

  const refreshWallets = () => {
    fetchWallets();
  };

  return (
    <WalletContext.Provider value={{
      wallets,
      loading,
      unlockedNetworks,
      createWallet,
      importWalletFromKey,
      importWalletFromSeed,
      unlockWallet,
      lockWallet,
      lockAllWallets,
      getPrivateKey,
      refreshWallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
