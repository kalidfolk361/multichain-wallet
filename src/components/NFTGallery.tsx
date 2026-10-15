import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/context/WalletContext';
import { NETWORKS } from '@/lib/networks';
import { shortenAddress } from '@/lib/format';
import { NFTCreateModal } from './NFTCreateModal';
import { NFTDetailModal } from './NFTDetailModal';
import { Image, Plus, Loader2, Sparkles, Tag, Search } from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  network_key: string;
  creator_address: string;
  owner_address: string;
  token_id: string | null;
  contract_address: string | null;
  mint_status: string;
  mint_price: string | null;
  is_listed: boolean;
  royalty_percent: number;
  metadata_uri: string | null;
  created_at: string;
}

export function NFTGallery() {
  const { wallets } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchNfts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setNfts([]);
    } else {
      setNfts(data as NFT[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);

  const filtered = nfts.filter((nft) => {
    if (statusFilter !== 'all' && nft.mint_status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return nft.name.toLowerCase().includes(q) || (nft.description?.toLowerCase().includes(q) ?? false);
  });

  const lazyCount = nfts.filter((n) => n.mint_status === 'lazy').length;
  const mintedCount = nfts.filter((n) => n.mint_status === 'minted').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">My NFTs</h2>
          <p className="text-sm text-gray-400">Create and manage your NFT collection</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={wallets.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Create NFT
        </button>
      </div>

      {nfts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-gray-500">Total NFTs</p>
            <p className="text-2xl font-bold text-white mt-1">{nfts.length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-gray-500">Lazy Minted</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{lazyCount}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-gray-500">On-Chain</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{mintedCount}</p>
          </div>
        </div>
      )}

      {nfts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'lazy', 'minted'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                  statusFilter === f ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'lazy' ? 'Lazy Minted' : 'On-Chain'}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <Image className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">
            {nfts.length === 0 ? 'No NFTs yet' : 'No NFTs match your search'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {nfts.length === 0 ? 'Create your first NFT with free lazy minting' : 'Try adjusting your filters'}
          </p>
          {nfts.length === 0 && wallets.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" /> Create Your First NFT
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((nft) => {
            const network = NETWORKS[nft.network_key];
            return (
              <button
                key={nft.id}
                onClick={() => setSelectedNft(nft)}
                className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all text-left"
              >
                <div className="relative aspect-square overflow-hidden bg-white/[0.02]">
                  <img
                    src={nft.image_url}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2 py-1 rounded-lg backdrop-blur-md ${
                      nft.mint_status === 'minted' ? 'bg-green-500/20 text-green-300' :
                      nft.mint_status === 'lazy' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {nft.mint_status === 'minted' ? 'On-Chain' : nft.mint_status === 'lazy' ? 'Lazy Minted' : nft.mint_status}
                    </span>
                  </div>
                  {network && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white">
                        {network.shortName}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white truncate">{nft.name}</h4>
                  {nft.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{nft.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-600">
                      by {shortenAddress(nft.creator_address, 4)}
                    </span>
                    {nft.is_listed && nft.mint_price && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Tag className="w-3 h-3" /> {nft.mint_price}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showCreate && (
        <NFTCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchNfts(); }}
        />
      )}

      {selectedNft && (
        <NFTDetailModal
          nft={selectedNft}
          onClose={() => setSelectedNft(null)}
          onUpdate={() => { fetchNfts(); setSelectedNft(null); }}
        />
      )}
    </div>
  );
}
